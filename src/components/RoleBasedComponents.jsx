import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_CONFIGS, DASHBOARD_WIDGETS, ROLE_ACTIONS, ROLE_MESSAGES } from '../config/roleConfiguration';

// Hook personnalisé pour gérer les permissions basées sur les rôles
export const useRolePermissions = () => {
  const { userProfile, employeeData, isAgencyOwner } = useAuth();
  
  // Déterminer le rôle effectif de l'utilisateur
  const getUserRole = () => {
    if (isAgencyOwner()) return 'agence';
    if (employeeData?.employee_role) return employeeData.employee_role;
    return 'employee'; // Rôle par défaut
  };

  const currentRole = getUserRole();
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.employee;

  // Vérifier si l'utilisateur peut voir un onglet
  const canViewTab = (tabName) => {
    return roleConfig.visibleTabs.includes(tabName);
  };

  // Vérifier les permissions pour un module spécifique
  const hasPermission = (module, action) => {
    const modulePermissions = roleConfig.permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions.actions?.includes(action) || 
           modulePermissions.view?.includes(action);
  };

  // Obtenir les widgets du dashboard pour le rôle
  const getDashboardWidgets = () => {
    return DASHBOARD_WIDGETS[currentRole] || DASHBOARD_WIDGETS.employee;
  };

  // Obtenir les actions disponibles pour le rôle
  const getAvailableActions = (context = 'global') => {
    const actions = ROLE_ACTIONS[currentRole];
    if (!actions) return [];
    
    if (context === 'global') {
      return actions.global || [];
    }
    
    return actions.contextual?.[context] || [];
  };

  // Obtenir les messages personnalisés pour le rôle
  const getRoleMessages = () => {
    return ROLE_MESSAGES[currentRole] || ROLE_MESSAGES.employee;
  };

  return {
    currentRole,
    roleConfig,
    canViewTab,
    hasPermission,
    getDashboardWidgets,
    getAvailableActions,
    getRoleMessages,
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
  const { getRoleMessages, currentRole, userProfile } = useRolePermissions();
  const messages = getRoleMessages();

  const getRoleIcon = () => {
    const icons = {
      agence: '🏢',
      admin: '👨‍💼',
      manager: '👔',
      employee: '👨‍💻',
      driver: '🚐'
    };
    return icons[currentRole] || '👤';
  };

  const getRoleLabel = () => {
    const labels = {
      agence: 'Directeur Général',
      admin: 'Administrateur',
      manager: 'Manager',
      employee: 'Employé',
      driver: 'Chauffeur'
    };
    return labels[currentRole] || 'Utilisateur';
  };

  return (
    <div className="role-based-header">
      <div className="user-role-info">
        <span className="role-icon">{getRoleIcon()}</span>
        <div className="role-details">
          <h3>{messages.welcome}</h3>
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
        <span className="focus-label">Focus:</span>
        <span className="focus-value">{messages.primary_focus}</span>
      </div>
    </div>
  );
};

// Composant pour les actions rapides basées sur le rôle
export const RoleBasedQuickActions = ({ context = 'global' }) => {
  const { getAvailableActions, currentRole } = useRolePermissions();
  const actions = getAvailableActions(context);

  if (!actions.length) return null;

  const getActionConfig = (actionName) => {
    const configs = {
      // Actions Patron
      'create-employee': { 
        label: 'Nouvel Employé', 
        icon: '👤', 
        color: 'primary',
        shortcut: 'Ctrl+N'
      },
      'financial-reports': { 
        label: 'Rapports Financiers', 
        icon: '📊', 
        color: 'success',
        shortcut: 'Ctrl+R'
      },
      'strategic-planning': { 
        label: 'Planification', 
        icon: '🎯', 
        color: 'info' 
      },

      // Actions Admin
      'operational-management': { 
        label: 'Gestion Opérations', 
        icon: '⚙️', 
        color: 'primary' 
      },
      'team-coordination': { 
        label: 'Coordination Équipe', 
        icon: '👥', 
        color: 'secondary' 
      },
      'create-trips': { 
        label: 'Nouveau Trajet', 
        icon: '🚌', 
        color: 'primary' 
      },

      // Actions Manager
      'team-supervision': { 
        label: 'Supervision', 
        icon: '👔', 
        color: 'info' 
      },
      'quality-control': { 
        label: 'Contrôle Qualité', 
        icon: '⭐', 
        color: 'warning' 
      },
      'goal-management': { 
        label: 'Gestion Objectifs', 
        icon: '🎯', 
        color: 'success' 
      },

      // Actions Employé
      'daily-operations': { 
        label: 'Mes Tâches', 
        icon: '📋', 
        color: 'primary' 
      },
      'customer-service': { 
        label: 'Service Client', 
        icon: '📞', 
        color: 'info' 
      },
      'booking-processing': { 
        label: 'Traiter Réservation', 
        icon: '🎫', 
        color: 'success' 
      },

      // Actions Chauffeur
      'trip-execution': { 
        label: 'Démarrer Trajet', 
        icon: '🚐', 
        color: 'primary' 
      },
      'passenger-management': { 
        label: 'Gestion Passagers', 
        icon: '👥', 
        color: 'info' 
      },
      'departure-confirmation': { 
        label: 'Confirmer Départ', 
        icon: '✅', 
        color: 'success' 
      }
    };

    return configs[actionName] || { 
      label: actionName, 
      icon: '⚡', 
      color: 'default' 
    };
  };

  return (
    <div className="role-based-quick-actions">
      <h4>Actions Rapides</h4>
      <div className="quick-actions-grid">
        {actions.slice(0, 6).map(action => {
          const config = getActionConfig(action);
          return (
            <button
              key={action}
              className={`quick-action-btn btn-${config.color}`}
              title={config.shortcut ? `${config.label} (${config.shortcut})` : config.label}
              onClick={() => handleQuickAction(action)}
            >
              <span className="action-icon">{config.icon}</span>
              <span className="action-label">{config.label}</span>
              {config.shortcut && (
                <span className="action-shortcut">{config.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
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
