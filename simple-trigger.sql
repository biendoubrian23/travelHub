-- Version simplifiée du trigger (en cas de problème avec la version complète)

CREATE OR REPLACE FUNCTION handle_invitation_signup_simple()
RETURNS TRIGGER AS $$
BEGIN
  -- Version minimaliste : juste créer l'utilisateur de base
  IF NEW.raw_user_meta_data ? 'invitation_token' THEN
    
    -- Créer l'utilisateur dans public.users
    INSERT INTO public.users (
      id, 
      email, 
      full_name,
      role, 
      is_active
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      'agency_employee',
      true
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Le reste sera géré manuellement ou par d'autres triggers
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger simplifié
DROP TRIGGER IF EXISTS on_auth_user_created_invitation ON auth.users;
CREATE TRIGGER on_auth_user_created_invitation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_invitation_signup_simple();
