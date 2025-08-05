import React from 'react'
import { useRole, PermissionGuard, RoleContent, PermissionButton } from '../SimpleRoleSystem'
import './BookingManagement.css'

const BookingManagement = () => {
  const { theme } = useRole()

  return (
    <div className="booking-management" style={{ '--role-primary': theme?.primary }}>
      {/* Header */}
      <div className="booking-header">
        <div className="header-content">
          <h1>📋 Gestion des Réservations</h1>
          <div className="header-actions">
            
            {/* Nouvelle réservation - Pas pour conducteur */}
            <PermissionGuard module="bookings" action="create">
              <PermissionButton
                module="bookings"
                action="create"
                variant="primary"
                onClick={() => console.log('Nouvelle réservation')}
              >
                ➕ Nouvelle Réservation
              </PermissionButton>
            </PermissionGuard>

            {/* Rapports financiers - Manager uniquement */}
            <PermissionGuard module="finances" action="viewReports">
              <PermissionButton
                module="finances"
                action="viewReports"
                variant="secondary"
                onClick={() => console.log('Rapports financiers')}
              >
                📊 Rapports
              </PermissionButton>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Contenu selon le rôle */}
      <div className="booking-content">
        <RoleContent
          manager={<ManagerBookingView />}
          employee={<EmployeeBookingView />}
          driver={<DriverPassengerView />}
        />
      </div>
    </div>
  )
}

// Vue Manager - Complète avec finances
const ManagerBookingView = () => {
  return (
    <div className="manager-booking-view">
      {/* Statistiques financières */}
      <div className="financial-stats">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Revenus Aujourd'hui</h3>
            <p className="stat-value">452,000 FCFA</p>
            <span className="stat-change positive">+18% vs hier</span>
          </div>
        </div>
        
        <div className="stat-card payments">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>Paiements en attente</h3>
            <p className="stat-value">8</p>
            <span className="stat-change warning">Nécessite suivi</span>
          </div>
        </div>
        
        <div className="stat-card refunds">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>Remboursements</h3>
            <p className="stat-value">3</p>
            <span className="stat-change">À traiter</span>
          </div>
        </div>
      </div>
      
      <BookingList showFinances={true} showActions={['view', 'modify', 'cancel', 'refund']} />
    </div>
  )
}

// Vue Employé - Sans finances
const EmployeeBookingView = () => {
  return (
    <div className="employee-booking-view">
      <div className="employee-stats">
        <div className="stat-card bookings">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Réservations du jour</h3>
            <p className="stat-value">34</p>
            <span className="stat-change">8 en attente</span>
          </div>
        </div>
        
        <div className="stat-card customers">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Nouveaux clients</h3>
            <p className="stat-value">12</p>
            <span className="stat-change positive">Bon taux</span>
          </div>
        </div>
        
        <div className="stat-card satisfaction">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Satisfaction</h3>
            <p className="stat-value">4.8/5</p>
            <span className="stat-change positive">Excellent</span>
          </div>
        </div>
      </div>
      
      <BookingList showFinances={false} showActions={['view', 'modify']} />
    </div>
  )
}

