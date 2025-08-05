import React, { useState, useEffect } from 'react';
import './TripMap.css';

const TripMap = ({ trips, onViewTrip, currentRole }) => {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 4.0511, lng: 9.7679 }); // Douala par défaut

  // Simulation d'une carte (en réalité on utiliserait Google Maps, Leaflet, etc.)
  const renderMap = () => {
    return (
      <div className="map-container">
        {/* Header de la carte */}
        <div className="map-header">
          <h3>🗺️ Carte des Trajets</h3>
          <div className="map-controls">
            <button 
              className="map-control-btn"
              onClick={() => centerMapOnCameroon()}
              title="Centrer sur le Cameroun"
            >
              🇨🇲 Cameroun
            </button>
            <button 
              className="map-control-btn"
              onClick={() => setMapCenter({ lat: 4.0511, lng: 9.7679 })}
              title="Centrer sur Douala"
            >
              📍 Douala
            </button>
            <button 
              className="map-control-btn"
              onClick={() => setMapCenter({ lat: 3.8480, lng: 11.5021 })}
              title="Centrer sur Yaoundé"
            >
              📍 Yaoundé
            </button>
          </div>
        </div>

        {/* Zone de la carte simulée */}
        <div className="map-display">
          <div className="map-background">
            {/* Simulation de fond de carte */}
            <div className="map-grid">
              {/* Grille pour simuler une carte */}
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="grid-line horizontal" style={{ top: `${i * 10}%` }}></div>
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="grid-line vertical" style={{ left: `${i * 10}%` }}></div>
              ))}
            </div>

            {/* Villes principales */}
            <div className="cities">
              <div 
                className="city-marker douala"
                style={{ left: '30%', top: '60%' }}
                title="Douala"
              >
                <div className="city-dot"></div>
                <span className="city-name">Douala</span>
              </div>
              
              <div 
                className="city-marker yaounde"
                style={{ left: '70%', top: '40%' }}
                title="Yaoundé"
              >
                <div className="city-dot"></div>
                <span className="city-name">Yaoundé</span>
              </div>
              
              <div 
                className="city-marker bafoussam"
                style={{ left: '60%', top: '25%' }}
                title="Bafoussam"
              >
                <div className="city-dot"></div>
                <span className="city-name">Bafoussam</span>
              </div>
              
              <div 
                className="city-marker buea"
                style={{ left: '25%', top: '70%' }}
                title="Buea"
              >
                <div className="city-dot"></div>
                <span className="city-name">Buea</span>
              </div>
            </div>

            {/* Trajets sur la carte */}
            <div className="trip-routes">
              {trips.map(trip => renderTripRoute(trip))}
            </div>
          </div>
        </div>

        {/* Légende de la carte */}
        <div className="map-legend">
          <div className="legend-title">Légende</div>
          <div className="legend-items">
            <div className="legend-item">
              <div className="route-line active"></div>
              <span>Trajet actif</span>
            </div>
            <div className="legend-item">
              <div className="route-line scheduled"></div>
              <span>Trajet programmé</span>
            </div>
            <div className="legend-item">
              <div className="route-line planned"></div>
              <span>Trajet planifié</span>
            </div>
            <div className="legend-item">
              <div className="city-dot"></div>
              <span>Ville</span>
            </div>
            <div className="legend-item">
              <div className="bus-marker"></div>
              <span>Bus en mouvement</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fonction pour rendre un trajet sur la carte
  const renderTripRoute = (trip) => {
    const routePositions = getRoutePositions(trip);
    
    return (
      <div 
        key={trip.id} 
        className={`trip-route ${trip.status}`}
        onClick={() => setSelectedTrip(trip)}
      >
        {/* Ligne du trajet */}
        <svg className="route-line-svg" style={routePositions.svg}>
          <line
            x1={routePositions.start.x}
            y1={routePositions.start.y}
            x2={routePositions.end.x}
            y2={routePositions.end.y}
            className={`route-line ${trip.status}`}
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
          />
          
          {/* Flèche directionnelle */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
              />
            </marker>
          </defs>
        </svg>

        {/* Marqueur du bus (si en mouvement) */}
        {trip.status === 'active' && (
          <div 
            className="bus-marker"
            style={{
              left: routePositions.busPosition.x + '%',
              top: routePositions.busPosition.y + '%'
            }}
            title={`${trip.bus?.number} - ${trip.driver?.name}`}
          >
            🚌
          </div>
        )}

        {/* Arrêts intermédiaires */}
        {trip.stops && trip.stops.map((stop, index) => {
          const stopPosition = getStopPosition(trip, stop, index);
          return (
            <div
              key={index}
              className="stop-marker"
              style={{
                left: stopPosition.x + '%',
                top: stopPosition.y + '%'
              }}
              title={`Arrêt: ${stop.city}`}
            >
              🟡
            </div>
          );
        })}

        {/* Label du trajet */}
        <div 
          className="route-label"
          style={{
            left: routePositions.labelPosition.x + '%',
            top: routePositions.labelPosition.y + '%'
          }}
        >
          <div className="route-info">
            <strong>{trip.routeNumber}</strong>
            <div className="route-path">
              {trip.from.city} → {trip.to.city}
            </div>
            <div className="route-details">
              {new Date(trip.departure).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })} • {trip.bookings}/{trip.bus?.capacity || 0}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculer les positions pour un trajet
  const getRoutePositions = (trip) => {
    const cityPositions = {
      'Douala': { x: 30, y: 60 },
      'Yaoundé': { x: 70, y: 40 },
      'Bafoussam': { x: 60, y: 25 },
      'Buea': { x: 25, y: 70 },
      'Edéa': { x: 50, y: 50 },
      'Mbalmayo': { x: 75, y: 45 },
      'Bafia': { x: 65, y: 32 }
    };

    const start = cityPositions[trip.from.city] || { x: 50, y: 50 };
    const end = cityPositions[trip.to.city] || { x: 50, y: 50 };

    // Position du bus (simulation basée sur l'heure)
    const now = new Date();
    const departure = new Date(trip.departure);
    const arrival = new Date(trip.arrival);
    
    let busProgress = 0;
    if (trip.status === 'active' && now >= departure && now <= arrival) {
      const totalDuration = arrival.getTime() - departure.getTime();
      const elapsed = now.getTime() - departure.getTime();
      busProgress = Math.max(0, Math.min(1, elapsed / totalDuration));
    }

    const busPosition = {
      x: start.x + (end.x - start.x) * busProgress,
      y: start.y + (end.y - start.y) * busProgress
    };

    const labelPosition = {
      x: start.x + (end.x - start.x) * 0.5,
      y: start.y + (end.y - start.y) * 0.5
    };

    return {
      start,
      end,
      busPosition,
      labelPosition,
      svg: {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }
    };
  };

  // Calculer la position d'un arrêt
  const getStopPosition = (trip, stop, index) => {
    const routePositions = getRoutePositions(trip);
    const progress = (index + 1) / (trip.stops.length + 1);
    
    return {
      x: routePositions.start.x + (routePositions.end.x - routePositions.start.x) * progress,
      y: routePositions.start.y + (routePositions.end.y - routePositions.start.y) * progress
    };
  };

  const centerMapOnCameroon = () => {
    setMapCenter({ lat: 5.0, lng: 10.0 });
  };

  return (
    <div className="trip-map">
      {renderMap()}

      {/* Panneau latéral avec la liste des trajets */}
      <div className="trips-sidebar">
        <div className="sidebar-header">
          <h3>📋 Trajets ({trips.length})</h3>
        </div>

        <div className="trips-list-sidebar">
          {trips.map(trip => (
            <div 
              key={trip.id}
              className={`trip-item-sidebar ${trip.status} ${selectedTrip?.id === trip.id ? 'selected' : ''}`}
              onClick={() => setSelectedTrip(trip)}
            >
              <div className="trip-header">
                <strong>{trip.routeNumber}</strong>
                <span className={`status-badge ${trip.status}`}>
                  {trip.status === 'active' && '🟢'}
                  {trip.status === 'scheduled' && '🟡'}
                  {trip.status === 'planned' && '⭕'}
                  {trip.status}
                </span>
              </div>

              <div className="trip-route">
                <div className="route-cities">
                  {trip.from.city} → {trip.to.city}
                </div>
                <div className="route-time">
                  {new Date(trip.departure).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {new Date(trip.arrival).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div className="trip-details">
                <div className="detail-item">
                  <span>🚌 {trip.bus?.number || 'Non assigné'}</span>
                </div>
                <div className="detail-item">
                  <span>👤 {trip.driver?.name || 'Non assigné'}</span>
                </div>
                <div className="detail-item">
                  <span>🎫 {trip.bookings}/{trip.bus?.capacity || 0}</span>
                </div>
                <div className="detail-item">
                  <span>💰 {trip.price.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="trip-actions">
                <button
                  className="btn-small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewTrip(trip);
                  }}
                >
                  👁️ Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau de détails du trajet sélectionné */}
      {selectedTrip && (
        <div className="trip-details-panel">
          <div className="panel-header">
            <h3>{selectedTrip.routeNumber}</h3>
            <button
              className="btn-close"
              onClick={() => setSelectedTrip(null)}
            >
              ✕
            </button>
          </div>

          <div className="panel-content">
            <div className="trip-overview">
              <div className="route-info">
                <h4>📍 Itinéraire</h4>
                <div className="route-path">
                  <div className="city-from">
                    <strong>{selectedTrip.from.city}</strong>
                    <span>{selectedTrip.from.station}</span>
                  </div>
                  <div className="route-arrow">→</div>
                  <div className="city-to">
                    <strong>{selectedTrip.to.city}</strong>
                    <span>{selectedTrip.to.station}</span>
                  </div>
                </div>
              </div>

              <div className="timing-info">
                <h4>⏰ Horaires</h4>
                <div className="time-details">
                  <div className="time-item">
                    <span className="label">Départ:</span>
                    <span className="value">
                      {new Date(selectedTrip.departure).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="time-item">
                    <span className="label">Arrivée:</span>
                    <span className="value">
                      {new Date(selectedTrip.arrival).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="time-item">
                    <span className="label">Durée:</span>
                    <span className="value">{selectedTrip.estimatedDuration}</span>
                  </div>
                </div>
              </div>

              <div className="vehicle-info">
                <h4>🚌 Véhicule & Équipage</h4>
                <div className="vehicle-details">
                  <div className="detail-row">
                    <span className="label">Bus:</span>
                    <span className="value">{selectedTrip.bus?.number || 'Non assigné'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Conducteur:</span>
                    <span className="value">{selectedTrip.driver?.name || 'Non assigné'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Capacité:</span>
                    <span className="value">{selectedTrip.bus?.capacity || 0} places</span>
                  </div>
                </div>
              </div>

              <div className="booking-info">
                <h4>🎫 Réservations</h4>
                <div className="booking-stats">
                  <div className="stat-item">
                    <span className="stat-value">{selectedTrip.bookings}</span>
                    <span className="stat-label">Réservées</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{(selectedTrip.bus?.capacity || 0) - selectedTrip.bookings}</span>
                    <span className="stat-label">Disponibles</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {selectedTrip.bus?.capacity ? Math.round((selectedTrip.bookings / selectedTrip.bus.capacity) * 100) : 0}%
                    </span>
                    <span className="stat-label">Taux</span>
                  </div>
                </div>
              </div>

              {selectedTrip.stops && selectedTrip.stops.length > 0 && (
                <div className="stops-info">
                  <h4>🛑 Arrêts</h4>
                  <div className="stops-list">
                    {selectedTrip.stops.map((stop, index) => (
                      <div key={index} className="stop-item">
                        <div className="stop-city">{stop.city}</div>
                        <div className="stop-times">
                          {stop.arrivalTime} - {stop.departureTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="panel-actions">
              <button
                className="btn-primary"
                onClick={() => onViewTrip(selectedTrip)}
              >
                📋 Voir détails complets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMap;
