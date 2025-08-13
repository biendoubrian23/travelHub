import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SIMPLE_ROLES, hasPermission, getVisibleTabs, ROLE_THEME } from '../config/simpleRoles';

// Hook personnalisé pour gérer les permissions basées sur les rôles SIMPLES
export const useRolePermissions = () => {
  const { userProfile, employeeData, isAgencyOwner } = useAuth();
  
  // Déterminer le rôle effectif de l'utilisateur
  const getUserRole = () => {
    console.log('🔍 DEBUG - Détermination du rôle:');
    console.log('  - isAgencyOwner():', isAgencyOwner());
    console.log('  - userProfile:', userProfile);
    console.log('  - userProfile.role:', userProfile?.role);
    console.log('  - employeeData:', employeeData);
    
    // 👑 PATRON - Seul propriétaire de l'agence
    if (isAgencyOwner()) {
      console.log('  - Résultat: PATRON');
      return 'patron';
    }
    
    // Vérifier d'abord le rôle dans userProfile.role (table users)
    if (userProfile?.role) {
      console.log('  - userProfile.role trouvé:', userProfile.role);
      
      // Mapping des rôles de la table users vers les nouveaux rôles
      const userRoleMapping = {
        'agency_manager': 'manager',
        'agency_employee': 'employee', 
        'agency_driver': 'driver',
        'manager': 'manager',
        'employee': 'employee',
        'driver': 'driver',
        'admin': 'manager'
      };
      
      const mappedRole = userRoleMapping[userProfile.role];
      if (mappedRole) {
        console.log('  - Rôle mappé depuis userProfile:', mappedRole);
        return mappedRole;
      }
    }
    
    // Si pas trouvé dans userProfile, vérifier employeeData (ancien système)
    if (employeeData?.employee_role) {
      console.log('  - employee_role trouvé:', employeeData.employee_role);
      
      // Mapping des anciens rôles vers les nouveaux
      const roleMapping = {
        'admin': 'manager',
        'manager': 'manager', 
        'employee': 'employee',
        'driver': 'driver'
      };
      
      const mappedRole = roleMapping[employeeData.employee_role] || 'employee';
      console.log('  - Rôle mappé depuis employeeData:', mappedRole);
      return mappedRole;
    }
    
    console.log('  - Résultat par défaut: employee');
    return 'employee'; // Rôle par défaut
  };

  const currentRole = getUserRole();
  const roleConfig = SIMPLE_ROLES[currentRole] || SIMPLE_ROLES.employee;
  const theme = ROLE_THEME[currentRole] || ROLE_THEME.employee;

  // Vérifier si l'utilisateur peut voir un onglet
  const canViewTab = (tabName) => {
    return roleConfig.visibleTabs.includes(tabName);
  };

  // Vérifier les permissions pour un module spécifique
  const hasModulePermission = (module, action) => {
    return hasPermission(currentRole, module, action);
  };

  // Vérifier si c'est le patron (seul créateur de rôles)
  const isPatron = () => {
    return currentRole === 'patron';
  };

  // Vérifier si peut créer des employés - UNIQUEMENT LE PATRON
  const canManageEmployees = () => {
    return isPatron(); // UNIQUEMENT le Patron peut gérer les employés
  };

  // Obtenir les rôles que l'utilisateur peut créer
  const getCreatableRoles = () => {
    if (isPatron()) {
      return ['manager', 'employee', 'driver']; // Patron peut tout créer
    }
    if (currentRole === 'manager') {
      return ['employee', 'driver']; // Manager peut créer employee et driver
    }
    return []; // Autres rôles ne peuvent rien créer
  };
  
  // Cette fonction retourne les rôles disponibles au format complet (pour l'UI)
  const getAllEmployeeRoles = () => {
    // UNIQUEMENT le Patron peut voir et utiliser ces rôles
    if (isPatron()) {
      const roles = [
        { value: 'manager', label: 'Manager', description: 'Gestion équipe + réservations + finances' },
        { value: 'employee', label: 'Employé', description: 'Réservations + consultation' },
        { value: 'driver', label: 'Conducteur', description: 'Accès conducteur (lecture seule)' }
      ];
      return roles;
    }
    return [];
  };

  // Vérifier si peut créer un rôle spécifique
  const canCreateRole = (roleType) => {
    return getCreatableRoles().includes(roleType);
  };

  return {
    currentRole,
    roleConfig,
    theme,
    canViewTab,
    hasPermission: hasModulePermission,
    isPatron,
    canManageEmployees,
    getCreatableRoles,
    getAllEmployeeRoles, // Nouvelle fonction pour obtenir tous les rôles disponibles
    canCreateRole,
    getUserRole, // Ajouter la fonction getUserRole
    userProfile,
    employeeData
  };
};

