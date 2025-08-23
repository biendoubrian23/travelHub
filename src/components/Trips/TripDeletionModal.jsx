import React, { useState } from 'react';
import './TripDeletionModal.css';

const TripDeletionModal = ({ isOpen, onClose, onConfirm, safetyCheck }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !safetyCheck) return null;

  const { trip, safety } = safetyCheck;

  const handleConfirm = async () => {
    if (safety.level === 'CRITICAL' && confirmText !== 'SUPPRIMER') {
      alert('Veuillez taper exactement "SUPPRIMER" pour confirmer');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      setConfirmText('');
      onClose();
    }
  };

  const getSafetyColor = () => {
    switch (safety.level) {
      case 'SAFE': return '#28a745';
      case 'WARNING': return '#ffc107';
      case 'CRITICAL': return '#dc3545';
      case 'FORBIDDEN': return '#6c757d';
      default: return '#007bff';
    }
  };

  const getSafetyIcon = () => {
    switch (safety.level) {
      case 'SAFE': return '✅';
      case 'WARNING': return '⚠️';
      case 'CRITICAL': return '🚨';
      case 'FORBIDDEN': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="trip-deletion-modal-overlay">
      <div className="trip-deletion-modal">
        <div className="modal-header">
          <h2>
            {getSafetyIcon()} Suppression de trajet
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Informations du trajet */}
          <div className="trip-info">
            <h3>🚌 Trajet à supprimer</h3>
            <div className="trip-details">
              <p><strong>Route:</strong> {trip.departure_city} → {trip.arrival_city}</p>
              <p><strong>Date:</strong> {trip.departure_date}</p>
              <p><strong>Heure:</strong> {trip.departure_time}</p>
              <p><strong>Prix:</strong> {trip.price_fcfa?.toLocaleString()} FCFA</p>
            </div>
          </div>

          {/* Niveau de sécurité */}
          <div 
            className="safety-level"
            style={{ 
              borderLeft: `4px solid ${getSafetyColor()}`,
              backgroundColor: `${getSafetyColor()}20`
            }}
          >
            <h4 style={{ color: getSafetyColor() }}>
              Niveau de sécurité: {safety.level}
            </h4>
            
            {safety.warnings.length > 0 && (
              <div className="warnings">
                <strong>⚠️ Avertissements:</strong>
                <ul>
                  {safety.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="impact-stats">
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-number">{safety.confirmedBookingsCount}</span>
                <span className="stat-label">Réservations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{safety.totalRevenue?.toLocaleString()}</span>
                <span className="stat-label">FCFA à traiter</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{safety.hoursToDeparture}h</span>
                <span className="stat-label">Avant départ</span>
              </div>
            </div>
          </div>

          {/* Actions qui seront effectuées */}
          {safety.actions.length > 0 && (
            <div className="actions-list">
              <h4>📋 Actions qui seront effectuées:</h4>
              <ul>
                {safety.actions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Zone de confirmation */}
          {safety.level === 'CRITICAL' && (
            <div className="critical-confirmation">
              <p><strong>🚨 Cette suppression nécessite une confirmation spéciale</strong></p>
              <p>Tapez <code>SUPPRIMER</code> dans le champ ci-dessous:</p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Tapez SUPPRIMER"
                className="confirm-input"
                disabled={isDeleting}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Annuler
          </button>
          
          {safety.level !== 'FORBIDDEN' && (
            <button 
              className={`btn-confirm btn-${safety.level.toLowerCase()}`}
              onClick={handleConfirm}
              disabled={
                isDeleting || 
                (safety.level === 'CRITICAL' && confirmText !== 'SUPPRIMER')
              }
            >
              {isDeleting ? (
                <>
                  <span className="spinner"></span>
                  Suppression...
                </>
              ) : (
                `Supprimer ${safety.level === 'CRITICAL' ? 'définitivement' : ''}`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDeletionModal;
