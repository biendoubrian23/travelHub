-- Script de debugging pour identifier les problèmes d'invitation
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les triggers existants
SELECT 
  trigger_name,
  action_timing,
  action_order,
  action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users'
ORDER BY action_order, trigger_name;

-- 2. Vérifier les invitations en attente
SELECT 
  id,
  email,
  first_name,
  last_name,
  employee_role,
  status,
  invitation_token,
  expires_at,
  expires_at > NOW() as is_valid
FROM public.agency_employee_invitations 
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- 3. Vérifier les utilisateurs récents dans auth.users (si accessible)
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 4. Vérifier les utilisateurs récents dans public.users
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Vérifier les employés récents
SELECT 
  user_id,
  agency_id,
  employee_role,
  first_name,
  last_name,
  created_at
FROM public.agency_employees 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Vérifier les permissions sur les tables
SELECT 
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'agency_employees', 'agency_employee_invitations')
  AND grantee IN ('authenticated', 'service_role', 'anon')
ORDER BY table_name, grantee;

-- 7. Vérifier la structure de la table users
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 8. Test de fonction (simuler le trigger sans l'exécuter)
DO $$
DECLARE
  test_invitation RECORD;
  test_role TEXT;
BEGIN
  -- Prendre une invitation en attente
  SELECT * INTO test_invitation
  FROM public.agency_employee_invitations 
  WHERE status = 'pending' 
    AND expires_at > NOW()
  LIMIT 1;
  
  IF FOUND THEN
    RAISE NOTICE 'Test invitation trouvée: %', test_invitation.email;
    
    -- Tester la logique de calcul de rôle
    test_role := CASE test_invitation.employee_role
      WHEN 'admin' THEN 'agency_admin'
      WHEN 'manager' THEN 'agency_manager'
      WHEN 'employee' THEN 'agency_employee'
      WHEN 'driver' THEN 'agency_driver'
      ELSE 'agency_employee'
    END;
    
    RAISE NOTICE 'Rôle calculé: % pour employee_role: %', test_role, test_invitation.employee_role;
    
    -- Vérifier si on peut accéder aux tables
    PERFORM 1 FROM public.users LIMIT 1;
    RAISE NOTICE 'Accès table users: OK';
    
    PERFORM 1 FROM public.agency_employees LIMIT 1;
    RAISE NOTICE 'Accès table agency_employees: OK';
    
  ELSE
    RAISE NOTICE 'Aucune invitation en attente trouvée pour le test';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erreur test: % - %', SQLSTATE, SQLERRM;
END $$;
