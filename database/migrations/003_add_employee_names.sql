-- Migration pour ajouter les champs nom et prénom à agency_employees
-- Date: 2025-08-04

-- Ajouter les champs pour stocker les informations employé directement
ALTER TABLE agency_employees 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Rendre user_id optionnel pour permettre les employés sans compte auth
ALTER TABLE agency_employees 
ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter un index sur le nom complet pour les recherches
CREATE INDEX IF NOT EXISTS idx_agency_employees_full_name ON agency_employees(full_name);

-- Commentaire explicatif
COMMENT ON COLUMN agency_employees.first_name IS 'Prénom de l''employé';
COMMENT ON COLUMN agency_employees.last_name IS 'Nom de famille de l''employé';
COMMENT ON COLUMN agency_employees.full_name IS 'Nom complet de l''employé (prénom + nom)';
COMMENT ON COLUMN agency_employees.user_id IS 'ID utilisateur auth (optionnel, null si pas encore connecté)';
