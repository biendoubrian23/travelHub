-- Migration pour mettre à jour la structure des rôles
-- Supprimer agency_admin et s'assurer que seuls les rôles valides sont utilisés

-- 1. Mettre à jour tous les utilisateurs avec agency_admin vers agence
UPDATE public.users 
SET role = 'agence'
WHERE role = 'agency_admin';

-- 2. Mise à jour des commentaires de la table pour refléter la nouvelle structure
COMMENT ON COLUMN public.users.role IS 'Hiérarchie des rôles: super_admin, agence, agency_manager, agency_employee, agency_driver, client';

-- 3. S'assurer que toutes les invitations futures utiliseront le bon rôle
UPDATE public.agency_employee_invitations
SET employee_role = 'admin'
WHERE employee_role = 'agency_admin';

-- 4. Ajouter une contrainte pour valider les rôles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'agence', 'agency_manager', 'agency_employee', 'agency_driver', 'client'));

-- 5. Vérifier les autres tables qui pourraient référencer les rôles
DO $$ 
BEGIN
    RAISE NOTICE 'Mise à jour de la structure des rôles terminée';
    RAISE NOTICE 'Rôles valides: super_admin, agence, agency_manager, agency_employee, agency_driver, client';
END $$;
