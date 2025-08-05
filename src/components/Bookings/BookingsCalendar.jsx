import React, { useState, useEffect } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './BookingsCalendar.css';

const BookingsCalendar = () => {
  const { hasPermission } = useRolePermissions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBus, setSelectedBus] = useState(null);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Générer les dates du carrousel (3 anciens + aujourd'hui + 15 prochains)
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -3; i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Données mockées
  useEffect(() => {
    setTimeout(() => {
      // Trajets avec bus pour la date sélectionnée
      const mockTrips = [
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          bus: {
            id: 'BUS-001',
            number: '001',
            name: 'Express Voyageur',
            plate: 'LT-234-CM',
            totalSeats: 45
          },
          driver: {
            name: 'Jean-Paul Mbarga',
            phone: '+237670123456'
          },
          route: 'Douala → Yaoundé',
          departureTime: '08:00',
          price: 3500,
          status: 'scheduled'
        },
        {
          id: 2,
          date: new Date().toISOString().split('T')[0],
          bus: {
            id: 'BUS-002',
            number: '002',
            name: 'Confort Plus',
            plate: 'LT-567-CM',
            totalSeats: 52
          },
          driver: {
            name: 'Marie Essono',
            phone: '+237670123457'
          },
          route: 'Yaoundé → Bafoussam',
          departureTime: '14:00',
          price: 2800,
          status: 'scheduled'
        },
        {
          id: 3,
          date: new Date().toISOString().split('T')[0],
          bus: {
            id: 'BUS-003',
            number: '003',
            name: 'Grand Voyageur',
            plate: 'LT-890-CM',
            totalSeats: 55
          },
          driver: {
            name: 'Paul Nkomo',
            phone: '+237670123458'
          },
          route: 'Douala → Bamenda',
          departureTime: '06:30',
          price: 4200,
          status: 'scheduled'
        },
        {
          id: 4,
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          bus: {
            id: 'BUS-004',
            number: '004',
            name: 'Rapide Service',
            plate: 'LT-456-CM',
            totalSeats: 48
          },
          driver: {
            name: 'Alice Mbouda',
            phone: '+237670123459'
          },
          route: 'Yaoundé → Douala',
          departureTime: '16:00',
          price: 3500,
          status: 'scheduled'
        }
      ];

      // Réservations mockées
      const mockBookings = [
        // Bus 001
        {
          id: 1,
          tripId: 1,
          busId: 'BUS-001',
          passengerName: 'Jean Dupont',
          passengerPhone: '+237670111111',
          seatNumber: 12,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 2,
          tripId: 1,
          busId: 'BUS-001',
          passengerName: 'Marie Mbolo',
          passengerPhone: '+237670111112',
          seatNumber: 13,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 3,
          tripId: 1,
          busId: 'BUS-001',
          passengerName: 'Paul Essomba',
          passengerPhone: '+237670111113',
          seatNumber: 15,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'pending'
        },
        {
          id: 4,
          tripId: 1,
          busId: 'BUS-001',
          passengerName: 'Alice Fouda',
          passengerPhone: '+237670111114',
          seatNumber: 8,
          bookingDate: new Date().toISOString(),
          status: 'pending',
          paymentStatus: 'pending'
        },
        {
          id: 5,
          tripId: 1,
          busId: 'BUS-001',
          passengerName: 'Michel Tchuente',
          passengerPhone: '+237670111115',
          seatNumber: 22,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        
        // Bus 002
        {
          id: 6,
          tripId: 2,
          busId: 'BUS-002',
          passengerName: 'Sophie Mbarga',
          passengerPhone: '+237670222221',
          seatNumber: 5,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 7,
          tripId: 2,
          busId: 'BUS-002',
          passengerName: 'Claude Nkomo',
          passengerPhone: '+237670222222',
          seatNumber: 18,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 8,
          tripId: 2,
          busId: 'BUS-002',
          passengerName: 'Diane Essono',
          passengerPhone: '+237670222223',
          seatNumber: 31,
          bookingDate: new Date().toISOString(),
          status: 'pending',
          paymentStatus: 'pending'
        },

        // Bus 003
        {
          id: 9,
          tripId: 3,
          busId: 'BUS-003',
          passengerName: 'Robert Fouda',
          passengerPhone: '+237670333331',
          seatNumber: 2,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 10,
          tripId: 3,
          busId: 'BUS-003',
          passengerName: 'Berthe Mbouda',
          passengerPhone: '+237670333332',
          seatNumber: 14,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 11,
          tripId: 3,
          busId: 'BUS-003',
          passengerName: 'André Tchouapi',
          passengerPhone: '+237670333333',
          seatNumber: 27,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        {
          id: 12,
          tripId: 3,
          busId: 'BUS-003',
          passengerName: 'Carole Mballa',
          passengerPhone: '+237670333334',
          seatNumber: 35,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentStatus: 'pending'
        }
      ];

      setTrips(mockTrips);
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  // Obtenir les trajets pour une date donnée
  const getTripsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return trips.filter(trip => trip.date === dateString);
  };

  // Obtenir les réservations pour un bus donné
  const getBookingsForBus = (busId) => {
    return bookings.filter(booking => booking.busId === busId);
  };

  // Filtrer les réservations par recherche
  const filteredBookings = selectedBus 
    ? getBookingsForBus(selectedBus.bus.id).filter(booking =>
        !searchTerm || 
        booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passengerPhone.includes(searchTerm) ||
        booking.seatNumber.toString().includes(searchTerm)
      )
    : [];

  // Formater les dates pour l'affichage
  const formatDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Obtenir l'état du statut
  const getStatusIcon = (status) => {
    return status === 'confirmed' ? '✅' : '⏳';
  };

  const getPaymentIcon = (paymentStatus) => {
    return paymentStatus === 'paid' ? '💳' : '⏰';
  };

  // Fonction pour gérer le clic sur un bus avec scroll intelligent
  const handleBusSelection = (trip) => {
    setSelectedBus(trip);
    
    // Scroll intelligent vers la section des passagers
    setTimeout(() => {
      const passengersSection = document.querySelector('.bookings-section');
      if (passengersSection) {
        // Ajouter classe de surbrillance
        passengersSection.classList.add('highlighted');
        
        // Scroll smooth vers la section
        passengersSection.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        
        // Retirer la surbrillance après l'animation
        setTimeout(() => {
          passengersSection.classList.remove('highlighted');
        }, 2000);
      }
    }, 100);
  };

  return (
    <div className="bookings-calendar">
      {/* En-tête avec recherche */}
      <div className="calendar-header">
        <div className="header-content">
          <h1>🎫 Gestion des Réservations</h1>
          <p>Consultez les réservations par date et par bus</p>
        </div>
        
        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou siège..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Carrousel calendaire */}
      <div className="calendar-carousel">
        <div className="carousel-container">
          {calendarDates.map((date, index) => {
            const tripsCount = getTripsForDate(date).length;
            return (
              <div
                key={index}
                className={`calendar-date ${selectedDate.toDateString() === date.toDateString() ? 'active' : ''}`}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedBus(null); // Reset bus selection when changing date
                }}
              >
                <div className="date-label">{formatDate(date)}</div>
                <div className="date-number">{formatDateShort(date)}</div>
                <div className="trips-count">
                  {tripsCount} bus
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bookings-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement des réservations...</p>
          </div>
        ) : (
          <>
            {/* Section des bus */}
            <div className="buses-section">
              <div className="section-header">
                <h2>🚌 Bus du {formatDate(selectedDate)}</h2>
                <div className="buses-count">
                  {getTripsForDate(selectedDate).length} bus disponible{getTripsForDate(selectedDate).length !== 1 ? 's' : ''}
                </div>
              </div>

              {getTripsForDate(selectedDate).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🚌</div>
                  <h3>Aucun bus programmé</h3>
                  <p>Aucun trajet n'est programmé pour cette date.</p>
                </div>
              ) : (
                <div className="buses-grid">
                  {getTripsForDate(selectedDate).map(trip => {
                    const tripBookings = getBookingsForBus(trip.bus.id);
                    const isSelected = selectedBus?.id === trip.id;
                    
                    return (
                      <div
                        key={trip.id}
                        className={`bus-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleBusSelection(trip)}
                      >
                        <div className="bus-header">
                          <div className="bus-number">#{trip.bus.number}</div>
                          <div className="bus-status">
                            <span className={`status-indicator status-${trip.status}`}>
                              {trip.status === 'scheduled' ? '📅' : '🚌'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bus-info">
                          <div className="bus-name">{trip.bus.name}</div>
                          <div className="bus-route">{trip.route}</div>
                          <div className="bus-time">🕐 {trip.departureTime}</div>
                        </div>
                        
                        <div className="driver-info">
                          <div className="driver-name">👤 {trip.driver.name}</div>
                        </div>
                        
                        <div className="bookings-summary">
                          <div className="bookings-count">
                            <span className="reserved">{tripBookings.length}</span>
                            <span className="separator">/</span>
                            <span className="total">{trip.bus.totalSeats}</span>
                          </div>
                          <div className="occupancy-bar">
                            <div 
                              className="occupancy-fill"
                              style={{
                                width: `${(tripBookings.length / trip.bus.totalSeats) * 100}%`
                              }}
                            ></div>
                          </div>
                          <div className="occupancy-text">
                            {Math.round((tripBookings.length / trip.bus.totalSeats) * 100)}% occupé
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section des réservations */}
            {selectedBus && (
              <div className="bookings-section">
                <div className="section-header">
                  <h2>👥 Passagers - Bus #{selectedBus.bus.number}</h2>
                  <div className="bookings-info">
                    <span className="bus-name">{selectedBus.bus.name}</span>
                    <span className="separator">•</span>
                    <span className="route">{selectedBus.route}</span>
                    <span className="separator">•</span>
                    <span className="time">{selectedBus.departureTime}</span>
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="empty-bookings">
                    <div className="empty-icon">👥</div>
                    <h3>
                      {searchTerm 
                        ? 'Aucune réservation trouvée' 
                        : 'Aucune réservation'
                      }
                    </h3>
                    <p>
                      {searchTerm 
                        ? 'Aucune réservation ne correspond à votre recherche.'
                        : 'Ce bus n\'a pas encore de réservations.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="bookings-list">
                    <div className="list-header">
                      <div className="booking-count">
                        {filteredBookings.length} réservation{filteredBookings.length !== 1 ? 's' : ''}
                        {searchTerm && ` trouvée${filteredBookings.length !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                    
                    <div className="bookings-records">
                      {filteredBookings.map(booking => (
                        <div key={booking.id} className="booking-record">
                          <div className="record-left">
                            <div className="passenger-avatar">
                              {booking.passengerName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="passenger-info">
                              <div className="passenger-name">{booking.passengerName}</div>
                              <div className="passenger-phone">{booking.passengerPhone}</div>
                            </div>
                          </div>

                          <div className="record-center">
                            <div className="seat-info">
                              <div className="seat-number">
                                <span className="seat-icon">💺</span>
                                <span className="seat-num">#{booking.seatNumber}</span>
                              </div>
                            </div>
                          </div>

                          <div className="record-right">
                            <div className="booking-status">
                              <div className="status-row">
                                <span className="status-icon">
                                  {getStatusIcon(booking.status)}
                                </span>
                                <span className="status-text">
                                  {booking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                                </span>
                              </div>
                              <div className="payment-row">
                                <span className="payment-icon">
                                  {getPaymentIcon(booking.paymentStatus)}
                                </span>
                                <span className="payment-text">
                                  {booking.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="record-actions">
                            {hasPermission('bookings', 'view') && (
                              <button
                                className="action-btn view"
                                onClick={() => console.log('Voir réservation:', booking)}
                                title="Voir détails"
                              >
                                👁️
                              </button>
                            )}
                            {hasPermission('bookings', 'modify') && (
                              <button
                                className="action-btn edit"
                                onClick={() => console.log('Modifier réservation:', booking)}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                            )}
                            {hasPermission('bookings', 'cancel') && booking.status === 'confirmed' && (
                              <button
                                className="action-btn cancel"
                                onClick={() => console.log('Annuler réservation:', booking)}
                                title="Annuler"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingsCalendar;
