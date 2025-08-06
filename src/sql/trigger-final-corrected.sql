-- Trigger d'invitation simplifié et corrigé
-- Version finale pour résoudre les problèmes d'invitation

-- 1. D'abord, supprimer les triggers existants qui causent des conflits
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS handle_invitation_signup ON auth.users;
DROP TRIGGER IF EXISTS a_invitation_handler_priority ON auth.users;

-- 2. Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_invitation_signup() CASCADE;
DROP FUNCTION IF EXISTS public.handle_invitation_signup_v3() CASCADE;

-- 3. Créer une fonction unifiée qui gère tout
CREATE OR REPLACE FUNCTION public.handle_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  invitation_record RECORD;
  calculated_role TEXT := 'client'; -- Par défaut
  user_full_name TEXT := '';
BEGIN
  RAISE NOTICE 'Début handle_user_signup pour user: %', NEW.email;
  
  -- 1. Chercher une invitation valide
  SELECT * INTO invitation_record
  FROM public.agency_employee_invitations
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW();
    
  IF FOUND THEN
    RAISE NOTICE 'Invitation trouvée pour: %', NEW.email;
    
    -- C'est un employé avec invitation
    calculated_role := CASE invitation_record.employee_role
      WHEN 'admin' THEN 'agency_admin'
      WHEN 'manager' THEN 'agency_manager'
      WHEN 'employee' THEN 'agency_employee'
      WHEN 'driver' THEN 'agency_driver'
      ELSE 'agency_employee'
    END;
    
    user_full_name := COALESCE(invitation_record.first_name || ' ' || invitation_record.last_name, NEW.email);
    
    RAISE NOTICE 'Rôle calculé: % pour employee_role: %', calculated_role, invitation_record.employee_role;
    
    -- 2. Mettre à jour le statut de l'invitation
    UPDATE public.agency_employee_invitations
    SET status = 'accepted',
        updated_at = NOW()
    WHERE id = invitation_record.id;
    
    RAISE NOTICE 'Statut invitation mis à jour';
    
    -- 3. Créer l'enregistrement employé
    INSERT INTO public.agency_employees (
      user_id,
      agency_id,
      employee_role,
      first_name,
      last_name,
      email,
      phone,
      birth_date
    ) VALUES (
      NEW.id,
      invitation_record.agency_id,
      invitation_record.employee_role,
      invitation_record.first_name,
      invitation_record.last_name,
      invitation_record.email,
      invitation_record.phone,
      invitation_record.birth_date
    ) ON CONFLICT (user_id) DO UPDATE SET
      agency_id = EXCLUDED.agency_id,
      employee_role = EXCLUDED.employee_role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      birth_date = EXCLUDED.birth_date;
    
    RAISE NOTICE 'Enregistrement employé créé/mis à jour';
    
  ELSE
    RAISE NOTICE 'Aucune invitation trouvée, utilisateur client standard';
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  END IF;
  
  -- 4. Créer/mettre à jour l'utilisateur dans public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    calculated_role,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RAISE NOTICE 'Utilisateur créé/mis à jour dans public.users avec rôle: %', calculated_role;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERREUR dans handle_user_signup: % - %', SQLSTATE, SQLERRM;
  -- Ne pas bloquer la création de l'utilisateur même en cas d'erreur
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer le trigger
CREATE TRIGGER handle_user_signup_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_signup();

-- 6. Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.handle_user_signup() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_user_signup() TO service_role;

-- Permissions sur les tables
GRANT SELECT, UPDATE ON public.agency_employee_invitations TO service_role;
GRANT INSERT, SELECT, UPDATE ON public.agency_employees TO service_role;
GRANT INSERT, SELECT, UPDATE ON public.users TO service_role;

-- 7. Script de test rapide
DO $$
BEGIN
  RAISE NOTICE 'Trigger créé avec succès. Pour tester:';
  RAISE NOTICE '1. Exécutez le script debug-invitation-complete.sql';
  RAISE NOTICE '2. Créez une invitation via l''interface admin';
  RAISE NOTICE '3. Utilisez le lien d''invitation pour créer un compte';
  RAISE NOTICE '4. Vérifiez les logs dans le dashboard Supabase';
END $$;
