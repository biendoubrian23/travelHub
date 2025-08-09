-- Script pour corriger tous les rôles agency_admin en agence
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Afficher les utilisateurs avec le rôle agency_admin
SELECT id, email, full_name, role FROM users WHERE role = 'agency_admin';

-- 2. Mettre à jour tous les utilisateurs agency_admin vers agence
UPDATE users
SET role = 'agence'
WHERE role = 'agency_admin';

-- 3. Vérifier qu'il n'y a plus d'utilisateurs agency_admin
SELECT id, email, full_name, role FROM users WHERE role = 'agency_admin';

-- 4. Afficher la répartition des rôles
SELECT role, COUNT(*) FROM users GROUP BY role ORDER BY COUNT(*) DESC;

-- 5. Vérification des agences et de leurs propriétaires
SELECT 
  a.id as agency_id,
  a.name as agency_name,
  a.owner_id,
  u.email as owner_email,
  u.role as owner_role
FROM 
  agencies a
JOIN 
  users u ON a.owner_id = u.id;

-- 6. S'assurer que tous les propriétaires d'agence ont le rôle 'agence'
UPDATE users
SET role = 'agence'
WHERE id IN (SELECT owner_id FROM agencies)
  AND role != 'agence';
