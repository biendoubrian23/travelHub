-- Fonction pour créer une invitation
CREATE OR REPLACE FUNCTION create_employee_invitation(
  p_agency_id UUID,
  p_email VARCHAR,
  p_first_name VARCHAR,
  p_last_name VARCHAR,
  p_phone VARCHAR DEFAULT NULL,
  p_date_of_birth DATE DEFAULT NULL,
  p_employee_role VARCHAR DEFAULT 'employee',
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation_id UUID;
  v_token UUID;
  v_agency_name VARCHAR;
BEGIN
  -- Vérifier que l'utilisateur est propriétaire de l'agence
  IF NOT EXISTS (
    SELECT 1 FROM agencies 
    WHERE id = p_agency_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Non autorisé à créer des invitations pour cette agence';
  END IF;

  -- Vérifier si l'email n'existe pas déjà
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Un utilisateur avec cet email existe déjà';
  END IF;

  -- Vérifier si une invitation pending existe déjà
  IF EXISTS (
    SELECT 1 FROM agency_employee_invitations 
    WHERE email = p_email AND agency_id = p_agency_id AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Une invitation est déjà en cours pour cet email';
  END IF;

  -- Récupérer le nom de l'agence
  SELECT name INTO v_agency_name FROM agencies WHERE id = p_agency_id;

  -- Créer l'invitation
  INSERT INTO agency_employee_invitations (
    agency_id, email, first_name, last_name, phone, date_of_birth,
    employee_role, notes, invited_by
  ) VALUES (
    p_agency_id, p_email, p_first_name, p_last_name, p_phone, p_date_of_birth,
    p_employee_role, p_notes, auth.uid()
  )
  RETURNING id, invitation_token INTO v_invitation_id, v_token;

  -- Retourner les informations
  RETURN json_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'token', v_token,
    'agency_name', v_agency_name,
    'email', p_email,
    'full_name', p_first_name || ' ' || p_last_name,
    'role', p_employee_role
  );
END;
$$;

-- Fonction pour accepter une invitation
CREATE OR REPLACE FUNCTION accept_employee_invitation(
  p_token UUID,
  p_password VARCHAR,
  p_user_metadata JSON DEFAULT '{}'::JSON
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_user_id UUID;
  v_user_role VARCHAR;
  v_agency_name VARCHAR;
BEGIN
  -- Récupérer l'invitation
  SELECT * INTO v_invitation
  FROM agency_employee_invitations
  WHERE invitation_token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation non trouvée, expirée ou déjà utilisée';
  END IF;

  -- Déterminer le user_role basé sur employee_role
  v_user_role := CASE v_invitation.employee_role
    WHEN 'admin' THEN 'agency_admin'
    WHEN 'manager' THEN 'agency_manager'
    WHEN 'employee' THEN 'agency_employee'
    WHEN 'driver' THEN 'agency_driver'
    ELSE 'agency_employee'
  END;

  -- Récupérer le nom de l'agence
  SELECT name INTO v_agency_name FROM agencies WHERE id = v_invitation.agency_id;

  -- Créer le compte utilisateur dans auth.users via admin
  -- Note: Cette partie nécessitera un appel depuis le frontend avec supabaseAdmin
  
  -- Pour l'instant, on retourne les informations nécessaires
  RETURN json_build_object(
    'success', true,
    'invitation', row_to_json(v_invitation),
    'user_role', v_user_role,
    'agency_name', v_agency_name
  );
END;
$$;

-- Fonction pour valider un token d'invitation
CREATE OR REPLACE FUNCTION validate_invitation_token(p_token UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
  v_agency_name VARCHAR;
BEGIN
  -- Récupérer l'invitation avec les détails de l'agence
  SELECT i.*, a.name as agency_name
  INTO v_invitation
  FROM agency_employee_invitations i
  JOIN agencies a ON i.agency_id = a.id
  WHERE i.invitation_token = p_token
    AND i.status = 'pending'
    AND i.expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invitation non trouvée, expirée ou déjà utilisée'
    );
  END IF;

  RETURN json_build_object(
    'valid', true,
    'invitation', row_to_json(v_invitation)
  );
END;
$$;
