-- Script SQL pour configurer la suppression en cascade
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier la contrainte actuelle
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'seat_maps'
    AND kcu.column_name = 'trip_id';

-- 2. Supprimer l'ancienne contrainte (remplacer 'nom_contrainte' par le vrai nom)
-- ALTER TABLE seat_maps DROP CONSTRAINT nom_contrainte_existante;

-- 3. Ajouter la nouvelle contrainte avec CASCADE DELETE
ALTER TABLE seat_maps 
ADD CONSTRAINT seat_maps_trip_id_fkey 
FOREIGN KEY (trip_id) 
REFERENCES trips(id) 
ON DELETE CASCADE;

-- 4. Vérifier que la contrainte est correctement configurée
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'seat_maps'
    AND kcu.column_name = 'trip_id';

-- Le delete_rule devrait maintenant être 'CASCADE'
