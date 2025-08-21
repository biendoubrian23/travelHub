import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RefreshButton from '../UI/RefreshButton';
import { useRefresh } from '../../hooks/useRefresh';
import './SuperAdminDashboard.css';

// Import des composants nécessaires
import Dashboard from './Dashboard';
import Agencies from './Agencies';
import Users from './Users';
import Statistics from './Statistics';
import Finance from './Finance';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const { signOut } = useAuth();
  
  // Fonction pour actualiser les données du super admin
  const refreshSuperAdminData = async () => {
    console.log('🔄 Actualisation des données Super Admin...');
    // Ici vous pouvez ajouter la logique pour recharger les données
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation
    console.log('✅ Données Super Admin actualisées');
  };

  // Hook pour gérer le rechargement
  const { refresh } = useRefresh(refreshSuperAdminData);
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  const handleLogout = async () => {
    try {
      console.log('🔄 Déconnexion du super admin...');
      await signOut();
      // La redirection sera gérée par le contexte d'authentification
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
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
  
  // Rendu du contenu en fonction de l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onAction={handleAction} />;
      case 'agencies':
        return <Agencies />;
      case 'users':
        return <Users />;
      case 'statistics':
        return <Statistics />;
      case 'finance':
        return <Finance />;
      default:
        return <Dashboard onAction={handleAction} />;
    }
  };

  return (
    <div className="sadmin-dashboard">
      {/* Bouton de rechargement */}
      <RefreshButton 
        onRefresh={refresh}
        tooltip="Actualiser les données Super Admin"
      />
      
      <div className="sadmin-header">
        <div className="sadmin-user-info">
          <div className="sadmin-avatar">
            <img src="/src/assets/react.svg" alt="Super Admin" onError={(e) => {
              e.target.onerror = null;
              // Utiliser une image locale ou simplement un bloc de couleur
              e.target.style.backgroundColor = "#ccc";
              e.target.style.width = "40px";
              e.target.style.height = "40px";
              e.target.style.borderRadius = "50%";
              e.target.style.display = "block";
              e.target.alt = "Admin";
              // Supprimer l'attribut src pour éviter d'autres requêtes
              e.target.removeAttribute("src");
            }} />
          </div>
          <div className="sadmin-user-details">
            <h2>Super Admin</h2>
            <p>Administrateur système</p>
          </div>
        </div>
        <div className="sadmin-header-actions">
          <button className="sadmin-notifications">
            <span className="sadmin-icon">🔔</span>
          </button>
          <button className="sadmin-settings">
            <span className="sadmin-icon">⚙️</span>
          </button>
        </div>
      </div>

      <div className="sadmin-main">
        <div className="sadmin-sidebar">
          <div className="sadmin-logo">
            <h1>TravelHub Admin</h1>
          </div>
          <nav className="sadmin-nav">
            <ul>
              <li className={activeTab === 'dashboard' ? 'active' : ''}>
                <button onClick={() => handleTabChange('dashboard')}>
                  <span className="sadmin-icon">📊</span>
                  Tableau de bord
                </button>
              </li>
              <li className={activeTab === 'agencies' ? 'active' : ''}>
                <button onClick={() => handleTabChange('agencies')}>
                  <span className="sadmin-icon">🏢</span>
                  Agences
                </button>
              </li>
              <li className={activeTab === 'users' ? 'active' : ''}>
                <button onClick={() => handleTabChange('users')}>
                  <span className="sadmin-icon">👥</span>
                  Utilisateurs
                </button>
              </li>
              <li className={activeTab === 'statistics' ? 'active' : ''}>
                <button onClick={() => handleTabChange('statistics')}>
                  <span className="sadmin-icon">📈</span>
                  Statistiques
                </button>
              </li>
              <li className={activeTab === 'finance' ? 'active' : ''}>
                <button onClick={() => handleTabChange('finance')}>
                  <span className="sadmin-icon">💰</span>
                  Finances
                </button>
              </li>
            </ul>
          </nav>
          <div className="sadmin-sidebar-footer">
            <button className="sadmin-logout" onClick={handleLogout}>
              <span className="sadmin-icon">🚪</span>
              Déconnexion
            </button>
          </div>
        </div>

        <div className="sadmin-content">
          <h1 className="sadmin-page-title">
            {activeTab === 'dashboard' && 'Tableau de bord'}
            {activeTab === 'agencies' && 'Gestion des agences'}
            {activeTab === 'users' && 'Gestion des utilisateurs'}
            {activeTab === 'statistics' && 'Statistiques'}
            {activeTab === 'finance' && 'Finances'}
          </h1>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
