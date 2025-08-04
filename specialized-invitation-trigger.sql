-- ============================================================================
-- TRIGGER SPÉCIALISÉ POUR INVITATIONS - VERSION CORRIGÉE
-- Ce trigger remplace complètement la logique d'inscription pour les invitations
-- ============================================================================

-- 1. Supprimer TOUS les triggers existants pour éviter les conflits
DROP TRIGGER IF EXISTS z_on_auth_user_invitation_handler ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_invitation_signup();

-- 2. Créer la fonction corrigée pour les invitations
CREATE OR REPLACE FUNCTION handle_invitation_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_user_role TEXT;
  v_token_str TEXT;
  v_existing_user RECORD;
BEGIN
  RAISE NOTICE 'TRIGGER START: Processing user % with email %', NEW.id, NEW.email;
  
  -- Vérifier si c'est une invitation
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'invitation_token' THEN
    v_token_str := NEW.raw_user_meta_data->>'invitation_token';
    RAISE NOTICE 'INVITATION TOKEN FOUND: %', v_token_str;
    
    -- Récupérer l'invitation valide
    SELECT * INTO v_invitation
    FROM public.agency_employee_invitations
    WHERE invitation_token = v_token_str::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      RAISE NOTICE 'VALID INVITATION FOUND for email: %', v_invitation.email;
      
      -- ÉTAPE 1: Marquer l'invitation comme acceptée IMMÉDIATEMENT
      UPDATE public.agency_employee_invitations
      SET 
        status = 'accepted',
        accepted_at = NOW(),
        user_id = NEW.id,
        updated_at = NOW()
      WHERE invitation_token = v_token_str::UUID;
      
      GET DIAGNOSTICS v_existing_user = ROW_COUNT;
      RAISE NOTICE 'INVITATION STATUS UPDATED: % rows affected', v_existing_user;
      
      -- ÉTAPE 2: Calculer le rôle système
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agency_admin'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      RAISE NOTICE 'CALCULATED ROLE: % from employee_role: %', v_user_role, v_invitation.employee_role;
      
      -- ÉTAPE 3: Vérifier si l'utilisateur existe déjà dans public.users
      SELECT * INTO v_existing_user
      FROM public.users 
      WHERE id = NEW.id;
      
      IF FOUND THEN
        RAISE NOTICE 'USER EXISTS, UPDATING with role: %', v_user_role;
        -- Mettre à jour l'utilisateur existant avec le bon rôle
        UPDATE public.users
        SET 
          role = v_user_role,
          full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', v_invitation.first_name || ' ' || v_invitation.last_name),
          phone = COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
          date_of_birth = v_invitation.date_of_birth,
          updated_at = NOW()
        WHERE id = NEW.id;
      ELSE
        RAISE NOTICE 'CREATING NEW USER with role: %', v_user_role;
        -- Créer un nouvel utilisateur
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
      END IF;
      
      RAISE NOTICE 'USER RECORD PROCESSED';
      
      -- ÉTAPE 4: Créer l'employé dans l'agence
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
        notes = EXCLUDED.notes,
        updated_at = NOW();
      
      RAISE NOTICE 'EMPLOYEE RECORD CREATED';
      RAISE NOTICE 'INVITATION PROCESS COMPLETED SUCCESSFULLY for % (role: %)', NEW.email, v_user_role;
      
    ELSE
      RAISE NOTICE 'NO VALID INVITATION FOUND for token: %', v_token_str;
    END IF;
  ELSE
    RAISE NOTICE 'NO INVITATION TOKEN - this is normal signup, handled by handle_new_user';
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'INVITATION TRIGGER ERROR: % - %', SQLSTATE, SQLERRM;
    -- Log l'erreur mais ne pas empêcher la création du compte
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Créer le trigger avec la PRIORITÉ MAXIMALE (s'exécute en premier)
CREATE TRIGGER a_invitation_handler_priority
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_signup();

-- 4. Permissions étendues
GRANT EXECUTE ON FUNCTION handle_invitation_signup() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_invitation_signup() TO service_role;
GRANT EXECUTE ON FUNCTION handle_invitation_signup() TO anon;

-- 5. Vérification complète
SELECT 
  trigger_name,
  action_timing,
  action_order,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY action_order, trigger_name;

-- 6. Test de la fonction (optionnel - décommentez pour tester)
/*
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Vérifier qu'on peut accéder aux tables
  SELECT 'OK' INTO test_result FROM public.agency_employee_invitations LIMIT 1;
  RAISE NOTICE 'Test access agency_employee_invitations: %', test_result;
  
  SELECT 'OK' INTO test_result FROM public.users LIMIT 1;
  RAISE NOTICE 'Test access users: %', test_result;
  
  SELECT 'OK' INTO test_result FROM public.agency_employees LIMIT 1;
  RAISE NOTICE 'Test access agency_employees: %', test_result;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test failed: % %', SQLSTATE, SQLERRM;
END $$;
*/

SELECT 'Trigger d''invitation CORRIGÉ créé avec priorité maximale!' as message;
