-- Script SQL pour diagnostiquer les problèmes de trigger
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si le trigger existe
SELECT 
  schemaname,
  tablename,
  triggername,
  triggerdef
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE c.relname = 'users' 
  AND n.nspname = 'auth'
  AND t.tgname = 'on_auth_user_created_invitation';

-- 2. Vérifier si la fonction existe
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'handle_invitation_signup';

-- 3. Tester la fonction manuellement (avec des données factices)
-- ATTENTION: Remplacez les UUIDs par des valeurs réelles de votre base
/*
SELECT handle_invitation_signup(
  ROW(
    gen_random_uuid()::text,  -- user_id
    'test@example.com',       -- email
    '{"invitation_token": "uuid-real-token", "full_name": "Test User"}'::jsonb  -- raw_user_meta_data
  )::auth.users
);
*/

-- 4. Vérifier les tables requises
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'agency_employees', 'agency_employee_invitations', 'agencies');

-- 5. Vérifier les contraintes qui peuvent causer des erreurs
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('users', 'agency_employees', 'agency_employee_invitations');
