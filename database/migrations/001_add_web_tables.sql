-- Migration pour ajouter les tables nécessaires à la partie web IntranetTravelHub
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Mise à jour des types ENUM existants
DO $$
BEGIN
    -- Mise à jour du type user_role pour inclure les nouveaux rôles d'agence
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') THEN
        CREATE TYPE user_role_new AS ENUM (
            'client', 
            'agence', 
            'agency_admin', 
            'agency_manager', 
            'agency_employee', 
            'super_admin'
        );
    END IF;

    -- Créer le type agency_employee_role
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agency_employee_role') THEN
        CREATE TYPE agency_employee_role AS ENUM (
            'admin',
            'manager', 
            'employee',
            'driver'
        );
    END IF;

    -- Créer le type document_type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM (
            'license',
            'insurance',
            'registration',
            'tax_certificate',
            'identity_card',
            'other'
        );
    END IF;

    -- Créer le type audit_action
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_action') THEN
        CREATE TYPE audit_action AS ENUM (
            'create',
            'update',
            'delete',
            'login',
            'logout',
            'view'
        );
    END IF;
END $$;

-- 2. Table des employés d'agence avec système de rôles
CREATE TABLE IF NOT EXISTS agency_employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_role agency_employee_role NOT NULL DEFAULT 'employee',
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    salary_fcfa INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    notes TEXT,
    
    UNIQUE(agency_id, user_id)
);

-- 3. Table des documents d'agence (pour les documents uploaded lors de l'inscription)
CREATE TABLE IF NOT EXISTS agency_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    expires_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table des paramètres d'agence
CREATE TABLE IF NOT EXISTS agency_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agency_id, setting_key)
);

-- 5. Table des statistiques d'agence (pour le dashboard)
CREATE TABLE IF NOT EXISTS agency_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_bookings INTEGER DEFAULT 0,
    total_revenue_fcfa INTEGER DEFAULT 0,
    active_trips INTEGER DEFAULT 0,
    cancelled_bookings INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agency_id, date)
);

-- 6. Table des logs d'audit pour traçabilité
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    agency_id UUID REFERENCES agencies(id),
    table_name TEXT NOT NULL,
    record_id UUID,
    action audit_action NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Table des notifications pour les agences
CREATE TABLE IF NOT EXISTS agency_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, error, success
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- 8. Table des services d'agence (pour compléter les informations lors de l'inscription)
CREATE TABLE IF NOT EXISTS agency_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Table des capacités d'agence (bus, sièges, etc.)
CREATE TABLE IF NOT EXISTS agency_capabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    bus_count INTEGER DEFAULT 0,
    total_seats INTEGER DEFAULT 0,
    vip_buses INTEGER DEFAULT 0,
    standard_buses INTEGER DEFAULT 0,
    minivan_count INTEGER DEFAULT 0,
    max_daily_trips INTEGER,
    coverage_areas TEXT[], -- Zones géographiques couvertes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agency_id)
);

-- 10. Ajout d'index pour performance
CREATE INDEX IF NOT EXISTS idx_agency_employees_agency_id ON agency_employees(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_employees_user_id ON agency_employees(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_employees_role ON agency_employees(employee_role);
CREATE INDEX IF NOT EXISTS idx_agency_documents_agency_id ON agency_documents(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_documents_type ON agency_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_agency_statistics_agency_date ON agency_statistics(agency_id, date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_agency_id ON audit_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_agency_notifications_agency_id ON agency_notifications(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_notifications_user_id ON agency_notifications(user_id);

-- 11. Triggers pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables qui ont updated_at
CREATE TRIGGER update_agency_employees_updated_at BEFORE UPDATE ON agency_employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_documents_updated_at BEFORE UPDATE ON agency_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_settings_updated_at BEFORE UPDATE ON agency_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_capabilities_updated_at BEFORE UPDATE ON agency_capabilities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Fonctions pour gestion des permissions
CREATE OR REPLACE FUNCTION check_agency_permission(
    user_uuid UUID,
    agency_uuid UUID,
    required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    user_permissions TEXT[];
BEGIN
    -- Récupérer le rôle et permissions de l'utilisateur
    SELECT ae.employee_role, ae.permissions
    INTO user_role, user_permissions
    FROM agency_employees ae
    WHERE ae.user_id = user_uuid 
    AND ae.agency_id = agency_uuid 
    AND ae.is_active = true;
    
    -- Si pas trouvé, vérifier si c'est le propriétaire de l'agence
    IF user_role IS NULL THEN
        SELECT CASE WHEN a.user_id = user_uuid THEN 'admin' ELSE NULL END
        INTO user_role
        FROM agencies a
        WHERE a.id = agency_uuid;
    END IF;
    
    -- Vérifier les permissions selon le rôle
    RETURN CASE 
        WHEN user_role = 'admin' THEN true
        WHEN user_role = 'manager' AND required_permission IN (
            'trips:view', 'trips:create', 'trips:update',
            'bookings:view_all', 'bookings:create', 'bookings:update', 'bookings:cancel',
            'employees:view', 'finances:view'
        ) THEN true
        WHEN user_role = 'employee' AND required_permission IN (
            'trips:view', 'bookings:view', 'bookings:create', 'bookings:update'
        ) THEN true
        WHEN user_role = 'driver' AND required_permission IN (
            'trips:view', 'bookings:view'
        ) THEN true
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Politiques RLS (Row Level Security)
ALTER TABLE agency_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_capabilities ENABLE ROW LEVEL SECURITY;

-- Politiques pour agency_employees
CREATE POLICY "Agency employees can view their own agency employees" ON agency_employees
    FOR SELECT USING (
        agency_id IN (
            SELECT a.id FROM agencies a WHERE a.user_id = auth.uid()
            UNION
            SELECT ae.agency_id FROM agency_employees ae WHERE ae.user_id = auth.uid()
        )
    );

CREATE POLICY "Agency admins can manage employees" ON agency_employees
    FOR ALL USING (
        agency_id IN (
            SELECT a.id FROM agencies a WHERE a.user_id = auth.uid()
            UNION
            SELECT ae.agency_id FROM agency_employees ae 
            WHERE ae.user_id = auth.uid() AND ae.employee_role IN ('admin', 'manager')
        )
    );

-- Politiques similaires pour les autres tables...
CREATE POLICY "Agency access for documents" ON agency_documents
    FOR ALL USING (
        agency_id IN (
            SELECT a.id FROM agencies a WHERE a.user_id = auth.uid()
            UNION
            SELECT ae.agency_id FROM agency_employees ae WHERE ae.user_id = auth.uid()
        )
    );

-- 14. Insertion de données de test pour le dashboard
INSERT INTO agency_statistics (agency_id, date, total_bookings, total_revenue_fcfa, active_trips, cancelled_bookings, new_customers)
SELECT 
    a.id,
    CURRENT_DATE - (RANDOM() * 30)::INTEGER,
    (RANDOM() * 50)::INTEGER,
    (RANDOM() * 1000000)::INTEGER,
    (RANDOM() * 10)::INTEGER,
    (RANDOM() * 5)::INTEGER,
    (RANDOM() * 15)::INTEGER
FROM agencies a
WHERE NOT EXISTS (
    SELECT 1 FROM agency_statistics WHERE agency_id = a.id
);
