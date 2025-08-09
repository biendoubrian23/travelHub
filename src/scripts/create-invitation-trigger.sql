-- ============================================================================
-- SCRIPT COMPLET DE CRÉATION DU TRIGGER D'INVITATION
-- À exécuter dans l'éditeur SQL de Supabase Dashboard
-- ============================================================================

-- 1. D'abord, supprimer le trigger existant s'il y en a un
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;

-- 2. Supprimer la fonction existante s'il y en a une
DROP FUNCTION IF EXISTS handle_invitation_signup();

-- 3. Créer la fonction de gestion des invitations
CREATE OR REPLACE FUNCTION handle_invitation_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_user_role VARCHAR;
BEGIN
  -- Log pour debug
  RAISE LOG 'Trigger handle_invitation_signup appelé pour user: %', NEW.id;
  
  -- Vérifier si l'utilisateur a un token d'invitation dans ses métadonnées
  IF NEW.raw_user_meta_data ? 'invitation_token' THEN
    RAISE LOG 'Token d''invitation trouvé: %', NEW.raw_user_meta_data->>'invitation_token';
    
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM public.agency_employee_invitations
    WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      RAISE LOG 'Invitation valide trouvée pour agence: %', v_invitation.agency_id;
      
      -- Déterminer le user_role basé sur employee_role
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agence'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      RAISE LOG 'Rôle déterminé: %', v_user_role;
      
      -- Créer l'utilisateur dans notre table users
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
        v_user_role,
        true,
        NOW(),
        NOW()
      );
      
      RAISE LOG 'Utilisateur créé dans public.users';
      
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
      );
      
      RAISE LOG 'Employé créé dans agency_employees';
      
      -- Marquer l'invitation comme acceptée
      UPDATE public.agency_employee_invitations
      SET 
        status = 'accepted',
        accepted_at = NOW(),
        user_id = NEW.id,
        updated_at = NOW()
      WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID;
      
      RAISE LOG 'Invitation marquée comme acceptée';
      
    ELSE
      RAISE LOG 'Aucune invitation valide trouvée pour le token: %', NEW.raw_user_meta_data->>'invitation_token';
    END IF;
  ELSE
    RAISE LOG 'Aucun token d''invitation dans les métadonnées utilisateur';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer la création de l'utilisateur
    RAISE LOG 'Erreur dans handle_invitation_signup: % %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Créer le trigger sur la table auth.users
CREATE TRIGGER on_auth_user_created_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_signup();

-- 5. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION handle_invitation_signup() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_invitation_signup() TO service_role;

-- 6. Vérification que le trigger a été créé
SELECT 
  schemaname,
  tablename,
  triggername
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'users' 
  AND n.nspname = 'auth'
  AND t.tgname = 'on_auth_user_created_invitation';

-- Message de confirmation
SELECT 'Trigger d''invitation créé avec succès!' as message;
