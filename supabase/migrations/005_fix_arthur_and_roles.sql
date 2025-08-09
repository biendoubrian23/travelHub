-- Migration: Corriger les employés existants et assurer la cohérence des rôles
-- Date: 2025-08-04
-- Description: Corriger Arthur et améliorer la structure des employés

-- 1. Mettre à jour l'employé Arthur avec le bon generated_by (en utilisant l'email pour l'identifier)
UPDATE public.agency_employees 
SET generated_by = (
    SELECT agencies.user_id 
    FROM public.agencies 
    WHERE agencies.id = agency_employees.agency_id
    LIMIT 1
)
WHERE user_id IN (
    SELECT id FROM public.users WHERE full_name = 'arthur nguekeu' OR email LIKE 'arthur.nguekeu%'
)
AND generated_by IS NULL;

-- 2. Corriger le rôle d'Arthur dans la table users selon son employee_role
UPDATE public.users 
SET role = CASE 
    WHEN ae.employee_role = 'admin' THEN 'agence'
    WHEN ae.employee_role = 'manager' THEN 'agency_manager' 
    WHEN ae.employee_role = 'employee' THEN 'agency_employee'
    WHEN ae.employee_role = 'driver' THEN 'agency_driver'
    ELSE 'agency_employee'
END
FROM public.agency_employees ae
WHERE users.id = ae.user_id 
AND (users.full_name = 'arthur nguekeu' OR users.email LIKE 'arthur.nguekeu%');

-- 3. Assurer que tous les employés existants ont un generated_by correct
UPDATE public.agency_employees 
SET generated_by = (
    SELECT agencies.user_id 
    FROM public.agencies 
    WHERE agencies.id = agency_employees.agency_id
    LIMIT 1
)
WHERE generated_by IS NULL;

-- 4. Corriger tous les rôles users selon leurs employee_role
UPDATE public.users 
SET role = CASE 
    WHEN ae.employee_role = 'admin' THEN 'agence'
    WHEN ae.employee_role = 'manager' THEN 'agency_manager' 
    WHEN ae.employee_role = 'employee' THEN 'agency_employee'
    WHEN ae.employee_role = 'driver' THEN 'agency_driver'
    ELSE role -- Garder le rôle existant si pas d'employee_role
END
FROM public.agency_employees ae
WHERE users.id = ae.user_id 
AND users.role IN ('agency_employee'); -- Seulement ceux qui ont le rôle générique

-- 5. Ajouter des contraintes pour éviter le problème à l'avenir
ALTER TABLE public.agency_employees 
ADD CONSTRAINT check_generated_by_not_null 
CHECK (generated_by IS NOT NULL);

-- 6. Créer un index sur generated_by pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_agency_employees_generated_by 
ON public.agency_employees(generated_by);

-- 7. Documenter les rôles
COMMENT ON COLUMN public.users.role IS 'Rôle spécifique: agency_admin, agency_manager, agency_employee, agency_driver, client, super_admin';
COMMENT ON COLUMN public.agency_employees.employee_role IS 'Rôle dans l''agence: admin, manager, employee, driver';

-- Vérification finale
SELECT 
    ae.employee_role,
    u.role as user_role,
    u.full_name,
    u.email,
    ae.generated_by,
    ae.is_active
FROM public.agency_employees ae
LEFT JOIN public.users u ON u.id = ae.user_id
WHERE u.full_name = 'arthur nguekeu' OR u.email LIKE 'arthur.nguekeu%';