// Composant pour l'affichage conditionnel basé sur les permissions
export const PermissionGuard = ({ 
  module, 
  action, 
  fallback = null, 
  children,
  requireRole = null 
}) => {
  const { hasPermission, currentRole } = useRolePermissions();

  // Vérification du rôle spécifique si requis
  if (requireRole && currentRole !== requireRole) {
    return fallback;
  }

  // Vérification des permissions
  if (module && action && !hasPermission(module, action)) {
    return fallback;
  }

  return children;
};

// Composant pour les onglets conditionnels
export const ConditionalTab = ({ tabName, children, fallback = null }) => {
  const { canViewTab } = useRolePermissions();

  if (!canViewTab(tabName)) {
    return fallback;
  }

  return children;
};

// Composant pour le header personnalisé par rôle
export const RoleBasedHeader = ({ currentModule }) => {
  const { currentRole, userProfile, roleConfig } = useRolePermissions();

  const getRoleIcon = () => {
    return roleConfig.icon || '👤';
  };

  const getRoleLabel = () => {
    return roleConfig.label || 'Utilisateur';
  };

  const getWelcomeMessage = () => {
    const messages = {
      patron: 'Bienvenue, Patron !',
      manager: 'Bienvenue, Manager !',
      employee: 'Bienvenue, Employé !',
      driver: 'Bienvenue, Conducteur !'
    };
    return messages[currentRole] || 'Bienvenue !';
  };

  return (
    <div className="role-based-header">
      <div className="user-role-info">
        <span className="role-icon">{getRoleIcon()}</span>
        <div className="role-details">
          <h3>{getWelcomeMessage()}</h3>
          <p className="role-subtitle">
            {userProfile?.full_name} • {getRoleLabel()}
          </p>
          {currentModule && (
            <p className="current-module">
              Module: {currentModule}
            </p>
          )}
        </div>
      </div>
      <div className="role-focus">
        <span className="focus-label">Description:</span>
        <span className="focus-value">{roleConfig.description}</span>
      </div>
    </div>
  );
};

// Composant spécialement pour la gestion des employés (Patron + Manager)
export const EmployeeManagementComponent = () => {
  const { canManageEmployees, getCreatableRoles, currentRole, isPatron } = useRolePermissions();

  if (!canManageEmployees()) {
    return (
      <div className="access-denied">
        <h3>🔒 Accès Restreint</h3>
        <p>Seuls le patron et les managers peuvent gérer les employés.</p>
      </div>
    );
  }

  const creatableRoles = getCreatableRoles();

  return (
    <div className="employee-management">
      <div className="management-header">
        <h2>
          {isPatron() ? '👑 Gestion des Employés (Patron)' : '👨‍💼 Gestion des Employés (Manager)'}
        </h2>
        <p>
          {isPatron() 
            ? 'En tant que patron, vous pouvez créer et gérer tous les rôles.'
            : 'En tant que manager, vous pouvez créer des employés et des conducteurs.'
          }
        </p>
      </div>
      
      <div className="role-creation-actions">
        {creatableRoles.includes('manager') && (
          <button className="create-role-btn manager" onClick={() => handleCreateRole('manager')}>
            👨‍💼 Créer Manager
          </button>
        )}
        
        {creatableRoles.includes('employee') && (
          <button className="create-role-btn employee" onClick={() => handleCreateRole('employee')}>
            👨‍💻 Créer Employé
          </button>
        )}
        
        {creatableRoles.includes('driver') && (
          <button className="create-role-btn driver" onClick={() => handleCreateRole('driver')}>
            🚗 Créer Conducteur
          </button>
        )}
      </div>
      
      <div className="role-permissions-info">
        <h4>📋 Permissions de création :</h4>
        <ul>
          {isPatron() ? (
            <>
              <li>✅ Manager (complet avec finances)</li>
              <li>✅ Employé (opérations sans finances)</li>
              <li>✅ Conducteur (consultation uniquement)</li>
            </>
          ) : (
            <>
              <li>❌ Manager (réservé au patron)</li>
              <li>✅ Employé (opérations sans finances)</li>
              <li>✅ Conducteur (consultation uniquement)</li>
            </>
          )}
        </ul>
      </div>
      
      <div className="existing-employees">
        <h3>Employés Existants</h3>
        {/* Ici on afficherait la liste des employés que le rôle peut gérer */}
      </div>
    </div>
  );
};

