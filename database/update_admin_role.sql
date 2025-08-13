-- Mettre à jour la structure des rôles dans agency_admin_invitations

-- 1. Créer une fonction pour accepter les invitations avec le bon rôle "agence"
CREATE OR REPLACE FUNCTION validate_admin_invitation(
    p_invitation_token UUID,
    p_password TEXT
)
RETURNS JSON AS $$
DECLARE
    v_invitation agency_admin_invitations%ROWTYPE;
    v_user_id UUID;
    v_agency agencies%ROWTYPE;
BEGIN
    -- Récupérer l'invitation
    SELECT * INTO v_invitation
    FROM agency_admin_invitations
    WHERE invitation_token = p_invitation_token
      AND is_used = FALSE
      AND expires_at > NOW();
    
    IF v_invitation.id IS NULL THEN
        RAISE EXCEPTION 'Invitation invalide ou expirée';
    END IF;
    
    -- Récupérer les informations de l'agence
    SELECT * INTO v_agency
    FROM agencies
    WHERE id = v_invitation.agency_id;
    
    -- Créer l'utilisateur admin avec le rôle "agence" (au lieu de agency_admin)
    INSERT INTO users (
        email,
        role,
        full_name,
        phone,
        agency_id,
        is_active,
        email_verified,
        created_at
    ) VALUES (
        v_invitation.admin_email,
        'agence',  -- Utiliser le rôle "agence" au lieu de "agency_admin"
        v_invitation.admin_first_name || ' ' || v_invitation.admin_last_name,
        v_invitation.admin_phone,
        v_invitation.agency_id,
        true,
        true,
        NOW()
    ) RETURNING id INTO v_user_id;
    
    -- Marquer l'invitation comme utilisée
    UPDATE agency_admin_invitations
    SET is_used = true, used_at = NOW()
    WHERE id = v_invitation.id;
    
    -- Retourner les informations
    RETURN json_build_object(
        'user_id', v_user_id,
        'email', v_invitation.admin_email,
        'agency_name', v_agency.name,
        'agency_id', v_invitation.agency_id,
        'role', 'agence'  -- Retourner le bon rôle "agence"
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Un utilisateur avec cet email existe déjà';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erreur lors de la création du compte admin: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 2. Mettre à jour les politiques de sécurité pour inclure le rôle "agence"
DROP POLICY IF EXISTS "Agency admin can view own invitations" ON agency_admin_invitations;
CREATE POLICY "Agency admin can view own invitations" ON agency_admin_invitations
    FOR SELECT USING (
        agency_id IN (
            SELECT agency_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('agence')  -- Uniquement le rôle "agence" maintenant
        )
    );

-- 3. Mettre à jour les utilisateurs existants qui ont l'ancien rôle
UPDATE users SET role = 'agence' WHERE role = 'agency_admin';
