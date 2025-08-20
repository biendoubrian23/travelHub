-- Script SQL complet pour créer toute la base de données TravelHub
-- (Application mobile + Portail web agences)
-- À exécuter dans Supabase SQL Editor après avoir supprimé toutes les tables existantes

-- ==============================================
-- 1. SUPPRESSION DES TABLES EXISTANTES (Optionnel)
-- ==============================================
-- Décommenter si vous voulez repartir de zéro

DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS seat_maps CASCADE;
DROP TABLE IF EXISTS trip_services CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS agency_capabilities CASCADE;
DROP TABLE IF EXISTS agency_services CASCADE;
DROP TABLE IF EXISTS agency_notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS agency_statistics CASCADE;
DROP TABLE IF EXISTS agency_settings CASCADE;
DROP TABLE IF EXISTS agency_documents CASCADE;
DROP TABLE IF EXISTS agency_employees CASCADE;
DROP TABLE IF EXISTS agencies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS agency_employee_role CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS bus_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS seat_type CASCADE;


-- ==============================================
-- 2. CRÉATION DES TYPES ENUM
-- ==============================================

-- Rôles utilisateurs (mobile + web)
CREATE TYPE user_role AS ENUM (
    'client',           -- Utilisateurs app mobile
    'agence',           -- Propriétaire d'agence (super admin)
    'agency_admin',     -- Admin d'agence
    'agency_manager',   -- Manager d'agence
    'agency_employee',  -- Employé d'agence
    'agency_driver',    -- Conducteur
    'super_admin'       -- Admin système
);

-- Rôles spécifiques employés d'agence
CREATE TYPE agency_employee_role AS ENUM (
    'admin',        -- Accès complet agence
    'manager',      -- Gestion équipe + réservations
    'employee',     -- Réservations + consultation
    'driver'        -- Accès conducteur
);

-- Types de documents
CREATE TYPE document_type AS ENUM (
    'license',          -- Licence transport
    'insurance',        -- Assurance
    'registration',     -- Immatriculation véhicules
    'tax_certificate',  -- Certificat fiscal
    'identity_card',    -- Carte d'identité
    'other'            -- Autres documents
);

-- Actions d'audit
CREATE TYPE audit_action AS ENUM (
    'create', 'update', 'delete', 'login', 'logout', 'view'
);

-- Types de bus (pour app mobile)
CREATE TYPE bus_type AS ENUM (
    'vip', 'standard', 'minivan', 'luxury'
);

-- Statuts de réservation
CREATE TYPE booking_status AS ENUM (
    'confirmed', 'cancelled', 'pending', 'completed'
);

-- Statuts de paiement
CREATE TYPE payment_status AS ENUM (
    'paid', 'failed', 'pending', 'refunded'
);

-- Types de sièges
CREATE TYPE seat_type AS ENUM (
    'standard', 'premium', 'vip'
);

-- ==============================================
-- 3. TABLE USERS (Partagée mobile + web)
-- ==============================================
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    date_of_birth DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    -- Champs pour les employés générés automatiquement
    is_generated_user BOOLEAN DEFAULT false,
    password_changed BOOLEAN DEFAULT false,
    generated_by UUID REFERENCES users(id)
);

-- ==============================================
-- 4. TABLE AGENCIES (Partagée mobile + web)
-- ==============================================
CREATE TABLE agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    license_number TEXT,
    description TEXT,
    logo_url TEXT,
    rating NUMERIC(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================
-- 5. TABLES SPÉCIFIQUES WEB (Gestion agences)
-- ==============================================

-- Employés d'agence avec système de rôles
CREATE TABLE agency_employees (
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
    -- Informations pour les comptes générés
    generated_email TEXT,
    temp_password TEXT, -- Mot de passe temporaire (sera hashé côté client)
    
    UNIQUE(agency_id, user_id)
);

-- Documents d'agence
CREATE TABLE agency_documents (
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

-- Paramètres d'agence
CREATE TABLE agency_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agency_id, setting_key)
);

-- Statistiques d'agence (dashboard)
CREATE TABLE agency_statistics (
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

-- Logs d'audit
CREATE TABLE audit_logs (
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

-- Notifications agences
CREATE TABLE agency_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Services d'agence
CREATE TABLE agency_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Capacités d'agence
CREATE TABLE agency_capabilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    bus_count INTEGER DEFAULT 0,
    total_seats INTEGER DEFAULT 0,
    vip_buses INTEGER DEFAULT 0,
    standard_buses INTEGER DEFAULT 0,
    minivan_count INTEGER DEFAULT 0,
    max_daily_trips INTEGER DEFAULT 10,
    coverage_areas TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(agency_id)
);

-- ==============================================
-- 6. TABLES APP MOBILE (Trajets et réservations)
-- ==============================================

-- Trajets
CREATE TABLE trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    departure_city TEXT NOT NULL,
    arrival_city TEXT NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    total_seats INTEGER DEFAULT 40,
    available_seats INTEGER DEFAULT 40,
    price_fcfa INTEGER NOT NULL,
    bus_type bus_type DEFAULT 'standard',
    description TEXT,
    amenities TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Réservations
CREATE TABLE bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    passenger_name TEXT NOT NULL,
    passenger_phone TEXT NOT NULL,
    seat_number TEXT,
    total_price_fcfa INTEGER NOT NULL,
    booking_reference TEXT UNIQUE NOT NULL,
    booking_status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method TEXT,
    payment_reference TEXT,
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services par trajet
CREATE TABLE trip_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    is_included BOOLEAN DEFAULT true,
    additional_cost_fcfa INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plans de sièges
CREATE TABLE seat_maps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    position_row INTEGER NOT NULL,
    position_column INTEGER NOT NULL,
    seat_type seat_type DEFAULT 'standard',
    is_available BOOLEAN DEFAULT true,
    price_modifier_fcfa INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(trip_id, seat_number)
);

