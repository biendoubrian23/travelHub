import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import InvitationPage from './components/Auth/InvitationPage';
import EmployeeManagement from './components/Admin/EmployeeManagement';
import './App.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Chargement...</p>
    </div>
  );
}

function AppContent() {
  const { user, loading, userProfile, agency } = useAuth();
  
  // Vérifier si on est sur une page d'invitation
  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get('token');
  const isInvitationPage = window.location.pathname === '/invitation' || invitationToken;
  
  if (loading) {
    return <LoadingSpinner />;
  }

  // Page d'invitation - accessible sans authentification
  if (isInvitationPage) {
    return <InvitationPage />;
  }

  if (!user || !userProfile) {
    return <AuthPages />;
  }

  // Vérifier si l'agence est vérifiée
  if (agency && !agency.is_verified) {
    return <AgencyPendingVerification />;
  }

  return <MainApp />;
}

function AuthPages() {
  const [showRegister, setShowRegister] = useState(false);

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  if (showRegister) {
    return (
      <Register 
        onBackToLogin={handleBackToLogin}
      />
    );
  }
  
  return (
    <Login 
      onShowRegister={handleShowRegister}
    />
  );
}

function MainApp() {
  const { userProfile, agency, hasPermission, signOut } = useAuth();
  const [activeRoute, setActiveRoute] = useState('dashboard');

  const handleLogout = async () => {
    try {
      console.log('🔄 Début de la déconnexion...')
      const { error } = await signOut()
      if (error) {
        console.error('❌ Erreur lors de la déconnexion:', error)
        // Même en cas d'erreur, on redirige vers la page de connexion
      } else {
        console.log('✅ Déconnexion réussie')
      }
      // La redirection se fera automatiquement via le AuthContext
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la déconnexion:', error)
      // En cas d'erreur critique, on force un rechargement de la page
      window.location.reload()
    }
  }

  const renderContent = () => {
    switch (activeRoute) {
      case 'dashboard':
        return <Dashboard />;
      case 'trips':
        return <div className="page-placeholder">
          <h2 className="text-title">Gestion des Trajets</h2>
          <p className="text-caption">Page en cours de développement...</p>
        </div>;
      case 'bookings':
        return <div className="page-placeholder">
          <h2 className="text-title">Gestion des Réservations</h2>
          <p className="text-caption">Page en cours de développement...</p>
        </div>;
      case 'customers':
        return <div className="page-placeholder">
          <h2 className="text-title">Gestion des Clients</h2>
          <p className="text-caption">Page en cours de développement...</p>
        </div>;
      case 'employees':
        return <EmployeeManagement />;
      case 'activity':
        return <div className="page-placeholder">
          <h2 className="text-title">Activité</h2>
          <p className="text-caption">Page en cours de développement...</p>
        </div>;
      case 'settings':
        return <div className="page-placeholder">
          <h2 className="text-title">Paramètres</h2>
          <p className="text-caption">Page en cours de développement...</p>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Sidebar 
        activeRoute={activeRoute}
        onRouteChange={setActiveRoute}
        onLogout={handleLogout}
        userRole={userProfile?.role}
        hasPermission={hasPermission}
        userProfile={userProfile}
        agency={agency}
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

function AgencyPendingVerification() {
  const { agency, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      console.log('🔄 Déconnexion depuis la page de vérification...')
      const { error } = await signOut()
      if (error) {
        console.error('❌ Erreur lors de la déconnexion:', error)
      } else {
        console.log('✅ Déconnexion réussie')
      }
    } catch (error) {
      console.error('❌ Erreur inattendue:', error)
      window.location.reload()
    }
  }

  return (
    <div className="pending-verification">
      <div className="pending-card">
        <div className="pending-icon">⏳</div>
        <h2>Agence en cours de vérification</h2>
        <p>
          Votre agence "{agency?.name}" est en cours de vérification par notre équipe.
          Vous recevrez un email de confirmation une fois la vérification terminée.
        </p>
        <p className="pending-note">
          Ce processus peut prendre 24 à 48 heures ouvrables.
        </p>
        <button 
          onClick={handleSignOut}
          className="btn btn-outline"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
