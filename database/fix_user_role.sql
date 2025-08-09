-- Script pour corriger le rôle de l'utilisateur et créer l'employé d'agence
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Corriger le rôle de l'utilisateur existant
UPDATE users 
SET role = 'agence'
WHERE email = 'test.test@test.com' AND role = 'user';

-- 2. Créer l'enregistrement dans agency_employees si il n'existe pas
INSERT INTO agency_employees (
  agency_id,
  user_id,
  employee_role,
  hire_date,
  is_active
)
SELECT 
  aei.agency_id,
  u.id,
  aei.employee_role::agency_employee_role,
  CURRENT_DATE,
  true
FROM agency_employee_invitations aei
JOIN users u ON u.email = aei.email
WHERE aei.status = 'accepted' 
  AND aei.email = 'test.test@test.com'
  AND NOT EXISTS (
    SELECT 1 FROM agency_employees ae 
    WHERE ae.user_id = u.id AND ae.agency_id = aei.agency_id
  );

-- 3. Vérifier que tout est correct
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  ae.employee_role,
  a.name as agency_name
FROM users u
LEFT JOIN agency_employees ae ON ae.user_id = u.id
LEFT JOIN agencies a ON a.id = ae.agency_id
WHERE u.email = 'test.test@test.com';
