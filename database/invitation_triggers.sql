-- Trigger pour créer automatiquement l'employé quand un utilisateur s'inscrit via invitation
CREATE OR REPLACE FUNCTION handle_invitation_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_user_role VARCHAR;
BEGIN
  -- Vérifier si l'utilisateur a un token d'invitation dans ses métadonnées
  IF NEW.raw_user_meta_data ? 'invitation_token' THEN
    
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM agency_employee_invitations
    WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      -- Déterminer le user_role
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agence'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      -- Créer l'utilisateur dans notre table users
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
      );
      
      -- Créer l'employé dans agency_employees
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
      );
      
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;
CREATE TRIGGER on_auth_user_created_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_signup();

-- Fonction pour nettoyer les invitations expirées
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE agency_employee_invitations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour annuler une invitation
CREATE OR REPLACE FUNCTION cancel_invitation(p_invitation_id UUID)
RETURNS boolean AS $$
DECLARE
  v_agency_id UUID;
BEGIN
  -- Récupérer l'agency_id de l'invitation
  SELECT agency_id INTO v_agency_id
  FROM agency_employee_invitations
  WHERE id = p_invitation_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Vérifier que l'utilisateur actuel est propriétaire de l'agence
  IF NOT EXISTS (
    SELECT 1 FROM agencies 
    WHERE id = v_agency_id AND owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;
  
  -- Annuler l'invitation
  UPDATE agency_employee_invitations
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_invitation_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
