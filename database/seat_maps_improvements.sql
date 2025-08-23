-- 🔧 AMÉLIORATION DE LA TABLE SEAT_MAPS
-- Nouvelles colonnes suggérées pour une meilleure maintenance et fonctionnalités

-- 1. INFORMATIONS TEMPORELLES
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ NULL;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ NULL;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();

-- 2. INFORMATIONS DE RÉSERVATION
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS reserved_by UUID REFERENCES auth.users(id) NULL;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) NULL;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS reservation_status TEXT DEFAULT 'available' CHECK (reservation_status IN ('available', 'reserved', 'occupied', 'blocked', 'maintenance'));

-- 3. INFORMATIONS TARIFAIRES
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS base_price_fcfa INTEGER DEFAULT 0;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS final_price_fcfa INTEGER DEFAULT 0;

-- 4. MÉTADONNÉES TECHNIQUES
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS seat_features JSONB DEFAULT '{}';
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS blocked_reason TEXT NULL;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS notes TEXT NULL;

-- 5. AUDIT ET TRAÇABILITÉ
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) NULL;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) NULL;
ALTER TABLE seat_maps ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- 6. INDEX POUR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_seat_maps_trip_available ON seat_maps(trip_id, is_available);
CREATE INDEX IF NOT EXISTS idx_seat_maps_reservation_status ON seat_maps(reservation_status);
CREATE INDEX IF NOT EXISTS idx_seat_maps_reserved_by ON seat_maps(reserved_by);
CREATE INDEX IF NOT EXISTS idx_seat_maps_booking_id ON seat_maps(booking_id);

-- 7. TRIGGER POUR MISE À JOUR AUTOMATIQUE
CREATE OR REPLACE FUNCTION update_seat_maps_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    NEW.version = OLD.version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_seat_maps_timestamp ON seat_maps;
CREATE TRIGGER trigger_update_seat_maps_timestamp
    BEFORE UPDATE ON seat_maps
    FOR EACH ROW
    EXECUTE FUNCTION update_seat_maps_timestamp();

-- 8. CONTRAINTES DE COHÉRENCE
ALTER TABLE seat_maps ADD CONSTRAINT check_seat_position 
    CHECK (position_row > 0 AND position_column > 0);

ALTER TABLE seat_maps ADD CONSTRAINT check_price_positive 
    CHECK (base_price_fcfa >= 0 AND final_price_fcfa >= 0);

-- 9. FONCTION HELPER POUR CALCULER LE PRIX FINAL
CREATE OR REPLACE FUNCTION calculate_final_seat_price(
    base_price INTEGER,
    modifier_price INTEGER,
    seat_features JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
    final_price INTEGER;
    vip_multiplier NUMERIC := 1.0;
    window_bonus INTEGER := 0;
BEGIN
    final_price := base_price + COALESCE(modifier_price, 0);
    
    -- Bonus VIP
    IF (seat_features->>'is_vip')::BOOLEAN = true THEN
        vip_multiplier := 1.5;
    END IF;
    
    -- Bonus siège fenêtre
    IF (seat_features->>'is_window')::BOOLEAN = true THEN
        window_bonus := 1000; -- 1000 FCFA bonus
    END IF;
    
    RETURN (final_price * vip_multiplier)::INTEGER + window_bonus;
END;
$$ LANGUAGE plpgsql;
