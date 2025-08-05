import React, { useState } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './BusSeatingMap.css';

const BusSeatingMap = ({ bus, onBack, currentRole }) => {
  const { hasPermission } = useRolePermissions();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatingData, setSeatingData] = useState(bus.seating || []);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' ou 'list'

  // Organisation des sièges par rangée (4 sièges par rangée: A-B | allée | C-D)
  const organizeSeats = () => {
    const rows = [];
    const seatsPerRow = 4;
    
    for (let i = 0; i < seatingData.length; i += seatsPerRow) {
      const row = {
        number: Math.floor(i / seatsPerRow) + 1,
        seats: {
          left: [
            seatingData[i] || null,
            seatingData[i + 1] || null
          ],
          right: [
            seatingData[i + 2] || null,
            seatingData[i + 3] || null
          ]
        }
      };
      rows.push(row);
    }
    
    return rows;
  };

  const getSeatClass = (seat) => {
    if (!seat) return 'seat-empty';
    
    let classes = ['seat'];
    classes.push(`seat-${seat.status}`);
    
    if (selectedSeat && selectedSeat.number === seat.number) {
      classes.push('seat-selected');
    }
    
    return classes.join(' ');
  };

  const getSeatIcon = (seat) => {
    if (!seat) return '';
    
    switch (seat.status) {
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

  const handleSeatClick = (seat) => {
    if (!seat) return;
    setSelectedSeat(seat);
  };

  const handleSeatUpdate = async (seatNumber, newStatus, passengerData = null) => {
    if (!hasPermission('buses', 'edit')) {
      alert('Vous n\'avez pas les permissions pour modifier les sièges');
      return;
    }

    try {
      const updatedSeating = seatingData.map(seat => {
        if (seat.number === seatNumber) {
          return {
            ...seat,
            status: newStatus,
            passenger: passengerData
          };
        }
        return seat;
      });

      setSeatingData(updatedSeating);
      setSelectedSeat(null);
      
      // Ici on ferait un appel API pour sauvegarder
      console.log('Siège mis à jour:', seatNumber, newStatus);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du siège:', error);
      alert('Erreur lors de la mise à jour du siège');
    }
  };

  const getOccupancyStats = () => {
    const total = seatingData.length;
    const occupied = seatingData.filter(seat => seat.status === 'occupied').length;
    const available = seatingData.filter(seat => seat.status === 'available').length;
    const reserved = seatingData.filter(seat => seat.status === 'reserved').length;
    const maintenance = seatingData.filter(seat => seat.status === 'maintenance').length;

    return {
      total,
      occupied,
      available,
      reserved,
      maintenance,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
    };
  };

  const stats = getOccupancyStats();
  const rows = organizeSeats();

  return (
    <div className="bus-seating-map">
      {/* Header */}
      <div className="seating-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            ← Retour
          </button>
          <div className="bus-info">
            <h1>🚌 {bus.number} - Plan des Sièges</h1>
            <p>{bus.brand} {bus.model} • {bus.capacity} places</p>
          </div>
        </div>

        <div className="header-right">
          <div className="view-toggle">
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

      {/* Statistiques */}
      <div className="occupancy-stats">
        <div className="stat-card total">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card occupied">
          <div className="stat-value">{stats.occupied}</div>
          <div className="stat-label">Occupés</div>
        </div>
        <div className="stat-card available">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Libres</div>
        </div>
        <div className="stat-card reserved">
          <div className="stat-value">{stats.reserved}</div>
          <div className="stat-label">Réservés</div>
        </div>
        <div className="stat-card occupancy-rate">
          <div className="stat-value">{stats.occupancyRate}%</div>
          <div className="stat-label">Taux occupation</div>
        </div>
      </div>

      {/* Légende */}
      <div className="seating-legend">
        <div className="legend-item">
          <span className="seat seat-available">💺</span>
          <span className="legend-label">Libre</span>
        </div>
        <div className="legend-item">
          <span className="seat seat-occupied">👤</span>
          <span className="legend-label">Occupé</span>
        </div>
        <div className="legend-item">
          <span className="seat seat-reserved">🔒</span>
          <span className="legend-label">Réservé</span>
        </div>
        <div className="legend-item">
          <span className="seat seat-maintenance">🔧</span>
          <span className="legend-label">Maintenance</span>
        </div>
      </div>

      <div className="seating-content">
        {viewMode === 'visual' ? (
          // Vue graphique du bus
          <div className="bus-visual">
            <div className="bus-container">
              {/* Avant du bus */}
              <div className="bus-front">
                <div className="driver-area">
                  🚗 Conducteur
                </div>
              </div>

              {/* Rangées de sièges */}
              <div className="seating-area">
                {rows.map(row => (
                  <div key={row.number} className="seat-row">
                    <div className="row-number">{row.number}</div>
                    
                    {/* Sièges gauche */}
                    <div className="seats-left">
                      {row.seats.left.map((seat, index) => (
                        <div
                          key={seat ? seat.number : `empty-${row.number}-${index}`}
                          className={getSeatClass(seat)}
                          onClick={() => handleSeatClick(seat)}
                          title={seat ? `Siège ${seat.number} - ${seat.status}` : ''}
                        >
                          {seat && (
                            <>
                              <span className="seat-icon">{getSeatIcon(seat)}</span>
                              <span className="seat-number">{seat.number}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Allée */}
                    <div className="aisle"></div>

                    {/* Sièges droite */}
                    <div className="seats-right">
                      {row.seats.right.map((seat, index) => (
                        <div
                          key={seat ? seat.number : `empty-${row.number}-${index + 2}`}
                          className={getSeatClass(seat)}
                          onClick={() => handleSeatClick(seat)}
                          title={seat ? `Siège ${seat.number} - ${seat.status}` : ''}
                        >
                          {seat && (
                            <>
                              <span className="seat-icon">{getSeatIcon(seat)}</span>
                              <span className="seat-number">{seat.number}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Arrière du bus */}
              <div className="bus-back">
                <div className="emergency-exit">
                  🚪 Sortie de secours
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Vue liste
          <div className="seating-list">
            <div className="seats-table">
              <table>
                <thead>
                  <tr>
                    <th>Siège</th>
                    <th>Statut</th>
                    <th>Passager</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {seatingData.map(seat => (
                    <tr key={seat.number} className={`seat-row-${seat.status}`}>
                      <td className="seat-number-cell">
                        <strong>{seat.number}</strong>
                      </td>
                      <td className="seat-status-cell">
                        <span className={`status-badge seat-${seat.status}`}>
                          {getSeatIcon(seat)} {seat.status}
                        </span>
                      </td>
                      <td className="passenger-cell">
                        {seat.passenger ? seat.passenger.name : '-'}
                      </td>
                      <td className="contact-cell">
                        {seat.passenger ? seat.passenger.phone : '-'}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-small"
                          onClick={() => handleSeatClick(seat)}
                        >
                          👁️ Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Panneau de détails du siège sélectionné */}
      {selectedSeat && (
        <div className="seat-details-panel">
          <div className="panel-header">
            <h3>Siège {selectedSeat.number}</h3>
            <button
              className="btn-close"
              onClick={() => setSelectedSeat(null)}
            >
              ✕
            </button>
          </div>

          <div className="panel-content">
            <div className="seat-info">
              <div className="info-row">
                <span className="label">Statut:</span>
                <span className={`value status-${selectedSeat.status}`}>
                  {getSeatIcon(selectedSeat)} {selectedSeat.status}
                </span>
              </div>

              {selectedSeat.passenger && (
                <>
                  <div className="info-row">
                    <span className="label">Passager:</span>
                    <span className="value">{selectedSeat.passenger.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Téléphone:</span>
                    <span className="value">{selectedSeat.passenger.phone}</span>
                  </div>
                </>
              )}
            </div>

            {hasPermission('buses', 'edit') && (
              <div className="seat-actions">
                <h4>Actions disponibles:</h4>
                
                {selectedSeat.status === 'occupied' && (
                  <button
                    className="btn-action free"
                    onClick={() => handleSeatUpdate(selectedSeat.number, 'available')}
                  >
                    💺 Libérer le siège
                  </button>
                )}

                {selectedSeat.status === 'available' && (
                  <>
                    <button
                      className="btn-action occupy"
                      onClick={() => {
                        const name = prompt('Nom du passager:');
                        const phone = prompt('Téléphone du passager:');
                        if (name && phone) {
                          handleSeatUpdate(selectedSeat.number, 'occupied', { name, phone });
                        }
                      }}
                    >
                      👤 Assigner un passager
                    </button>
                    
                    <button
                      className="btn-action reserve"
                      onClick={() => handleSeatUpdate(selectedSeat.number, 'reserved')}
                    >
                      🔒 Réserver
                    </button>
                  </>
                )}

                {selectedSeat.status === 'reserved' && (
                  <button
                    className="btn-action free"
                    onClick={() => handleSeatUpdate(selectedSeat.number, 'available')}
                  >
                    💺 Annuler réservation
                  </button>
                )}

                <button
                  className="btn-action maintenance"
                  onClick={() => handleSeatUpdate(
                    selectedSeat.number, 
                    selectedSeat.status === 'maintenance' ? 'available' : 'maintenance'
                  )}
                >
                  🔧 {selectedSeat.status === 'maintenance' ? 'Remettre en service' : 'Marquer en maintenance'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusSeatingMap;