// Vue Conducteur - Ses passagers uniquement
const DriverPassengerView = () => {
  const passengers = [
    {
      id: 1,
      name: 'Jean Dupont',
      phone: '+237 650 123 456',
      seat: '12A',
      status: 'confirmed',
      trip: 'Douala → Yaoundé 08:30',
      checkedIn: false
    },
    {
      id: 2,
      name: 'Marie Kamga',
      phone: '+237 651 234 567',
      seat: '15B',
      status: 'confirmed',
      trip: 'Douala → Yaoundé 08:30',
      checkedIn: true
    },
    {
      id: 3,
      name: 'Paul Mbala',
      phone: '+237 652 345 678',
      seat: '08A',
      status: 'pending',
      trip: 'Douala → Yaoundé 08:30',
      checkedIn: false
    }
  ]

  return (
    <div className="driver-passenger-view">
      <div className="passenger-header">
        <h2>👥 Mes Passagers - Trajet 08:30</h2>
        <div className="trip-info">
          <span className="route">🚌 Douala → Yaoundé</span>
          <span className="passenger-count">38/45 passagers</span>
        </div>
      </div>
      
      <div className="passenger-search">
        <input 
          type="text" 
          placeholder="🔍 Rechercher un passager..."
          className="search-input"
        />
        <select className="filter-select">
          <option>Tous les statuts</option>
          <option>Confirmé</option>
          <option>En attente</option>
          <option>Enregistré</option>
        </select>
      </div>
      
      <div className="passenger-list">
        {passengers.map(passenger => (
          <div key={passenger.id} className={`passenger-card ${passenger.status}`}>
            <div className="passenger-info">
              <div className="passenger-main">
                <h4>{passenger.name}</h4>
                <p className="phone">{passenger.phone}</p>
                <p className="seat">Siège {passenger.seat}</p>
              </div>
              
              <div className="passenger-status">
                <span className={`status-badge ${passenger.status}`}>
                  {passenger.status === 'confirmed' ? '✅ Confirmé' : 
                   passenger.status === 'pending' ? '⏳ En attente' : '❌ Annulé'}
                </span>
                
                {passenger.checkedIn && (
                  <span className="checkin-badge">✈️ Enregistré</span>
                )}
              </div>
            </div>
            
            <div className="passenger-actions">
              {!passenger.checkedIn && passenger.status === 'confirmed' && (
                <button 
                  className="action-btn primary"
                  onClick={() => console.log('Check-in', passenger.id)}
                >
                  ✅ Enregistrer
                </button>
              )}
              
              <button 
                className="action-btn secondary"
                onClick={() => console.log('Détails', passenger.id)}
              >
                👁️ Détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Liste des réservations (réutilisable)
const BookingList = ({ showFinances, showActions }) => {
  const bookings = [
    {
      id: 'BK001',
      passenger: 'Alice Martin',
      phone: '+237 650 111 222',
      trip: 'Douala → Yaoundé',
      time: '08:30',
      seat: '12A',
      price: 3500,
      status: 'confirmed',
      payment: 'paid',
      date: new Date()
    },
    {
      id: 'BK002',
      passenger: 'Robert Nkomo',
      phone: '+237 651 333 444',
      trip: 'Yaoundé → Bafoussam',
      time: '10:15',
      seat: '08B',
      price: 4200,
      status: 'pending',
      payment: 'pending',
      date: new Date()
    }
  ]

  return (
    <div className="booking-list">
      <div className="list-header">
        <h3>📋 Réservations Récentes</h3>
        <div className="list-filters">
          <select className="filter-select">
            <option>Toutes les réservations</option>
            <option>Confirmées</option>
            <option>En attente</option>
            <option>Annulées</option>
          </select>
        </div>
      </div>
      
      <div className="bookings-grid">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <div className="booking-id">
                <span className="id-label">Réf:</span>
                <span className="id-value">{booking.id}</span>
              </div>
              <div className="booking-status">
                <span className={`status-badge ${booking.status}`}>
                  {booking.status === 'confirmed' ? '✅ Confirmé' : '⏳ En attente'}
                </span>
              </div>
            </div>
            
            <div className="booking-details">
              <div className="passenger-details">
                <h4>{booking.passenger}</h4>
                <p className="phone">{booking.phone}</p>
                <p className="trip">{booking.trip} • {booking.time} • Siège {booking.seat}</p>
              </div>
              
              {showFinances && (
                <div className="financial-details">
                  <div className="price">{booking.price.toLocaleString()} FCFA</div>
                  <div className={`payment-status ${booking.payment}`}>
                    {booking.payment === 'paid' ? '💳 Payé' : '⏳ En attente'}
                  </div>
                </div>
              )}
            </div>
            
            <div className="booking-actions">
              {showActions.includes('view') && (
                <button className="action-btn secondary">👁️ Voir</button>
              )}
              
              {showActions.includes('modify') && (
                <PermissionButton
                  module="bookings"
                  action="modify"
                  variant="secondary"
                >
                  ✏️ Modifier
                </PermissionButton>
              )}
              
              {showActions.includes('cancel') && (
                <PermissionButton
                  module="bookings"
                  action="cancel"
                  variant="danger"
                >
                  ❌ Annuler
                </PermissionButton>
              )}
              
              {showActions.includes('refund') && booking.payment === 'paid' && (
                <PermissionButton
                  module="finances"
                  action="processRefund"
                  variant="secondary"
                >
                  🔄 Rembourser
                </PermissionButton>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BookingManagement
