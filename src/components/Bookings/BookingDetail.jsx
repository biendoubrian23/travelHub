import React from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './BookingDetail.css';

const BookingDetail = ({ booking, onBack, onEdit, onCancel, onRefund }) => {
  const { hasPermission } = useRolePermissions();

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: '✅',
      pending: '⏳',
      cancelled: '❌',
      completed: '🎯',
      no_show: '👻'
    };
    return icons[status] || '❓';
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: 'Confirmée',
      pending: 'En attente',
      cancelled: 'Annulée',
      completed: 'Terminée',
      no_show: 'Absent'
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

  const departureInfo = formatDateTime(booking.departure_time);
  const arrivalInfo = formatDateTime(booking.arrival_time || booking.departure_time);
  const bookingDate = formatDateTime(booking.booking_date);

  return (
    <div className="booking-detail">
      <div className="detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            ← Retour
          </button>
          <div className="booking-title">
            <h1>Réservation #{booking.id}</h1>
            <span className={`status-badge status-${booking.status}`}>
              {getStatusIcon(booking.status)} {getStatusLabel(booking.status)}
            </span>
          </div>
        </div>
        <div className="header-actions">
          {hasPermission('bookings', 'modify') && booking.status !== 'cancelled' && (
            <button className="btn-edit" onClick={() => onEdit(booking)}>
              ✏️ Modifier
            </button>
          )}
          {hasPermission('bookings', 'cancel') && booking.status === 'confirmed' && (
            <button className="btn-cancel" onClick={() => onCancel(booking)}>
              ❌ Annuler
            </button>
          )}
          {hasPermission('bookings', 'refund') && booking.status === 'cancelled' && booking.payment_status === 'paid' && (
            <button className="btn-refund" onClick={() => onRefund(booking)}>
              💰 Rembourser
            </button>
          )}
        </div>
      </div>

      <div className="detail-content">
        {/* Informations du passager */}
        <div className="detail-section">
          <h2>👤 Informations du passager</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <div className="card-header">
                <h3>🆔 Identité</h3>
              </div>
              <div className="card-content">
                <div className="passenger-profile">
                  <div className="passenger-avatar">
                    {booking.passenger_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="passenger-details">
                    <div className="passenger-name">{booking.passenger_name}</div>
                    {booking.passenger_id && (
                      <div className="passenger-id">ID: {booking.passenger_id}</div>
                    )}
                    {booking.passenger_age && (
                      <div className="passenger-age">Âge: {booking.passenger_age} ans</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <div className="card-header">
                <h3>📞 Contact</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="label">Téléphone</span>
                  <span className="value phone">{booking.passenger_phone}</span>
                </div>
                {booking.passenger_email && (
                  <div className="info-row">
                    <span className="label">Email</span>
                    <span className="value email">{booking.passenger_email}</span>
                  </div>
                )}
                {booking.emergency_contact && (
                  <div className="info-row">
                    <span className="label">Contact d'urgence</span>
                    <span className="value">{booking.emergency_contact}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Détails du voyage */}
        <div className="detail-section">
          <h2>🗺️ Détails du voyage</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <div className="card-header">
                <h3>🛣️ Itinéraire</h3>
              </div>
              <div className="card-content">
                <div className="trip-visual">
                  <div className="trip-point">
                    <div className="point-icon departure">🏁</div>
                    <div className="point-info">
                      <div className="city-name">{booking.departure_city}</div>
                      <div className="datetime-info">
                        <div className="date">{departureInfo.date}</div>
                        <div className="time">{departureInfo.time}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="trip-arrow">→</div>
                  
                  <div className="trip-point">
                    <div className="point-icon arrival">🏁</div>
                    <div className="point-info">
                      <div className="city-name">{booking.destination_city}</div>
                      <div className="datetime-info">
                        <div className="date">{arrivalInfo.date}</div>
                        <div className="time">{arrivalInfo.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {booking.trip_duration && (
                  <div className="trip-duration">
                    <span className="duration-label">Durée du trajet:</span>
                    <span className="duration-value">{booking.trip_duration}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-card">
              <div className="card-header">
                <h3>🚌 Transport</h3>
              </div>
              <div className="card-content">
                <div className="info-row">
                  <span className="label">Bus</span>
                  <span className="value">{booking.bus_name}</span>
                </div>
                {booking.bus_plate && (
                  <div className="info-row">
                    <span className="label">Plaque</span>
                    <span className="value plate">{booking.bus_plate}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Siège</span>
                  <span className="value seat">💺 {booking.seat_number}</span>
                </div>
                {booking.driver_name && (
                  <div className="info-row">
                    <span className="label">Conducteur</span>
                    <span className="value">{booking.driver_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations financières */}
        <div className="detail-section">
          <h2>💰 Informations financières</h2>
          <div className="detail-grid">
            <div className="detail-card">
              <div className="card-header">
                <h3>💳 Paiement</h3>
              </div>
              <div className="card-content">
                <div className="price-display">
                  <div className="price-amount">{booking.price.toLocaleString()} FCFA</div>
                  <div className="price-label">Prix du billet</div>
                </div>
                
                <div className="payment-info">
                  <div className="payment-status-row">
                    <span className="payment-label">Statut du paiement:</span>
                    <span className={`payment-badge ${booking.payment_status}`}>
                      {booking.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'}
                    </span>
                  </div>
                  
                  {booking.payment_method && (
                    <div className="info-row">
                      <span className="label">Méthode de paiement</span>
                      <span className="value">{booking.payment_method}</span>
                    </div>
                  )}
                  
                  {booking.payment_date && (
                    <div className="info-row">
                      <span className="label">Date de paiement</span>
                      <span className="value">{formatDateTime(booking.payment_date).date}</span>
                    </div>
                  )}
                  
                  {booking.transaction_id && (
                    <div className="info-row">
                      <span className="label">ID Transaction</span>
                      <span className="value transaction">{booking.transaction_id}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {booking.discounts && booking.discounts.length > 0 && (
              <div className="detail-card">
                <div className="card-header">
                  <h3>🎯 Réductions appliquées</h3>
                </div>
                <div className="card-content">
                  {booking.discounts.map((discount, index) => (
                    <div key={index} className="discount-item">
                      <div className="discount-name">{discount.name}</div>
                      <div className="discount-amount">-{discount.amount} FCFA</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Historique de la réservation */}
        <div className="detail-section">
          <h2>📋 Historique de la réservation</h2>
          <div className="booking-timeline">
            <div className="timeline-item">
              <div className="timeline-icon">➕</div>
              <div className="timeline-content">
                <div className="timeline-title">Réservation créée</div>
                <div className="timeline-date">{bookingDate.date} à {bookingDate.time}</div>
                {booking.created_by && (
                  <div className="timeline-details">Par: {booking.created_by}</div>
                )}
              </div>
            </div>

            {booking.payment_date && (
              <div className="timeline-item">
                <div className="timeline-icon">💳</div>
                <div className="timeline-content">
                  <div className="timeline-title">Paiement effectué</div>
                  <div className="timeline-date">
                    {formatDateTime(booking.payment_date).date} à {formatDateTime(booking.payment_date).time}
                  </div>
                  <div className="timeline-details">
                    Montant: {booking.price.toLocaleString()} FCFA
                  </div>
                </div>
              </div>
            )}

            {booking.modification_history && booking.modification_history.map((modification, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-icon">✏️</div>
                <div className="timeline-content">
                  <div className="timeline-title">Modification</div>
                  <div className="timeline-date">
                    {formatDateTime(modification.date).date} à {formatDateTime(modification.date).time}
                  </div>
                  <div className="timeline-details">{modification.description}</div>
                  {modification.modified_by && (
                    <div className="timeline-details">Par: {modification.modified_by}</div>
                  )}
                </div>
              </div>
            ))}

            {booking.status === 'cancelled' && booking.cancellation_date && (
              <div className="timeline-item">
                <div className="timeline-icon">❌</div>
                <div className="timeline-content">
                  <div className="timeline-title">Réservation annulée</div>
                  <div className="timeline-date">
                    {formatDateTime(booking.cancellation_date).date} à {formatDateTime(booking.cancellation_date).time}
                  </div>
                  {booking.cancellation_reason && (
                    <div className="timeline-details">Raison: {booking.cancellation_reason}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes et commentaires */}
        {(booking.notes || booking.special_requests) && (
          <div className="detail-section">
            <h2>📝 Notes et demandes spéciales</h2>
            <div className="notes-content">
              {booking.notes && (
                <div className="notes-section">
                  <h3>Notes</h3>
                  <p>{booking.notes}</p>
                </div>
              )}
              {booking.special_requests && (
                <div className="requests-section">
                  <h3>Demandes spéciales</h3>
                  <p>{booking.special_requests}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;
