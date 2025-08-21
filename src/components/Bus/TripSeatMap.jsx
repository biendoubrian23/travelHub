import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './TripSeatMap.css';

const TripSeatMap = ({ tripId, busCapacity = 50, onSeatSelect, readOnly = false, showLegend = true }) => {
  const { userProfile } = useAuth();
  const [seatMap, setSeatMap] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Configuration du plan de siège standard (2-2 layout)
  const SEATS_PER_ROW = 4;
  const ROWS_COUNT = Math.ceil(busCapacity / SEATS_PER_ROW);

  // Charger les données des sièges et réservations
  const loadSeatData = useCallback(async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      setError('');

      // 1. Charger les informations de la table seat_maps
      const { data: seatMapsData, error: seatMapsError } = await supabase
        .from('seat_maps')
        .select('*')
        .eq('trip_id', tripId)
        .order('position_row, position_column');

      if (seatMapsError) {
        console.error('Erreur lors du chargement des seat_maps:', seatMapsError);
      }

      // 2. Charger les réservations confirmées pour ce voyage
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          seat_number,
          passenger_name,
          passenger_phone,
          booking_status,
          payment_status
        `)
        .eq('trip_id', tripId)
        .in('booking_status', ['confirmed', 'pending']);

      if (bookingsError) {
        console.error('Erreur lors du chargement des réservations:', bookingsError);
        throw bookingsError;
      }

      // 3. Générer la carte des sièges si elle n'existe pas dans seat_maps
      let seatMapStructure = seatMapsData || [];
      
      if (!seatMapsData || seatMapsData.length === 0) {
        // Créer automatiquement la structure de siège si elle n'existe pas
        seatMapStructure = await generateDefaultSeatMap();
      }

      // 4. Combiner les données
      const combinedSeatData = seatMapStructure.map(seat => {
        const booking = bookingsData?.find(b => b.seat_number === seat.seat_number);
        return {
          ...seat,
          isOccupied: !!booking,
          booking: booking || null,
          status: booking ? 'occupied' : (seat.is_available ? 'available' : 'unavailable')
        };
      });

      setSeatMap(combinedSeatData);
      setBookings(bookingsData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données de siège:', error);
      setError('Erreur lors du chargement du plan des sièges');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Générer une carte de siège par défaut
  const generateDefaultSeatMap = async () => {
    const defaultSeats = [];
    let seatNumber = 1;

    for (let row = 1; row <= ROWS_COUNT; row++) {
      for (let col = 1; col <= SEATS_PER_ROW; col++) {
        if (seatNumber <= busCapacity) {
          const seatData = {
            trip_id: tripId,
            seat_number: seatNumber.toString(),
            position_row: row,
            position_column: col,
            seat_type: 'standard',
            is_available: true,
            price_modifier_fcfa: 0
          };

          defaultSeats.push(seatData);
          seatNumber++;
        }
      }
    }

    // Sauvegarder dans la base de données
    try {
      const { data: insertedSeats, error: insertError } = await supabase
        .from('seat_maps')
        .insert(defaultSeats)
        .select();

      if (insertError) {
        console.error('Erreur lors de la création des sièges:', insertError);
        return defaultSeats; // Retourner les données locales en cas d'erreur
      }

      return insertedSeats;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des sièges:', error);
      return defaultSeats;
    }
  };

  // Gérer la sélection d'un siège
  const handleSeatClick = (seat) => {
    if (readOnly || seat.status === 'occupied' || !seat.is_available) {
      return;
    }

    const seatNumber = parseInt(seat.seat_number);
    const isSelected = selectedSeats.includes(seatNumber);

    let newSelection;
    if (isSelected) {
      newSelection = selectedSeats.filter(s => s !== seatNumber);
    } else {
      newSelection = [...selectedSeats, seatNumber];
    }

    setSelectedSeats(newSelection);
    
    if (onSeatSelect) {
      onSeatSelect(newSelection);
    }
  };

  // Organiser les sièges par rangée
  const organizeSeatsByRow = () => {
    const rows = {};
    
    seatMap.forEach(seat => {
      const rowNum = seat.position_row;
      if (!rows[rowNum]) {
        rows[rowNum] = [];
      }
      rows[rowNum].push(seat);
    });

    // Trier les sièges par colonne dans chaque rangée
    Object.keys(rows).forEach(rowNum => {
      rows[rowNum].sort((a, b) => a.position_column - b.position_column);
    });

    return rows;
  };

  // Obtenir la classe CSS pour un siège
  const getSeatClass = (seat) => {
    const baseClass = 'travelhub-seat';
    const seatNumber = parseInt(seat.seat_number);
    const isSelected = selectedSeats.includes(seatNumber);

    let statusClass = '';
    if (seat.status === 'occupied') {
      statusClass = 'travelhub-seat-occupied';
    } else if (!seat.is_available) {
      statusClass = 'travelhub-seat-unavailable';
    } else if (isSelected) {
      statusClass = 'travelhub-seat-selected';
    } else {
      statusClass = 'travelhub-seat-available';
    }

    return `${baseClass} ${statusClass}`;
  };

  // Obtenir l'icône pour un siège
  const getSeatIcon = (seat) => {
    if (seat.status === 'occupied') return '👤';
    if (!seat.is_available) return '❌';
    if (selectedSeats.includes(parseInt(seat.seat_number))) return '✅';
    return '💺';
  };

  // Reserver un siège (pour les agents)
  const reserveSeat = async (seatNumber, passengerData) => {
    try {
      // Créer une réservation temporaire
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userProfile.id,
          trip_id: tripId,
          passenger_name: passengerData.name,
          passenger_phone: passengerData.phone,
          seat_number: seatNumber.toString(),
          total_price_fcfa: passengerData.price,
          booking_reference: generateBookingReference(),
          booking_status: 'confirmed',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Recharger les données
      await loadSeatData();
      
      return booking;
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      throw error;
    }
  };

  // Générer une référence de réservation
  const generateBookingReference = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BKG-${timestamp}-${random}`;
  };

  useEffect(() => {
    loadSeatData();
  }, [loadSeatData]);

  if (loading) {
    return (
      <div className="travelhub-seat-map-loading">
        <div className="travelhub-loading-spinner"></div>
        <p>Chargement du plan des sièges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="travelhub-seat-map-error">
        <p>❌ {error}</p>
        <button onClick={loadSeatData} className="travelhub-retry-btn">
          Réessayer
        </button>
      </div>
    );
  }

  const seatRows = organizeSeatsByRow();
  const occupiedCount = seatMap.filter(seat => seat.status === 'occupied').length;
  const availableCount = seatMap.filter(seat => seat.status === 'available').length;

  return (
    <div className="travelhub-seat-map-container">
      {/* En-tête avec statistiques */}
      <div className="travelhub-seat-map-header">
        <h3>🚌 Plan des sièges</h3>
        <div className="travelhub-seat-stats">
          <span className="travelhub-stat-item travelhub-occupied">
            👤 {occupiedCount} occupés
          </span>
          <span className="travelhub-stat-item travelhub-available">
            💺 {availableCount} libres
          </span>
          <span className="travelhub-stat-item travelhub-total">
            📊 {busCapacity} total
          </span>
        </div>
      </div>

      {/* Plan de siège visuel */}
      <div className="travelhub-seat-map">
        {/* Avant du bus */}
        <div className="travelhub-bus-front">
          <div className="travelhub-driver-area">🚗 Conducteur</div>
        </div>

        {/* Rangées de sièges */}
        <div className="travelhub-seat-rows">
          {Object.keys(seatRows).sort((a, b) => a - b).map(rowNum => (
            <div key={rowNum} className="travelhub-seat-row">
              <div className="travelhub-row-number">{rowNum}</div>
              
              {/* Sièges gauche */}
              <div className="travelhub-seats-left">
                {seatRows[rowNum]
                  .filter(seat => seat.position_column <= 2)
                  .map(seat => (
                    <div
                      key={seat.seat_number}
                      className={getSeatClass(seat)}
                      onClick={() => handleSeatClick(seat)}
                      title={`Siège ${seat.seat_number}${seat.booking ? ` - ${seat.booking.passenger_name}` : ''}`}
                    >
                      <span className="travelhub-seat-icon">
                        {getSeatIcon(seat)}
                      </span>
                      <span className="travelhub-seat-number">
                        {seat.seat_number}
                      </span>
                    </div>
                  ))
                }
              </div>

              {/* Allée */}
              <div className="travelhub-aisle"></div>

              {/* Sièges droite */}
              <div className="travelhub-seats-right">
                {seatRows[rowNum]
                  .filter(seat => seat.position_column > 2)
                  .map(seat => (
                    <div
                      key={seat.seat_number}
                      className={getSeatClass(seat)}
                      onClick={() => handleSeatClick(seat)}
                      title={`Siège ${seat.seat_number}${seat.booking ? ` - ${seat.booking.passenger_name}` : ''}`}
                    >
                      <span className="travelhub-seat-icon">
                        {getSeatIcon(seat)}
                      </span>
                      <span className="travelhub-seat-number">
                        {seat.seat_number}
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>

        {/* Arrière du bus */}
        <div className="travelhub-bus-back">
          <div className="travelhub-emergency-exit">
            🚪 Sortie de secours
          </div>
        </div>
      </div>

      {/* Légende */}
      {showLegend && (
        <div className="travelhub-seat-legend">
          <h4>Légende :</h4>
          <div className="travelhub-legend-items">
            <div className="travelhub-legend-item">
              <span className="travelhub-seat travelhub-seat-available">💺</span>
              <span>Libre</span>
            </div>
            <div className="travelhub-legend-item">
              <span className="travelhub-seat travelhub-seat-occupied">👤</span>
              <span>Occupé</span>
            </div>
            <div className="travelhub-legend-item">
              <span className="travelhub-seat travelhub-seat-selected">✅</span>
              <span>Sélectionné</span>
            </div>
            <div className="travelhub-legend-item">
              <span className="travelhub-seat travelhub-seat-unavailable">❌</span>
              <span>Indisponible</span>
            </div>
          </div>
        </div>
      )}

      {/* Sièges sélectionnés */}
      {selectedSeats.length > 0 && (
        <div className="travelhub-selected-seats">
          <h4>Sièges sélectionnés :</h4>
          <div className="travelhub-selected-list">
            {selectedSeats.map(seatNum => (
              <span key={seatNum} className="travelhub-selected-seat-tag">
                Siège {seatNum}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripSeatMap;
