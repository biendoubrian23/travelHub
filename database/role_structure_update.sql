-- Script pour mettre à jour la structure des rôles selon la hiérarchie correcte
-- Rôles dans l'ordre de pouvoir :
-- 1. super_admin
-- 2. agence (admin d'agence)
-- 3. agency_manager
-- 4. agency_employee
-- 5. agency_driver

-- 1. Mettre à jour les types de roles autorisés dans la table des invitations
ALTER TABLE agency_employee_invitations DROP CONSTRAINT IF EXISTS agency_employee_invitations_employee_role_check;
ALTER TABLE agency_employee_invitations ADD CONSTRAINT agency_employee_invitations_employee_role_check 
  CHECK (employee_role IN ('admin', 'manager', 'employee', 'driver'));
COMMENT ON COLUMN agency_employee_invitations.employee_role IS 'Rôle dans l''agence: admin (converti en agence), manager (converti en agency_manager), employee (converti en agency_employee) ou driver (converti en agency_driver)';

-- 2. Mettre à jour la fonction de traitement des invitations pour utiliser le rôle "agence" au lieu de "agency_admin"
CREATE OR REPLACE FUNCTION handle_invitation_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_user_role TEXT;
BEGIN
  -- Vérifier si l'utilisateur a un token d'invitation dans ses métadonnées
  IF NEW.raw_user_meta_data IS NOT NULL AND NEW.raw_user_meta_data ? 'invitation_token' THEN
    
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM agency_employee_invitations
    WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      -- Déterminer le user_role selon la hiérarchie officielle
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agence'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      -- Créer l'utilisateur dans notre table users (avec gestion des conflits)
      INSERT INTO public.users (
        id, email, full_name, phone, date_of_birth, role, is_active
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', v_invitation.first_name || ' ' || v_invitation.last_name),
        COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
        v_invitation.date_of_birth,
        v_user_role,
        true
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        is_active = true;
      
      -- Créer l'employé dans agency_employees (avec gestion des conflits)
      INSERT INTO public.agency_employees (
        agency_id, user_id, employee_role, notes, 
        created_by, phone, date_of_birth, is_active, hire_date
      ) VALUES (
        v_invitation.agency_id,
        NEW.id,
        v_invitation.employee_role,
        v_invitation.notes,
        v_invitation.invited_by,
        COALESCE(NEW.raw_user_meta_data->>'phone', v_invitation.phone),
        v_invitation.date_of_birth,
        true,
        CURRENT_DATE
      )
      ON CONFLICT (user_id, agency_id) DO UPDATE SET
        employee_role = EXCLUDED.employee_role,
        is_active = true,
        hire_date = EXCLUDED.hire_date;
      
      -- Marquer l'invitation comme acceptée
      UPDATE agency_employee_invitations
      SET 
        status = 'accepted',
        accepted_at = NOW(),
        user_id = NEW.id,
        updated_at = NOW()
      WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Assurer que les triggers utilisent la fonction mise à jour
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;
CREATE TRIGGER on_auth_user_created_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_signup();

-- 4. Mise à jour similaire pour la table agency_admin_invitations (utilisée par le super_admin)
-- Note: Si nécessaire, créez un trigger spécifique pour les invitations admin

-- 5. Mettre à jour les utilisateurs existants qui pourraient avoir des rôles obsolètes
UPDATE users 
SET role = 'agence' 
WHERE role = 'agency_admin' OR role = 'admin';

-- Vérification que les rôles sont conformes à la hiérarchie
DO $$
BEGIN
  RAISE NOTICE 'Nombre d''utilisateurs par rôle :';
  RAISE NOTICE 'super_admin: %', (SELECT COUNT(*) FROM users WHERE role = 'super_admin');
  RAISE NOTICE 'agence: %', (SELECT COUNT(*) FROM users WHERE role = 'agence');
  RAISE NOTICE 'agency_manager: %', (SELECT COUNT(*) FROM users WHERE role = 'agency_manager');
  RAISE NOTICE 'agency_employee: %', (SELECT COUNT(*) FROM users WHERE role = 'agency_employee');
  RAISE NOTICE 'agency_driver: %', (SELECT COUNT(*) FROM users WHERE role = 'agency_driver');
END $$;
