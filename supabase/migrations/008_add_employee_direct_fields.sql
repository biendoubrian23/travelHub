-- Migration: Ajouter colonnes pour gestion des employés sans compte auth
-- Date: 2025-01-04

-- Ajouter des colonnes pour stocker les informations des employés directement
ALTER TABLE agency_employees 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending_creation',
ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'agency_employee';

-- Ajouter des commentaires pour clarifier l'usage
COMMENT ON COLUMN agency_employees.first_name IS 'Prénom de l''employé';
COMMENT ON COLUMN agency_employees.last_name IS 'Nom de famille de l''employé';
COMMENT ON COLUMN agency_employees.email IS 'Email de l''employé (peut être différent de generated_email)';
COMMENT ON COLUMN agency_employees.account_status IS 'Statut du compte: pending_creation, active, suspended';
COMMENT ON COLUMN agency_employees.user_role IS 'Rôle pour la création du compte utilisateur';

-- Mettre à jour les enregistrements existants qui ont un user_id
UPDATE agency_employees 
SET 
    first_name = SPLIT_PART(u.full_name, ' ', 1),
    last_name = SUBSTRING(u.full_name FROM POSITION(' ' IN u.full_name) + 1),
    email = u.email,
    account_status = 'active',
    user_role = u.role
FROM users u 
WHERE agency_employees.user_id = u.id 
AND agency_employees.first_name IS NULL;

-- Ajouter un index sur l'email pour les recherches
CREATE INDEX IF NOT EXISTS idx_agency_employees_email ON agency_employees(email);
CREATE INDEX IF NOT EXISTS idx_agency_employees_status ON agency_employees(account_status);
