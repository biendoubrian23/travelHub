import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AddPassengerModal from './AddPassengerModal';
import './BookingsCalendar.css';

const BookingsCalendar = () => {
  const { hasPermission } = useRolePermissions();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedBus, setSelectedBus] = useState(null);
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [globalSearchResult, setGlobalSearchResult] = useState(null);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [showAddPassengerModal, setShowAddPassengerModal] = useState(false);
  
  // Référence pour le scroll automatique
  const busContainerRef = useRef(null);
  const searchResultRef = useRef(null);

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

  // Fonction pour récupérer les données réelles de la base
  const fetchTripsAndBookingsFromDatabase = useCallback(async () => {
    console.log('🔄 Récupération des trajets et réservations depuis la base de données...');
    setLoading(true);

    try {
      // 1. Identifier l'agence de l'utilisateur
      let agencyId = null;

      // Méthode 1: Chercher si l'utilisateur possède une agence
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyData && !agencyError) {
        agencyId = agencyData.id;
        console.log('🏢 Utilisateur propriétaire de l\'agence:', agencyId);
      } else {
        // Méthode 2: Chercher l'agence via les invitations d'employés
        const { data: employeeData, error: employeeError } = await supabase
          .from('agency_employee_invitations')
          .select('agency_id')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .single();

        if (employeeData && !employeeError) {
          agencyId = employeeData.agency_id;
          console.log('👥 Utilisateur employé de l\'agence:', agencyId);
        }
      }

      if (!agencyId) {
        console.error('Aucune agence trouvée pour cet utilisateur');
        setLoading(false);
        return;
      }

      console.log('🎯 ID de l\'agence utilisée pour filtrer:', agencyId);

      // 2. Récupérer les trajets de l'agence avec les informations des conducteurs et des bus
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          agency_employee_invitations!driver_id (
            id,
            first_name,
            last_name,
            phone
          ),
          buses!bus_id (
            id,
            name,
            license_plate,
            total_seats,
            is_vip
          )
        `)
        .eq('agency_id', agencyId);

      if (tripsError) {
        console.error('❌ Erreur lors de la récupération des trajets:', tripsError);
        setLoading(false);
        return;
      }

      // 3. Récupérer toutes les réservations pour ces trajets
      const tripIds = tripsData?.map(trip => trip.id) || [];
      let bookingsData = [];

      if (tripIds.length > 0) {
        const { data: fetchedBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .in('trip_id', tripIds);

        if (bookingsError) {
          console.error('❌ Erreur lors de la récupération des réservations:', bookingsError);
        } else {
          bookingsData = fetchedBookings || [];
        }
      }

      // 4. Traiter et formater les données pour l'affichage
      const formattedTrips = tripsData?.map(trip => ({
        id: trip.id,
        date: trip.departure_time ? trip.departure_time.split('T')[0] : new Date().toISOString().split('T')[0],
        bus: {
          id: trip.buses?.id || trip.bus_id,
          number: trip.buses?.license_plate?.replace(/[^0-9]/g, '') || '000',
          name: trip.buses?.name || 'Bus inconnu',
          plate: trip.buses?.license_plate || 'N/A',
          totalSeats: trip.buses?.total_seats || 50,
          isVip: trip.buses?.is_vip || false
        },
        driver: {
          name: trip.agency_employee_invitations 
            ? `${trip.agency_employee_invitations.first_name} ${trip.agency_employee_invitations.last_name}`
            : 'Conducteur non assigné',
          phone: trip.agency_employee_invitations?.phone || 'N/A'
        },
        route: `${trip.departure_city} → ${trip.arrival_city}`,
        departureTime: trip.departure_time ? new Date(trip.departure_time).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : '00:00',
        price: trip.price_fcfa || 0,
        status: trip.status || 'scheduled'
      })) || [];

      // 5. Formater les réservations
      const formattedBookings = bookingsData?.map(booking => ({
        id: booking.id,
        tripId: booking.trip_id,
        busId: tripsData?.find(trip => trip.id === booking.trip_id)?.bus_id,
        passengerName: booking.passenger_name,
        passengerPhone: booking.passenger_phone,
        seatNumber: parseInt(booking.seat_number) || 0,
        bookingDate: booking.created_at,
        status: booking.booking_status || 'pending',
        paymentStatus: booking.payment_status || 'pending',
        bookingReference: booking.booking_reference
      })) || [];

      console.log('✅ Trajets formatés:', formattedTrips.length);
      console.log('✅ Réservations formatées:', formattedBookings.length);
      
      // Debug des dates avec la date actuelle
      const today = new Date().toISOString().split('T')[0];
      if (formattedTrips.length > 0) {
        console.log('🔍 Premier trajet exemple:', formattedTrips[0]);
        console.log('📅 Date du premier trajet:', formattedTrips[0]?.date);
        console.log('📅 Date aujourd\'hui:', today);
        
        // Vérifier combien de trajets correspondent à aujourd'hui
        const tripsToday = formattedTrips.filter(trip => trip.date === today);
        console.log('� Trajets pour aujourd\'hui:', tripsToday.length);
      }

      setTrips(formattedTrips);
      setBookings(formattedBookings);

    } catch (error) {
      console.error('💥 Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger les données au démarrage et quand l'utilisateur change
  useEffect(() => {
    if (user?.id) {
      fetchTripsAndBookingsFromDatabase();
    }
  }, [user?.id, fetchTripsAndBookingsFromDatabase]);

  // Obtenir les trajets pour une date donnée
  const getTripsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return trips.filter(trip => trip.date === dateString);
  };

  // Obtenir les réservations pour un bus donné
  const getBookingsForBus = (busId) => {
    return bookings.filter(booking => booking.busId === busId);
  };

  // 🔍 RECHERCHE GLOBALE INTELLIGENTE
  // Rechercher dans tous les bus de la journée sélectionnée
  const performGlobalSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setGlobalSearchResult(null);
      setIsGlobalSearch(false);
      return;
    }

    const tripsForDate = getTripsForDate(selectedDate);
    const results = [];

    tripsForDate.forEach(trip => {
      const busBookings = getBookingsForBus(trip.bus.id);
      const matchingBookings = busBookings.filter(booking =>
        booking.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.passengerPhone.includes(searchQuery) ||
        booking.seatNumber.toString().includes(searchQuery)
      );

      if (matchingBookings.length > 0) {
        results.push({
          trip,
          bookings: matchingBookings
        });
      }
    });

    if (results.length > 0) {
      setGlobalSearchResult(results);
      setIsGlobalSearch(true);
      
      // Auto-sélectionner le premier bus trouvé
      const firstResult = results[0];
      setSelectedBus(firstResult.trip);
      
      // Scroll automatique vers le bus sélectionné
      setTimeout(() => {
        scrollToBus(firstResult.trip.bus.id);
      }, 100);
    } else {
      setGlobalSearchResult([]);
      setIsGlobalSearch(true);
    }
  };

  // Gérer l'ajout d'un nouveau passager
  const handlePassengerAdded = (newBooking) => {
    console.log('✅ Nouveau passager ajouté:', newBooking);
    // Rafraîchir les données
    fetchTripsAndBookingsFromDatabase();
  };

  // Fonction pour vérifier si la date du trajet sélectionné est passée
  const isTripDatePassed = () => {
    if (!selectedBus || !selectedBus.date) return false;
    
    const tripDate = new Date(selectedBus.date);
    const currentDate = new Date();
    
    // Reset time to start of day for accurate comparison
    currentDate.setHours(0, 0, 0, 0);
    tripDate.setHours(0, 0, 0, 0);
    
    return tripDate < currentDate;
  };

  // Fonction pour gérer le clic sur le bouton "Ajouter un Passager" désactivé
  const handleDisabledAddPassengerClick = () => {
    alert("⚠️ Impossible d'ajouter un passager : ce trajet a déjà eu lieu. Vous ne pouvez pas ajouter de nouveaux passagers pour des trajets dont la date est passée.");
  };

  // Scroll automatique vers un bus spécifique
  const scrollToBus = (busId) => {
    const busElement = document.querySelector(`[data-bus-id="${busId}"]`);
    if (busElement && busContainerRef.current) {
      busElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Effet visuel de highlight
      busElement.classList.add('highlight-search');
      setTimeout(() => {
        busElement.classList.remove('highlight-search');
      }, 2000);
    }
  };

  // Gérer la touche Entrée dans la recherche
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performGlobalSearch(searchTerm);
    }
  };

  // Réinitialiser la recherche globale quand on change de date
  useEffect(() => {
    setGlobalSearchResult(null);
    setIsGlobalSearch(false);
    setSearchTerm('');
  }, [selectedDate]);

  // Filtrer les réservations par recherche (mode local)
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
              placeholder={isGlobalSearch 
                ? "Recherche globale dans tous les bus..." 
                : "Rechercher par nom, téléphone ou siège (Entrée = recherche globale)..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className={`search-input ${isGlobalSearch ? 'global-search-active' : ''}`}
            />
            {searchTerm && (
              <div className="search-actions">
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setGlobalSearchResult(null);
                    setIsGlobalSearch(false);
                  }}
                  className="clear-search-btn"
                  title="Effacer la recherche"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          
          {/* Affichage des résultats de recherche globale */}
          {isGlobalSearch && globalSearchResult && globalSearchResult.length === 0 && (
            <div className="global-search-results">
              <div className="search-summary no-results-horizontal">
                ❌ Aucun résultat trouvé pour "{searchTerm}"
              </div>
            </div>
          )}
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
            <div className="fun-mini-loader">
              <div className="ticket-icon">🎫</div>
              <div className="loading-dots-small">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <p>Recherche des réservations...</p>
          </div>
        ) : (
          <>
            {/* Section des bus */}
            <div className="buses-section" ref={busContainerRef}>
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
                        data-bus-id={trip.bus.id}
                        className={`bus-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleBusSelection(trip)}
                      >
                        <div className="bus-header">
                          <div className="bus-number">#{trip.bus.number}</div>
                          <div className="bus-status">
                            <span className={`status-indicator status-${trip.status}`}>
                              {trip.status === 'scheduled' ? '📅' : '🚌'}
                            </span>
                            {trip.bus.isVip && (
                              <span className="vip-badge" title="Bus VIP">
                                ⭐ VIP
                              </span>
                            )}
                            {!trip.bus.isVip && (
                              <span className="std-badge" title="Bus Standard">
                                STD
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bus-info">
                          <div className="bus-name">{trip.bus.name}</div>
                          <div className="bus-route">{trip.route}</div>
                          <div className="bus-time">🕐 {trip.departureTime}</div>
                        </div>
                        
                        <div className="driver-info">
                          <div className="driver-name">
                            👤 {trip.driver.name}
                            <span className="driver-label">Conducteur</span>
                          </div>
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
              <div className="bookings-section" ref={searchResultRef}>
                <div className="section-header">
                  <h2>👥 Passagers - Bus #{selectedBus.bus.number}</h2>
                </div>
                
                <div className="bookings-add-passenger-container">
                  <button 
                    className={`bookings-add-passenger-btn ${isTripDatePassed() ? 'tvhub-disabled-btn' : ''}`}
                    onClick={() => {
                      if (isTripDatePassed()) {
                        handleDisabledAddPassengerClick();
                      } else {
                        setShowAddPassengerModal(true);
                      }
                    }}
                    title={isTripDatePassed() ? "Date passée - Impossible d'ajouter un passager" : "Ajouter un nouveau passager"}
                  >
                    ➕ Ajouter un Passager
                  </button>
                </div>
                
                <div className="bookings-info">
                  <span className="bus-name">{selectedBus.bus.name}</span>
                  <span className="separator">•</span>
                  <span className="route">{selectedBus.route}</span>
                  <span className="separator">•</span>
                  <span className="time">{selectedBus.departureTime}</span>
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

      {/* Modal d'ajout de passager */}
      <AddPassengerModal
        isOpen={showAddPassengerModal}
        onClose={() => setShowAddPassengerModal(false)}
        selectedTrip={selectedBus}
        onPassengerAdded={handlePassengerAdded}
      />
    </div>
  );
};

export default BookingsCalendar;
