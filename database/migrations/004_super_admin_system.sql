-- Migration 004: Système Super Admin et Invitations
-- Cette migration ajoute le système de super admin et les tables d'invitation

-- ==============================================
-- 1. TABLE DES INVITATIONS ADMIN D'AGENCE
-- ==============================================

CREATE TABLE IF NOT EXISTS agency_admin_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    admin_first_name TEXT NOT NULL,
    admin_last_name TEXT NOT NULL,
    admin_phone TEXT,
    invitation_token TEXT NOT NULL UNIQUE,
    invitation_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_agency_admin_invitations_token ON agency_admin_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_agency_admin_invitations_agency ON agency_admin_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_admin_invitations_status ON agency_admin_invitations(status);

-- ==============================================
-- 2. FONCTIONS ET TRIGGERS POUR LES INVITATIONS
-- ==============================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_agency_admin_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agency_admin_invitations_updated_at
    BEFORE UPDATE ON agency_admin_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_agency_admin_invitations_updated_at();

-- ==============================================
-- 3. POLITIQUES DE SÉCURITÉ (RLS)
-- ==============================================

-- Activer RLS sur la table
ALTER TABLE agency_admin_invitations ENABLE ROW LEVEL SECURITY;

-- Politique pour le super admin (accès complet)
CREATE POLICY "Super admin full access" ON agency_admin_invitations
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

-- Politique pour les admins d'agence (voir leurs propres invitations)
CREATE POLICY "Agency admin can view own invitations" ON agency_admin_invitations
    FOR SELECT
    TO authenticated
    USING (
        admin_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- ==============================================
-- 4. COMMENTAIRES POUR LA DOCUMENTATION
-- ==============================================

COMMENT ON TABLE agency_admin_invitations IS 'Table pour gérer les invitations des admins d''agence';
COMMENT ON COLUMN agency_admin_invitations.status IS 'Statut de l''invitation: pending, accepted, rejected, expired';
COMMENT ON COLUMN agency_admin_invitations.expires_at IS 'Date d''expiration de l''invitation (7 jours par défaut)';
