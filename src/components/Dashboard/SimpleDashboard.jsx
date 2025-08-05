import React from 'react'
import { useRole, RoleContent, RoleBadge } from '../SimpleRoleSystem'
import './SimpleDashboard.css'

const SimpleDashboard = () => {
  const { theme, roleConfig } = useRole()

  return (
    <div className="simple-dashboard" style={{ '--role-primary': theme?.primary, '--role-bg': theme?.background }}>
      {/* Header avec badge rôle */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>👋 Bonjour !</h1>
          <p>Bienvenue dans votre espace de travail</p>
        </div>
        <RoleBadge />
      </div>

      {/* Contenu selon le rôle */}
      <div className="dashboard-content">
        <RoleContent
          manager={<ManagerDashboard />}
          employee={<EmployeeDashboard />}
          driver={<DriverDashboard />}
        />
      </div>
    </div>
  )
}

// Dashboard Manager - Finances + Vue d'ensemble
const ManagerDashboard = () => {
  return (
    <div className="manager-dashboard">
      {/* KPIs financiers */}
      <div className="financial-overview">
        <h2>💰 Vue Financière</h2>
        <div className="kpi-grid">
          <div className="kpi-card revenue">
            <div className="kpi-icon">💵</div>
            <div className="kpi-data">
              <h3>Revenus du jour</h3>
              <p className="value">687,500 FCFA</p>
              <span className="trend positive">+24% vs hier</span>
            </div>
          </div>
          
          <div className="kpi-card bookings">
            <div className="kpi-icon">📊</div>
            <div className="kpi-data">
              <h3>Réservations payées</h3>
              <p className="value">156</p>
              <span className="trend">+18 aujourd'hui</span>
            </div>
          </div>
          
          <div className="kpi-card pending">
            <div className="kpi-icon">⏳</div>
            <div className="kpi-data">
              <h3>Paiements en attente</h3>
              <p className="value">12</p>
              <span className="trend warning">À suivre</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides manager */}
      <div className="quick-actions">
        <h2>⚡ Actions Rapides</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={() => console.log('Ajuster prix')}>
            <div className="action-icon">💰</div>
            <div className="action-text">
              <h3>Ajuster les Prix</h3>
              <p>Gérer les tarifs et réductions</p>
            </div>
          </div>
          
          <div className="action-card" onClick={() => console.log('Rapport finances')}>
            <div className="action-icon">📈</div>
            <div className="action-text">
              <h3>Rapports Financiers</h3>
              <p>Voir les performances</p>
            </div>
          </div>
          
          <div className="action-card" onClick={() => console.log('Gérer employés')}>
            <div className="action-icon">👥</div>
            <div className="action-text">
              <h3>Gérer Équipe</h3>
              <p>Employés et permissions</p>
            </div>
          </div>
        </div>
      </div>

      <OperationalOverview />
    </div>
  )
}

// Dashboard Employé - Opérationnel sans finances
const EmployeeDashboard = () => {
  return (
    <div className="employee-dashboard">
      {/* KPIs opérationnels */}
      <div className="operational-overview">
        <h2>🚌 Vue Opérationnelle</h2>
        <div className="kpi-grid">
          <div className="kpi-card trips">
            <div className="kpi-icon">🚌</div>
            <div className="kpi-data">
              <h3>Trajets à gérer</h3>
              <p className="value">24</p>
              <span className="trend">8 nécessitent attention</span>
            </div>
          </div>
          
          <div className="kpi-card capacity">
            <div className="kpi-icon">👥</div>
            <div className="kpi-data">
              <h3>Taux d'occupation</h3>
              <p className="value">82%</p>
              <span className="trend positive">Excellent</span>
            </div>
          </div>
          
          <div className="kpi-card services">
            <div className="kpi-icon">⭐</div>
            <div className="kpi-data">
              <h3>Services actifs</h3>
              <p className="value">15</p>
              <span className="trend">WiFi, AC, Collations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides employé */}
      <div className="quick-actions">
        <h2>⚡ Actions Rapides</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={() => console.log('Nouveau trajet')}>
            <div className="action-icon">➕</div>
            <div className="action-text">
              <h3>Nouveau Trajet</h3>
              <p>Créer un nouveau trajet</p>
            </div>
          </div>
          
          <div className="action-card" onClick={() => console.log('Gérer services')}>
            <div className="action-icon">🛠️</div>
            <div className="action-text">
              <h3>Gérer Services</h3>
              <p>Configuration des services bus</p>
            </div>
          </div>
          
          <div className="action-card" onClick={() => console.log('Horaires')}>
            <div className="action-icon">⏰</div>
            <div className="action-text">
              <h3>Planifier Horaires</h3>
              <p>Gérer les départs et arrivées</p>
            </div>
          </div>
        </div>
      </div>

      <TripSchedule />
    </div>
  )
}

