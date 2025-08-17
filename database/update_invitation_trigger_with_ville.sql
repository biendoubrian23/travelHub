-- Script pour mettre à jour le trigger avec le champ ville
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer le trigger existant
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Supprimer la fonction existante
DROP FUNCTION IF EXISTS handle_invitation_signup();

-- Créer la nouvelle fonction avec le champ ville
CREATE OR REPLACE FUNCTION handle_invitation_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_user_role TEXT;
BEGIN
  -- Vérifier si l'utilisateur a un token d'invitation dans ses métadonnées
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'invitation_token' THEN
    
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM agency_employee_invitations
    WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      -- Déterminer le user_role
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agence'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      -- Créer l'utilisateur dans notre table users (avec gestion des conflits)
      INSERT INTO public.users (
        id, email, full_name, phone, date_of_birth, ville, role, is_active
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', v_invitation.first_name || ' ' || v_invitation.last_name),
        COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
        v_invitation.date_of_birth,
        v_invitation.ville,
        v_user_role,
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        ville = EXCLUDED.ville,
        role = EXCLUDED.role,
        is_active = true;
      
      -- Créer l'entrée dans agency_employees (avec gestion des conflits)
      INSERT INTO public.agency_employees (
        agency_id, user_id, role, is_active, created_at
      ) VALUES (
        v_invitation.agency_id,
        NEW.id,
        v_invitation.employee_role,
        true,
        NOW()
      )
      ON CONFLICT (agency_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        is_active = true;
      
      -- Marquer l'invitation comme acceptée
      UPDATE agency_employee_invitations
      SET status = 'accepted', accepted_at = NOW()
      WHERE id = v_invitation.id;
      
      -- Log de l'activité
      INSERT INTO audit_logs (
        table_name, action, record_id, user_id, changes
      ) VALUES (
        'users',
        'invitation_signup',
        NEW.id::TEXT,
        NEW.id,
        jsonb_build_object(
          'invitation_id', v_invitation.id,
          'agency_id', v_invitation.agency_id,
          'role', v_user_role,
          'ville', v_invitation.ville
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_signup();

-- Message de confirmation
SELECT 'Trigger mis à jour avec succès. Le champ ville sera maintenant transféré lors de l''acceptation d''invitation.' as message;
