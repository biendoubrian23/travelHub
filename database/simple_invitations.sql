-- Version simplifiée des fonctions d'invitation (compatible SQL Server/PostgreSQL)

-- Table des invitations (à exécuter dans Supabase)
/*
CREATE TABLE agency_employee_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  employee_role VARCHAR(50) NOT NULL CHECK (employee_role IN ('admin', 'manager', 'employee', 'driver')),
  notes TEXT,
  invitation_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES users(id)
);

-- Index pour les performances
CREATE INDEX idx_invitations_token ON agency_employee_invitations(invitation_token);
CREATE INDEX idx_invitations_email ON agency_employee_invitations(email);
CREATE INDEX idx_invitations_agency ON agency_employee_invitations(agency_id);
CREATE INDEX idx_invitations_status ON agency_employee_invitations(status);

-- RLS (Row Level Security)
ALTER TABLE agency_employee_invitations ENABLE ROW LEVEL SECURITY;

-- Politique pour les propriétaires d'agence
CREATE POLICY "Agency owners can manage invitations" ON agency_employee_invitations
  FOR ALL USING (
    agency_id IN (
      SELECT id FROM agencies WHERE owner_id = auth.uid()
    )
  );

-- Politique pour voir les invitations publiques (pour l'inscription)
CREATE POLICY "Anyone can view invitation by token" ON agency_employee_invitations
  FOR SELECT USING (status = 'pending' AND expires_at > NOW());
*/
