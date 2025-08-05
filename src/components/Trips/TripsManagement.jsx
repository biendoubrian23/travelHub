import React, { useState, useEffect } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import TripsList from './TripsList';
import TripDetail from './TripDetail';
import TripForm from './TripForm';
import TripMap from './TripMap';
import './TripsManagement.css';

const TripsManagement = () => {
  const { currentRole, hasPermission } = useRolePermissions();
  const [currentView, setCurrentView] = useState('list');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // États pour les données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);

  // Données mockées pour la démo
  useEffect(() => {
    setTimeout(() => {
      // Chauffeurs disponibles
      setDrivers([
        { id: 1, name: 'Jean Mboma', phone: '+237670123456', status: 'available' },
        { id: 2, name: 'Paul Nkomo', phone: '+237670123457', status: 'busy' },
        { id: 3, name: 'Marie Essono', phone: '+237670123458', status: 'available' }
      ]);

      // Bus disponibles
      setBuses([
        { id: 1, number: 'BUS-001', capacity: 45, status: 'available' },
        { id: 2, number: 'BUS-002', capacity: 52, status: 'in_service' },
        { id: 3, number: 'BUS-003', capacity: 48, status: 'available' }
      ]);

      // Trajets
      setTrips([
        {
          id: 1,
          routeNumber: 'TRJ-001',
          from: {
            city: 'Douala',
            station: 'Gare Routière Bonabéri',
            coordinates: { lat: 4.0511, lng: 9.7679 }
          },
          to: {
            city: 'Yaoundé',
            station: 'Gare Routière Mvan',
            coordinates: { lat: 3.8480, lng: 11.5021 }
          },
          departure: '2024-01-20T08:00:00',
          arrival: '2024-01-20T12:00:00',
          price: 3500,
          bus: { id: 2, number: 'BUS-002', capacity: 52 },
          driver: { id: 1, name: 'Jean Mboma', phone: '+237670123456' },
          status: 'active',
          bookings: 23,
          distance: 245,
          estimatedDuration: '4h00',
          stops: [
            {
              city: 'Edéa',
              arrivalTime: '09:30:00',
              departureTime: '09:45:00',
              coordinates: { lat: 3.7833, lng: 10.1333 }
            }
          ],
          features: ['AC', 'WiFi', 'Collation']
        },
        {
          id: 2,
          routeNumber: 'TRJ-002',
          from: {
            city: 'Yaoundé',
            station: 'Gare Routière Mvan',
            coordinates: { lat: 3.8480, lng: 11.5021 }
          },
          to: {
            city: 'Bafoussam',
            station: 'Gare Routière Centrale',
            coordinates: { lat: 5.4781, lng: 10.4167 }
          },
          departure: '2024-01-20T14:00:00',
          arrival: '2024-01-20T18:30:00',
          price: 2800,
          bus: { id: 1, number: 'BUS-001', capacity: 45 },
          driver: { id: 3, name: 'Marie Essono', phone: '+237670123458' },
          status: 'scheduled',
          bookings: 8,
          distance: 195,
          estimatedDuration: '4h30',
          stops: [
            {
              city: 'Mbalmayo',
              arrivalTime: '15:00:00',
              departureTime: '15:15:00',
              coordinates: { lat: 3.5167, lng: 11.4833 }
            },
            {
              city: 'Bafia',
              arrivalTime: '16:30:00',
              departureTime: '16:45:00',
              coordinates: { lat: 4.7500, lng: 11.2333 }
            }
          ],
          features: ['AC', 'Musique']
        },
        {
          id: 3,
          routeNumber: 'TRJ-003',
          from: {
            city: 'Douala',
            station: 'Gare Routière Bonabéri',
            coordinates: { lat: 4.0511, lng: 9.7679 }
          },
          to: {
            city: 'Buea',
            station: 'Motor Park',
            coordinates: { lat: 4.1559, lng: 9.2669 }
          },
          departure: '2024-01-21T06:00:00',
          arrival: '2024-01-21T07:30:00',
          price: 1500,
          bus: { id: 3, number: 'BUS-003', capacity: 48 },
          driver: null, // Pas encore assigné
          status: 'planned',
          bookings: 0,
          distance: 75,
          estimatedDuration: '1h30',
          stops: [],
          features: ['AC']
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Gestion des vues
  const handleViewChange = (view, trip = null) => {
    setCurrentView(view);
    setSelectedTrip(trip);
  };

  // Filtrage des trajets
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.from.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.bus?.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || trip.status === filterStatus;
    
    const matchesDate = !filterDate || 
      new Date(trip.departure).toDateString() === new Date(filterDate).toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Actions sur les trajets
  const handleTripAction = async (action, tripData) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'create': {
          const newTrip = {
            ...tripData,
            id: Date.now(),
            routeNumber: `TRJ-${String(trips.length + 1).padStart(3, '0')}`,
            bookings: 0,
            status: 'planned'
          };
          setTrips(prev => [...prev, newTrip]);
          setCurrentView('list');
          break;
        }
          
        case 'update': {
          setTrips(prev => prev.map(trip => 
            trip.id === tripData.id ? { ...trip, ...tripData } : trip
          ));
          setCurrentView('list');
          break;
        }
          
        case 'delete': {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) {
            setTrips(prev => prev.filter(trip => trip.id !== tripData.id));
            setCurrentView('list');
          }
          break;
        }

        case 'assign_driver': {
          setTrips(prev => prev.map(trip => 
            trip.id === tripData.tripId ? { ...trip, driver: tripData.driver } : trip
          ));
          break;
        }

        case 'assign_bus': {
          setTrips(prev => prev.map(trip => 
            trip.id === tripData.tripId ? { ...trip, bus: tripData.bus } : trip
          ));
          break;
        }
          
        default:
          console.log('Action non reconnue:', action);
      }
    } catch (error) {
      setError('Erreur lors de l\'opération: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="trips-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des trajets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trips-management">
      {/* Header avec actions globales */}
      <div className="trips-management-header">
        <div className="header-title">
          <h1>🗺️ Gestion des Trajets</h1>
          <div className="trips-stats">
            <span className="stat">
              <strong>{trips.length}</strong> Trajets total
            </span>
            <span className="stat active">
              <strong>{trips.filter(t => t.status === 'active').length}</strong> Actifs
            </span>
            <span className="stat scheduled">
              <strong>{trips.filter(t => t.status === 'scheduled').length}</strong> Programmés
            </span>
            <span className="stat planned">
              <strong>{trips.filter(t => t.status === 'planned').length}</strong> Planifiés
            </span>
          </div>
        </div>

        <div className="header-actions">
          {hasPermission('trips', 'create') && (
            <button 
              className="btn-primary"
              onClick={() => handleViewChange('create')}
            >
              ➕ Nouveau Trajet
            </button>
          )}
          
          <div className="view-toggle">
            <button 
              className={currentView === 'list' ? 'active' : ''}
              onClick={() => handleViewChange('list')}
            >
              📋 Liste
            </button>
            <button 
              className={currentView === 'map' ? 'active' : ''}
              onClick={() => handleViewChange('map')}
            >
              🗺️ Carte
            </button>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="trips-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Rechercher un trajet (numéro, ville, chauffeur, bus...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="planned">Planifié</option>
            <option value="scheduled">Programmé</option>
            <option value="active">Actif</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-date"
            title="Filtrer par date"
          />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="trips-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {currentView === 'list' && (
          <TripsList 
            trips={filteredTrips}
            onViewTrip={(trip) => handleViewChange('detail', trip)}
            onEditTrip={(trip) => handleViewChange('edit', trip)}
            onDeleteTrip={(trip) => handleTripAction('delete', trip)}
            onAssignDriver={(tripId, driver) => handleTripAction('assign_driver', { tripId, driver })}
            onAssignBus={(tripId, bus) => handleTripAction('assign_bus', { tripId, bus })}
            drivers={drivers}
            buses={buses}
            currentRole={currentRole}
          />
        )}

        {currentView === 'map' && (
          <TripMap 
            trips={filteredTrips}
            onViewTrip={(trip) => handleViewChange('detail', trip)}
            currentRole={currentRole}
          />
        )}

        {currentView === 'detail' && selectedTrip && (
          <TripDetail 
            trip={selectedTrip}
            onBack={() => handleViewChange('list')}
            onEdit={() => handleViewChange('edit', selectedTrip)}
            onAssignDriver={(driver) => handleTripAction('assign_driver', { tripId: selectedTrip.id, driver })}
            onAssignBus={(bus) => handleTripAction('assign_bus', { tripId: selectedTrip.id, bus })}
            drivers={drivers}
            buses={buses}
            currentRole={currentRole}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <TripForm 
            trip={currentView === 'edit' ? selectedTrip : null}
            onSave={(tripData) => handleTripAction(currentView === 'edit' ? 'update' : 'create', tripData)}
            onCancel={() => handleViewChange('list')}
            drivers={drivers}
            buses={buses}
            currentRole={currentRole}
          />
        )}
      </div>
    </div>
  );
};

export default TripsManagement;
