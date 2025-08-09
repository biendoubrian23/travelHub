-- Script de nettoyage complet avant recréation
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Supprimer toutes les invitations en cours
DELETE FROM agency_employee_invitations WHERE email = 'test.test@test.com';

-- 2. Supprimer les employés d'agence liés à cet email
DELETE FROM agency_employees 
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'test.test@test.com'
);

-- 3. Supprimer l'utilisateur de la table users
DELETE FROM users WHERE email = 'test.test@test.com';

-- 4. Supprimer les agences créées pour les tests
DELETE FROM agencies WHERE owner_id IN (
  SELECT id FROM auth.users WHERE email = 'test.test@test.com'
);

-- 5. Vérifier qu'il n'y a plus de données pour cet email
SELECT 'Vérification - Users' as table_name, count(*) as count FROM users WHERE email = 'test.test@test.com'
UNION ALL
SELECT 'Vérification - Invitations' as table_name, count(*) as count FROM agency_employee_invitations WHERE email = 'test.test@test.com'
UNION ALL
SELECT 'Vérification - Employés' as table_name, count(*) as count FROM agency_employees WHERE user_id IN (SELECT id FROM users WHERE email = 'test.test@test.com')
UNION ALL
SELECT 'Vérification - Auth Users' as table_name, count(*) as count FROM auth.users WHERE email = 'test.test@test.com';

-- 6. Si il reste des utilisateurs auth, les supprimer aussi (ATTENTION: commande administrative)
-- UNCOMMENT UNIQUEMENT SI NÉCESSAIRE:
-- DELETE FROM auth.users WHERE email = 'test.test@test.com';
