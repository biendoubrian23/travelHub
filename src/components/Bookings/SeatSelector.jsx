import React from 'react';
import './SeatSelector.css';

const SeatSelector = ({ totalSeats, occupiedSeats, selectedSeat, onSeatSelect }) => {
  // Organiser les sièges en rangées (4 sièges par rangée par défaut)
  const seatsPerRow = 4;
  const rows = Math.ceil(totalSeats / seatsPerRow);

  const getSeatStatus = (seatNumber) => {
    if (occupiedSeats.includes(seatNumber)) return 'occupied';
    if (selectedSeat === seatNumber) return 'selected';
    return 'available';
  };

  const handleSeatClick = (seatNumber) => {
    if (!occupiedSeats.includes(seatNumber)) {
      onSeatSelect(seatNumber === selectedSeat ? null : seatNumber);
    }
  };

  const renderSeat = (seatNumber) => {
    const status = getSeatStatus(seatNumber);
    
    return (
      <div
        key={seatNumber}
        className={`seat ${status}`}
        onClick={() => handleSeatClick(seatNumber)}
        title={
          status === 'occupied' 
            ? `Siège ${seatNumber} - Occupé` 
            : `Siège ${seatNumber} - ${status === 'selected' ? 'Sélectionné' : 'Disponible'}`
        }
      >
        {seatNumber}
      </div>
    );
  };

  return (
    <div className="seat-selector">
      <div className="seat-selector-header">
        <h4>🚌 Sélectionnez votre siège</h4>
        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat available small"></div>
            <span>Disponible</span>
          </div>
          <div className="legend-item">
            <div className="seat occupied small"></div>
            <span>Occupé</span>
          </div>
          <div className="legend-item">
            <div className="seat selected small"></div>
            <span>Sélectionné</span>
          </div>
        </div>
      </div>
      
      <div className="bus-layout">
        <div className="driver-area">🪑 Conducteur</div>
        
        <div className="seats-area">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              {/* Côté gauche (2 sièges) */}
              <div className="seat-group left">
                {Array.from({ length: 2 }, (_, seatIndex) => {
                  const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                  return seatNumber <= totalSeats ? renderSeat(seatNumber) : null;
                })}
              </div>
              
              {/* Allée */}
              <div className="aisle"></div>
              
              {/* Côté droit (2 sièges) */}
              <div className="seat-group right">
                {Array.from({ length: 2 }, (_, seatIndex) => {
                  const seatNumber = rowIndex * seatsPerRow + seatIndex + 3;
                  return seatNumber <= totalSeats ? renderSeat(seatNumber) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="seat-info">
        {selectedSeat ? (
          <p className="selected-info">
            ✅ Siège {selectedSeat} sélectionné
          </p>
        ) : (
          <p className="no-selection">
            💡 Cliquez sur un siège pour le sélectionner
          </p>
        )}
      </div>
    </div>
  );
};

export default SeatSelector;
