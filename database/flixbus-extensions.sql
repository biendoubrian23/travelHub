-- Tables supplémentaires pour la configuration FlixBus-style
-- À exécuter après les migrations existantes

-- ==============================================
-- TABLES ANALYTICS & REPORTING
-- ==============================================

-- Métriques quotidiennes pour dashboards temps réel
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_type TEXT NOT NULL, -- 'revenue', 'bookings', 'occupancy', 'satisfaction', 'punctuality'
    metric_value NUMERIC NOT NULL,
    metric_unit TEXT DEFAULT 'count', -- 'count', 'percentage', 'fcfa', 'minutes'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, date, metric_type)
);

-- Objectifs par employé et équipe
CREATE TABLE IF NOT EXISTS employee_targets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES agency_employees(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'sales', 'satisfaction', 'bookings', 'punctuality'
    target_value NUMERIC NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    current_value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed', 'cancelled'
    created_by UUID REFERENCES agency_employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPIs personnalisés par rôle
CREATE TABLE IF NOT EXISTS role_kpis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    role_type agency_employee_role NOT NULL,
    kpi_name TEXT NOT NULL,
    kpi_description TEXT,
    calculation_method TEXT, -- 'sum', 'average', 'percentage', 'count'
    target_value NUMERIC,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- GESTION FLOTTE & VÉHICULES
-- ==============================================

-- Véhicules de l'agence
CREATE TABLE IF NOT EXISTS agency_vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    vehicle_number TEXT NOT NULL,
    license_plate TEXT UNIQUE,
    model TEXT NOT NULL,
    brand TEXT,
    year INTEGER,
    capacity INTEGER NOT NULL,
    type bus_type DEFAULT 'standard',
    current_driver_id UUID REFERENCES agency_employees(id),
    purchase_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    mileage_km INTEGER DEFAULT 0,
    fuel_type TEXT DEFAULT 'diesel', -- 'diesel', 'gasoline', 'electric', 'hybrid'
    insurance_expiry DATE,
    technical_control_expiry DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, vehicle_number)
);

