-- Alternative: Trigger qui met à jour le rôle APRÈS insertion
-- Si l'autre approche ne fonctionne pas

CREATE OR REPLACE FUNCTION update_user_role_after_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_invitation RECORD;
  v_user_role VARCHAR;
BEGIN
  -- Attendre un petit délai pour que l'insertion soit complète
  PERFORM pg_sleep(0.1);
  
  -- Vérifier si c'est un signup avec invitation
  IF NEW.raw_user_meta_data ? 'invitation_token' THEN
    
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM public.agency_employee_invitations
    WHERE invitation_token = (NEW.raw_user_meta_data->>'invitation_token')::UUID
      AND status = 'pending'
      AND expires_at > NOW();
    
    IF FOUND THEN
      -- Calculer le bon rôle
      v_user_role := CASE v_invitation.employee_role
        WHEN 'admin' THEN 'agency_admin'
        WHEN 'manager' THEN 'agency_manager'
        WHEN 'employee' THEN 'agency_employee'
        WHEN 'driver' THEN 'agency_driver'
        ELSE 'agency_employee'
      END;
      
      -- FORCER la mise à jour du rôle
      UPDATE public.users 
      SET 
        role = v_user_role,
        updated_at = NOW()
      WHERE id = NEW.id;
      
      RAISE NOTICE 'Rôle forcé à % pour user %', v_user_role, NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un trigger supplémentaire qui s'exécute APRÈS les autres
DROP TRIGGER IF EXISTS force_user_role_update ON auth.users;
CREATE TRIGGER force_user_role_update
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION update_user_role_after_signup();
