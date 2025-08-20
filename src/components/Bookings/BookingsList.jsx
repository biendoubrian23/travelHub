import React from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './BookingsList.css';

const BookingsList = ({ 
  bookings, 
  view, 
  searchTerm, 
  statusFilter,
  onBookingAction 
}) => {
  const { hasPermission } = useRolePermissions();

  // Fonction pour vérifier si la date est passée
  const isDatePassed = (dateString) => {
    if (!dateString) return false;
    const tripDate = new Date(dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day
    tripDate.setHours(0, 0, 0, 0); // Reset time to start of day
    return tripDate < currentDate;
  };

  // Fonction pour gérer les clics sur les boutons désactivés
  const handleDisabledButtonClick = (action) => {
    const messages = {
      view: "⚠️ Impossible de voir les détails : cette réservation concerne un trajet dont la date est déjà passée. Vous ne pouvez que consulter les informations.",
      edit: "⚠️ Impossible de modifier : cette réservation concerne un trajet dont la date est déjà passée.",
      cancel: "⚠️ Impossible d'annuler : cette réservation concerne un trajet dont la date est déjà passée.",
      refund: "⚠️ Impossible de rembourser : cette réservation concerne un trajet dont la date est déjà passée."
    };
    
    alert(messages[action] || "⚠️ Action impossible : la date du trajet est déjà passée.");
  };

  // Fonction utilitaire pour extraire les données selon la structure
  const getBookingData = (booking) => {
    return {
      id: booking.id,
      passenger_name: booking.passenger_name || booking.passenger?.name || '',
      passenger_phone: booking.passenger_phone || booking.passenger?.phone || '',
      passenger_email: booking.passenger_email || booking.passenger?.email || '',
      passenger_id: booking.passenger_id || booking.passenger?.idCard || '',
      trip_route: booking.trip_route || `${booking.trip?.from} → ${booking.trip?.to}` || '',
      seat_number: booking.seat_number || (booking.seats ? booking.seats.join(', ') : ''),
      price: booking.price || booking.totalPrice || 0,
      status: booking.status || 'pending',
      payment_status: booking.payment_status || booking.paymentStatus || 'pending',
      booking_date: booking.booking_date || booking.bookingDate || '',
      departure_time: booking.departure_time || booking.trip?.departure || '',
      payment_method: booking.payment_method || booking.paymentMethod || ''
    };
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingData = getBookingData(booking);
    
    const matchesSearch = !searchTerm || 
      bookingData.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookingData.passenger_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookingData.trip_route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookingData.seat_number.toString().includes(searchTerm);
    
    const matchesStatus = !statusFilter || bookingData.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (view === 'table') {
    return (
      <div className="bookings-table-container">
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Passager</th>
                <th>Contact</th>
                <th>Trajet</th>
                <th>Date/Heure</th>
                <th>Siège</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Réservé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => {
                const bookingData = getBookingData(booking);
                return (
                <tr key={booking.id} className="booking-row">
                  <td className="passenger-cell">
                    <div className="passenger-info">
                      <div className="passenger-name">{bookingData.passenger_name}</div>
                      <div className="passenger-id">ID: {bookingData.passenger_id || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="contact-cell">
                    <div className="contact-info">
                      <div className="phone">{bookingData.passenger_phone}</div>
                      {bookingData.passenger_email && (
                        <div className="email">{bookingData.passenger_email}</div>
                      )}
                    </div>
                  </td>
                  <td className="trip-cell">
                    <div className="trip-info">
                      <div className="route">{bookingData.trip_route}</div>
                      <div className="bus-info">{booking.bus_name || booking.trip?.bus?.number || ''}</div>
                    </div>
                  </td>
                  <td className="datetime-cell">
                    <div className="datetime-info">
                      <div className="date">{formatDate(bookingData.departure_time)}</div>
                      <div className="time">{formatTime(bookingData.departure_time)}</div>
                    </div>
                  </td>
                  <td className="seat-cell">
                    <div className="seat-number">
                      <span className="seat-icon">💺</span>
                      <span className="number">{bookingData.seat_number}</span>
                    </div>
                  </td>
                  <td className="price-cell">
                    <div className="price-info">
                      <div className="amount">{(bookingData.price || 0).toLocaleString()} FCFA</div>
                      <div className="payment-status">
                        {bookingData.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'}
                      </div>
                    </div>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge status-${bookingData.status}`}>
                      {getStatusIcon(bookingData.status)} {getStatusLabel(bookingData.status)}
                    </span>
                  </td>
                  <td className="booking-date-cell">
                    <div className="booking-date">
                      {formatDate(bookingData.booking_date)}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        className={`btn-view ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                        onClick={() => {
                          if (isDatePassed(bookingData.departure_time)) {
                            handleDisabledButtonClick('view');
                          } else {
                            onBookingAction('view', booking);
                          }
                        }}
                        title={isDatePassed(bookingData.departure_time) ? "Date passée - Consultation uniquement" : "Voir les détails"}
                      >
                        👁️
                      </button>
                      {hasPermission('bookings', 'modify') && (
                        <button
                          className={`btn-edit ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                          onClick={() => {
                            if (isDatePassed(bookingData.departure_time)) {
                              handleDisabledButtonClick('edit');
                            } else {
                              onBookingAction('edit', booking);
                            }
                          }}
                          title={isDatePassed(bookingData.departure_time) ? "Date passée - Modification impossible" : "Modifier"}
                        >
                          ✏️
                        </button>
                      )}
                      {hasPermission('bookings', 'cancel') && booking.status === 'confirmed' && (
                        <button
                          className={`btn-cancel ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                          onClick={() => {
                            if (isDatePassed(bookingData.departure_time)) {
                              handleDisabledButtonClick('cancel');
                            } else {
                              onBookingAction('cancel', booking);
                            }
                          }}
                          title={isDatePassed(bookingData.departure_time) ? "Date passée - Annulation impossible" : "Annuler"}
                        >
                          ❌
                        </button>
                      )}
                      {hasPermission('bookings', 'refund') && booking.status === 'cancelled' && (
                        <button
                          className={`btn-refund ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                          onClick={() => {
                            if (isDatePassed(bookingData.departure_time)) {
                              handleDisabledButtonClick('refund');
                            } else {
                              onBookingAction('refund', booking);
                            }
                          }}
                          title={isDatePassed(bookingData.departure_time) ? "Date passée - Remboursement impossible" : "Rembourser"}
                        >
                          💰
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h3>Aucune réservation trouvée</h3>
            <p>Aucune réservation ne correspond à vos critères de recherche.</p>
          </div>
        )}
      </div>
    );
  }

  // Vue en cartes (mobile)
  return (
    <div className="bookings-cards-container">
      <div className="bookings-grid">
        {filteredBookings.map(booking => {
          const bookingData = getBookingData(booking);
          return (
          <div key={booking.id} className="booking-card">
            <div className="card-header">
              <div className="passenger-header">
                <h3>{bookingData.passenger_name}</h3>
                <div className="passenger-contact">{bookingData.passenger_phone}</div>
              </div>
              <span className={`status-badge status-${bookingData.status}`}>
                {getStatusIcon(bookingData.status)} {getStatusLabel(bookingData.status)}
              </span>
            </div>

            <div className="card-content">
              <div className="trip-summary">
                <div className="route-display">
                  <span className="route-icon">🗺️</span>
                  <span className="route-text">{bookingData.trip_route}</span>
                </div>
                <div className="bus-display">
                  <span className="bus-icon">🚌</span>
                  <span className="bus-text">{booking.bus_name || booking.trip?.bus?.number || ''}</span>
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">📅 Date:</span>
                    <span className="detail-value">{formatDate(bookingData.departure_time)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">⏰ Heure:</span>
                    <span className="detail-value">{formatTime(bookingData.departure_time)}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">💺 Siège:</span>
                    <span className="detail-value seat-highlight">{booking.seat_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">� Siège:</span>
                    <span className="detail-value">{bookingData.seat_number}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">�💰 Prix:</span>
                    <span className="detail-value price-highlight">
                      {(bookingData.price || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <div className="payment-row">
                  <div className="payment-status">
                    <span className="payment-label">Paiement:</span>
                    <span className={`payment-badge ${bookingData.payment_status}`}>
                      {bookingData.payment_status === 'paid' ? '✅ Payé' : '⏳ En attente'}
                    </span>
                  </div>
                </div>

                <div className="booking-meta">
                  <div className="booking-id">
                    Réservation #{booking.id}
                  </div>
                  <div className="booking-created">
                    Créée le {formatDate(bookingData.booking_date)}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button
                className={`btn-view ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                onClick={() => {
                  if (isDatePassed(bookingData.departure_time)) {
                    handleDisabledButtonClick('view');
                  } else {
                    onBookingAction('view', booking);
                  }
                }}
              >
                👁️ {isDatePassed(bookingData.departure_time) ? 'Consulter' : 'Détails'}
              </button>
              {hasPermission('bookings', 'modify') && (
                <button
                  className={`btn-edit ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                  onClick={() => {
                    if (isDatePassed(bookingData.departure_time)) {
                      handleDisabledButtonClick('edit');
                    } else {
                      onBookingAction('edit', booking);
                    }
                  }}
                >
                  ✏️ Modifier
                </button>
              )}
              {hasPermission('bookings', 'cancel') && bookingData.status === 'confirmed' && (
                <button
                  className={`btn-cancel ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                  onClick={() => {
                    if (isDatePassed(bookingData.departure_time)) {
                      handleDisabledButtonClick('cancel');
                    } else {
                      onBookingAction('cancel', booking);
                    }
                  }}
                >
                  ❌ Annuler
                </button>
              )}
              {hasPermission('bookings', 'refund') && bookingData.status === 'cancelled' && (
                <button
                  className={`btn-refund ${isDatePassed(bookingData.departure_time) ? 'tvhub-disabled-btn' : ''}`}
                  onClick={() => {
                    if (isDatePassed(bookingData.departure_time)) {
                      handleDisabledButtonClick('refund');
                    } else {
                      onBookingAction('refund', booking);
                    }
                  }}
                >
                  💰 Rembourser
                </button>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {filteredBookings.length === 0 && (
        <div className="no-bookings">
          <div className="no-bookings-icon">📋</div>
          <h3>Aucune réservation trouvée</h3>
          <p>Aucune réservation ne correspond à vos critères de recherche.</p>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
