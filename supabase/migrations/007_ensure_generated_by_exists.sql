-- Migration: Vérifier et corriger la structure de agency_employees
-- Date: 2025-08-04
-- Description: S'assurer que generated_by existe et est bien configuré

-- 1. Ajouter la colonne generated_by si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agency_employees' 
        AND column_name = 'generated_by'
    ) THEN
        ALTER TABLE public.agency_employees 
        ADD COLUMN generated_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Mettre à jour tous les employés existants sans generated_by
UPDATE public.agency_employees 
SET generated_by = (
    SELECT agencies.user_id 
    FROM public.agencies 
    WHERE agencies.id = agency_employees.agency_id
    LIMIT 1
)
WHERE generated_by IS NULL;

-- 3. Créer un index sur generated_by pour les performances (si n'existe pas)
CREATE INDEX IF NOT EXISTS idx_agency_employees_generated_by 
ON public.agency_employees(generated_by);

-- 4. Vérifier la structure actuelle de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'agency_employees' 
AND table_schema = 'public'
ORDER BY ordinal_position;
