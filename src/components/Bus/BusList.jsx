import React from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './BusList.css';

const BusList = ({ 
  buses, 
  onViewBus, 
  onEditBus, 
  onDeleteBus, 
  onViewSeating,
  currentRole 
}) => {
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

  if (buses.length === 0) {
    return (
      <div className="bus-list-empty">
        <div className="empty-illustration">
          🚌
        </div>
        <h3>Aucun bus trouvé</h3>
        <p>Aucun bus ne correspond à vos critères de recherche.</p>
      </div>
    );
  }

  return (
    <div className="bus-list">
      <div className="bus-list-header">
        <h2>📋 Liste des Bus ({buses.length})</h2>
      </div>

      <div className="bus-table-container">
        <table className="bus-table">
          <thead>
            <tr>
              <th>Bus</th>
              <th>Véhicule</th>
              <th>Capacité</th>
              <th>Statut</th>
              <th>Trajet actuel</th>
              <th>Conducteur</th>
              <th>Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map(bus => (
              <tr key={bus.id} className="bus-row">
                <td className="bus-info">
                  <div className="bus-number">
                    <strong>{bus.number}</strong>
                  </div>
                  <div className="bus-plate">
                    {bus.licensePlate}
                  </div>
                </td>

                <td className="vehicle-info">
                  <div className="vehicle-brand">
                    {bus.brand} {bus.model}
                  </div>
                  <div className="vehicle-features">
                    {bus.features.map(feature => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="capacity-info">
                  <div className="capacity-total">
                    <strong>{bus.capacity}</strong> places
                  </div>
                  {bus.status === 'in_service' && bus.seating && (
                    <div className="capacity-occupied">
                      {bus.seating.filter(seat => seat.status === 'occupied').length} occupées
                    </div>
                  )}
                </td>

                <td className="status-info">
                  <span className={`status-badge ${getStatusClass(bus.status)}`}>
                    {getStatusIcon(bus.status)} {getStatusLabel(bus.status)}
                  </span>
                </td>

                <td className="route-info">
                  {bus.currentRoute ? (
                    <div className="route-details">
                      <div className="route-path">
                        {bus.currentRoute.from} → {bus.currentRoute.to}
                      </div>
                      <div className="route-time">
                        {new Date(bus.currentRoute.departure).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ) : (
                    <span className="no-route">Aucun trajet</span>
                  )}
                </td>

                <td className="driver-info">
                  {bus.driver ? (
                    <div className="driver-details">
                      <div className="driver-name">
                        {bus.driver.name}
                      </div>
                      <div className="driver-phone">
                        📞 {bus.driver.phone}
                      </div>
                    </div>
                  ) : (
                    <span className="no-driver">Aucun conducteur</span>
                  )}
                </td>

                <td className="maintenance-info">
                  <div className="maintenance-status">
                    <span className={`maintenance-badge ${bus.maintenance.status}`}>
                      {bus.maintenance.status === 'good' ? '✅' : '⚠️'}
                      {bus.maintenance.status === 'good' ? 'Bon' : 'Attention'}
                    </span>
                  </div>
                  <div className="next-check">
                    Prochain: {new Date(bus.maintenance.nextCheck).toLocaleDateString('fr-FR')}
                  </div>
                </td>

                <td className="actions-info">
                  <div className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => onViewBus(bus)}
                      title="Voir détails"
                    >
                      👁️
                    </button>

                    <button
                      className="btn-seating"
                      onClick={() => onViewSeating(bus)}
                      title="Plan des sièges"
                    >
                      🪑
                    </button>

                    {hasPermission('buses', 'edit') && (
                      <button
                        className="btn-edit"
                        onClick={() => onEditBus(bus)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                    )}

                    {hasPermission('buses', 'delete') && (
                      <button
                        className="btn-delete"
                        onClick={() => onDeleteBus(bus)}
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

      {/* Version mobile */}
      <div className="bus-cards-mobile">
        {buses.map(bus => (
          <div key={bus.id} className="bus-card-mobile">
            <div className="bus-card-header">
              <div className="bus-title">
                <strong>{bus.number}</strong>
                <span className="bus-brand">{bus.brand} {bus.model}</span>
              </div>
              <span className={`status-badge ${getStatusClass(bus.status)}`}>
                {getStatusIcon(bus.status)} {getStatusLabel(bus.status)}
              </span>
            </div>

            <div className="bus-card-content">
              <div className="bus-detail-row">
                <span className="label">Plaque:</span>
                <span className="value">{bus.licensePlate}</span>
              </div>

              <div className="bus-detail-row">
                <span className="label">Capacité:</span>
                <span className="value">
                  {bus.capacity} places
                  {bus.status === 'in_service' && bus.seating && (
                    <span className="occupied">
                      ({bus.seating.filter(seat => seat.status === 'occupied').length} occupées)
                    </span>
                  )}
                </span>
              </div>

              {bus.currentRoute && (
                <div className="bus-detail-row">
                  <span className="label">Trajet:</span>
                  <span className="value">
                    {bus.currentRoute.from} → {bus.currentRoute.to}
                  </span>
                </div>
              )}

              {bus.driver && (
                <div className="bus-detail-row">
                  <span className="label">Conducteur:</span>
                  <span className="value">{bus.driver.name}</span>
                </div>
              )}

              <div className="bus-detail-row">
                <span className="label">Maintenance:</span>
                <span className="value">
                  <span className={`maintenance-badge ${bus.maintenance.status}`}>
                    {bus.maintenance.status === 'good' ? '✅ Bon' : '⚠️ Attention'}
                  </span>
                </span>
              </div>
            </div>

            <div className="bus-card-actions">
              <button
                className="btn-view"
                onClick={() => onViewBus(bus)}
              >
                👁️ Détails
              </button>

              <button
                className="btn-seating"
                onClick={() => onViewSeating(bus)}
              >
                🪑 Sièges
              </button>

              {hasPermission('buses', 'edit') && (
                <button
                  className="btn-edit"
                  onClick={() => onEditBus(bus)}
                >
                  ✏️ Modifier
                </button>
              )}

              {hasPermission('buses', 'delete') && (
                <button
                  className="btn-delete"
                  onClick={() => onDeleteBus(bus)}
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusList;
