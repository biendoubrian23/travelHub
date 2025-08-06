-- Test simple du trigger dans Supabase SQL Editor
-- À exécuter APRÈS avoir créé le trigger

-- 1. Créer une invitation de test
INSERT INTO public.agency_employee_invitations (
  id,
  agency_id,
  email,
  first_name,
  last_name,
  phone,
  employee_role,
  invitation_token,
  status,
  expires_at,
  invited_by
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM public.agencies LIMIT 1), -- Prendre une agence existante
  'test-trigger@example.com',
  'Test',
  'Trigger',
  '+237123456789',
  'employee',
  gen_random_uuid(),
  'pending',
  NOW() + INTERVAL '7 days',
  (SELECT owner_id FROM public.agencies LIMIT 1) -- Prendre un owner existant
);

-- 2. Récupérer le token pour le test
SELECT 
  invitation_token,
  email,
  first_name,
  last_name
FROM public.agency_employee_invitations 
WHERE email = 'test-trigger@example.com' 
  AND status = 'pending';

-- 3. Maintenant testez le signUp avec ce token dans votre application
-- ou utilisez l'API REST de Supabase

-- 4. Nettoyer après le test
-- DELETE FROM public.agency_employee_invitations WHERE email = 'test-trigger@example.com';
