-- Migration: Uniformiser les rôles admin vers agence
-- Date: 2025-08-09
-- Description: Mise à jour des utilisateurs avec rôle agency_admin vers agence

-- 1. Mettre à jour tous les utilisateurs avec le rôle agency_admin vers agence
UPDATE public.users 
SET role = 'agence'
WHERE role = 'agency_admin';

-- 2. S'assurer que les mappings de rôles sont cohérents dans tous les triggers
-- IMPORTANT: Cette partie est commentée car les changements ont été faits dans les fichiers de migration
-- et les scripts SQL

-- 3. Ajouter un commentaire dans la colonne role pour clarifier les rôles disponibles
COMMENT ON COLUMN public.users.role IS 'Rôle spécifique: agence, agency_manager, agency_employee, agency_driver, client, super_admin';
