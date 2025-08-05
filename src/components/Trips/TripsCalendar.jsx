import React, { useState, useEffect } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import TripFormModal from './TripFormModal';
import './TripsCalendar.css';

const TripsCalendar = () => {
  const { currentRole, hasPermission } = useRolePermissions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [modifyFormData, setModifyFormData] = useState({});
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

  // Données mockées des trajets
  useEffect(() => {
    setTimeout(() => {
      const mockTrips = [
        {
          id: 1,
          tripNumber: 'TRJ-001',
          date: new Date().toISOString().split('T')[0],
          departureCity: 'Douala',
          arrivalCity: 'Yaoundé',
          departureTime: '08:00',
          arrivalTime: '11:30',
          distance: '245 km',
          duration: '3h 30min',
          price: 3500,
          bus: {
            id: 'BUS-001',
            name: 'Express Voyageur',
            plate: 'LT-234-CM',
            totalSeats: 45,
            occupiedSeats: 32,
            availableSeats: 13
          },
          driver: {
            id: 1,
            name: 'Jean-Paul Mbarga',
            phone: '+237670123456',
            experience: '8 ans'
          },
          status: 'scheduled', // scheduled, in_progress, completed, cancelled, delayed
          route: {
            waypoints: [
              { city: 'Douala', lat: 4.0511, lng: 9.7679 },
              { city: 'Edéa', lat: 3.7961, lng: 10.1343 },
              { city: 'Yaoundé', lat: 3.8480, lng: 11.5021 }
            ]
          },
          revenue: {
            current: 112000,
            potential: 157500
          },
          notes: 'Trajet express sans arrêt intermédiaire',
          createdBy: 'admin',
          lastModified: new Date().toISOString()
        },
        {
          id: 2,
          tripNumber: 'TRJ-002',
          date: new Date().toISOString().split('T')[0],
          departureCity: 'Yaoundé',
          arrivalCity: 'Bafoussam',
          departureTime: '14:00',
          arrivalTime: '17:15',
          distance: '185 km',
          duration: '3h 15min',
          price: 2800,
          bus: {
            id: 'BUS-002',
            name: 'Confort Plus',
            plate: 'LT-567-CM',
            totalSeats: 52,
            occupiedSeats: 28,
            availableSeats: 24
          },
          driver: {
            id: 2,
            name: 'Marie Essono',
            phone: '+237670123457',
            experience: '5 ans'
          },
          status: 'in_progress',
          route: {
            waypoints: [
              { city: 'Yaoundé', lat: 3.8480, lng: 11.5021 },
              { city: 'Mfou', lat: 3.7290, lng: 11.6337 },
              { city: 'Bafoussam', lat: 5.4781, lng: 10.4186 }
            ]
          },
          revenue: {
            current: 78400,
            potential: 145600
          },
          notes: 'Trajet avec arrêt à Mfou',
          createdBy: 'manager',
          lastModified: new Date().toISOString()
        },
        {
          id: 3,
          tripNumber: 'TRJ-003',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hier
          departureCity: 'Douala',
          arrivalCity: 'Bamenda',
          departureTime: '06:30',
          arrivalTime: '11:45',
          distance: '315 km',
          duration: '5h 15min',
          price: 4200,
          bus: {
            id: 'BUS-003',
            name: 'Grand Voyageur',
            plate: 'LT-890-CM',
            totalSeats: 55,
            occupiedSeats: 55,
            availableSeats: 0
          },
          driver: {
            id: 3,
            name: 'Paul Nkomo',
            phone: '+237670123458',
            experience: '12 ans'
          },
          status: 'completed',
          route: {
            waypoints: [
              { city: 'Douala', lat: 4.0511, lng: 9.7679 },
              { city: 'Bafoussam', lat: 5.4781, lng: 10.4186 },
              { city: 'Bamenda', lat: 5.9631, lng: 10.1591 }
            ]
          },
          revenue: {
            current: 231000,
            potential: 231000
          },
          notes: 'Trajet complet - Excellent taux de remplissage',
          createdBy: 'admin',
          lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          tripNumber: 'TRJ-004',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Demain
          departureCity: 'Yaoundé',
          arrivalCity: 'Douala',
          departureTime: '16:00',
          arrivalTime: '19:30',
          distance: '245 km',
          duration: '3h 30min',
          price: 3500,
          bus: {
            id: 'BUS-004',
            name: 'Rapide Service',
            plate: 'LT-456-CM',
            totalSeats: 48,
            occupiedSeats: 12,
            availableSeats: 36
          },
          driver: {
            id: 4,
            name: 'Alice Mbouda',
            phone: '+237670123459',
            experience: '6 ans'
          },
          status: 'scheduled',
          route: {
            waypoints: [
              { city: 'Yaoundé', lat: 3.8480, lng: 11.5021 },
              { city: 'Edéa', lat: 3.7961, lng: 10.1343 },
              { city: 'Douala', lat: 4.0511, lng: 9.7679 }
            ]
          },
          revenue: {
            current: 42000,
            potential: 168000
          },
          notes: 'Retour vers Douala - Places disponibles',
          createdBy: 'manager',
          lastModified: new Date().toISOString()
        },
        {
          id: 5,
          tripNumber: 'TRJ-005',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Après-demain
          departureCity: 'Douala',
          arrivalCity: 'Garoua',
          departureTime: '20:00',
          arrivalTime: '06:30',
          distance: '695 km',
          duration: '10h 30min',
          price: 8500,
          bus: {
            id: 'BUS-005',
            name: 'Nuit Express',
            plate: 'LT-789-CM',
            totalSeats: 42,
            occupiedSeats: 18,
            availableSeats: 24
          },
          driver: {
            id: 5,
            name: 'Michel Fouda',
            phone: '+237670123460',
            experience: '15 ans'
          },
          status: 'scheduled',
          route: {
            waypoints: [
              { city: 'Douala', lat: 4.0511, lng: 9.7679 },
              { city: 'Yaoundé', lat: 3.8480, lng: 11.5021 },
              { city: 'Ngaoundéré', lat: 7.3176, lng: 13.5886 },
              { city: 'Garoua', lat: 9.3265, lng: 13.3958 }
            ]
          },
          revenue: {
            current: 153000,
            potential: 357000
          },
          notes: 'Trajet de nuit - Couchettes disponibles',
          createdBy: 'admin',
          lastModified: new Date().toISOString()
        }
      ];

      setTrips(mockTrips);
      setLoading(false);
    }, 1000);
  }, []);

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

  // Obtenir le texte du statut
  const getStatusText = (status) => {
    const texts = {
      scheduled: 'Programmé',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      delayed: 'Retardé'
    };
    return texts[status] || 'Inconnu';
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
        if (hasPermission('trips', 'modify')) {
          setEditingTrip(trip);
          setShowEditModal(true);
        }
        break;
      case 'delete':
        if (hasPermission('trips', 'delete') && trip.status === 'scheduled') {
          if (window.confirm(`Êtes-vous sûr de vouloir supprimer le trajet ${trip.tripNumber} ?`)) {
            setTrips(trips.filter(t => t.id !== trip.id));
            if (selectedTrip?.id === trip.id) {
              setSelectedTrip(null);
            }
          }
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

  // Gérer l'ajout d'un nouveau trajet
  const handleAddTrip = (tripData) => {
    const newTrip = {
      id: trips.length + 1,
      tripNumber: `TRJ-${String(trips.length + 1).padStart(3, '0')}`,
      ...tripData,
      status: 'scheduled',
      createdBy: currentRole,
      lastModified: new Date().toISOString()
    };
    
    setTrips([...trips, newTrip]);
    setShowAddModal(false);
  };

  // Gérer la modification d'un trajet
  const handleEditTrip = (tripData) => {
    const updatedTrips = trips.map(trip => 
      trip.id === editingTrip.id 
        ? { ...trip, ...tripData, lastModified: new Date().toISOString() }
        : trip
    );
    
    setTrips(updatedTrips);
    
    if (selectedTrip?.id === editingTrip.id) {
      setSelectedTrip({ ...selectedTrip, ...tripData });
    }
    
    setShowEditModal(false);
    setEditingTrip(null);
  };

  return (
    <div className="trips-calendar">
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
          
          {hasPermission('trips', 'create') && (
            <button
              className="add-trip-btn"
              onClick={() => setShowAddModal(true)}
              title="Ajouter un nouveau trajet"
            >
              <span className="btn-icon">➕</span>
              <span className="btn-text">Ajouter un trajet</span>
            </button>
          )}
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
            <div className="loading-spinner"></div>
            <p>Chargement des trajets...</p>
          </div>
        ) : (
          <>
            <div className="trips-list">
              <div className="list-header">
                <h2>📋 Trajets du {formatDate(selectedDate)}</h2>
                <div className="trips-summary">
                  {filteredTrips.length} trajet{filteredTrips.length !== 1 ? 's' : ''} trouvé{filteredTrips.length !== 1 ? 's' : ''}
                </div>
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

                      {/* Colonne 4: Bus et Conducteur */}
                      <div className="bus-driver">
                        <div className="bus-info">
                          🚌 {trip.bus.name}
                        </div>
                        <div className="driver-info">
                          👤 {trip.driver.name}
                        </div>
                      </div>

                      {/* Colonne 5: Places restantes - tout à droite */}
                      <div className="record-right">
                        <div className="occupancy-info">
                          <div className="seats-stats">
                            <span className="occupied">{trip.bus.occupiedSeats}</span>
                            <span className="separator">/</span>
                            <span className="total">{trip.bus.totalSeats}</span>
                          </div>
                          <div className="occupancy-bar">
                            <div 
                              className="occupancy-fill"
                              style={{
                                width: `${(trip.bus.occupiedSeats / trip.bus.totalSeats) * 100}%`
                              }}
                            ></div>
                          </div>
                          <div className="percentage">
                            {Math.round((trip.bus.occupiedSeats / trip.bus.totalSeats) * 100)}%
                          </div>
                        </div>

                        <div className="record-actions">
                          {hasPermission('trips', 'modify') && currentRole !== 'driver' && (
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
                          )}
                        </div>
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
                    <button
                      key="modify"
                      className={`tab-btn modify-tab ${activeTab === 'modify' ? 'active' : ''}`}
                      onClick={() => setActiveTab('modify')}
                    >
                      ✏️ Modifier
                    </button>
                    {['details', 'map', 'passengers', 'revenue'].map(tab => (
                      <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === 'details' && '📋 Détails'}
                        {tab === 'map' && '🗺️ Carte'}
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
                            <div className="stat-card distance">
                              <div className="stat-header">
                                <div className="stat-icon">�️</div>
                                <div className="stat-label">Distance Totale</div>
                              </div>
                              <div className="stat-content">
                                <div className="stat-value">{selectedTrip.distance}</div>
                                <div className="stat-gauge">
                                  <div className="gauge-fill distance-gauge"></div>
                                </div>
                                <div className="stat-subtitle">Trajet Direct</div>
                              </div>
                            </div>

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

                  {activeTab === 'map' && (
                    <div className="map-tab">
                      <div className="map-placeholder">
                        <div className="map-content">
                          <h4>🗺️ Carte du trajet</h4>
                          <div className="route-info">
                            <p><strong>Itinéraire:</strong> {selectedTrip.departureCity} → {selectedTrip.arrivalCity}</p>
                            <p><strong>Distance:</strong> {selectedTrip.distance}</p>
                            <p><strong>Points de passage:</strong></p>
                            <ul>
                              {selectedTrip.route.waypoints.map((point, index) => (
                                <li key={index}>{point.city}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="map-note">
                            📍 Carte Google Maps sera intégrée ici
                          </div>
                        </div>
                      </div>
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