// Fonction pour créer un nouveau rôle (seulement pour le patron)
const handleCreateRole = (roleType) => {
  console.log(`Création d'un nouveau ${roleType} par le patron`);
  // Ici on ouvrirait un modal de création d'employé avec le rôle spécifié
};

// Composant pour afficher les actions selon le rôle
export const RoleBasedQuickActions = ({ context = 'global' }) => {
  const { currentRole, isPatron, canManageEmployees } = useRolePermissions();

  const getActionsForRole = () => {
    switch (currentRole) {
      case 'patron':
        return [
          { id: 'create-employee', label: 'Nouvel Employé', icon: '�', color: 'primary' },
          { id: 'financial-reports', label: 'Rapports Financiers', icon: '📊', color: 'success' },
          { id: 'manage-settings', label: 'Paramètres Agence', icon: '⚙️', color: 'info' },
          { id: 'view-analytics', label: 'Analytics', icon: '📈', color: 'warning' }
        ];
      case 'manager':
        return [
          { id: 'create-trip', label: 'Nouveau Trajet', icon: '🚌', color: 'primary' },
          { id: 'manage-prices', label: 'Gérer Prix', icon: '💰', color: 'success' },
          { id: 'view-bookings', label: 'Réservations', icon: '📋', color: 'info' },
          { id: 'create-employee-limited', label: 'Nouvel Employé', icon: '👤', color: 'secondary' }
        ];
      case 'employee':
        return [
          { id: 'add-trip', label: 'Ajouter Trajet', icon: '�', color: 'primary' },
          { id: 'manage-services', label: 'Gérer Services', icon: '⭐', color: 'success' },
          { id: 'customer-service', label: 'Service Client', icon: '📞', color: 'info' }
        ];
      case 'driver':
        return [
          { id: 'my-trips', label: 'Mes Trajets', icon: '�', color: 'primary' },
          { id: 'my-passengers', label: 'Mes Passagers', icon: '👥', color: 'info' },
          { id: 'trip-status', label: 'Statut Trajet', icon: '📍', color: 'success' }
        ];
      default:
        return [];
    }
  };

  const actions = getActionsForRole();

  return (
    <div className="role-based-quick-actions">
      <h4>Actions Rapides</h4>
      <div className="quick-actions-grid">
        {actions.map(action => (
          <button
            key={action.id}
            className={`quick-action-btn btn-${action.color}`}
            onClick={() => handleQuickAction(action.id)}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
      
      {canManageEmployees() && (
        <div className="employee-management-section">
          <h5>
            {isPatron() ? '👑 Actions Patron Exclusives' : '👨‍💼 Gestion Équipe'}
          </h5>
          <button 
            className="employee-management-btn"
            onClick={() => handleQuickAction('manage-employees')}
          >
            👥 {isPatron() ? 'Gérer Employés & Rôles' : 'Créer Employés/Conducteurs'}
          </button>
        </div>
      )}
    </div>
  );
};

// Fonction pour gérer les actions rapides
const handleQuickAction = (actionName) => {
  // Cette fonction sera appelée depuis les composants parents
  // pour gérer les actions spécifiques à chaque rôle
  console.log(`Action rapide: ${actionName}`);
  
  // Ici on peut dispatcher des actions Redux, naviguer, ouvrir des modals, etc.
  switch (actionName) {
    case 'create-employee':
      // Ouvrir modal de création d'employé
      break;
    case 'financial-reports':
      // Naviguer vers les rapports financiers
      break;
    case 'create-trips':
      // Ouvrir modal de création de trajet
      break;
    case 'daily-operations':
      // Afficher les tâches du jour
      break;
    case 'trip-execution':
      // Interface de démarrage de trajet
      break;
    default:
      console.log(`Action non implémentée: ${actionName}`);
  }
};

// Composant pour afficher les KPIs adaptés au rôle
export const RoleBasedKPIs = ({ data }) => {
  const { currentRole, getDashboardWidgets } = useRolePermissions();
  const widgets = getDashboardWidgets();

  // Filtrer et organiser les widgets par priorité
  const priorityWidgets = widgets
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4); // Afficher les 4 principaux

  return (
    <div className="role-based-kpis">
      <div className="kpis-grid">
        {priorityWidgets.map(widget => (
          <KPIWidget 
            key={widget.id}
            widget={widget}
            data={data?.[widget.id]}
            role={currentRole}
          />
        ))}
      </div>
    </div>
  );
};

// Composant individuel pour un widget KPI
const KPIWidget = ({ widget, data, role }) => {
  const getWidgetIcon = (type) => {
    const icons = {
      'metric-card': '📊',
      'chart': '📈',
      'table': '📋',
      'metric-grid': '🎯',
      'list': '📝',
      'alert-panel': '🚨',
      'team-grid': '👥',
      'progress-chart': '📊',
      'gauge-chart': '⚡',
      'task-list': '✅',
      'personal-metrics': '🏆',
      'customer-list': '👤',
      'trip-card': '🚌',
      'vehicle-panel': '🔧',
      'map-widget': '🗺️'
    };
    return icons[type] || '📊';
  };

  const isMobile = widget.mobile || role === 'driver';

  return (
    <div className={`kpi-widget ${widget.size} ${isMobile ? 'mobile' : ''}`}>
      <div className="widget-header">
        <span className="widget-icon">{getWidgetIcon(widget.type)}</span>
        <h4 className="widget-title">{widget.title}</h4>
      </div>
      <div className="widget-content">
        {/* Ici on renderait le contenu spécifique selon le type de widget */}
        {renderWidgetContent(widget, data)}
      </div>
    </div>
  );
};

// Fonction pour rendre le contenu des widgets
const renderWidgetContent = (widget, data) => {
  // Implémentation basique - à étendre selon les besoins
  switch (widget.type) {
    case 'metric-card':
      return (
        <div className="metric-card-content">
          {/* Contenu des métriques */}
          <div className="metric-value">
            {data?.value || '0'}
          </div>
          <div className="metric-label">
            {data?.label || widget.title}
          </div>
        </div>
      );
    
    case 'chart':
      return (
        <div className="chart-placeholder">
          📈 Graphique {widget.chartType}
        </div>
      );
    
    case 'task-list':
      return (
        <div className="task-list-content">
          {data?.tasks?.map((task, index) => (
            <div key={index} className="task-item">
              <span className="task-status">
                {task.completed ? '✅' : '⏳'}
              </span>
              <span className="task-description">{task.description}</span>
            </div>
          )) || <div>Aucune tâche</div>}
        </div>
      );
    
    default:
      return (
        <div className="widget-placeholder">
          Contenu du widget {widget.type}
        </div>
      );
  }
};

export default {
  useRolePermissions,
  PermissionGuard,
  ConditionalTab,
  RoleBasedHeader,
  RoleBasedQuickActions,
  RoleBasedKPIs
};
