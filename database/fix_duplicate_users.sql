-- Script pour corriger les problèmes de duplication d'utilisateurs
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Identifier les doublons potentiels (même email, IDs différents)
WITH duplicates AS (
  SELECT email, COUNT(*), ARRAY_AGG(id) as ids
  FROM users
  GROUP BY email
  HAVING COUNT(*) > 1
)
SELECT * FROM duplicates;

-- 2. Pour chaque doublon, garder le premier et supprimer les autres (DÉCOMMENTEZ POUR EXÉCUTER)
-- WITH duplicates AS (
--   SELECT email, ARRAY_AGG(id ORDER BY created_at) as ids
--   FROM users
--   GROUP BY email
--   HAVING COUNT(*) > 1
-- ),
-- keep_ids AS (
--   SELECT ids[1] as keep_id
--   FROM duplicates
-- ),
-- delete_ids AS (
--   SELECT unnest(ids[2:array_length(ids, 1)]) as delete_id
--   FROM duplicates
-- )
-- DELETE FROM users
-- WHERE id IN (SELECT delete_id FROM delete_ids);

-- 3. Mettre à jour les références (par exemple, remplacer les IDs dans agency_employees)
-- (DÉCOMMENTEZ POUR EXÉCUTER APRÈS AVOIR CORRIGÉ LES DOUBLONS)
-- WITH duplicates AS (
--   SELECT email, ids[1] as keep_id, unnest(ids[2:array_length(ids, 1)]) as delete_id
--   FROM (
--     SELECT email, ARRAY_AGG(id ORDER BY created_at) as ids
--     FROM users
--     GROUP BY email
--     HAVING COUNT(*) > 1
--   ) sub
-- )
-- UPDATE agency_employees
-- SET user_id = d.keep_id
-- FROM duplicates d
-- WHERE agency_employees.user_id = d.delete_id;

-- 4. Vérifier les utilisateurs auth qui n'ont pas d'entrée dans la table users
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE u.id IS NULL;

-- 5. Créer automatiquement les entrées manquantes dans la table users
-- (DÉCOMMENTEZ POUR EXÉCUTER APRÈS VÉRIFICATION)
-- INSERT INTO users (id, email, full_name, role, created_at)
-- SELECT 
--   au.id, 
--   au.email, 
--   COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
--   COALESCE(au.raw_user_meta_data->>'role', 'agence') as role,
--   au.created_at
-- FROM auth.users au
-- LEFT JOIN users u ON au.id = u.id
-- WHERE u.id IS NULL;
