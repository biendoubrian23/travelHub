-- Version simplifiée pour test rapide (sans RLS)
CREATE TABLE IF NOT EXISTS agency_employee_invitations (
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
CREATE INDEX IF NOT EXISTS idx_invitations_token ON agency_employee_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON agency_employee_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_agency ON agency_employee_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON agency_employee_invitations(status);

-- Note: RLS sera ajouté plus tard une fois qu'on connaît la structure exacte
