-- 🔍 SCRIPT DE VÉRIFICATION DE LA TABLE BUSES
-- À exécuter dans l'éditeur SQL de Supabase pour vérifier que tout est en place

-- 1. Vérifier que la table buses existe
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'buses'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    a.attname as column_name
FROM pg_constraint pgc
JOIN pg_class pgcl ON pgc.conrelid = pgcl.oid
JOIN pg_attribute a ON a.attrelid = pgc.conrelid AND a.attnum = ANY(pgc.conkey)
WHERE pgcl.relname = 'buses'
ORDER BY pgc.conname;

-- 3. Vérifier les index
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'buses';

-- 4. Test d'insertion (optionnel - décommenter si besoin)
/*
-- Récupérer une agence existante pour le test
SELECT id, name FROM agencies LIMIT 1;

-- Exemple d'insertion (remplacer 'AGENCY_ID_HERE' par un vrai ID)
INSERT INTO buses (
    agency_id,
    name,
    license_plate,
    total_seats,
    is_vip,
    notes
) VALUES (
    'AGENCY_ID_HERE', -- Remplacer par un vrai UUID d'agence
    'Bus Express Test',
    'TEST-123',
    45,
    true,
    'Bus de test - supprimer après vérification'
);

-- Vérifier l'insertion
SELECT * FROM buses WHERE license_plate = 'TEST-123';

-- Nettoyer le test
DELETE FROM buses WHERE license_plate = 'TEST-123';
*/
