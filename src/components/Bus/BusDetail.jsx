import React from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './BusDetail.css';

const BusDetail = ({ bus, onBack, onEdit, onViewSeating }) => {
  const { hasPermission } = useRolePermissions();

  const getStatusIcon = (status) => {
    const icons = {
      available: '✅',
      in_service: '🚌',
      maintenance: '🔧'
    };
    return icons[status] || '❓';
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Disponible',
      in_service: 'En service',
      maintenance: 'Maintenance'
    };
    return labels[status] || 'Inconnu';
  };

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  const getOccupancyStats = () => {
    if (!bus.seating) return { occupied: 0, available: bus.capacity, rate: 0 };
    
    const occupied = bus.seating.filter(seat => seat.status === 'occupied').length;
    const available = bus.seating.filter(seat => seat.status === 'available').length;
    const rate = bus.capacity > 0 ? Math.round((occupied / bus.capacity) * 100) : 0;
    
    return { occupied, available, rate };
  };

  const stats = getOccupancyStats();

  return (
    <div className="bus-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            ← Retour
          </button>
          <div className="bus-title">
            <h1>{bus.number}</h1>
            <span className={`status-badge ${getStatusClass(bus.status)}`}>
              {getStatusIcon(bus.status)} {getStatusLabel(bus.status)}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn-seating"
            onClick={onViewSeating}
          >
            🪑 Plan des sièges
          </button>

          {hasPermission('buses', 'edit') && (
            <button
              className="btn-primary"
              onClick={onEdit}
            >
              ✏️ Modifier
            </button>
          )}
        </div>
      </div>

      <div className="detail-content">
        {/* Informations principales */}
        <div className="detail-section">
          <h2>🚌 Informations du véhicule</h2>
          
          <div className="detail-grid">
            <div className="detail-card">
              <div className="card-header">
                <h3>Identification</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="label">Numéro:</span>
                  <span className="value">{bus.number}</span>
                </div>
                <div className="info-row">
                  <span className="label">Plaque:</span>
                  <span className="value">{bus.licensePlate}</span>
                </div>
                <div className="info-row">
                  <span className="label">Marque:</span>
                  <span className="value">{bus.brand}</span>
                </div>
                <div className="info-row">
                  <span className="label">Modèle:</span>
                  <span className="value">{bus.model}</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-header">
                <h3>Capacité</h3>
              </div>
              <div className="card-content">
                <div className="capacity-overview">
                  <div className="capacity-main">
                    <span className="capacity-number">{bus.capacity}</span>
                    <span className="capacity-label">places total</span>
                  </div>
                  
                  {bus.status === 'in_service' && (
                    <div className="occupancy-breakdown">
                      <div className="occupancy-item occupied">
                        <span className="occupancy-count">{stats.occupied}</span>
                        <span className="occupancy-label">Occupées</span>
                      </div>
                      <div className="occupancy-item available">
                        <span className="occupancy-count">{stats.available}</span>
                        <span className="occupancy-label">Libres</span>
                      </div>
                      <div className="occupancy-rate">
                        <span className="rate-value">{stats.rate}%</span>
                        <span className="rate-label">Taux occupation</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="detail-section">
          <h2>⭐ Équipements et services</h2>
          
          <div className="features-container">
            {bus.features && bus.features.length > 0 ? (
              <div className="features-grid">
                {bus.features.map(feature => (
                  <div key={feature} className="feature-item">
                    <span className="feature-icon">
                      {getFeatureIcon(feature)}
                    </span>
                    <span className="feature-name">{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-features">
                <span>Aucun équipement spécial</span>
              </div>
            )}
          </div>
        </div>

        {/* Trajet actuel */}
        {bus.currentRoute && (
          <div className="detail-section">
            <h2>🗺️ Trajet en cours</h2>
            
            <div className="route-card">
              <div className="route-path">
                <div className="route-from">
                  <span className="city-name">{bus.currentRoute.from}</span>
                  <span className="departure-time">
                    Départ: {new Date(bus.currentRoute.departure).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="route-arrow">
                  <span>→</span>
                </div>
                
                <div className="route-to">
                  <span className="city-name">{bus.currentRoute.to}</span>
                  <span className="arrival-time">
                    Arrivée: {new Date(bus.currentRoute.arrival).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              
              <div className="route-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: getRouteProgress() + '%' }}></div>
                </div>
                <span className="progress-text">En cours de trajet</span>
              </div>
            </div>
          </div>
        )}

        {/* Conducteur assigné */}
        {bus.driver && (
          <div className="detail-section">
            <h2>👨‍✈️ Conducteur assigné</h2>
            
            <div className="driver-card">
              <div className="driver-avatar">
                👨‍✈️
              </div>
              <div className="driver-info">
                <h3>{bus.driver.name}</h3>
                <p>📞 {bus.driver.phone}</p>
              </div>
              <div className="driver-actions">
                <button className="btn-contact">
                  📞 Contacter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance */}
        <div className="detail-section">
          <h2>🔧 Maintenance</h2>
          
          <div className="maintenance-card">
            <div className="maintenance-status">
              <span className={`maintenance-badge ${bus.maintenance.status}`}>
                {bus.maintenance.status === 'good' ? '✅' : '⚠️'}
                {bus.maintenance.status === 'good' ? 'Bon état' : 'Attention requise'}
              </span>
            </div>
            
            <div className="maintenance-details">
              <div className="maintenance-row">
                <span className="label">Dernière vérification:</span>
                <span className="value">
                  {bus.maintenance.lastCheck ? 
                    new Date(bus.maintenance.lastCheck).toLocaleDateString('fr-FR') : 
                    'Non renseignée'
                  }
                </span>
              </div>
              <div className="maintenance-row">
                <span className="label">Prochaine vérification:</span>
                <span className="value">
                  {bus.maintenance.nextCheck ? 
                    new Date(bus.maintenance.nextCheck).toLocaleDateString('fr-FR') : 
                    'Non programmée'
                  }
                </span>
              </div>
            </div>
            
            {hasPermission('buses', 'manageMaintenance') && (
              <div className="maintenance-actions">
                <button className="btn-maintenance">
                  🔧 Programmer maintenance
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function getFeatureIcon(feature) {
    const icons = {
      'AC': '❄️',
      'WiFi': '📶',
      'USB': '🔌',
      'TV': '📺',
      'Toilet': '🚽',
      'Musique': '🎵',
      'Collation': '🍿',
      'Climatisation': '❄️'
    };
    return icons[feature] || '⭐';
  }

  function getRouteProgress() {
    if (!bus.currentRoute) return 0;
    
    const now = new Date();
    const departure = new Date(bus.currentRoute.departure);
    const arrival = new Date(bus.currentRoute.arrival);
    
    if (now < departure) return 0;
    if (now > arrival) return 100;
    
    const totalDuration = arrival.getTime() - departure.getTime();
    const elapsed = now.getTime() - departure.getTime();
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  }
};

export default BusDetail;
