import React from 'react';
import Dashboard from './Admin/Dashboard';
import Agencies from './Admin/Agencies';
import './SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  const handleAction = (actionId) => {
    console.log('Action clicked:', actionId);
    
    // Navigation vers d'autres onglets en fonction de l'action
    switch (actionId) {
      case 'add-agency':
        setActiveTab('agencies');
        break;
      case 'view-reports':
        setActiveTab('finance');
        break;
      case 'manage-users':
        setActiveTab('users');
        break;
      default:
        break;
    }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAction={handleAction} />;
      case 'agencies':
        return <Agencies />;
      case 'statistics':
        return (
          <div className="placeholder-content">
            <h2>Statistiques</h2>
            <p>Cette page est en cours de développement.</p>
          </div>
        );
      case 'finance':
        return (
          <div className="placeholder-content">
            <h2>Finances</h2>
            <p>Cette page est en cours de développement.</p>
          </div>
        );
      case 'users':
        return (
          <div className="placeholder-content">
            <h2>Utilisateurs</h2>
            <p>Cette page est en cours de développement.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="placeholder-content">
            <h2>Paramètres</h2>
            <p>Cette page est en cours de développement.</p>
          </div>
        );
      default:
        return <Dashboard onAction={handleAction} />;
    }
  };

  return (
    <div className="super-admin-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>TravelHub Admin</h1>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleTabChange('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Tableau de bord</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'agencies' ? 'active' : ''}`}
                onClick={() => handleTabChange('agencies')}
              >
                <span className="nav-icon">🏢</span>
                <span className="nav-text">Agences</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => handleTabChange('statistics')}
              >
                <span className="nav-icon">📈</span>
                <span className="nav-text">Statistiques</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`}
                onClick={() => handleTabChange('finance')}
              >
                <span className="nav-icon">💶</span>
                <span className="nav-text">Finances</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => handleTabChange('users')}
              >
                <span className="nav-icon">👥</span>
                <span className="nav-text">Utilisateurs</span>
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleTabChange('settings')}
              >
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Paramètres</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Déconnexion</span>
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="main-header">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <div className="user-name">Super Admin</div>
              <div className="user-role">Administrateur système</div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="header-action-button">
              <span>🔔</span>
            </button>
            <button className="header-action-button">
              <span>⚙️</span>
            </button>
          </div>
        </header>
        
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
