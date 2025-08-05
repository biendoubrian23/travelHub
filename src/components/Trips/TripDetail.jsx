import React from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './TripDetail.css';

const TripDetail = ({ trip, onBack, onEdit, onViewMap }) => {
  const { hasPermission } = useRolePermissions();

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: '📅',
      in_progress: '🚌',
      completed: '✅',
      cancelled: '❌',
      delayed: '⏰'
    };
    return icons[status] || '❓';
  };

  const getStatusLabel = (status) => {
    const labels = {
      scheduled: 'Programmé',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      delayed: 'Retardé'
    };
    return labels[status] || status;
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getDuration = (departure, arrival) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (trip.status === 'completed') return 100;
    if (trip.status === 'cancelled') return 0;
    if (trip.status === 'scheduled') return 0;
    
    // Pour un trajet en cours, calculer le pourcentage basé sur l'heure
    const now = new Date();
    const departure = new Date(trip.departure_time);
    const arrival = new Date(trip.arrival_time);
    
    if (now < departure) return 0;
    if (now > arrival) return 100;
    
    const elapsed = now - departure;
    const total = arrival - departure;
    return Math.round((elapsed / total) * 100);
  };

  const departureInfo = formatDateTime(trip.departure_time);
  const arrivalInfo = formatDateTime(trip.arrival_time);
  const progress = getProgress();

  return (
    <div className="trip-detail">
      <div className="detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            ← Retour
          </button>
          <div className="trip-title">
            <h1>{trip.departure_city} → {trip.destination_city}</h1>
            <span className={`status-badge status-${trip.status}`}>
              {getStatusIcon(trip.status)} {getStatusLabel(trip.status)}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-map" onClick={() => onViewMap(trip)}>
            🗺️ Voir la carte
          </button>
          {hasPermission('trips', 'canEdit') && (
            <button className="btn-primary" onClick={() => onEdit(trip)}>
              ✏️ Modifier
            </button>
          )}
        </div>
      </div>

      <div className="detail-content">
        {/* Informations générales */}
        <div className="detail-section">
          <h2>📋 Informations générales</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <div className="card-header">
                <h3>🛣️ Itinéraire</h3>
              </div>
              <div className="card-content">
                <div className="route-visual">
                  <div className="route-point">
                    <div className="point-icon departure">🏁</div>
                    <div className="point-info">
                      <div className="city-name">{trip.departure_city}</div>
                      <div className="datetime-info">
                        <div className="date">{departureInfo.date}</div>
                        <div className="time">{departureInfo.time}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="route-progress">
                    <div className="progress-line">
                      <div 
                        className="progress-fill"
                        style={{ height: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-info">
                      <div className="distance">{trip.distance} km</div>
                      <div className="duration">{getDuration(trip.departure_time, trip.arrival_time)}</div>
                      {trip.status === 'in_progress' && (
                        <div className="current-progress">{progress}%</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="route-point">
                    <div className="point-icon arrival">🏁</div>
                    <div className="point-info">
                      <div className="city-name">{trip.destination_city}</div>
                      <div className="datetime-info">
                        <div className="date">{arrivalInfo.date}</div>
                        <div className="time">{arrivalInfo.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-header">
                <h3>💰 Tarification</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="label">Prix par place</span>
                  <span className="value price">{trip.price} FCFA</span>
                </div>
                <div className="info-row">
                  <span className="label">Revenus actuels</span>
                  <span className="value revenue">
                    {(trip.seats_occupied * trip.price).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Revenus maximum</span>
                  <span className="value max-revenue">
                    {(trip.total_seats * trip.price).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bus et conducteur */}
        <div className="detail-section">
          <h2>🚌 Bus et équipe</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <div className="card-header">
                <h3>🚌 Informations du bus</h3>
              </div>
              <div className="card-content">
                <div className="bus-overview">
                  <div className="bus-main-info">
                    <div className="bus-name">{trip.bus_name}</div>
                    <div className="bus-plate">{trip.bus_plate}</div>
                  </div>
                  <div className="bus-specs">
                    <div className="spec-item">
                      <span className="spec-label">Capacité totale:</span>
                      <span className="spec-value">{trip.total_seats} places</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Type:</span>
                      <span className="spec-value">{trip.bus_type || 'Bus standard'}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Équipements:</span>
                      <span className="spec-value">
                        {trip.bus_features ? trip.bus_features.join(', ') : 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-header">
                <h3>👨‍✈️ Conducteur</h3>
              </div>
              <div className="card-content">
                <div className="driver-profile">
                  <div className="driver-avatar">
                    {trip.driver_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="driver-details">
                    <div className="driver-name">{trip.driver_name}</div>
                    <div className="driver-phone">{trip.driver_phone}</div>
                    <div className="driver-experience">
                      Expérience: {trip.driver_experience || 'Non spécifiée'}
                    </div>
                  </div>
                  <div className="driver-actions">
                    <button className="btn-contact">
                      📞 Contacter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Réservations */}
        <div className="detail-section">
          <h2>💺 État des réservations</h2>
          <div className="reservations-overview">
            <div className="seats-stats">
              <div className="stat-item occupied">
                <div className="stat-number">{trip.seats_occupied}</div>
                <div className="stat-label">Occupées</div>
              </div>
              <div className="stat-item available">
                <div className="stat-number">{trip.total_seats - trip.seats_occupied}</div>
                <div className="stat-label">Disponibles</div>
              </div>
              <div className="stat-item total">
                <div className="stat-number">{trip.total_seats}</div>
                <div className="stat-label">Total</div>
              </div>
            </div>

            <div className="occupancy-visual">
              <div className="occupancy-bar-large">
                <div 
                  className="occupancy-fill-large"
                  style={{ 
                    width: `${(trip.seats_occupied / trip.total_seats) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="occupancy-text">
                {Math.round((trip.seats_occupied / trip.total_seats) * 100)}% d'occupation
              </div>
            </div>

            {trip.recent_bookings && trip.recent_bookings.length > 0 && (
              <div className="recent-bookings">
                <h3>Dernières réservations</h3>
                <div className="bookings-list">
                  {trip.recent_bookings.slice(0, 5).map((booking, index) => (
                    <div key={index} className="booking-item">
                      <div className="booking-passenger">
                        <div className="passenger-name">{booking.passenger_name}</div>
                        <div className="booking-time">
                          Réservé le {new Date(booking.booking_time).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="booking-details">
                        <div className="seat-number">Place {booking.seat_number}</div>
                        <div className="booking-status">{booking.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes et observations */}
        {(trip.notes || trip.observations) && (
          <div className="detail-section">
            <h2>📝 Notes et observations</h2>
            <div className="notes-content">
              {trip.notes && (
                <div className="notes-section">
                  <h3>Notes du trajet</h3>
                  <p>{trip.notes}</p>
                </div>
              )}
              {trip.observations && (
                <div className="observations-section">
                  <h3>Observations</h3>
                  <p>{trip.observations}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripDetail;
