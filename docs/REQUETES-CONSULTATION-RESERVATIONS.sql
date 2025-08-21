-- Consulter toutes les réservations avec détails des sièges
SELECT 
    b.booking_reference,
    b.passenger_name,
    b.passenger_phone,
    b.seat_number,
    b.total_price_fcfa,
    b.booking_status,
    b.payment_status,
    t.departure_city,
    t.arrival_city,
    t.departure_date,
    sm.position_row,
    sm.position_column,
    sm.seat_type
FROM bookings b
JOIN trips t ON b.trip_id = t.id
LEFT JOIN seat_maps sm ON b.trip_id = sm.trip_id AND b.seat_number = sm.seat_number
WHERE b.booking_status != 'cancelled'
ORDER BY b.created_at DESC;

-- Consulter les réservations d'un client spécifique
SELECT 
    b.*,
    t.departure_city,
    t.arrival_city,
    t.departure_date
FROM bookings b
JOIN trips t ON b.trip_id = t.id
WHERE b.user_id = 'ID_DU_CLIENT'
ORDER BY b.created_at DESC;

-- Voir l'occupation des sièges pour un trajet
SELECT 
    sm.seat_number,
    sm.position_row,
    sm.position_column,
    sm.is_available,
    b.passenger_name,
    b.booking_reference
FROM seat_maps sm
LEFT JOIN bookings b ON sm.trip_id = b.trip_id 
    AND sm.seat_number = b.seat_number 
    AND b.booking_status != 'cancelled'
WHERE sm.trip_id = 'ID_DU_TRAJET'
ORDER BY sm.position_row, sm.position_column;
