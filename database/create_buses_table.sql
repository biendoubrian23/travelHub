-- 🚌 CRÉATION DE LA TABLE BUSES POUR TRAVELHUB
-- Table pour gérer les bus de chaque agence
-- ⚠️ IMPORTANT: Exécuter ce script dans l'éditeur SQL de Supabase

-- Supprimer la table existante si elle existe (attention aux dépendances)
DROP TABLE IF EXISTS buses CASCADE;

-- Créer la nouvelle table buses
CREATE TABLE buses (
    -- Identifiants
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    
    -- Informations principales du bus
    name VARCHAR(100) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    
    -- Type de bus
    is_vip BOOLEAN DEFAULT FALSE,
    
    -- Notes optionnelles
    notes TEXT,
    
    -- Statut et gestion
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Créer les index pour optimiser les performances
CREATE INDEX buses_agency_id_idx ON buses(agency_id);
CREATE INDEX buses_license_plate_idx ON buses(license_plate);
CREATE INDEX buses_is_active_idx ON buses(is_active);

-- Contrainte unique pour la plaque d'immatriculation par agence
ALTER TABLE buses 
ADD CONSTRAINT buses_license_plate_agency_unique 
UNIQUE (agency_id, license_plate);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_buses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER buses_updated_at_trigger
    BEFORE UPDATE ON buses
    FOR EACH ROW
    EXECUTE FUNCTION update_buses_updated_at();

-- RLS (Row Level Security) pour s'assurer que chaque agence ne voit que ses bus
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;

-- Politique RLS : les utilisateurs ne peuvent voir que les bus de leur agence
-- Administrateurs d'agence (propriétaires)
CREATE POLICY buses_agency_owners_policy ON buses
    FOR ALL USING (
        agency_id IN (
            SELECT a.id FROM agencies a
            WHERE a.user_id = auth.uid()
        )
    );

-- Employés d'agence (via invitations acceptées dans agency_employee_invitations)
CREATE POLICY buses_agency_employees_policy ON buses
    FOR ALL USING (
        agency_id IN (
            SELECT aei.agency_id FROM agency_employee_invitations aei
            WHERE aei.user_id = auth.uid() 
            AND aei.status = 'accepted'
        )
    );

-- Politique pour l'insertion : seuls les membres de l'agence peuvent créer des bus
CREATE POLICY buses_insert_owners_policy ON buses
    FOR INSERT WITH CHECK (
        agency_id IN (
            SELECT a.id FROM agencies a
            WHERE a.user_id = auth.uid()
        )
    );

CREATE POLICY buses_insert_employees_policy ON buses
    FOR INSERT WITH CHECK (
        agency_id IN (
            SELECT aei.agency_id FROM agency_employee_invitations aei
            WHERE aei.user_id = auth.uid()
            AND aei.status = 'accepted'
        )
    );

-- Commentaires pour la documentation
COMMENT ON TABLE buses IS 'Table des bus pour chaque agence';
COMMENT ON COLUMN buses.name IS 'Nom du bus (ex: Express Voyageur)';
COMMENT ON COLUMN buses.license_plate IS 'Plaque d''immatriculation';
COMMENT ON COLUMN buses.total_seats IS 'Nombre total de places dans le bus';
COMMENT ON COLUMN buses.is_vip IS 'Indique si le bus est de catégorie VIP';
COMMENT ON COLUMN buses.notes IS 'Notes optionnelles sur le bus';
COMMENT ON COLUMN buses.is_active IS 'Statut actif/inactif du bus';

-- Messages de confirmation
SELECT 'Table buses créée avec succès!' as status;

-- Exemple d'insertion pour tester (optionnel)
/*
INSERT INTO buses (
    agency_id,
    name,
    license_plate,
    total_seats,
    is_vip,
    notes
) VALUES (
    -- Remplacer par un vrai agency_id lors de l'utilisation
    'example-agency-id',
    'Express Voyageur',
    'LT-234-CM',
    45,
    false,
    'Bus confortable avec climatisation'
) ON CONFLICT DO NOTHING;
*/