-- Assignations chauffeur-véhicule-trajet
CREATE TABLE IF NOT EXISTS driver_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES agency_employees(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES agency_vehicles(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'assigned', -- 'assigned', 'started', 'completed', 'cancelled'
    pre_trip_check JSONB, -- Vérifications avant départ
    post_trip_report JSONB, -- Rapport fin de trajet
    assigned_by UUID REFERENCES agency_employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance véhicules
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_id UUID NOT NULL REFERENCES agency_vehicles(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL, -- 'routine', 'repair', 'inspection', 'emergency'
    description TEXT NOT NULL,
    cost_fcfa INTEGER,
    scheduled_date DATE,
    completed_date DATE,
    performed_by TEXT, -- Nom du garage/mécanicien
    next_maintenance_km INTEGER,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- COMMUNICATION INTERNE
-- ==============================================

-- Messages internes entre employés
CREATE TABLE IF NOT EXISTS internal_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES agency_employees(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES agency_employees(id) ON DELETE CASCADE,
    recipient_role agency_employee_role, -- Pour messages broadcast à un rôle
    subject TEXT,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'normal', -- 'urgent', 'info', 'alert', 'broadcast'
    priority INTEGER DEFAULT 1, -- 1=normal, 2=high, 3=urgent
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de communication
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'email', 'sms', 'notification', 'internal'
    template_subject TEXT,
    template_content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- Variables dynamiques à remplacer
    category TEXT, -- 'booking', 'customer_service', 'internal', 'marketing'
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES agency_employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, template_name)
);

-- ==============================================
-- PERFORMANCES & ÉVALUATIONS
-- ==============================================

-- Évaluations périodiques des employés
CREATE TABLE IF NOT EXISTS employee_evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES agency_employees(id) ON DELETE CASCADE,
    evaluator_id UUID NOT NULL REFERENCES agency_employees(id),
    evaluation_period_start DATE NOT NULL,
    evaluation_period_end DATE NOT NULL,
    overall_score NUMERIC(3,2) CHECK (overall_score >= 0 AND overall_score <= 5),
    criteria JSONB NOT NULL, -- Critères structurés par rôle
    strengths TEXT,
    areas_for_improvement TEXT,
    action_plan TEXT,
    next_evaluation_date DATE,
    status TEXT DEFAULT 'draft', -- 'draft', 'completed', 'approved', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suggestions d'amélioration des employés
CREATE TABLE IF NOT EXISTS improvement_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES agency_employees(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL, -- 'process', 'system', 'service', 'training', 'equipment'
    category TEXT, -- 'operations', 'customer_service', 'safety', 'efficiency'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_benefit TEXT,
    implementation_effort TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'implemented', 'rejected'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    reviewed_by UUID REFERENCES agency_employees(id),
    review_notes TEXT,
    implementation_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formations et certifications
CREATE TABLE IF NOT EXISTS employee_training (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES agency_employees(id) ON DELETE CASCADE,
    training_name TEXT NOT NULL,
    training_type TEXT NOT NULL, -- 'mandatory', 'optional', 'certification', 'skill_development'
    training_provider TEXT,
    start_date DATE,
    end_date DATE,
    completion_date DATE,
    score NUMERIC(3,2),
    certification_number TEXT,
    expiry_date DATE,
    status TEXT DEFAULT 'planned', -- 'planned', 'in_progress', 'completed', 'failed', 'cancelled'
    cost_fcfa INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- CUSTOMER RELATIONSHIP MANAGEMENT (CRM)
-- ==============================================

-- Interactions clients détaillées
CREATE TABLE IF NOT EXISTS customer_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES agency_employees(id),
    interaction_type TEXT NOT NULL, -- 'call', 'email', 'chat', 'in_person', 'complaint', 'compliment'
    channel TEXT, -- 'phone', 'email', 'website', 'app', 'office', 'social_media'
    subject TEXT,
    description TEXT NOT NULL,
    outcome TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Programmes de fidélité
CREATE TABLE IF NOT EXISTS loyalty_program (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    tier_level TEXT DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
    total_spent_fcfa INTEGER DEFAULT 0,
    total_trips INTEGER DEFAULT 0,
    member_since DATE DEFAULT CURRENT_DATE,
    last_activity DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, customer_id)
);

-- ==============================================
-- PERMISSIONS GRANULAIRES
-- ==============================================

-- Permissions spécifiques par module
CREATE TABLE IF NOT EXISTS module_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES agency_employees(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL, -- 'dashboard', 'trips', 'bookings', 'customers', 'reports', etc.
    permission_type TEXT NOT NULL, -- 'view', 'create', 'edit', 'delete', 'export', 'approve'
    is_granted BOOLEAN DEFAULT true,
    granted_by UUID REFERENCES agency_employees(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    notes TEXT,
    
    UNIQUE(employee_id, module_name, permission_type)
);

-- Configuration d'interface par rôle
CREATE TABLE IF NOT EXISTS role_interface_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    role_type agency_employee_role NOT NULL,
    module_name TEXT NOT NULL,
    config_key TEXT NOT NULL,
    config_value JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, role_type, module_name, config_key)
);

-- ==============================================
-- INDEX POUR PERFORMANCES
-- ==============================================

-- Index pour les métriques
CREATE INDEX IF NOT EXISTS idx_daily_metrics_agency_date ON daily_metrics(agency_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_type ON daily_metrics(metric_type);

-- Index pour les véhicules
CREATE INDEX IF NOT EXISTS idx_agency_vehicles_agency_id ON agency_vehicles(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_vehicles_driver ON agency_vehicles(current_driver_id);
CREATE INDEX IF NOT EXISTS idx_agency_vehicles_active ON agency_vehicles(is_active);

-- Index pour les assignations
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_vehicle ON driver_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_date ON driver_assignments(assignment_date);

-- Index pour les messages
CREATE INDEX IF NOT EXISTS idx_internal_messages_recipient ON internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_unread ON internal_messages(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_internal_messages_agency ON internal_messages(agency_id);

-- Index pour les interactions clients
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_employee ON customer_interactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_date ON customer_interactions(created_at);

-- ==============================================
-- FONCTIONS UTILITAIRES
-- ==============================================

-- Fonction pour calculer les KPIs automatiquement
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void AS $$
BEGIN
    -- Insérer/mettre à jour les métriques du jour pour chaque agence
    INSERT INTO daily_metrics (agency_id, date, metric_type, metric_value)
    SELECT 
        a.id as agency_id,
        CURRENT_DATE as date,
        'total_bookings' as metric_type,
        COUNT(b.id) as metric_value
    FROM agencies a
    LEFT JOIN trips t ON t.agency_id = a.id
    LEFT JOIN bookings b ON b.trip_id = t.id AND DATE(b.created_at) = CURRENT_DATE
    GROUP BY a.id
    ON CONFLICT (agency_id, date, metric_type)
    DO UPDATE SET metric_value = EXCLUDED.metric_value;
    
    -- Ajouter d'autres calculs de métriques ici
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour mettre à jour les métriques automatiquement
CREATE OR REPLACE FUNCTION update_metrics_trigger()
RETURNS trigger AS $$
BEGIN
    -- Déclencher le recalcul des métriques quand il y a une nouvelle réservation
    PERFORM calculate_daily_metrics();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le déclencheur sur les réservations
DROP TRIGGER IF EXISTS trigger_update_metrics ON bookings;
CREATE TRIGGER trigger_update_metrics
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_metrics_trigger();

-- ==============================================
-- POLITIQUES RLS
-- ==============================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques pour les métriques
CREATE POLICY "Agency members can view metrics" ON daily_metrics
    FOR SELECT USING (
        agency_id IN (
            SELECT id FROM agencies WHERE user_id = auth.uid()
            UNION
            SELECT agency_id FROM agency_employees WHERE user_id = auth.uid()
        )
    );

-- Politiques pour les véhicules
CREATE POLICY "Agency access for vehicles" ON agency_vehicles
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE user_id = auth.uid()
            UNION
            SELECT agency_id FROM agency_employees WHERE user_id = auth.uid()
        )
    );

-- Politiques pour les messages
CREATE POLICY "Employees can view their messages" ON internal_messages
    FOR SELECT USING (
        recipient_id IN (SELECT id FROM agency_employees WHERE user_id = auth.uid())
        OR sender_id IN (SELECT id FROM agency_employees WHERE user_id = auth.uid())
    );

-- Ajouter d'autres politiques selon les besoins...
