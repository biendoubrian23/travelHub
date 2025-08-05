import React from 'react';
import './Sidebar.css';
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Activity, 
  Settings,
  LogOut,
  UserCog,
  DollarSign,
  Bus
} from 'lucide-react';
import { useRolePermissions } from '../RoleBasedComponents';

const Sidebar = ({ activeRoute, onRouteChange, onLogout, userProfile, agency }) => {
  const { currentRole, canViewTab, roleConfig, theme, canManageEmployees } = useRolePermissions();

  // Définition des onglets avec leurs icônes et conditions d'affichage
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tabName: 'dashboard' },
    { id: 'trips', label: 'Trajets', icon: MapPin, tabName: 'trips' },
    { id: 'bookings', label: 'Réservations', icon: Calendar, tabName: 'bookings' },
    { id: 'buses', label: 'Bus', icon: Bus, tabName: 'buses' },
    { id: 'finances', label: 'Finances', icon: DollarSign, tabName: 'finances' },
    { 
      id: 'employees', 
      label: 'Employés', 
      icon: UserCog,
      tabName: 'employees',
      requiresEmployeeManagement: true // Spécial pour employés
    },
    { id: 'activity', label: 'Activité', icon: Activity, tabName: 'activity' },
    { id: 'settings', label: 'Paramètres', icon: Settings, tabName: 'settings' },
  ];

  // Filtrer les éléments selon les permissions du rôle
  const visibleItems = allMenuItems.filter(item => {
    // Cas spécial pour la gestion des employés - garde la logique originale
    if (item.requiresEmployeeManagement) {
      return canManageEmployees(); // Patron OU Manager peuvent voir l'onglet
    }
    // Pour les autres onglets, utilise la logique des rôles
    return canViewTab(item.tabName);
  });

  // Obtenir le style du rôle actuel
  const getRoleIcon = () => {
    return roleConfig?.icon || '👤';
  };

  const getRoleLabel = () => {
    return roleConfig?.label || 'Utilisateur';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">TravelHub</h2>
        <p className="sidebar-subtitle">Agence</p>
        {userProfile && (
          <div className="user-info">
            <div className="user-role-badge" style={{ backgroundColor: theme?.primary || '#007AFF' }}>
              <span className="role-icon">{getRoleIcon()}</span>
              <span className="role-label">{getRoleLabel()}</span>
            </div>
            <p className="user-name">{userProfile.full_name}</p>
            {agency && (
              <p className="agency-name">{agency.name}</p>
            )}
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeRoute === item.id ? 'active' : ''}`}
              onClick={() => onRouteChange(item.id)}
              title={`${item.label} - ${getRoleLabel()}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {item.id === 'employees' && (
                <span className="nav-badge">
                  {currentRole === 'patron' ? '👑' : currentRole === 'manager' ? '👨‍💼' : ''}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        {userProfile && (
          <div className="user-status">
            <div className="user-indicator">
              <div className="status-dot"></div>
              <span className="status-text">En ligne • {getRoleLabel()}</span>
            </div>
          </div>
        )}
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={18} />
          <span>Sortir</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
