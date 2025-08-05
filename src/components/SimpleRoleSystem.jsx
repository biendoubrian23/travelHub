import React, { createContext, useContext } from 'react'
import { SIMPLE_ROLES, hasPermission, getVisibleTabs, ROLE_THEME, PAGE_ACTIONS } from '../config/simpleRoles'

// Context pour la gestion des rôles
const RoleContext = createContext(null)

// Provider du contexte des rôles
export const RoleProvider = ({ children, user }) => {
  const userRole = user?.employee_role || null
  const roleConfig = userRole ? SIMPLE_ROLES[userRole] : null
  const theme = userRole ? ROLE_THEME[userRole] : null

  const value = {
    userRole,
    roleConfig,
    theme,
    hasPermission: (module, action) => hasPermission(userRole, module, action),
    getVisibleTabs: () => getVisibleTabs(userRole),
    isManager: userRole === 'manager',
    isEmployee: userRole === 'employee', 
    isDriver: userRole === 'driver'
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  )
}

// Hook pour utiliser le contexte des rôles
export const useRole = () => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

// Composant pour protéger l'accès selon les permissions
export const PermissionGuard = ({ 
  module, 
  action, 
  children, 
  fallback = null,
  role = null // Permettre de vérifier un rôle spécifique
}) => {
  const { hasPermission: checkPermission, userRole } = useRole()
  
  // Si on vérifie un rôle spécifique
  if (role) {
    if (userRole !== role) return fallback
  }
  
  // Si on vérifie une permission
  if (module && action) {
    if (!checkPermission(module, action)) return fallback
  }
  
  return children
}

// Composant pour afficher du contenu selon le rôle
export const RoleContent = ({ 
  manager = null, 
  employee = null, 
  driver = null,
  fallback = null 
}) => {
  const { userRole } = useRole()
  
  switch (userRole) {
    case 'manager':
      return manager || fallback
    case 'employee':
      return employee || fallback
    case 'driver':
      return driver || fallback
    default:
      return fallback
  }
}

// Composant pour les boutons avec permissions
export const PermissionButton = ({ 
  module, 
  action, 
  children, 
  className = '',
  onClick,
  variant = 'primary',
  disabled = false,
  ...props 
}) => {
  const { hasPermission: checkPermission, theme } = useRole()
  
  // Vérifier les permissions
  if (module && action && !checkPermission(module, action)) {
    return null
  }
  
  // Style iOS selon le variant
  const getButtonStyle = () => {
    const baseStyle = {
      border: 'none',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.5 : 1
    }
    
    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme?.primary || '#007AFF',
          color: 'white'
        }
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme?.background || '#F2F8FF',
          color: theme?.primary || '#007AFF',
          border: `1px solid ${theme?.primary || '#007AFF'}`
        }
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#FF3B30',
          color: 'white'
        }
      default:
        return baseStyle
    }
  }
  
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={getButtonStyle()}
      {...props}
    >
      {children}
    </button>
  )
}

// Composant pour les alertes/badges selon le rôle
export const RoleBadge = ({ className = '' }) => {
  const { roleConfig, theme } = useRole()
  
  if (!roleConfig) return null
  
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: theme?.background || '#F2F8FF',
    color: theme?.primary || '#007AFF',
    border: `1px solid ${theme?.primary || '#007AFF'}`
  }
  
  return (
    <span className={className} style={badgeStyle}>
      <span>{roleConfig.icon}</span>
      <span>{roleConfig.label}</span>
    </span>
  )
}

// Composant pour afficher les permissions manquantes
export const PermissionDenied = ({ message = "Accès non autorisé" }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      color: '#8E8E93'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
        {message}
      </h3>
      <p style={{ fontSize: '14px', margin: '0' }}>
        Vous n'avez pas les permissions nécessaires pour accéder à cette section.
      </p>
    </div>
  )
}

// Hook pour les actions de page
export const usePageActions = (page) => {
  const { userRole } = useRole()
  
  if (!userRole || !PAGE_ACTIONS[page]) return []
  
  return PAGE_ACTIONS[page][userRole] || []
}

export default {
  RoleProvider,
  useRole,
  PermissionGuard,
  RoleContent,
  PermissionButton,
  RoleBadge,
  PermissionDenied,
  usePageActions
}
