import React from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './TripsList.css';

const TripsList = ({ 
  trips, 
  view, 
  searchTerm, 
  statusFilter,
  routeFilter, 
  onTripAction 
}) => {
  const { hasPermission } = useRolePermissions();

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = !searchTerm || 
      trip.bus_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.departure_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination_city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || trip.status === statusFilter;
    const matchesRoute = !routeFilter || trip.route === routeFilter;
    
    return matchesSearch && matchesStatus && matchesRoute;
  });

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

  const getRouteDisplay = (trip) => {
    return `${trip.departure_city} → ${trip.destination_city}`;
  };

  const getDuration = (departure, arrival) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (view === 'table') {
    return (
      <div className="trips-table-container">
        <div className="table-wrapper">
          <table className="trips-table">
            <thead>
              <tr>
                <th>Trajet</th>
                <th>Date</th>
                <th>Horaires</th>
                <th>Durée</th>
                <th>Bus</th>
                <th>Conducteur</th>
                <th>Places</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(trip => (
                <tr key={trip.id} className="trip-row">
                  <td className="route-cell">
                    <div className="route-info">
                      <div className="route-path">{getRouteDisplay(trip)}</div>
                      <div className="route-distance">{trip.distance} km</div>
                    </div>
                  </td>
                  <td className="date-cell">
                    {formatDate(trip.departure_time)}
                  </td>
                  <td className="time-cell">
                    <div className="time-info">
                      <div className="departure-time">
                        Départ: {formatTime(trip.departure_time)}
                      </div>
                      <div className="arrival-time">
                        Arrivée: {formatTime(trip.arrival_time)}
                      </div>
                    </div>
                  </td>
                  <td className="duration-cell">
                    {getDuration(trip.departure_time, trip.arrival_time)}
                  </td>
                  <td className="bus-cell">
                    <div className="bus-info">
                      <div className="bus-name">{trip.bus_name}</div>
                      <div className="bus-plate">{trip.bus_plate}</div>
                    </div>
                  </td>
                  <td className="driver-cell">
                    <div className="driver-info">
                      <div className="driver-name">{trip.driver_name}</div>
                      <div className="driver-phone">{trip.driver_phone}</div>
                    </div>
                  </td>
                  <td className="seats-cell">
                    <div className="seats-info">
                      <div className="seats-occupied">
                        {trip.seats_occupied}/{trip.total_seats}
                      </div>
                      <div className="occupancy-rate">
                        {Math.round((trip.seats_occupied / trip.total_seats) * 100)}%
                      </div>
                    </div>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge status-${trip.status}`}>
                      {getStatusIcon(trip.status)} {getStatusLabel(trip.status)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => onTripAction('view', trip)}
                        title="Voir les détails"
                      >
                        👁️
                      </button>
                      {hasPermission('trips', 'canEdit') && (
                        <button
                          className="btn-edit"
                          onClick={() => onTripAction('edit', trip)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        className="btn-map"
                        onClick={() => onTripAction('map', trip)}
                        title="Voir sur la carte"
                      >
                        🗺️
                      </button>
                      {hasPermission('trips', 'canDelete') && (
                        <button
                          className="btn-delete"
                          onClick={() => onTripAction('delete', trip)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTrips.length === 0 && (
          <div className="no-trips">
            <div className="no-trips-icon">🚌</div>
            <h3>Aucun trajet trouvé</h3>
            <p>Aucun trajet ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>
    );
  }

  // Vue en cartes (mobile)
  return (
    <div className="trips-cards-container">
      <div className="trips-grid">
        {filteredTrips.map(trip => (
          <div key={trip.id} className="trip-card">
            <div className="card-header">
              <div className="trip-route">
                <h3>{getRouteDisplay(trip)}</h3>
                <div className="trip-distance">{trip.distance} km</div>
              </div>
              <span className={`status-badge status-${trip.status}`}>
                {getStatusIcon(trip.status)} {getStatusLabel(trip.status)}
              </span>
            </div>

            <div className="card-content">
              <div className="trip-datetime">
                <div className="trip-date">
                  📅 {formatDate(trip.departure_time)}
                </div>
                <div className="trip-times">
                  <div className="time-item">
                    <span className="time-label">Départ:</span>
                    <span className="time-value">{formatTime(trip.departure_time)}</span>
                  </div>
                  <div className="time-separator">→</div>
                  <div className="time-item">
                    <span className="time-label">Arrivée:</span>
                    <span className="time-value">{formatTime(trip.arrival_time)}</span>
                  </div>
                </div>
                <div className="trip-duration">
                  ⏱️ Durée: {getDuration(trip.departure_time, trip.arrival_time)}
                </div>
              </div>

              <div className="trip-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">🚌 Bus:</span>
                    <span className="detail-value">{trip.bus_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📋 Plaque:</span>
                    <span className="detail-value">{trip.bus_plate}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">👨‍✈️ Conducteur:</span>
                    <span className="detail-value">{trip.driver_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📞 Téléphone:</span>
                    <span className="detail-value">{trip.driver_phone}</span>
                  </div>
                </div>

                <div className="seats-summary">
                  <div className="seats-count">
                    <span className="seats-occupied">{trip.seats_occupied}</span>
                    <span className="seats-separator">/</span>
                    <span className="seats-total">{trip.total_seats}</span>
                    <span className="seats-label">places</span>
                  </div>
                  <div className="occupancy-bar">
                    <div 
                      className="occupancy-fill"
                      style={{ 
                        width: `${(trip.seats_occupied / trip.total_seats) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className="occupancy-percentage">
                    {Math.round((trip.seats_occupied / trip.total_seats) * 100)}% occupé
                  </div>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button
                className="btn-view"
                onClick={() => onTripAction('view', trip)}
              >
                👁️ Détails
              </button>
              <button
                className="btn-map"
                onClick={() => onTripAction('map', trip)}
              >
                🗺️ Carte
              </button>
              {hasPermission('trips', 'canEdit') && (
                <button
                  className="btn-edit"
                  onClick={() => onTripAction('edit', trip)}
                >
                  ✏️ Modifier
                </button>
              )}
              {hasPermission('trips', 'canDelete') && (
                <button
                  className="btn-delete"
                  onClick={() => onTripAction('delete', trip)}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="no-trips">
          <div className="no-trips-icon">🚌</div>
          <h3>Aucun trajet trouvé</h3>
          <p>Aucun trajet ne correspond à vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
};

export default TripsList;
