import React, { useState } from 'react'
import { RoleProvider } from './components/SimpleRoleSystem'
import RoleBasedSidebar from './components/Sidebar/RoleBasedSidebar'
import SimpleDashboard from './components/Dashboard/SimpleDashboard'
import TripManagement from './components/TripManagement/TripManagement'
import BookingManagement from './components/BookingManagement/BookingManagement'
import './SimpleApp.css'

// Simulation d'un utilisateur connecté avec son rôle
const mockUsers = {
  manager: {
    id: '1',
    name: 'Marie Dubois',
    email: 'marie.dubois@agence.com',
    employee_role: 'manager'
  },
  employee: {
    id: '2', 
    name: 'Jean Kamga',
    email: 'jean.kamga@agence.com',
    employee_role: 'employee'
  },
  driver: {
    id: '3',
    name: 'Paul Mballa',
    email: 'paul.mballa@agence.com',
    employee_role: 'driver'
  }
}

const SimpleApp = () => {
  const [currentUser, setCurrentUser] = useState(mockUsers.manager) // Par défaut: manager
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SimpleDashboard />
      case 'trips':
      case 'my-trips':
        return <TripManagement />
      case 'bookings':
      case 'passengers':
        return <BookingManagement />
      case 'customers':
        return <div className="page-placeholder">👥 Gestion Clients (À venir)</div>
      case 'finances':
        return <div className="page-placeholder">💰 Finances (À venir)</div>
      case 'services':
        return <div className="page-placeholder">⭐ Services (À venir)</div>
      case 'settings':
        return <div className="page-placeholder">⚙️ Paramètres (À venir)</div>
      default:
        return <SimpleDashboard />
    }
  }

  return (
    <RoleProvider user={currentUser}>
      <div className="simple-app">
        {/* Demo: Sélecteur de rôle */}
        <div className="role-selector">
          <span>🧪 Test des rôles:</span>
          <button 
            className={currentUser.employee_role === 'manager' ? 'active' : ''}
            onClick={() => setCurrentUser(mockUsers.manager)}
          >
            👨‍💼 Manager
          </button>
          <button 
            className={currentUser.employee_role === 'employee' ? 'active' : ''}
            onClick={() => setCurrentUser(mockUsers.employee)}
          >
            👨‍💻 Employé
          </button>
          <button 
            className={currentUser.employee_role === 'driver' ? 'active' : ''}
            onClick={() => setCurrentUser(mockUsers.driver)}
          >
            🚗 Conducteur
          </button>
        </div>

        {/* Layout principal */}
        <div className="app-layout">
          <RoleBasedSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          
          <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {renderContent()}
          </main>
        </div>
      </div>
    </RoleProvider>
  )
}

export default SimpleApp
