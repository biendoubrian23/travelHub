import React from 'react'
import { useRole, PermissionGuard, RoleBadge } from '../SimpleRoleSystem'
import './RoleBasedSidebar.        <button className="logout-btn" title="Sortir">
          <span className="logout-icon">↗️</span>
          {!isCollapsed && <span className="logout-text">Sortir</span>}'

const RoleBasedSidebar = ({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) => {
  const { getVisibleTabs, theme } = useRole()
  const visibleTabs = getVisibleTabs()

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: '📊',
      description: 'Vue d\'ensemble'
    },
    {
      id: 'trips',
      label: 'Trajets',
      icon: '🚌',
      description: 'Gestion des trajets'
    },
    {
      id: 'bookings',
      label: 'Réservations',
      icon: '📋',
      description: 'Gestion réservations'
    },
    {
      id: 'buses',
      label: 'Bus',
      icon: '�',
      description: 'Gestion des bus'
    },
    {
      id: 'finances',
      label: 'Finances',
      icon: '💰',
      description: 'Revenus et prix'
    },
    {
      id: 'services',
      label: 'Services',
      icon: '⭐',
      description: 'Services bus'
    },
    {
      id: 'my-trips',
      label: 'Mes Trajets',
      icon: '🚗',
      description: 'Trajets assignés'
    },
    {
      id: 'passengers',
      label: 'Mes Passagers',
      icon: '👥',
      description: 'Passagers du trajet'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '⚙️',
      description: 'Configuration'
    }
  ]

  return (
    <div 
      className={`role-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ '--role-primary': theme?.primary, '--role-bg': theme?.background }}
    >
      {/* Header avec rôle */}
      <div className="sidebar-header">
        <div className="agency-logo">
          <span className="logo-icon">🚌</span>
          {!isCollapsed && <span className="logo-text">TravelHub</span>}
        </div>
        
        {!isCollapsed && (
          <div className="role-section">
            <RoleBadge />
          </div>
        )}

        <button 
          className="collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Étendre' : 'Réduire'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation selon le rôle */}
      <nav className="sidebar-nav">
        {navigationItems
          .filter(item => visibleTabs.includes(item.id))
          .map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && (
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              )}
            </button>
          ))
        }
      </nav>

      {/* Section utilisateur */}
      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <span className="user-name">Utilisateur</span>
                <span className="user-email">user@agence.com</span>
              </div>
            </div>
          </div>
        )}
        
        <button className="logout-btn" title="Sortir">
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span className="logout-text">Sortir</span>}
        </button>
      </div>
    </div>
  )
}

export default RoleBasedSidebar