-- Favoris utilisateurs
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, trip_id)
);

-- ==============================================
-- 7. INDEX POUR PERFORMANCES
-- ==============================================

-- Index utilisateurs
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Index agences
CREATE INDEX idx_agencies_user_id ON agencies(user_id);
CREATE INDEX idx_agencies_verified ON agencies(is_verified);

-- Index employés
CREATE INDEX idx_agency_employees_agency_id ON agency_employees(agency_id);
CREATE INDEX idx_agency_employees_user_id ON agency_employees(user_id);
CREATE INDEX idx_agency_employees_role ON agency_employees(employee_role);

-- Index trajets
CREATE INDEX idx_trips_agency_id ON trips(agency_id);
CREATE INDEX idx_trips_departure_time ON trips(departure_time);
CREATE INDEX idx_trips_cities ON trips(departure_city, arrival_city);
CREATE INDEX idx_trips_active ON trips(is_active);

-- Index réservations
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- Index autres
CREATE INDEX idx_agency_statistics_agency_date ON agency_statistics(agency_id, date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==============================================
-- 8. FONCTIONS UTILITAIRES
-- ==============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Fonction pour générer un email unique
CREATE OR REPLACE FUNCTION generate_employee_email(
    first_name TEXT,
    last_name TEXT,
    agency_name TEXT
)
RETURNS TEXT AS $$
DECLARE
    base_email TEXT;
    final_email TEXT;
    counter INTEGER := 1;
BEGIN
    -- Nettoyer et formater les noms
    first_name := LOWER(REGEXP_REPLACE(first_name, '[^a-zA-Z]', '', 'g'));
    last_name := LOWER(REGEXP_REPLACE(last_name, '[^a-zA-Z]', '', 'g'));
    agency_name := LOWER(REGEXP_REPLACE(agency_name, '[^a-zA-Z]', '', 'g'));
    
    -- Créer l'email de base
    base_email := first_name || '.' || last_name || '@' || agency_name || '.com';
    final_email := base_email;
    
    -- Vérifier l'unicité et ajouter un numéro si nécessaire
    WHILE EXISTS (SELECT 1 FROM users WHERE email = final_email) LOOP
        counter := counter + 1;
        final_email := first_name || '.' || last_name || counter || '@' || agency_name || '.com';
    END LOOP;
    
    RETURN final_email;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un mot de passe temporaire
CREATE OR REPLACE FUNCTION generate_temp_password()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier les permissions
CREATE OR REPLACE FUNCTION check_agency_permission(
    user_uuid UUID,
    agency_uuid UUID,
    required_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Récupérer le rôle de l'utilisateur
    SELECT ae.employee_role
    INTO user_role
    FROM agency_employees ae
    WHERE ae.user_id = user_uuid 
    AND ae.agency_id = agency_uuid 
    AND ae.is_active = true;
    
    -- Si pas trouvé, vérifier si c'est le propriétaire
    IF user_role IS NULL THEN
        SELECT CASE WHEN a.user_id = user_uuid THEN 'admin' ELSE NULL END
        INTO user_role
        FROM agencies a
        WHERE a.id = agency_uuid;
    END IF;
    
    -- Vérifier les permissions
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

-- ==============================================
-- 9. TRIGGERS
-- ==============================================

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_employees_updated_at BEFORE UPDATE ON agency_employees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_documents_updated_at BEFORE UPDATE ON agency_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_settings_updated_at BEFORE UPDATE ON agency_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_capabilities_updated_at BEFORE UPDATE ON agency_capabilities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Activer RLS sur toutes les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques RLS pour agencies
CREATE POLICY "Agency owners can manage their agency" ON agencies
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Agency employees can view their agency" ON agencies
    FOR SELECT USING (
        id IN (SELECT agency_id FROM agency_employees WHERE user_id = auth.uid())
    );

-- Politiques RLS pour agency_employees
CREATE POLICY "Agency access for employees" ON agency_employees
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE user_id = auth.uid()
            UNION
            SELECT agency_id FROM agency_employees WHERE user_id = auth.uid()
        )
    );

-- Politiques similaires pour les autres tables...
CREATE POLICY "Agency access for documents" ON agency_documents
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE user_id = auth.uid()
            UNION
            SELECT agency_id FROM agency_employees WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency access for trips" ON trips
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE user_id = auth.uid()
            UNION
            SELECT agency_id FROM agency_employees WHERE user_id = auth.uid()
        )
    );

-- Politiques pour les clients (app mobile)
CREATE POLICY "Clients can view active trips" ON trips
    FOR SELECT USING (is_active = true);

CREATE POLICY "Clients can manage their bookings" ON bookings
    FOR ALL USING (user_id = auth.uid());

-- ==============================================
-- 11. DONNÉES INITIALES
-- ==============================================

-- Insérer un super admin par défaut (optionnel)
/*
INSERT INTO users (id, email, full_name, role) 
VALUES (
    gen_random_uuid(),
    'admin@travelhub.cm',
    'Administrateur Système',
    'super_admin'
);
*/
