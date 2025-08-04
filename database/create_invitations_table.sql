-- Étape 1: Créer la table des invitations d'employés
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
  user_id UUID REFERENCES users(id) -- Sera rempli quand l'invitation est acceptée
);

-- Étape 2: Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_invitations_token ON agency_employee_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON agency_employee_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_agency ON agency_employee_invitations(agency_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON agency_employee_invitations(status);

-- Étape 3: Activer RLS (Row Level Security)
ALTER TABLE agency_employee_invitations ENABLE ROW LEVEL SECURITY;

-- Étape 4: Créer les politiques de sécurité
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agency_employee_invitations' 
    AND policyname = 'Agency owners can manage invitations'
  ) THEN
    CREATE POLICY "Agency owners can manage invitations" ON agency_employee_invitations
      FOR ALL USING (
        agency_id IN (
          SELECT id FROM agencies WHERE user_id = auth.uid()
        )
      );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agency_employee_invitations' 
    AND policyname = 'Anyone can view invitation by token'
  ) THEN
    CREATE POLICY "Anyone can view invitation by token" ON agency_employee_invitations
      FOR SELECT USING (status = 'pending' AND expires_at > NOW());
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'agency_employee_invitations' 
    AND policyname = 'Anyone can view invitation by token'
  ) THEN
    CREATE POLICY "Anyone can view invitation by token" ON agency_employee_invitations
      FOR SELECT USING (status = 'pending' AND expires_at > NOW());
  END IF;
END
$$;
