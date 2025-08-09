-- Migration 004: Système Super Admin et création d'agences
-- Date: 9 août 2025
-- Description: Refactorisation pour ajouter le super admin et la gestion des agences

-- ==============================================
-- 1. AJOUT DU SUPER ADMIN DANS LA BASE
-- ==============================================

-- Créer le super admin avec l'email spécifique
INSERT INTO users (
    id,
    email,
    role,
    full_name,
    phone,
    created_at,
    is_active,
    email_verified
) VALUES (
    gen_random_uuid(),
    'djayoubrian@gmail.com',
    'super_admin',
    'Brian Djayou',
    '+237123456789',
    NOW(),
    true,
    true
) ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    full_name = 'Brian Djayou',
    is_active = true,
    email_verified = true;

-- ==============================================
-- 2. TABLE POUR GÉRER LES INVITATIONS D'ADMINS D'AGENCE
-- ==============================================

CREATE TABLE IF NOT EXISTS agency_admin_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
    admin_email VARCHAR(255) NOT NULL,
    admin_first_name VARCHAR(100) NOT NULL,
    admin_last_name VARCHAR(100) NOT NULL,
    admin_phone VARCHAR(20),
    invitation_token UUID UNIQUE DEFAULT gen_random_uuid(),
    invitation_url TEXT NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE NULL
);

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_agency_admin_invitations_token ON agency_admin_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_agency_admin_invitations_agency ON agency_admin_invitations(agency_id);

-- ==============================================
-- 3. FONCTION POUR GÉNÉRER L'EMAIL DE L'ADMIN
-- ==============================================

CREATE OR REPLACE FUNCTION generate_admin_email(
    first_name TEXT,
    last_name TEXT,
    agency_name TEXT
) RETURNS TEXT AS $$
DECLARE
    clean_first_name TEXT;
    clean_last_name TEXT;
    clean_agency_name TEXT;
    generated_email TEXT;
BEGIN
    -- Nettoyer et normaliser les noms (supprimer accents, espaces, caractères spéciaux)
    clean_first_name := LOWER(
        REGEXP_REPLACE(
            UNACCENT(TRIM(first_name)), 
            '[^a-z0-9]', 
            '', 
            'g'
        )
    );
    
    clean_last_name := LOWER(
        REGEXP_REPLACE(
            UNACCENT(TRIM(last_name)), 
            '[^a-z0-9]', 
            '', 
            'g'
        )
    );
    
    clean_agency_name := LOWER(
        REGEXP_REPLACE(
            UNACCENT(TRIM(agency_name)), 
            '[^a-z0-9]', 
            '', 
            'g'
        )
    );
    
    -- Générer l'email
    generated_email := clean_first_name || '.' || clean_last_name || '@' || clean_agency_name || '.com';
    
    RETURN generated_email;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 4. FONCTION POUR CRÉER UNE INVITATION D'ADMIN
-- ==============================================

CREATE OR REPLACE FUNCTION create_agency_admin_invitation(
    p_agency_id UUID,
    p_invited_by UUID,
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_phone VARCHAR(20) DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_agency_name VARCHAR(255);
    v_admin_email VARCHAR(255);
    v_invitation_token UUID;
    v_invitation_url TEXT;
    v_base_url TEXT;
    v_invitation_id UUID;
BEGIN
    -- Récupérer le nom de l'agence
    SELECT name INTO v_agency_name
    FROM agencies 
    WHERE id = p_agency_id;
    
    IF v_agency_name IS NULL THEN
        RAISE EXCEPTION 'Agence non trouvée';
    END IF;
    
    -- Générer l'email de l'admin
    v_admin_email := generate_admin_email(p_first_name, p_last_name, v_agency_name);
    
    -- Générer le token d'invitation
    v_invitation_token := gen_random_uuid();
    
    -- URL de base (à adapter selon votre domaine)
    v_base_url := 'https://travelhub-app.com/admin-signup';
    v_invitation_url := v_base_url || '?token=' || v_invitation_token;
    
    -- Insérer l'invitation
    INSERT INTO agency_admin_invitations (
        agency_id,
        invited_by,
        admin_email,
        admin_first_name,
        admin_last_name,
        admin_phone,
        invitation_token,
        invitation_url
    ) VALUES (
        p_agency_id,
        p_invited_by,
        v_admin_email,
        p_first_name,
        p_last_name,
        p_phone,
        v_invitation_token,
        v_invitation_url
    ) RETURNING id INTO v_invitation_id;
    
    -- Retourner les informations de l'invitation
    RETURN json_build_object(
        'invitation_id', v_invitation_id,
        'admin_email', v_admin_email,
        'invitation_url', v_invitation_url,
        'invitation_token', v_invitation_token,
        'expires_at', (NOW() + INTERVAL '7 days')
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erreur lors de la création de l''invitation: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 5. FONCTION POUR VALIDER ET UTILISER UNE INVITATION
-- ==============================================

CREATE OR REPLACE FUNCTION validate_admin_invitation(
    p_invitation_token UUID,
    p_password TEXT
) RETURNS JSON AS $$
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
    
    -- Créer l'utilisateur admin
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
        'agency_admin',
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
        'role', 'agency_admin'
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Un utilisateur avec cet email existe déjà';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erreur lors de la création du compte admin: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 6. PERMISSIONS POUR LE SUPER ADMIN
-- ==============================================

-- Le super admin peut tout faire
-- Ces permissions seront gérées au niveau de l'application

-- ==============================================
-- 7. POLITIQUE DE SÉCURITÉ (RLS) POUR LES NOUVELLES TABLES
-- ==============================================

-- Activer RLS sur la table des invitations
ALTER TABLE agency_admin_invitations ENABLE ROW LEVEL SECURITY;

-- Politique pour le super admin (peut tout voir)
CREATE POLICY "Super admin full access" ON agency_admin_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Politique pour les admins d'agence (peuvent voir leurs invitations)
CREATE POLICY "Agency admin can view own invitations" ON agency_admin_invitations
    FOR SELECT USING (
        agency_id IN (
            SELECT agency_id FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('agency_admin', 'agence')
        )
    );

COMMENT ON TABLE agency_admin_invitations IS 'Table pour gérer les invitations des admins d''agence';
COMMENT ON FUNCTION generate_admin_email IS 'Génère automatiquement l''email d''un admin basé sur nom.prenom@agence.com';
COMMENT ON FUNCTION create_agency_admin_invitation IS 'Crée une invitation pour un nouvel admin d''agence';
COMMENT ON FUNCTION validate_admin_invitation IS 'Valide et active un compte admin via le token d''invitation';
