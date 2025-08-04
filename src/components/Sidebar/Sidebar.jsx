import React from 'react';
import './Sidebar.css';
import { 
  LayoutDashboard, 
  MapPin, 
  Calendar, 
  Users, 
  Activity, 
  Settings,
  LogOut,
  UserCog
} from 'lucide-react';

const Sidebar = ({ activeRoute, onRouteChange, onLogout, userRole, hasPermission, userProfile, agency }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trips', label: 'Trajets', icon: MapPin },
    { id: 'bookings', label: 'Réservations', icon: Calendar },
    { id: 'customers', label: 'Clients', icon: Users },
    { 
      id: 'employees', 
      label: 'Employés', 
      icon: UserCog,
      requiresOwner: true // Seul le propriétaire peut voir cette section
    },
    { id: 'activity', label: 'Activité', icon: Activity },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  // Filtrer les éléments selon les permissions
  const visibleItems = menuItems.filter(item => {
    // Si l'élément nécessite d'être propriétaire
    if (item.requiresOwner) {
      return userRole === 'agence';
    }
    
    // Si l'élément a des permissions spécifiques
    if (item.permission) {
      return hasPermission && hasPermission(item.permission);
    }
    
    // Par défaut, tout le monde peut voir
    return true;
  });

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">TravelHub</h2>
        <p className="sidebar-subtitle">Agence</p>
        {userProfile && (
          <div className="user-info">
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
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        {userProfile && (
          <div className="user-status">
            <div className="user-indicator">
              <div className="status-dot"></div>
              <span className="status-text">En ligne</span>
            </div>
          </div>
        )}
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
