-- Script de diagnostic pour comprendre pourquoi le rôle reste 'client'
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la structure de la table users
SELECT column_name, column_default, is_nullable, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'role';

-- 2. Vérifier les invitations existantes
SELECT 
  id,
  email,
  first_name,
  last_name,
  employee_role,
  invitation_token,
  status,
  expires_at > NOW() as is_valid
FROM public.agency_employee_invitations 
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- 3. Vérifier les utilisateurs récents et leurs rôles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Tester manuellement la logique du trigger
DO $$
DECLARE
  v_invitation RECORD;
  v_user_role VARCHAR;
  test_token UUID;
BEGIN
  -- Prendre un token d'invitation valide
  SELECT invitation_token INTO test_token
  FROM public.agency_employee_invitations 
  WHERE status = 'pending' 
    AND expires_at > NOW()
  LIMIT 1;
  
  IF test_token IS NOT NULL THEN
    RAISE NOTICE 'Test avec token: %', test_token;
    
    -- Simuler la logique du trigger
    SELECT * INTO v_invitation
    FROM public.agency_employee_invitations
    WHERE invitation_token = test_token
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agency_admin'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      RAISE NOTICE 'Invitation trouvée: role=%, user_role=%', v_invitation.employee_role, v_user_role;
    ELSE
      RAISE NOTICE 'Aucune invitation trouvée pour ce token';
    END IF;
  ELSE
    RAISE NOTICE 'Aucun token d''invitation valide trouvé';
  END IF;
END $$;

-- 5. Vérifier que le trigger existe et est actif
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_invitation';
