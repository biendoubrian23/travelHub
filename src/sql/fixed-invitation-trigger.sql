-- Version corrigée du trigger avec logs détaillés
-- À exécuter dans Supabase SQL Editor

DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;
DROP FUNCTION IF EXISTS handle_invitation_signup();

CREATE OR REPLACE FUNCTION handle_invitation_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_user_role VARCHAR;
  v_token_str TEXT;
BEGIN
  -- Log détaillé pour debug
  RAISE NOTICE 'TRIGGER: Début handle_invitation_signup pour user %', NEW.id;
  RAISE NOTICE 'TRIGGER: Email = %', NEW.email;
  RAISE NOTICE 'TRIGGER: Métadonnées = %', NEW.raw_user_meta_data;
  
  -- Vérifier si l'utilisateur a un token d'invitation dans ses métadonnées
  IF NEW.raw_user_meta_data ? 'invitation_token' THEN
    v_token_str := NEW.raw_user_meta_data->>'invitation_token';
    RAISE NOTICE 'TRIGGER: Token d''invitation trouvé = %', v_token_str;
    
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM public.agency_employee_invitations
    WHERE invitation_token = v_token_str::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      RAISE NOTICE 'TRIGGER: Invitation valide trouvée, employee_role = %', v_invitation.employee_role;
      
      -- Déterminer le user_role basé sur employee_role
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agency_admin'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      RAISE NOTICE 'TRIGGER: Rôle calculé = %', v_user_role;
      
      -- IMPORTANT: Utiliser INSERT ... ON CONFLICT pour éviter les doublons
      -- et forcer la mise à jour du rôle
      INSERT INTO public.users (
        id, 
        email, 
        full_name, 
        phone, 
        date_of_birth, 
        role, 
        is_active,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', v_invitation.first_name || ' ' || v_invitation.last_name),
        COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
        v_invitation.date_of_birth,
        v_user_role,  -- Forcer le bon rôle
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,  -- Forcer la mise à jour du rôle même en cas de conflit
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
      
      RAISE NOTICE 'TRIGGER: Utilisateur créé/mis à jour avec rôle %', v_user_role;
      
      -- Créer l'employé dans agency_employees
      INSERT INTO public.agency_employees (
        agency_id, 
        user_id, 
        employee_role, 
        notes,
        created_by, 
        phone, 
        date_of_birth, 
        is_active, 
        hire_date,
        first_name,
        last_name,
        created_at,
        updated_at
      ) VALUES (
        v_invitation.agency_id,
        NEW.id,
        v_invitation.employee_role,
        v_invitation.notes,
        v_invitation.invited_by,
        COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
        v_invitation.date_of_birth,
        true,
        CURRENT_DATE,
        v_invitation.first_name,
        v_invitation.last_name,
        NOW(),
        NOW()
      ) ON CONFLICT (user_id, agency_id) DO UPDATE SET
        employee_role = EXCLUDED.employee_role,
        updated_at = NOW();
      
      RAISE NOTICE 'TRIGGER: Employé créé dans agency_employees';
      
      -- Marquer l'invitation comme acceptée
      UPDATE public.agency_employee_invitations
      SET 
        status = 'accepted',
        accepted_at = NOW(),
        user_id = NEW.id,
        updated_at = NOW()
      WHERE invitation_token = v_token_str::UUID;
      
      RAISE NOTICE 'TRIGGER: Invitation marquée comme acceptée';
      
    ELSE
      RAISE NOTICE 'TRIGGER: Aucune invitation valide trouvée pour token %', v_token_str;
    END IF;
  ELSE
    RAISE NOTICE 'TRIGGER: Aucun token d''invitation dans les métadonnées';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'TRIGGER: Erreur dans handle_invitation_signup: % %', SQLSTATE, SQLERRM;
    -- Ne pas faire échouer la création de l'utilisateur
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_signup();

-- Permissions
GRANT EXECUTE ON FUNCTION handle_invitation_signup() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_invitation_signup() TO service_role;

RAISE NOTICE 'Trigger mis à jour avec logs détaillés!';
