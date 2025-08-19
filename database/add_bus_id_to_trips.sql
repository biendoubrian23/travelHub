-- Ajout d'un champ bus_id dans la table trips pour référencer le bus assigné
ALTER TABLE trips 
ADD COLUMN bus_id UUID REFERENCES buses(id);

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN trips.bus_id IS 'Référence vers le bus assigné pour ce trajet';

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_trips_bus_id ON trips(bus_id);
