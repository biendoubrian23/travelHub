-- Migration: Corriger la structure pour les employés d'agence
-- Date: 2025-08-04
-- Description: Assurer que generated_by est toujours rempli et corriger la logique

-- 1. S'assurer que la colonne generated_by existe dans agency_employees
ALTER TABLE public.agency_employees 
ADD COLUMN IF NOT EXISTS generated_by UUID REFERENCES auth.users(id);

-- 2. Mettre à jour tous les employés existants sans generated_by
-- (les lier automatiquement au propriétaire de leur agence)
UPDATE public.agency_employees 
SET generated_by = (
    SELECT agencies.user_id 
    FROM public.agencies 
    WHERE agencies.id = agency_employees.agency_id
    LIMIT 1
)
WHERE generated_by IS NULL;

-- 3. Créer un index sur generated_by pour les performances
CREATE INDEX IF NOT EXISTS idx_agency_employees_generated_by 
ON public.agency_employees(generated_by);

-- 4. Ajouter une contrainte pour empêcher generated_by NULL à l'avenir
-- (seulement après avoir corrigé les données existantes)
ALTER TABLE public.agency_employees 
ALTER COLUMN generated_by SET NOT NULL;

-- 5. Documenter les colonnes importantes
COMMENT ON COLUMN public.agency_employees.generated_by IS 'UUID du patron qui a créé cet employé';
COMMENT ON COLUMN public.agency_employees.created_by IS 'UUID de l''utilisateur qui a créé cet enregistrement';
COMMENT ON COLUMN public.agency_employees.employee_role IS 'Rôle dans l''agence: admin, manager, employee, driver';

-- 6. Créer une vue pour faciliter les requêtes d'employés avec leurs créateurs
CREATE OR REPLACE VIEW agency_employees_with_creator AS
SELECT 
    ae.*,
    u_employee.full_name as employee_full_name,
    u_employee.email as employee_email,
    u_creator.full_name as created_by_name,
    u_creator.email as created_by_email,
    agencies.name as agency_name
FROM public.agency_employees ae
LEFT JOIN public.users u_employee ON u_employee.id = ae.user_id
LEFT JOIN public.users u_creator ON u_creator.id = ae.generated_by
LEFT JOIN public.agencies ON agencies.id = ae.agency_id;

-- 7. Permissions pour la vue
GRANT SELECT ON agency_employees_with_creator TO authenticated;
