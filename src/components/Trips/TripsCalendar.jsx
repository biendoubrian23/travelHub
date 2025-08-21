import React, { useState, useEffect } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import TripFormModal from './TripFormModal';
import RefreshButton from '../UI/RefreshButton';
import { useRefresh } from '../../hooks/useRefresh';
import { supabase } from '../../lib/supabase';
import './TripsCalendar.css';

const TripsCalendar = () => {
  const { hasPermission } = useRolePermissions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Générer les dates du carrousel (3 derniers + aujourd'hui + 13 prochains)
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -3; i <= 13; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Récupérer les trajets depuis la base de données
  const fetchTripsFromDatabase = async () => {
    setLoading(true);
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      let agencyId = null;

      // Méthode 1: Vérifier si c'est le propriétaire de l'agence
      const { data: agencyOwner, error: ownerError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyOwner && !ownerError) {
        agencyId = agencyOwner.id;
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

      // Récupérer les trajets de l'agence avec les informations des conducteurs et des bus
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
        .eq('agency_id', agencyId)
        .eq('is_active', true)
        .order('departure_time', { ascending: true });

      if (tripsError) {
        console.error('Erreur lors de la récupération des trajets:', tripsError);
        setLoading(false);
        return;
      }

      console.log('Trajets récupérés:', tripsData); // Debug

      // Récupérer les réservations pour calculer les places occupées
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('trip_id, booking_status')
        .in('trip_id', tripsData.map(trip => trip.id));

      if (bookingsError) {
        console.warn('Erreur lors de la récupération des réservations:', bookingsError);
      }

      // Transformer les données pour correspondre au format attendu
      const formattedTrips = tripsData.map((trip, index) => {
        // Calculer les places occupées à partir des réservations
        const tripBookings = bookingsData?.filter(booking => 
          booking.trip_id === trip.id && 
          (booking.booking_status === 'confirmed' || booking.booking_status === 'pending')
        ) || [];
        
        const occupiedSeats = tripBookings.length;
        const availableSeats = trip.total_seats - occupiedSeats;
        const currentRevenue = occupiedSeats * trip.price_fcfa;
        const potentialRevenue = trip.total_seats * trip.price_fcfa;

        // Récupérer les informations du conducteur et du bus
        const driver = trip.agency_employee_invitations;
        const bus = trip.buses;
        const driverName = driver ? `${driver.first_name} ${driver.last_name}` : 'Non assigné';
        const busName = bus ? bus.name : `Bus ${trip.bus_type || 'Standard'}`;

        console.log(`Trajet ${trip.id}: Bus VIP = ${bus?.is_vip}, Bus:`, bus); // Debug VIP

        return {
          id: trip.id,
          tripNumber: `TRJ-${String(index + 1).padStart(3, '0')}`,
          date: trip.departure_time.split('T')[0],
          departureCity: trip.departure_city,
          arrivalCity: trip.arrival_city,
          departureTime: new Date(trip.departure_time).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          arrivalTime: new Date(trip.arrival_time).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          distance: '-- km', // À calculer ou récupérer d'une autre source
          duration: calculateDuration(trip.departure_time, trip.arrival_time),
          price: trip.price_fcfa,
          isVip: bus?.is_vip || false, // Information VIP du bus
          bus: {
            id: bus?.id || 'N/A',
            name: busName,
            plate: bus?.license_plate || 'N/A',
            totalSeats: trip.total_seats,
            occupiedSeats: occupiedSeats,
            availableSeats: availableSeats,
            isVip: bus?.is_vip || false // Information VIP du bus
          },
          driver: {
            id: driver?.id || null,
            name: driverName,
            phone: driver?.phone || '',
            experience: ''
          },
          status: determineStatus(trip.departure_time, trip.arrival_time),
          route: {
            waypoints: [
              { city: trip.departure_city, lat: 0, lng: 0 }, // Coordonnées à ajouter plus tard
              { city: trip.arrival_city, lat: 0, lng: 0 }
            ]
          },
          revenue: {
            current: currentRevenue,
            potential: potentialRevenue
          },
          notes: trip.description || '',
          createdBy: 'admin',
          lastModified: trip.updated_at
        };
      });

      console.log('Trajets formatés:', formattedTrips); // Debug
      setTrips(formattedTrips);
    } catch (error) {
      console.error('Erreur lors de la récupération des trajets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hook pour gérer le rechargement des données
  const { refresh, isRefreshing } = useRefresh(fetchTripsFromDatabase);

  // Fonction pour calculer la durée du trajet
  const calculateDuration = (departureTime, arrivalTime) => {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationMs = arrival - departure;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  };

  // Fonction pour déterminer le statut du trajet
  const determineStatus = (departureTime, arrivalTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    if (now < departure) {
      return 'scheduled'; // Programmé
    } else if (now >= departure && now <= arrival) {
      return 'in_progress'; // En cours
    } else {
      return 'completed'; // Terminé
    }
  };

  useEffect(() => {
    // Charger les données au premier rendu seulement
    fetchTripsFromDatabase();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtrer les trajets par date sélectionnée
  const getTripsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return trips.filter(trip => trip.date === dateString);
  };

  // Filtrer les trajets par recherche
  const filteredTrips = getTripsForDate(selectedDate).filter(trip =>
    !searchTerm || 
    trip.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.departureCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.arrivalCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.driver.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    const icons = {
      scheduled: '📅',
      in_progress: '🚌',
      completed: '✅',
      cancelled: '❌',
      delayed: '⏰'
    };
    return icons[status] || '📅';
  };

  // Actions sur les trajets
  const handleTripAction = (action, trip) => {
    switch (action) {
      case 'view':
        setSelectedTrip(trip);
        setActiveTab('details');
        // Scroll vers la section des détails avec effet
        setTimeout(() => {
          const detailsSection = document.querySelector('.trip-details-panel');
          if (detailsSection) {
            // Ajouter classe de surbrillance
            detailsSection.classList.add('highlighted');
            
            // Scroll smooth vers la section
            detailsSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
            
            // Retirer la surbrillance après l'animation
            setTimeout(() => {
              detailsSection.classList.remove('highlighted');
            }, 2000);
          }
        }, 100);
        break;
      case 'edit':
        console.log('Action edit déclenchée pour le trajet:', trip.id);
        setEditingTrip(trip);
        setShowEditModal(true);
        break;
      case 'delete':
        console.log('Action delete déclenchée pour le trajet:', trip.id);
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le trajet ${trip.departure_city} → ${trip.arrival_city} ?`)) {
          handleDeleteTrip(trip);
        }
        break;
      case 'cancel':
        if (hasPermission('trips', 'cancel')) {
          if (window.confirm(`Êtes-vous sûr de vouloir annuler le trajet ${trip.tripNumber} ?`)) {
            const updatedTrips = trips.map(t => 
              t.id === trip.id ? { ...t, status: 'cancelled' } : t
            );
            setTrips(updatedTrips);
            if (selectedTrip?.id === trip.id) {
              setSelectedTrip({ ...selectedTrip, status: 'cancelled' });
            }
          }
        }
        break;
      default:
        break;
    }
  };

  // Fonction pour supprimer un trajet de la base de données
  const handleDeleteTrip = async (trip) => {
    console.log('Suppression du trajet:', trip.id);
    try {
      // Supprimer le trajet de la base de données
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', trip.id);

      if (error) {
        console.error('Erreur lors de la suppression du trajet:', error);
        alert('Erreur lors de la suppression du trajet: ' + error.message);
        return;
      }

      console.log('Trajet supprimé avec succès');
      
      // Recharger les données pour rafraîchir l'affichage
      await fetchTripsFromDatabase();
      
      // Fermer les détails si le trajet supprimé était sélectionné
      if (selectedTrip?.id === trip.id) {
        setSelectedTrip(null);
      }

      alert('Trajet supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur inattendue lors de la suppression');
    }
  };

  // Gérer l'ajout d'un nouveau trajet
  const handleAddTrip = async () => {
    try {
      // Le trajet a déjà été sauvegardé dans la base de données via TripFormModal
      // On recharge simplement les données pour rafraîchir l'affichage
      await fetchTripsFromDatabase();
      setShowAddModal(false);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des trajets:', error);
    }
  };

  // Fonction pour vérifier si la date sélectionnée est passée
  const isSelectedDatePassed = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0); // Reset time to start of day
    return selected < today;
  };

  // Fonction pour gérer le clic sur le bouton "Ajouter un trajet" désactivé
  const handleDisabledAddTripClick = () => {
    alert("⚠️ Impossible d'ajouter un trajet : vous ne pouvez pas créer des trajets pour des dates passées. Veuillez sélectionner une date future.");
  };

  // Gérer la modification d'un trajet
  const handleEditTrip = async () => {
    try {
      // Le trajet a déjà été modifié dans la base de données
      // On recharge simplement les données pour rafraîchir l'affichage
      await fetchTripsFromDatabase();
      setShowEditModal(false);
      setEditingTrip(null);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des trajets:', error);
    }
  };

  return (
    <div className="trips-calendar">
      {/* Bouton de rechargement */}
      <RefreshButton 
        onRefresh={refresh}
        tooltip="Actualiser les trajets"
      />
      
      {/* En-tête avec recherche */}
      <div className="calendar-header">
        <div className="header-content">
          <h1>🗓️ Gestion des Trajets</h1>
          <p>Consultez et gérez les trajets par date</p>
        </div>
        
        <div className="header-actions">
          <div className="search-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Rechercher par trajet, ville, bus ou conducteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
        </div>
      </div>

      {/* Carrousel calendaire */}
      <div className="calendar-carousel">
        <div className="carousel-container">
          {calendarDates.map((date, index) => (
            <div
              key={index}
              className={`calendar-date ${selectedDate.toDateString() === date.toDateString() ? 'active' : ''}`}
              onClick={() => {
                setSelectedDate(date);
                setSelectedTrip(null); // Fermer les détails lors du changement de date
                setActiveTab('details'); // Réinitialiser l'onglet actif
              }}
            >
              <div className="date-label">{formatDate(date)}</div>
              <div className="date-number">{formatDateShort(date)}</div>
              <div className="trips-count">
                {getTripsForDate(date).length} trajet{getTripsForDate(date).length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des trajets */}
      <div className="trips-content">
        {loading ? (
          <div className="loading-state">
            <div className="fun-mini-loader">
              <div className="bus-icon">🚌</div>
              <div className="loading-dots-small">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <p>Recherche des trajets...</p>
          </div>
        ) : (
          <>
            <div className="trips-list">
              <div className="list-header">
                <div className="header-left">
                  <h2>📋 Trajets du {formatDate(selectedDate)}</h2>
                  <div className="trips-summary">
                    {filteredTrips.length} trajet{filteredTrips.length !== 1 ? 's' : ''} trouvé{filteredTrips.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {hasPermission('trips', 'create') && (
                  <div className="add-trip-section">
                    <button
                      className={`add-trip-btn-green ${isSelectedDatePassed() ? 'tvhub-disabled-btn' : ''}`}
                      onClick={() => {
                        if (isSelectedDatePassed()) {
                          handleDisabledAddTripClick();
                        } else {
                          setShowAddModal(true);
                        }
                      }}
                      title={isSelectedDatePassed() ? "Date passée - Impossible d'ajouter un trajet" : "Ajouter un nouveau trajet"}
                    >
                      <span className="btn-icon">➕</span>
                      <span className="btn-text">Ajouter un trajet</span>
                    </button>
                  </div>
                )}
              </div>

              {filteredTrips.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>Aucun trajet trouvé</h3>
                  <p>
                    {searchTerm 
                      ? 'Aucun trajet ne correspond à votre recherche.'
                      : 'Aucun trajet programmé pour cette date.'
                    }
                  </p>
                </div>
              ) : (
                <div className="trips-records">
                  {filteredTrips.map(trip => (
                    <div
                      key={trip.id}
                      className={`trip-record ${selectedTrip?.id === trip.id ? 'selected' : ''}`}
                      onClick={() => handleTripAction('view', trip)}
                    >
                      {/* Colonne 1: Statut + Numéro + Route */}
                      <div className="record-left">
                        <div className="trip-status">
                          <span className={`status-indicator status-${trip.status}`}>
                            {getStatusIcon(trip.status)}
                          </span>
                        </div>
                      </div>

                      {/* Colonne 2: Numéro de bus et trajet */}
                      <div className="trip-main-info">
                        <div className="trip-number">{trip.tripNumber}</div>
                        <div className="trip-route">
                          {trip.departureCity} → {trip.arrivalCity}
                        </div>
                      </div>

                      {/* Colonne 3: Heures de départ et d'arrivée */}
                      <div className="time-info">
                        <div className="departure-time">
                          🕐 {trip.departureTime}
                        </div>
                        <div className="arrival-time">
                          🏁 {trip.arrivalTime}
                        </div>
                      </div>

                      {/* Colonne 4: Badge VIP */}
                      <div className="vip-badge">
                        <span className={`vip-tag ${trip.isVip ? 'is-vip' : 'standard'}`}>
                          {trip.isVip ? 'VIP' : 'STD'}
                        </span>
                      </div>

                      {/* Colonne 5: Bus et Conducteur */}
                      <div className="bus-driver">
                        <div className="bus-info">
                          🚌 {trip.bus.name}
                        </div>
                        <div className="driver-info">
                          👤 {trip.driver.name}
                        </div>
                      </div>

                      {/* Colonne 6: Passagers (SIMPLE) */}
                      <div className="occupancy-simple">
                        {trip.bus.occupiedSeats}/{trip.bus.totalSeats}
                      </div>

                      {/* Colonne 7: Boutons (SÉPARÉS) */}
                      <div className="record-actions">
                        <button
                          className="action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTripAction('edit', trip);
                          }}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTripAction('delete', trip);
                          }}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Détails du trajet sélectionné */}
            {selectedTrip && (
              <div className="trip-details-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <h3>🚌 {selectedTrip.tripNumber}</h3>
                    <button
                      className="close-panel"
                      onClick={() => setSelectedTrip(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="panel-tabs">
                    {['details', 'passengers', 'revenue'].map(tab => (
                      <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === 'details' && '📋 Détails'}
                        {tab === 'passengers' && '👥 Passagers'}
                        {tab === 'revenue' && '💰 Revenus'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel-content">
                  {activeTab === 'details' && (
                    <div className="details-tab">
                      <div className="details-grid">
                        <div className="detail-card">
                          <h4>📊 Informations du Trajet</h4>
                          <div className="trip-stats-grid">
                            <div className="stat-item">
                              <div className="stat-icon">⏱️</div>
                              <div className="stat-info">
                                <span className="stat-label">Durée</span>
                                <span className="stat-value">{selectedTrip.duration}</span>
                              </div>
                            </div>

                            <div className="stat-card price">
                              <div className="stat-header">
                                <div className="stat-icon">�</div>
                                <div className="stat-label">Tarif Standard</div>
                              </div>
                              <div className="stat-content">
                                <div className="stat-value">{selectedTrip.price.toLocaleString()} FCFA</div>
                                <div className="stat-gauge">
                                  <div className="gauge-fill price-gauge"></div>
                                </div>
                                <div className="stat-subtitle">Prix Compétitif</div>
                              </div>
                            </div>
                          </div>


                        </div>

                        <div className="detail-card">
                          <h4>🚌 Bus & Conducteur</h4>
                          <div className="bus-details">
                            <div className="bus-main">
                              <div className="bus-name">{selectedTrip.bus.name}</div>
                              <div className="bus-plate">{selectedTrip.bus.plate}</div>
                            </div>
                            <div className="seats-overview">
                              <div className="seats-info">
                                <span className="occupied">{selectedTrip.bus.occupiedSeats} occupés</span>
                                <span className="available">{selectedTrip.bus.availableSeats} libres</span>
                              </div>
                              <div className="capacity-bar">
                                <div 
                                  className="capacity-fill"
                                  style={{
                                    width: `${(selectedTrip.bus.occupiedSeats / selectedTrip.bus.totalSeats) * 100}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="driver-details">
                            <div className="driver-avatar">
                              {selectedTrip.driver.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="driver-info">
                              <div className="driver-name">{selectedTrip.driver.name}</div>
                              <div className="driver-phone">{selectedTrip.driver.phone}</div>
                              <div className="driver-experience">{selectedTrip.driver.experience} d'expérience</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedTrip.notes && (
                        <div className="detail-card full-width">
                          <h4>📝 Notes</h4>
                          <p>{selectedTrip.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'passengers' && (
                    <div className="passengers-tab">
                      <div className="passengers-summary">
                        <h4>👥 Résumé des passagers</h4>
                        <div className="summary-stats">
                          <div className="stat">
                            <span className="stat-number">{selectedTrip.bus.occupiedSeats}</span>
                            <span className="stat-label">Passagers</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{selectedTrip.bus.availableSeats}</span>
                            <span className="stat-label">Places libres</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{Math.round((selectedTrip.bus.occupiedSeats / selectedTrip.bus.totalSeats) * 100)}%</span>
                            <span className="stat-label">Taux de remplissage</span>
                          </div>
                        </div>
                      </div>
                      <div className="passengers-note">
                        📝 Liste détaillée des passagers sera affichée ici
                      </div>
                    </div>
                  )}

                  {activeTab === 'revenue' && (
                    <div className="revenue-tab">
                      <div className="revenue-summary">
                        <h4>💰 Analyse des revenus</h4>
                        <div className="revenue-stats">
                          <div className="revenue-item current">
                            <span className="revenue-label">Revenus actuels</span>
                            <span className="revenue-value">{selectedTrip.revenue.current.toLocaleString()} FCFA</span>
                          </div>
                          <div className="revenue-item potential">
                            <span className="revenue-label">Revenus potentiels</span>
                            <span className="revenue-value">{selectedTrip.revenue.potential.toLocaleString()} FCFA</span>
                          </div>
                          <div className="revenue-item difference">
                            <span className="revenue-label">Manque à gagner</span>
                            <span className="revenue-value">
                              {(selectedTrip.revenue.potential - selectedTrip.revenue.current).toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                        <div className="revenue-bar">
                          <div 
                            className="revenue-fill"
                            style={{
                              width: `${(selectedTrip.revenue.current / selectedTrip.revenue.potential) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'modify' && (
                    <div className="modify-tab">
                      <div className="modify-content">
                        <h4>✏️ Modifier le trajet</h4>
                        
                        <div className="modify-form">
                          <div className="form-section">
                            <h5>🗓️ Informations générales</h5>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Date du trajet</label>
                                <input 
                                  type="date" 
                                  defaultValue={selectedTrip.date}
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label>Heure de départ</label>
                                <input 
                                  type="time" 
                                  defaultValue={selectedTrip.departureTime}
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label>Heure d'arrivée</label>
                                <input 
                                  type="time" 
                                  defaultValue={selectedTrip.arrivalTime}
                                  className="form-input"
                                />
                              </div>
                              <div className="form-group">
                                <label>Prix du ticket (FCFA)</label>
                                <input 
                                  type="number" 
                                  defaultValue={selectedTrip.price}
                                  className="form-input"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="form-section">
                            <h5>🚌 Bus et conducteur</h5>
                            <div className="form-grid">
                              <div className="form-group">
                                <label>Bus</label>
                                <select className="form-input" defaultValue={selectedTrip.bus.name}>
                                  <option value={selectedTrip.bus.name}>{selectedTrip.bus.name} ({selectedTrip.bus.plate})</option>
                                  <option value="Autre bus">Changer de bus...</option>
                                </select>
                              </div>
                              <div className="form-group">
                                <label>Conducteur</label>
                                <select className="form-input" defaultValue={selectedTrip.driver.name}>
                                  <option value={selectedTrip.driver.name}>{selectedTrip.driver.name}</option>
                                  <option value="Autre conducteur">Changer de conducteur...</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="form-section">
                            <h5>📝 Notes</h5>
                            <div className="form-group">
                              <label>Notes du trajet</label>
                              <textarea 
                                className="form-textarea"
                                rows={3}
                                defaultValue={selectedTrip.notes || ''}
                                placeholder="Ajouter des notes sur ce trajet..."
                              />
                            </div>
                          </div>

                          <div className="modify-actions">
                            <button
                              className="btn-save-modifications"
                              onClick={() => {
                                alert('Modifications sauvegardées !');
                                setActiveTab('details');
                              }}
                            >
                              ✅ Sauvegarder les modifications
                            </button>
                            
                            <button
                              className="btn-delete-trip"
                              onClick={() => setShowDeleteConfirm(true)}
                            >
                              🗑️ Supprimer le trajet
                            </button>
                          </div>
                        </div>

                        {/* Modal de confirmation de suppression */}
                        {showDeleteConfirm && (
                          <div className="delete-confirm-modal">
                            <div className="modal-content">
                              <h4>⚠️ Confirmer la suppression</h4>
                              <p>Êtes-vous sûr de vouloir supprimer le trajet <strong>{selectedTrip.tripNumber}</strong> ?</p>
                              <p className="warning-text">Cette action est irréversible.</p>
                              <div className="modal-actions">
                                <button
                                  className="btn-cancel"
                                  onClick={() => setShowDeleteConfirm(false)}
                                >
                                  Annuler
                                </button>
                                <button
                                  className="btn-confirm-delete"
                                  onClick={() => {
                                    // Logique de suppression
                                    setTrips(trips.filter(trip => trip.id !== selectedTrip.id));
                                    setSelectedTrip(null);
                                    setShowDeleteConfirm(false);
                                    setActiveTab('details');
                                  }}
                                >
                                  Supprimer définitivement
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <TripFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTrip}
        selectedDate={selectedDate}
      />

      <TripFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTrip(null);
        }}
        onSubmit={handleEditTrip}
        editingTrip={editingTrip}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default TripsCalendar;
