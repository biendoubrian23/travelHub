import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useRolePermissions } from '../RoleBasedComponents';
import './TripSeatMap.css';

const TripSeatMap = ({ trip, onBack, mode = 'admin' }) => {
  const { userProfile, agency } = useAuth();
  const { hasPermission } = useRolePermissions();
  const [seatMaps, setSeatMaps] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('visual'); // 'visual' ou 'list'

  useEffect(() => {
    if (trip?.id) {
      loadSeatMaps();
      loadBookings();
    }
  }, [trip?.id]);

  // Charger la configuration des sièges pour ce voyage
  const loadSeatMaps = async () => {
    try {
      setError('');
      console.log('🪑 Chargement du plan des sièges pour le voyage:', trip.id);

      const { data, error } = await supabase
        .from('seat_maps')
        .select('*')
        .eq('trip_id', trip.id)
        .order('position_row', { ascending: true })
        .order('position_column', { ascending: true });

      if (error) {
        console.error('❌ Erreur chargement seat_maps:', error);
        throw error;
      }

      console.log('✅ Plan des sièges chargé:', data?.length || 0, 'sièges');
      setSeatMaps(data || []);

      // Si aucun plan de sièges n'existe, créer un plan par défaut
      if (!data || data.length === 0) {
        await createDefaultSeatMap();
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du plan des sièges:', error);
      setError('Erreur lors du chargement du plan des sièges');
    }
  };

  // Charger les réservations pour ce voyage
  const loadBookings = async () => {
    try {
      console.log('📋 Chargement des réservations pour le voyage:', trip.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:user_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('trip_id', trip.id)
        .in('status', ['confirmed', 'pending']); // Statuts actifs

      if (error) {
        console.error('❌ Erreur chargement bookings:', error);
        throw error;
      }

      console.log('✅ Réservations chargées:', data?.length || 0);
      setBookings(data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer un plan de sièges par défaut basé sur la capacité du bus
  const createDefaultSeatMap = async () => {
    try {
      console.log('🆕 Création du plan de sièges par défaut...');
      
      // Obtenir les infos du bus pour ce voyage
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          *,
          bus:bus_id (
            id,
            capacity,
            number
          )
        `)
        .eq('id', trip.id)
        .single();

      if (tripError || !tripData?.bus?.capacity) {
        console.warn('⚠️ Impossible de récupérer la capacité du bus');
        return;
      }

      const capacity = tripData.bus.capacity;
      const seatsToCreate = [];

      // Configuration standard : 4 sièges par rangée (2-2 avec allée centrale)
      const seatsPerRow = 4;
      const totalRows = Math.ceil(capacity / seatsPerRow);

      let seatNumber = 1;

      for (let row = 1; row <= totalRows; row++) {
        for (let col = 1; col <= seatsPerRow && seatNumber <= capacity; col++) {
          seatsToCreate.push({
            trip_id: trip.id,
            seat_number: seatNumber.toString(),
            position_row: row,
            position_column: col,
            seat_type: 'standard', // Type par défaut
            is_available: true,
            price_modifier_fcfa: 0
          });
          seatNumber++;
        }
      }

      console.log('📊 Création de', seatsToCreate.length, 'sièges...');

      const { data, error } = await supabase
        .from('seat_maps')
        .insert(seatsToCreate)
        .select();

      if (error) {
        console.error('❌ Erreur création plan par défaut:', error);
        throw error;
      }

      console.log('✅ Plan de sièges par défaut créé:', data?.length || 0, 'sièges');
      setSeatMaps(data || []);

    } catch (error) {
      console.error('❌ Erreur lors de la création du plan par défaut:', error);
      setError('Erreur lors de la création du plan de sièges');
    }
  };

  // Organiser les sièges par rangée pour l'affichage
  const organizeSeats = () => {
    const rows = [];
    const seatsByRow = {};

    // Grouper les sièges par rangée
    seatMaps.forEach(seat => {
      if (!seatsByRow[seat.position_row]) {
        seatsByRow[seat.position_row] = [];
      }
      seatsByRow[seat.position_row].push(seat);
    });

    // Créer les rangées organisées
    Object.keys(seatsByRow)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(rowNumber => {
        const rowSeats = seatsByRow[rowNumber].sort((a, b) => a.position_column - b.position_column);
        
        rows.push({
          number: parseInt(rowNumber),
          seats: {
            left: rowSeats.filter(s => s.position_column <= 2),
            right: rowSeats.filter(s => s.position_column > 2)
          }
        });
      });

    return rows;
  };

  // Obtenir le statut d'un siège (disponible, occupé, réservé)
  const getSeatStatus = (seat) => {
    // Vérifier d'abord si le siège est disponible dans seat_maps
    if (!seat.is_available) {
      return 'maintenance';
    }

    // Vérifier s'il y a une réservation pour ce siège
    const booking = bookings.find(b => 
      b.seat_number === seat.seat_number || 
      (b.seat_numbers && b.seat_numbers.includes(seat.seat_number))
    );

    if (booking) {
      return booking.status === 'confirmed' ? 'occupied' : 'reserved';
    }

    return 'available';
  };

  // Obtenir la classe CSS d'un siège
  const getSeatClass = (seat) => {
    const status = getSeatStatus(seat);
    let classes = ['travelhub-seat'];
    classes.push(`travelhub-seat-${status}`);
    
    if (selectedSeat && selectedSeat.id === seat.id) {
      classes.push('travelhub-seat-selected');
    }

    // Ajouter le type de siège
    if (seat.seat_type && seat.seat_type !== 'standard') {
      classes.push(`travelhub-seat-${seat.seat_type}`);
    }
    
    return classes.join(' ');
  };

  // Obtenir l'icône d'un siège
  const getSeatIcon = (seat) => {
    const status = getSeatStatus(seat);
    
    switch (status) {
      case 'available':
        return '💺';
      case 'occupied':
        return '👤';
      case 'reserved':
        return '🔒';
      case 'maintenance':
        return '🔧';
      default:
        return '❓';
    }
  };

  // Gérer le clic sur un siège
  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
  };

  // Mettre à jour le statut d'un siège
  const updateSeatAvailability = async (seatId, isAvailable) => {
    try {
      console.log('🔄 Mise à jour disponibilité siège:', seatId, isAvailable);

      const { error } = await supabase
        .from('seat_maps')
        .update({ is_available: isAvailable })
        .eq('id', seatId);

      if (error) {
        console.error('❌ Erreur mise à jour siège:', error);
        throw error;
      }

      // Recharger les données
      await loadSeatMaps();
      setSelectedSeat(null);

      console.log('✅ Siège mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du siège:', error);
      setError('Erreur lors de la mise à jour du siège');
    }
  };

  // Obtenir les statistiques d'occupation
  const getOccupancyStats = () => {
    const total = seatMaps.length;
    const available = seatMaps.filter(seat => getSeatStatus(seat) === 'available').length;
    const occupied = seatMaps.filter(seat => getSeatStatus(seat) === 'occupied').length;
    const reserved = seatMaps.filter(seat => getSeatStatus(seat) === 'reserved').length;
    const maintenance = seatMaps.filter(seat => getSeatStatus(seat) === 'maintenance').length;

    return {
      total,
      available,
      occupied,
      reserved,
      maintenance,
      occupancyRate: total > 0 ? Math.round(((occupied + reserved) / total) * 100) : 0
    };
  };

  // Obtenir les informations de réservation pour un siège
  const getSeatBookingInfo = (seat) => {
    return bookings.find(b => 
      b.seat_number === seat.seat_number || 
      (b.seat_numbers && b.seat_numbers.includes(seat.seat_number))
    );
  };

  if (loading) {
    return (
      <div className="travelhub-loading-container">
        <div className="travelhub-loading-spinner"></div>
        <p>Chargement du plan des sièges...</p>
      </div>
    );
  }

  const stats = getOccupancyStats();
  const rows = organizeSeats();

  return (
    <div className="travelhub-trip-seat-map">
      {/* Header */}
      <div className="travelhub-seating-header">
        <div className="travelhub-header-left">
          <button className="travelhub-btn-back" onClick={onBack}>
            ← Retour
          </button>
          <div className="travelhub-trip-info">
            <h1>🚌 Plan des Sièges</h1>
            <p>
              <strong>{trip.departure_city}</strong> → <strong>{trip.arrival_city}</strong>
            </p>
            <p>
              {new Date(trip.departure_time).toLocaleDateString('fr-FR')} à{' '}
              {new Date(trip.departure_time).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>

        <div className="travelhub-header-right">
          <div className="travelhub-view-toggle">
            <button 
              className={viewMode === 'visual' ? 'active' : ''}
              onClick={() => setViewMode('visual')}
            >
              🎯 Visuel
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              📋 Liste
            </button>
          </div>
        </div>
      </div>

      {/* Zone d'erreur */}
      {error && (
        <div className="travelhub-error-message">
          <strong>Erreur :</strong> {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Statistiques */}
      <div className="travelhub-occupancy-stats">
        <div className="travelhub-stat-card">
          <div className="travelhub-stat-number">{stats.total}</div>
          <div className="travelhub-stat-label">Places total</div>
        </div>
        <div className="travelhub-stat-card available">
          <div className="travelhub-stat-number">{stats.available}</div>
          <div className="travelhub-stat-label">Disponibles</div>
        </div>
        <div className="travelhub-stat-card occupied">
          <div className="travelhub-stat-number">{stats.occupied}</div>
          <div className="travelhub-stat-label">Occupées</div>
        </div>
        <div className="travelhub-stat-card reserved">
          <div className="travelhub-stat-number">{stats.reserved}</div>
          <div className="travelhub-stat-label">Réservées</div>
        </div>
        <div className="travelhub-stat-card maintenance">
          <div className="travelhub-stat-number">{stats.maintenance}</div>
          <div className="travelhub-stat-label">Maintenance</div>
        </div>
        <div className="travelhub-stat-card rate">
          <div className="travelhub-stat-number">{stats.occupancyRate}%</div>
          <div className="travelhub-stat-label">Taux d'occupation</div>
        </div>
      </div>

      {/* Vue visuelle */}
      {viewMode === 'visual' && (
        <div className="travelhub-visual-view">
          <div className="travelhub-bus-layout">
            {/* Direction du bus */}
            <div className="travelhub-bus-front">
              <div className="travelhub-driver-area">
                🚗 Conducteur
              </div>
            </div>

            {/* Plan des sièges */}
            <div className="travelhub-seating-area">
              {rows.map(row => (
                <div key={row.number} className="travelhub-seat-row">
                  <div className="travelhub-row-number">{row.number}</div>
                  
                  {/* Sièges côté gauche */}
                  <div className="travelhub-seat-group left">
                    {row.seats.left.map((seat, index) => (
                      <div
                        key={seat?.id || `empty-${row.number}-${index}`}
                        className={seat ? getSeatClass(seat) : 'travelhub-seat-empty'}
                        onClick={() => seat && handleSeatClick(seat)}
                        title={seat ? `Siège ${seat.seat_number} - ${getSeatStatus(seat)}` : ''}
                      >
                        <span className="travelhub-seat-icon">
                          {seat ? getSeatIcon(seat) : ''}
                        </span>
                        <span className="travelhub-seat-number">
                          {seat?.seat_number || ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Allée centrale */}
                  <div className="travelhub-aisle"></div>

                  {/* Sièges côté droit */}
                  <div className="travelhub-seat-group right">
                    {row.seats.right.map((seat, index) => (
                      <div
                        key={seat?.id || `empty-${row.number}-${index + 2}`}
                        className={seat ? getSeatClass(seat) : 'travelhub-seat-empty'}
                        onClick={() => seat && handleSeatClick(seat)}
                        title={seat ? `Siège ${seat.seat_number} - ${getSeatStatus(seat)}` : ''}
                      >
                        <span className="travelhub-seat-icon">
                          {seat ? getSeatIcon(seat) : ''}
                        </span>
                        <span className="travelhub-seat-number">
                          {seat?.seat_number || ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div className="travelhub-legend">
            <h3>Légende</h3>
            <div className="travelhub-legend-items">
              <div className="travelhub-legend-item">
                <span className="travelhub-seat travelhub-seat-available">💺</span>
                <span>Disponible</span>
              </div>
              <div className="travelhub-legend-item">
                <span className="travelhub-seat travelhub-seat-occupied">👤</span>
                <span>Occupé</span>
              </div>
              <div className="travelhub-legend-item">
                <span className="travelhub-seat travelhub-seat-reserved">🔒</span>
                <span>Réservé</span>
              </div>
              <div className="travelhub-legend-item">
                <span className="travelhub-seat travelhub-seat-maintenance">🔧</span>
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue liste */}
      {viewMode === 'list' && (
        <div className="travelhub-list-view">
          <div className="travelhub-seats-table">
            <table>
              <thead>
                <tr>
                  <th>N° Siège</th>
                  <th>Position</th>
                  <th>Statut</th>
                  <th>Type</th>
                  <th>Prix</th>
                  <th>Passager</th>
                  {mode === 'admin' && hasPermission('trips', 'edit') && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {seatMaps.map(seat => {
                  const status = getSeatStatus(seat);
                  const booking = getSeatBookingInfo(seat);
                  return (
                    <tr key={seat.id} className={`travelhub-seat-row-${status}`}>
                      <td>
                        <span className="travelhub-seat-number-badge">
                          {getSeatIcon(seat)} {seat.seat_number}
                        </span>
                      </td>
                      <td>
                        Rangée {seat.position_row}, Place {seat.position_column}
                      </td>
                      <td>
                        <span className={`travelhub-status-badge travelhub-status-${status}`}>
                          {status === 'available' && 'Disponible'}
                          {status === 'occupied' && 'Occupé'}
                          {status === 'reserved' && 'Réservé'}
                          {status === 'maintenance' && 'Maintenance'}
                        </span>
                      </td>
                      <td>
                        {seat.seat_type === 'premium' && '⭐ Premium'}
                        {seat.seat_type === 'standard' && '💺 Standard'}
                        {seat.seat_type === 'economy' && '💰 Économique'}
                      </td>
                      <td>
                        {trip.price_fcfa + (seat.price_modifier_fcfa || 0)} FCFA
                        {seat.price_modifier_fcfa > 0 && (
                          <span className="travelhub-price-modifier">
                            (+{seat.price_modifier_fcfa})
                          </span>
                        )}
                      </td>
                      <td>
                        {booking ? (
                          <div className="travelhub-passenger-info">
                            <strong>{booking.user?.full_name || 'Anonyme'}</strong>
                            <br />
                            <small>{booking.user?.phone || 'N/A'}</small>
                          </div>
                        ) : (
                          <span className="travelhub-no-passenger">-</span>
                        )}
                      </td>
                      {mode === 'admin' && hasPermission('trips', 'edit') && (
                        <td>
                          <div className="travelhub-seat-actions">
                            {seat.is_available ? (
                              <button
                                className="travelhub-btn-maintenance"
                                onClick={() => updateSeatAvailability(seat.id, false)}
                                title="Mettre en maintenance"
                              >
                                🔧
                              </button>
                            ) : (
                              <button
                                className="travelhub-btn-activate"
                                onClick={() => updateSeatAvailability(seat.id, true)}
                                title="Rendre disponible"
                              >
                                ✅
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal détails siège sélectionné */}
      {selectedSeat && (
        <div className="travelhub-seat-modal-overlay" onClick={() => setSelectedSeat(null)}>
          <div className="travelhub-seat-modal" onClick={e => e.stopPropagation()}>
            <div className="travelhub-modal-header">
              <h3>Détails du siège {selectedSeat.seat_number}</h3>
              <button 
                className="travelhub-modal-close"
                onClick={() => setSelectedSeat(null)}
              >
                ×
              </button>
            </div>
            
            <div className="travelhub-modal-content">
              <div className="travelhub-seat-details">
                <div className="travelhub-detail-row">
                  <strong>Position :</strong> 
                  Rangée {selectedSeat.position_row}, Place {selectedSeat.position_column}
                </div>
                <div className="travelhub-detail-row">
                  <strong>Statut :</strong> 
                  <span className={`travelhub-status-badge travelhub-status-${getSeatStatus(selectedSeat)}`}>
                    {getSeatIcon(selectedSeat)} {getSeatStatus(selectedSeat)}
                  </span>
                </div>
                <div className="travelhub-detail-row">
                  <strong>Type :</strong> {selectedSeat.seat_type || 'Standard'}
                </div>
                <div className="travelhub-detail-row">
                  <strong>Prix :</strong> 
                  {trip.price_fcfa + (selectedSeat.price_modifier_fcfa || 0)} FCFA
                  {selectedSeat.price_modifier_fcfa > 0 && (
                    <span className="travelhub-price-modifier">
                      (+{selectedSeat.price_modifier_fcfa})
                    </span>
                  )}
                </div>
                
                {(() => {
                  const booking = getSeatBookingInfo(selectedSeat);
                  return booking ? (
                    <div className="travelhub-booking-details">
                      <h4>Informations de réservation</h4>
                      <div className="travelhub-detail-row">
                        <strong>Passager :</strong> {booking.user?.full_name || 'Anonyme'}
                      </div>
                      <div className="travelhub-detail-row">
                        <strong>Téléphone :</strong> {booking.user?.phone || 'N/A'}
                      </div>
                      <div className="travelhub-detail-row">
                        <strong>Email :</strong> {booking.user?.email || 'N/A'}
                      </div>
                      <div className="travelhub-detail-row">
                        <strong>Statut réservation :</strong> 
                        <span className={`travelhub-status-badge travelhub-booking-${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
              
              {mode === 'admin' && hasPermission('trips', 'edit') && (
                <div className="travelhub-modal-actions">
                  {selectedSeat.is_available ? (
                    <button
                      className="travelhub-btn-maintenance"
                      onClick={() => updateSeatAvailability(selectedSeat.id, false)}
                    >
                      🔧 Mettre en maintenance
                    </button>
                  ) : (
                    <button
                      className="travelhub-btn-activate"
                      onClick={() => updateSeatAvailability(selectedSeat.id, true)}
                    >
                      ✅ Rendre disponible
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripSeatMap;
