import React from 'react'
import { useRole, PermissionGuard, RoleContent, PermissionButton } from '../SimpleRoleSystem'
import './TripManagement.css'

const TripManagement = () => {
  const { roleConfig, theme, hasPermission } = useRole()

  return (
    <div className="trip-management" style={{ '--role-primary': theme?.primary }}>
      {/* Header avec style iOS */}
      <div className="trip-header">
        <div className="header-content">
          <h1>🚌 Gestion des Trajets</h1>
          <div className="header-actions">
            
            {/* Bouton créer trajet - Pas pour conducteur */}
            <PermissionGuard module="trips" action="create">
              <PermissionButton
                module="trips"
                action="create"
                variant="primary"
                onClick={() => console.log('Créer trajet')}
              >
                ➕ Nouveau Trajet
              </PermissionButton>
            </PermissionGuard>

            {/* Bouton prix - Manager uniquement */}
            <PermissionGuard module="finances" action="editPrices">
              <PermissionButton
                module="finances"
                action="editPrices"
                variant="secondary"
                onClick={() => console.log('Gérer prix')}
              >
                💰 Gérer Prix
              </PermissionButton>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Contenu principal selon le rôle */}
      <div className="trip-content">
        
        {/* Vue Manager - Tout voir */}
        <RoleContent
          manager={
            <ManagerTripView />
          }
          
          employee={
            <EmployeeTripView />
          }
          
          driver={
            <DriverTripView />
          }
        />
        
      </div>
    </div>
  )
}

// Vue complète pour Manager
const ManagerTripView = () => {
  return (
    <div className="manager-view">
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Revenus du jour</h3>
            <p className="stat-value">285,000 FCFA</p>
            <span className="stat-change positive">+12% vs hier</span>
          </div>
        </div>
        
        <div className="stat-card trips">
          <div className="stat-icon">🚌</div>
          <div className="stat-info">
            <h3>Trajets actifs</h3>
            <p className="stat-value">24</p>
            <span className="stat-change">6 en cours</span>
          </div>
        </div>
        
        <div className="stat-card bookings">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Réservations</h3>
            <p className="stat-value">142</p>
            <span className="stat-change positive">+8 aujourd'hui</span>
          </div>
        </div>
      </div>
      
      <TripList showFinances={true} />
    </div>
  )
}

// Vue pour Employé - Pas de finances
const EmployeeTripView = () => {
  return (
    <div className="employee-view">
      <div className="stats-grid">
        <div className="stat-card trips">
          <div className="stat-icon">🚌</div>
          <div className="stat-info">
            <h3>Trajets à gérer</h3>
            <p className="stat-value">18</p>
            <span className="stat-change">5 nécessitent attention</span>
          </div>
        </div>
        
        <div className="stat-card capacity">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Taux occupation</h3>
            <p className="stat-value">78%</p>
            <span className="stat-change positive">Bon taux</span>
          </div>
        </div>
        
        <div className="stat-card services">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Services actifs</h3>
            <p className="stat-value">12</p>
            <span className="stat-change">WiFi, AC, Snacks</span>
          </div>
        </div>
      </div>
      
      <TripList showFinances={false} />
    </div>
  )
}

// Vue pour Conducteur - Lecture seule
const DriverTripView = () => {
  return (
    <div className="driver-view">
      <div className="driver-header">
        <h2>🚗 Mes Trajets Assignés</h2>
        <div className="driver-status">
          <span className="status-badge active">En Service</span>
        </div>
      </div>
      
      <div className="driver-schedule">
        <div className="trip-card today">
          <div className="trip-time">
            <span className="departure">08:30</span>
            <span className="route">→</span>
            <span className="arrival">12:15</span>
          </div>
          <div className="trip-details">
            <h3>Douala → Yaoundé</h3>
            <p>Bus VIP • 45 places • 38 passagers</p>
            <div className="trip-actions">
              <button className="action-btn primary">📋 Voir Passagers</button>
              <button className="action-btn secondary">🗺️ Itinéraire</button>
            </div>
          </div>
        </div>
        
        <div className="trip-card next">
          <div className="trip-time">
            <span className="departure">15:45</span>
            <span className="route">→</span>
            <span className="arrival">19:30</span>
          </div>
          <div className="trip-details">
            <h3>Yaoundé → Douala</h3>
            <p>Bus Standard • 50 places • 42 passagers</p>
            <div className="trip-actions">
              <button className="action-btn secondary">📋 Voir Passagers</button>
              <button className="action-btn secondary">🗺️ Itinéraire</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Liste des trajets (réutilisable)
const TripList = ({ showFinances }) => {
  const trips = [
    {
      id: 1,
      departure: 'Douala',
      arrival: 'Yaoundé',
      time: '08:30',
      duration: '3h45',
      price: 3500,
      available: 12,
      total: 45,
      revenue: 116500,
      status: 'active'
    },
    {
      id: 2,
      departure: 'Yaoundé',
      arrival: 'Bafoussam',
      time: '10:15',
      duration: '4h30',
      price: 4200,
      available: 8,
      total: 40,
      revenue: 134400,
      status: 'active'
    }
  ]

  return (
    <div className="trip-list">
      <div className="list-header">
        <h3>📋 Liste des Trajets</h3>
        <div className="list-filters">
          <select className="filter-select">
            <option>Tous les trajets</option>
            <option>Trajets actifs</option>
            <option>En cours</option>
            <option>Terminés</option>
          </select>
        </div>
      </div>
      
      <div className="trips-grid">
        {trips.map(trip => (
          <div key={trip.id} className="trip-card">
            <div className="trip-route">
              <div className="route-info">
                <h4>{trip.departure} → {trip.arrival}</h4>
                <p className="trip-time">{trip.time} • {trip.duration}</p>
              </div>
              <div className="trip-status">
                <span className={`status-badge ${trip.status}`}>
                  {trip.status === 'active' ? '🟢 Actif' : '🔴 Terminé'}
                </span>
              </div>
            </div>
            
            <div className="trip-details">
              <div className="capacity-info">
                <span className="available">{trip.available} places libres</span>
                <span className="total">sur {trip.total}</span>
              </div>
              
              {showFinances && (
                <div className="price-info">
                  <span className="price">{trip.price.toLocaleString()} FCFA</span>
                  <span className="revenue">Revenus: {trip.revenue.toLocaleString()} FCFA</span>
                </div>
              )}
            </div>
            
            <div className="trip-actions">
              <PermissionButton
                module="trips"
                action="edit"
                variant="secondary"
                onClick={() => console.log('Modifier', trip.id)}
              >
                ✏️ Modifier
              </PermissionButton>
              
              <PermissionButton
                module="finances"
                action="editPrices"
                variant="secondary"
                onClick={() => console.log('Prix', trip.id)}
              >
                💰 Prix
              </PermissionButton>
              
              <button className="action-btn primary">
                📋 Détails
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TripManagement
