-- Migration: Ajouter téléphone et date de naissance aux employés
-- Date: 2025-08-04
-- Description: Ajouter les champs phone et date_of_birth à la table agency_employees et users

-- 1. Ajouter les champs manquants à la table agency_employees
ALTER TABLE public.agency_employees 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 2. Ajouter les champs manquants à la table users (si pas déjà présents)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 3. Créer un index sur le téléphone pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_agency_employees_phone ON public.agency_employees(phone);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- 4. Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN public.agency_employees.phone IS 'Numéro de téléphone de l''employé';
COMMENT ON COLUMN public.agency_employees.date_of_birth IS 'Date de naissance de l''employé';
COMMENT ON COLUMN public.users.phone IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN public.users.date_of_birth IS 'Date de naissance de l''utilisateur';

-- 5. Mettre à jour la politique de sécurité pour inclure les nouveaux champs
-- Les politiques existantes s'appliquent déjà aux nouvelles colonnes