// Dashboard Conducteur - Mes trajets uniquement
const DriverDashboard = () => {
  return (
    <div className="driver-dashboard">
      {/* Ma journée */}
      <div className="my-day">
        <h2>🚗 Ma Journée</h2>
        <div className="day-overview">
          <div className="day-card">
            <div className="day-icon">📅</div>
            <div className="day-info">
              <h3>Trajets assignés</h3>
              <p className="value">3</p>
              <span className="schedule">08:30 • 13:45 • 17:15</span>
            </div>
          </div>
          
          <div className="day-card">
            <div className="day-icon">👥</div>
            <div className="day-info">
              <h3>Total passagers</h3>
              <p className="value">124</p>
              <span className="breakdown">42 + 38 + 44</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prochain trajet */}
      <div className="next-trip">
        <h2>🔜 Prochain Trajet</h2>
        <div className="trip-detail">
          <div className="trip-time">
            <span className="departure">08:30</span>
            <span className="arrow">→</span>
            <span className="arrival">12:15</span>
          </div>
          <div className="trip-route">
            <h3>Douala → Yaoundé</h3>
            <p>Bus VIP • 45 places • 42 passagers confirmés</p>
          </div>
          <div className="trip-actions">
            <button className="action-btn primary">📋 Voir Passagers</button>
            <button className="action-btn secondary">🗺️ Itinéraire</button>
          </div>
        </div>
      </div>

      {/* Actions rapides conducteur */}
      <div className="driver-actions">
        <h2>⚡ Actions Rapides</h2>
        <div className="actions-simple">
          <button className="simple-action" onClick={() => console.log('Mes trajets')}>
            <span className="action-emoji">📅</span>
            <span>Mes Trajets</span>
          </button>
          
          <button className="simple-action" onClick={() => console.log('Passagers')}>
            <span className="action-emoji">👥</span>
            <span>Mes Passagers</span>
          </button>
          
          <button className="simple-action" onClick={() => console.log('Planning')}>
            <span className="action-emoji">⏰</span>
            <span>Mon Planning</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant vue d'ensemble opérationnelle (pour Manager)
const OperationalOverview = () => {
  return (
    <div className="operational-section">
      <h2>📊 Vue d'Ensemble Opérationnelle</h2>
      <div className="operation-cards">
        <div className="operation-card">
          <h4>🚌 Trajets Actifs</h4>
          <p className="big-number">24</p>
          <span className="status">6 en cours de route</span>
        </div>
        
        <div className="operation-card">
          <h4>👥 Nouveaux Clients</h4>
          <p className="big-number">18</p>
          <span className="status positive">+32% cette semaine</span>
        </div>
        
        <div className="operation-card">
          <h4>⭐ Satisfaction</h4>
          <p className="big-number">4.8/5</p>
          <span className="status positive">Excellent service</span>
        </div>
      </div>
    </div>
  )
}

// Planning des trajets (pour Employé)
const TripSchedule = () => {
  const trips = [
    { time: '08:30', route: 'Douala → Yaoundé', capacity: '42/45', status: 'ready' },
    { time: '10:15', route: 'Yaoundé → Bafoussam', capacity: '35/40', status: 'boarding' },
    { time: '13:45', route: 'Douala → Limbe', capacity: '28/35', status: 'scheduled' }
  ]

  return (
    <div className="trip-schedule">
      <h2>⏰ Planning des Trajets</h2>
      <div className="schedule-list">
        {trips.map((trip, index) => (
          <div key={index} className={`schedule-item ${trip.status}`}>
            <div className="schedule-time">{trip.time}</div>
            <div className="schedule-info">
              <h4>{trip.route}</h4>
              <p>{trip.capacity}</p>
            </div>
            <div className="schedule-status">
              {trip.status === 'ready' && '✅ Prêt'}
              {trip.status === 'boarding' && '🚶 Embarquement'}
              {trip.status === 'scheduled' && '⏳ Programmé'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SimpleDashboard
