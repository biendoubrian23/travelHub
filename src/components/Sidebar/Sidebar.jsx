import React from 'react';
import './SidebarElegant.css';
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Activity, 
  Settings,
  LogOut,
  UserCog,
  DollarSign,
  Bus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRolePermissions } from '../RoleBasedComponents';

const Sidebar = ({ activeRoute, onRouteChange, onLogout, userProfile, agency }) => {
  const { currentRole, canViewTab, roleConfig, theme, canManageEmployees } = useRolePermissions();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Définition des onglets avec leurs icônes et conditions d'affichage
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', description: 'Vue d\'ensemble', icon: LayoutDashboard, tabName: 'dashboard', group: 'main' },
    { id: 'trips', label: 'Trajets', description: 'Gestion des trajets', icon: MapPin, tabName: 'trips', group: 'main' },
    { id: 'bookings', label: 'Réservations', description: 'Gestion des réservations', icon: Calendar, tabName: 'bookings', group: 'main' },
    { id: 'buses', label: 'Bus', description: 'Gestion de la flotte', icon: Bus, tabName: 'buses', group: 'main' },
    { id: 'finances', label: 'Finances', description: 'Revenus et rapports', icon: DollarSign, tabName: 'finances', group: 'admin' },
    { 
      id: 'employees', 
      label: 'Employés', 
      description: 'Gestion du personnel',
      icon: UserCog,
      tabName: 'employees',
      requiresEmployeeManagement: true, // Spécial pour employés
      group: 'admin'
    },
    { id: 'activity', label: 'Activité', description: 'Journal des actions', icon: Activity, tabName: 'activity', group: 'admin' },
    { id: 'settings', label: 'Paramètres', description: 'Configuration du système', icon: Settings, tabName: 'settings', group: 'system' },
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

  // Groupe les éléments par catégorie
  const groupedItems = visibleItems.reduce((acc, item) => {
    const group = item.group || 'other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});

  // Obtenir le style du rôle actuel
  const getRoleIcon = () => {
    return roleConfig?.icon || '👤';
  };

  const getRoleLabel = () => {
    return roleConfig?.label || 'Utilisateur';
  };

  // Gérer la bascule entre mode normal et réduit
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} data-role={currentRole}>
      <div className="sidebar-header">
        <div className="sidebar-title-container">
          <div className="sidebar-logo">
            <Bus size={20} strokeWidth={2.5} color={theme?.primary || '#3B82F6'} />
            {!isCollapsed && (
              <div style={{ width: '100%' }}>
                <h2 className="sidebar-title">TravelHub</h2>
                <p className="sidebar-subtitle">Agence</p>
              </div>
            )}
          </div>
          <button className="sidebar-collapse-btn" onClick={toggleSidebar} aria-label={isCollapsed ? 'Déplier le menu' : 'Replier le menu'}>
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="agency-banner">
            <h3 className="agency-title">{agency?.name || 'Buca Voyage'}</h3>
          </div>
        )}
        {!isCollapsed && userProfile && (
          <div className="user-info">
            <div className="user-role-badge">
              {currentRole === 'patron' && <span className="role-label">Patron</span>}
              {currentRole === 'manager' && <span className="role-label">Manager</span>}
              {currentRole === 'employee' && <span className="role-label">Employé</span>}
              {currentRole === 'driver' && <span className="role-label">Conducteur</span>}
            </div>
            <p className="user-name">{userProfile.full_name}</p>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {Object.entries(groupedItems).map(([group, items]) => (
          <div className="nav-group" key={group}>
            {!isCollapsed && (
              <h3 className="nav-group-title">
                {group === 'main' && 'Principal'}
                {group === 'admin' && 'Administration'}
                {group === 'system' && 'Système'}
                {group === 'other' && 'Autres'}
              </h3>
            )}
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeRoute === item.id ? 'active' : ''}`}
                  onClick={() => onRouteChange(item.id)}
                  aria-label={item.label}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="nav-icon" size={isCollapsed ? 18 : 16} />
                  {!isCollapsed && (
                    <div className="nav-content">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        {!isCollapsed && userProfile && (
          <div className="user-status">
            <div className="user-indicator">
              <div className="status-dot"></div>
              <span className="status-text">En ligne • {getRoleLabel()}</span>
            </div>
          </div>
        )}
        <button className="logout-button" onClick={onLogout} aria-label="Déconnexion">
          <LogOut className="logout-icon" size={16} />
          {!isCollapsed && <span className="logout-text">Sortir</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
