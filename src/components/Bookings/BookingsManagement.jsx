import React, { useState, useEffect } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import BookingsList from './BookingsList';
import BookingDetail from './BookingDetail';
import BookingForm from './BookingForm';
import RefreshButton from '../UI/RefreshButton';
import { useRefresh } from '../../hooks/useRefresh';
import './BookingsManagement.css';

const BookingsManagement = () => {
  const { currentRole, hasPermission } = useRolePermissions();
  const [currentView, setCurrentView] = useState('list');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrip, setFilterTrip] = useState('all');

  // États pour les données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trips, setTrips] = useState([]);

  // Données mockées pour la démo
  useEffect(() => {
    setTimeout(() => {
      // Trajets disponibles
      setTrips([
        {
          id: 1,
          routeNumber: 'TRJ-001',
          from: 'Douala',
          to: 'Yaoundé',
          departure: '2024-01-20T08:00:00',
          price: 3500,
          bus: { number: 'BUS-002', capacity: 52 }
        },
        {
          id: 2,
          routeNumber: 'TRJ-002',
          from: 'Yaoundé',
          to: 'Bafoussam',
          departure: '2024-01-20T14:00:00',
          price: 2800,
          bus: { number: 'BUS-001', capacity: 45 }
        }
      ]);

      // Réservations
      setBookings([
        {
          id: 1,
          bookingNumber: 'RES-001',
          trip: {
            id: 1,
            routeNumber: 'TRJ-001',
            from: 'Douala',
            to: 'Yaoundé',
            departure: '2024-01-20T08:00:00',
            price: 3500,
            bus: { number: 'BUS-002' }
          },
          passenger: {
            name: 'Jean Dupont',
            phone: '+237670123456',
            email: 'jean.dupont@email.com',
            idCard: 'CM123456789'
          },
          seats: [12, 13], // Sièges réservés
          totalPrice: 7000,
          status: 'confirmed',
          paymentStatus: 'paid',
          bookingDate: '2024-01-15T10:30:00',
          paymentMethod: 'mobile_money',
          notes: 'Voyage d\'affaires'
        },
        {
          id: 2,
          bookingNumber: 'RES-002',
          trip: {
            id: 1,
            routeNumber: 'TRJ-001',
            from: 'Douala',
            to: 'Yaoundé',
            departure: '2024-01-20T08:00:00',
            price: 3500,
            bus: { number: 'BUS-002' }
          },
          passenger: {
            name: 'Marie Mbolo',
            phone: '+237670123457',
            email: 'marie.mbolo@email.com',
            idCard: 'CM987654321'
          },
          seats: [5],
          totalPrice: 3500,
          status: 'pending',
          paymentStatus: 'pending',
          bookingDate: '2024-01-16T14:20:00',
          paymentMethod: 'cash',
          notes: 'Paiement à la gare'
        },
        {
          id: 3,
          bookingNumber: 'RES-003',
          trip: {
            id: 2,
            routeNumber: 'TRJ-002',
            from: 'Yaoundé',
            to: 'Bafoussam',
            departure: '2024-01-20T14:00:00',
            price: 2800,
            bus: { number: 'BUS-001' }
          },
          passenger: {
            name: 'Paul Nkomo',
            phone: '+237670123458',
            email: 'paul.nkomo@email.com',
            idCard: 'CM456789123'
          },
          seats: [8, 9, 10], // Famille
          totalPrice: 8400,
          status: 'confirmed',
          paymentStatus: 'paid',
          bookingDate: '2024-01-17T09:15:00',
          paymentMethod: 'bank_transfer',
          notes: 'Voyage en famille'
        },
        {
          id: 4,
          bookingNumber: 'RES-004',
          trip: {
            id: 1,
            routeNumber: 'TRJ-001',
            from: 'Douala',
            to: 'Yaoundé',
            departure: '2024-01-20T08:00:00',
            price: 3500,
            bus: { number: 'BUS-002' }
          },
          passenger: {
            name: 'Alice Essono',
            phone: '+237670123459',
            email: 'alice.essono@email.com',
            idCard: 'CM789123456'
          },
          seats: [23],
          totalPrice: 3500,
          status: 'cancelled',
          paymentStatus: 'refunded',
          bookingDate: '2024-01-14T16:45:00',
          paymentMethod: 'mobile_money',
          notes: 'Annulation pour raisons personnelles',
          cancellationDate: '2024-01-18T11:20:00'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Fonction pour actualiser les données
  const refreshBookingsData = async () => {
    console.log('🔄 Actualisation des données de réservations...');
    setLoading(true);
    // Simuler un rechargement de données depuis l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    console.log('✅ Données de réservations actualisées');
  };

  // Hook pour gérer le rechargement
  const { refresh } = useRefresh(refreshBookingsData);

  // Gestion des vues
  const handleViewChange = (view, booking = null) => {
    setCurrentView(view);
    setSelectedBooking(booking);
  };

  // Filtrage des réservations
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger.phone.includes(searchTerm) ||
      booking.trip.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trip.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trip.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesTrip = filterTrip === 'all' || booking.trip.id.toString() === filterTrip;
    
    return matchesSearch && matchesStatus && matchesTrip;
  });

  // Actions sur les réservations
  const handleBookingAction = async (action, bookingData) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'create': {
          const newBooking = {
            ...bookingData,
            id: Date.now(),
            bookingNumber: `RES-${String(bookings.length + 1).padStart(3, '0')}`,
            bookingDate: new Date().toISOString(),
            status: 'pending',
            paymentStatus: 'pending'
          };
          setBookings(prev => [...prev, newBooking]);
          setCurrentView('list');
          break;
        }
          
        case 'update': {
          setBookings(prev => prev.map(booking => 
            booking.id === bookingData.id ? { ...booking, ...bookingData } : booking
          ));
          setCurrentView('list');
          break;
        }
          
        case 'delete': {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
            setBookings(prev => prev.filter(booking => booking.id !== bookingData.id));
            setCurrentView('list');
          }
          break;
        }

        case 'confirm': {
          setBookings(prev => prev.map(booking => 
            booking.id === bookingData.id 
              ? { ...booking, status: 'confirmed' }
              : booking
          ));
          break;
        }

        case 'cancel': {
          const reason = window.prompt('Raison de l\'annulation:');
          if (reason) {
            setBookings(prev => prev.map(booking => 
              booking.id === bookingData.id 
                ? { 
                    ...booking, 
                    status: 'cancelled',
                    cancellationDate: new Date().toISOString(),
                    notes: booking.notes + `\nAnnulation: ${reason}`
                  }
                : booking
            ));
          }
          break;
        }

        case 'mark_paid': {
          setBookings(prev => prev.map(booking => 
            booking.id === bookingData.id 
              ? { ...booking, paymentStatus: 'paid', status: 'confirmed' }
              : booking
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

  // Calcul des statistiques
  const getBookingStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0);
      
    return { total, confirmed, pending, cancelled, totalRevenue };
  };

  const stats = getBookingStats();

  if (loading && bookings.length === 0) {
    return (
      <div className="bookings-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des réservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-management">
      {/* Bouton de rechargement */}
      <RefreshButton 
        onRefresh={refresh}
        tooltip="Actualiser les réservations"
      />
      
      {/* Header avec actions globales */}
      <div className="bookings-management-header">
        <div className="header-title">
          <h1>🎫 Gestion des Réservations</h1>
          <div className="bookings-stats">
            <span className="stat">
              <strong>{stats.total}</strong> Total
            </span>
            <span className="stat confirmed">
              <strong>{stats.confirmed}</strong> Confirmées
            </span>
            <span className="stat pending">
              <strong>{stats.pending}</strong> En attente
            </span>
            <span className="stat cancelled">
              <strong>{stats.cancelled}</strong> Annulées
            </span>
            <span className="stat revenue">
              <strong>{stats.totalRevenue.toLocaleString()}</strong> FCFA
            </span>
          </div>
        </div>

        <div className="header-actions">
          {hasPermission('bookings', 'create') && (
            <button 
              className="btn-primary"
              onClick={() => handleViewChange('create')}
            >
              ➕ Nouvelle Réservation
            </button>
          )}
          
          <button 
            className="btn-secondary"
            onClick={() => {
              // Export des données
              console.log('Export des réservations');
            }}
          >
            📊 Exporter
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bookings-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Rechercher une réservation (numéro, passager, téléphone, trajet...)"
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
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="cancelled">Annulée</option>
          </select>

          <select
            value={filterTrip}
            onChange={(e) => setFilterTrip(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les trajets</option>
            {trips.map(trip => (
              <option key={trip.id} value={trip.id.toString()}>
                {trip.routeNumber} - {trip.from} → {trip.to}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bookings-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {currentView === 'list' && (
          <BookingsList 
            bookings={filteredBookings}
            onViewBooking={(booking) => handleViewChange('detail', booking)}
            onEditBooking={(booking) => handleViewChange('edit', booking)}
            onDeleteBooking={(booking) => handleBookingAction('delete', booking)}
            onConfirmBooking={(booking) => handleBookingAction('confirm', booking)}
            onCancelBooking={(booking) => handleBookingAction('cancel', booking)}
            onMarkPaid={(booking) => handleBookingAction('mark_paid', booking)}
            currentRole={currentRole}
          />
        )}

        {currentView === 'detail' && selectedBooking && (
          <BookingDetail 
            booking={selectedBooking}
            onBack={() => handleViewChange('list')}
            onEdit={() => handleViewChange('edit', selectedBooking)}
            onConfirm={() => handleBookingAction('confirm', selectedBooking)}
            onCancel={() => handleBookingAction('cancel', selectedBooking)}
            onMarkPaid={() => handleBookingAction('mark_paid', selectedBooking)}
            currentRole={currentRole}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <BookingForm 
            booking={currentView === 'edit' ? selectedBooking : null}
            onSave={(bookingData) => handleBookingAction(currentView === 'edit' ? 'update' : 'create', bookingData)}
            onCancel={() => handleViewChange('list')}
            trips={trips}
            currentRole={currentRole}
          />
        )}
      </div>
    </div>
  );
};

export default BookingsManagement;
