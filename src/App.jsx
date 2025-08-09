import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import InvitationPage from './components/Auth/InvitationPage';
import EmployeeManagement from './components/Admin/EmployeeManagement';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import BusManagement from './components/Bus/BusManagement';
import TripsManagement from './components/Trips/TripsManagement';
import TripsCalendar from './components/Trips/TripsCalendar';
import BookingsManagement from './components/Bookings/BookingsManagement';
import BookingsCalendar from './components/Bookings/BookingsCalendar';
import ProgressLoader from './components/UI/ProgressLoader';
import { 
  useRolePermissions, 
  RoleBasedHeader, 
  ConditionalTab,
  EmployeeManagementComponent
} from './components/RoleBasedComponents';
import './components/EmployeeManagement.css';
import './App.css';

function LoadingSpinner() {
  return <ProgressLoader />;
}

function AppContent() {
  const { user, loading, userProfile, agency } = useAuth();
  
  // 🔬 DEBUG: Vérifier pourquoi loading reste true
  console.log('🔍 App.jsx état:', {
    loading,
    hasUser: !!user,
    hasUserProfile: !!userProfile,
    userEmail: user?.email,
    profileName: userProfile?.full_name
  });
  
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

  // 👑 SUPER ADMIN - Interface spéciale
  if (userProfile.role === 'super_admin') {
    return <SuperAdminApp />;
  }

  // Vérifier si l'agence est vérifiée
  if (agency && !agency.is_verified) {
    return <AgencyPendingVerification />;
  }

  return <MainApp />;
}

function AuthPages() {
  return <Login />;
}

function MainApp() {
  const { userProfile, agency, hasPermission, signOut } = useAuth();
  const { currentRole, canViewTab, isPatron } = useRolePermissions();
  
  // Page par défaut selon le rôle
  const getDefaultTab = () => {
    // Pour les employés et conducteurs, la page par défaut est "trips"
    if (currentRole === 'employee' || currentRole === 'driver') {
      return 'trips';
    }
    // Pour le patron et manager, garde le dashboard
    return 'dashboard';
  };
  
  const [activeRoute, setActiveRoute] = useState(getDefaultTab());

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
    const getPageTitle = () => {
      const titles = {
        'dashboard': 'Dashboard',
        'trips': 'Gestion des Trajets',
        'bookings': 'Gestion des Réservations',
        'buses': 'Gestion des Bus',
        'employees': 'Gestion des Employés',
        'activity': 'Activité',
        'settings': 'Paramètres'
      };
      return titles[activeRoute] || 'Dashboard';
    };

    const content = (() => {
      switch (activeRoute) {
        case 'dashboard':
          return (
            <ConditionalTab tabName="dashboard" fallback={<div className="access-denied">
              <h3>🔒 Accès Restreint</h3>
              <p>Seul le patron de l'agence a accès au dashboard.</p>
            </div>}>
              <Dashboard />
            </ConditionalTab>
          );
        case 'trips':
          return (
            <ConditionalTab tabName="trips" fallback={<div className="access-denied">
              <h3>🔒 Accès Restreint</h3>
              <p>Vous n'avez pas accès à cette section.</p>
            </div>}>
              <TripsCalendar />
            </ConditionalTab>
          );
        case 'bookings':
          return (
            <ConditionalTab tabName="bookings" fallback={<div className="access-denied">
              <h3>🔒 Accès Restreint</h3>
              <p>Vous n'avez pas accès à cette section.</p>
            </div>}>
              <BookingsCalendar />
            </ConditionalTab>
          );
        case 'buses':
          return (
            <ConditionalTab tabName="buses" fallback={<div className="access-denied">
              <h3>🔒 Accès Restreint</h3>
              <p>Vous n'avez pas accès à cette section.</p>
            </div>}>
              <BusManagement />
            </ConditionalTab>
          );
        case 'employees':
          return <EmployeeManagement />;
        case 'activity':
          return (
            <ConditionalTab tabName="activity" fallback={<div className="access-denied">
              <h3>🔒 Accès Restreint</h3>
              <p>Vous n'avez pas accès à cette section.</p>
            </div>}>
              <div className="page-placeholder">
                <h2 className="text-title">Activité</h2>
                <p className="text-caption">Page en cours de développement...</p>
              </div>
            </ConditionalTab>
          );
        case 'settings':
          return (
            <ConditionalTab tabName="settings" fallback={<div className="access-denied">
              <h3>🔒 Accès Restreint</h3>
              <p>Vous n'avez pas accès à cette section.</p>
            </div>}>
              <div className="page-placeholder">
                <h2 className="text-title">Paramètres</h2>
                <p className="text-caption">Page en cours de développement...</p>
              </div>
            </ConditionalTab>
          );
        case 'test-roles':
          return (
            <div style={{ padding: '20px' }}>
              <h2>🧪 Test du Système de Rôles</h2>
              <p>Vérifiez les fonctionnalités selon votre rôle actuel.</p>
            </div>
          );
        default:
          return <Dashboard />;
      }
    })();

    return (
      <div className="main-content-wrapper">
        <RoleBasedHeader currentModule={getPageTitle()} />
        <div className="page-content">
          {content}
        </div>
      </div>
    );
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

// 👑 COMPOSANT SUPER ADMIN
function SuperAdminApp() {
  return (
    <div className="super-admin-app">
      {/* Utilisation du nouveau composant amélioré de SuperAdmin */}
      <SuperAdminDashboard />
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
