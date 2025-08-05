// Configuration des permissions et visibilité par rôle
// Inspiré de FlixBus pour une expérience utilisateur optimale

export const ROLE_CONFIGS = {
  // 🏢 PATRON D'AGENCE - Accès complet stratégique
  agence: {
    visibleTabs: ['dashboard', 'trips', 'bookings', 'customers', 'employees', 'activity', 'settings'],
    permissions: {
      dashboard: {
        view: ['strategic-kpis', 'financial-overview', 'growth-metrics', 'employee-performance', 'market-analysis'],
        actions: ['export-reports', 'set-targets', 'view-predictions', 'configure-kpis']
      },
      trips: {
        view: ['all-trips', 'profitability-analysis', 'route-optimization', 'seasonal-trends'],
        actions: ['create-route', 'modify-pricing', 'strategic-planning', 'market-expansion']
      },
      bookings: {
        view: ['all-bookings', 'revenue-analytics', 'conversion-analysis', 'customer-segmentation'],
        actions: ['override-policies', 'bulk-operations', 'advanced-reporting', 'pricing-strategy']
      },
      customers: {
        view: ['customer-analytics', 'lifetime-value', 'segmentation', 'retention-analysis'],
        actions: ['marketing-campaigns', 'loyalty-programs', 'vip-management', 'strategic-initiatives']
      },
      employees: {
        view: ['all-employees', 'performance-analytics', 'cost-analysis', 'organizational-chart'],
        actions: ['hire-employees', 'set-salaries', 'performance-reviews', 'strategic-hr']
      },
      activity: {
        view: ['executive-dashboard', 'business-intelligence', 'predictive-analytics', 'market-intelligence'],
        actions: ['strategic-decisions', 'goal-setting', 'resource-allocation', 'expansion-planning']
      },
      settings: {
        view: ['all-settings', 'financial-config', 'strategic-parameters', 'integrations'],
        actions: ['global-configuration', 'financial-settings', 'strategic-planning', 'system-administration']
      }
    },
    dashboardLayout: {
      primary: ['revenue-overview', 'growth-metrics', 'market-position'],
      secondary: ['employee-performance', 'operational-efficiency', 'customer-satisfaction'],
      charts: ['revenue-trends', 'route-profitability', 'market-share', 'growth-projections']
    }
  },

  // 👨‍💼 ADMIN AGENCE - Gestion opérationnelle complète
  admin: {
    visibleTabs: ['dashboard', 'trips', 'bookings', 'customers', 'employees', 'activity', 'settings'],
    permissions: {
      dashboard: {
        view: ['operational-kpis', 'daily-metrics', 'alerts', 'team-performance', 'system-health'],
        actions: ['manage-operations', 'handle-alerts', 'team-coordination', 'operational-reports']
      },
      trips: {
        view: ['all-trips', 'operational-details', 'resource-allocation', 'scheduling'],
        actions: ['create-trips', 'modify-trips', 'assign-resources', 'manage-schedules']
      },
      bookings: {
        view: ['all-bookings', 'operational-metrics', 'payment-processing', 'customer-service'],
        actions: ['process-bookings', 'handle-modifications', 'manage-payments', 'customer-support']
      },
      customers: {
        view: ['customer-database', 'service-history', 'complaints', 'loyalty-status'],
        actions: ['manage-customers', 'process-complaints', 'loyalty-management', 'customer-communications']
      },
      employees: {
        view: ['team-overview', 'performance-monitoring', 'scheduling', 'training-needs'],
        actions: ['create-employees', 'manage-schedules', 'conduct-evaluations', 'coordinate-training']
      },
      activity: {
        view: ['operational-monitoring', 'system-logs', 'performance-tracking', 'quality-metrics'],
        actions: ['system-monitoring', 'quality-control', 'process-optimization', 'team-management']
      },
      settings: {
        view: ['operational-settings', 'team-configuration', 'process-settings'],
        actions: ['configure-operations', 'manage-team-settings', 'optimize-processes']
      }
    },
    dashboardLayout: {
      primary: ['daily-operations', 'team-status', 'system-alerts'],
      secondary: ['booking-queue', 'resource-utilization', 'performance-metrics'],
      charts: ['daily-trends', 'team-performance', 'operational-efficiency']
    }
  },

  // 👔 MANAGER - Supervision équipe et opérations
  manager: {
    visibleTabs: ['dashboard', 'trips', 'bookings', 'customers', 'activity', 'settings'],
    permissions: {
      dashboard: {
        view: ['team-kpis', 'supervision-metrics', 'quality-indicators', 'goal-tracking'],
        actions: ['team-coordination', 'goal-setting', 'quality-monitoring', 'team-reports']
      },
      trips: {
        view: ['supervised-trips', 'team-assignments', 'quality-metrics', 'schedule-overview'],
        actions: ['coordinate-trips', 'adjust-schedules', 'quality-control', 'team-guidance']
      },
      bookings: {
        view: ['team-bookings', 'quality-metrics', 'customer-feedback', 'performance-tracking'],
        actions: ['supervise-bookings', 'quality-assurance', 'team-support', 'performance-coaching']
      },
      customers: {
        view: ['team-customers', 'service-quality', 'feedback-analysis', 'relationship-management'],
        actions: ['supervise-service', 'handle-escalations', 'coach-team', 'relationship-building']
      },
      activity: {
        view: ['team-activity', 'performance-analytics', 'quality-monitoring', 'goal-progress'],
        actions: ['team-management', 'performance-reviews', 'goal-tracking', 'quality-improvement']
      },
      settings: {
        view: ['team-settings', 'goal-configuration', 'quality-parameters'],
        actions: ['configure-team', 'set-goals', 'quality-standards']
      }
    },
    dashboardLayout: {
      primary: ['team-overview', 'goal-progress', 'quality-metrics'],
      secondary: ['individual-performance', 'customer-satisfaction', 'operational-quality'],
      charts: ['team-trends', 'goal-tracking', 'quality-evolution']
    }
  },

  // 👨‍💻 EMPLOYÉ - Opérations quotidiennes
  employee: {
    visibleTabs: ['dashboard', 'trips', 'bookings', 'customers', 'activity', 'settings'],
    permissions: {
      dashboard: {
        view: ['personal-kpis', 'daily-tasks', 'personal-goals', 'achievements'],
        actions: ['track-progress', 'update-status', 'view-training', 'personal-reports']
      },
      trips: {
        view: ['available-trips', 'schedules', 'basic-info', 'customer-information'],
        actions: ['search-trips', 'provide-information', 'assist-customers']
      },
      bookings: {
        view: ['customer-bookings', 'booking-process', 'payment-status', 'customer-history'],
        actions: ['create-bookings', 'modify-bookings', 'process-payments', 'customer-service']
      },
      customers: {
        view: ['customer-profiles', 'booking-history', 'preferences', 'contact-information'],
        actions: ['update-profiles', 'contact-customers', 'provide-support', 'collect-feedback']
      },
      activity: {
        view: ['personal-activity', 'performance-metrics', 'training-progress', 'achievements'],
        actions: ['update-activity', 'access-training', 'track-goals', 'submit-feedback']
      },
      settings: {
        view: ['personal-settings', 'notification-preferences', 'interface-customization'],
        actions: ['update-profile', 'customize-interface', 'manage-notifications']
      }
    },
    dashboardLayout: {
      primary: ['my-tasks', 'my-performance', 'my-goals'],
      secondary: ['customer-queue', 'daily-achievements', 'training-updates'],
      charts: ['personal-progress', 'goal-achievement', 'skill-development']
    }
  },

  // 🚐 CHAUFFEUR - Interface mobile optimisée
  driver: {
    visibleTabs: ['dashboard', 'trips', 'bookings', 'activity', 'settings'],
    permissions: {
      dashboard: {
        view: ['driver-kpis', 'vehicle-status', 'route-info', 'passenger-info', 'schedule'],
        actions: ['update-status', 'report-issues', 'communicate-dispatch', 'log-activities']
      },
      trips: {
        view: ['assigned-trips', 'route-details', 'passenger-list', 'special-instructions'],
        actions: ['confirm-departure', 'update-location', 'report-delays', 'passenger-management']
      },
      bookings: {
        view: ['passenger-manifest', 'boarding-status', 'special-needs', 'contact-info'],
        actions: ['validate-tickets', 'check-in-passengers', 'update-boarding', 'passenger-assistance']
      },
      activity: {
        view: ['driving-logs', 'vehicle-reports', 'performance-metrics', 'safety-records'],
        actions: ['log-activities', 'report-incidents', 'update-vehicle-status', 'safety-checks']
      },
      settings: {
        view: ['driver-profile', 'vehicle-settings', 'mobile-preferences', 'emergency-contacts'],
        actions: ['update-profile', 'vehicle-configuration', 'emergency-procedures']
      }
    },
    dashboardLayout: {
      primary: ['current-trip', 'vehicle-status', 'passenger-count'],
      secondary: ['next-trip', 'route-navigation', 'emergency-contacts'],
      mobile: true, // Interface mobile optimisée
      charts: ['trip-history', 'performance-metrics', 'safety-score']
    }
  }
};

// Configuration des widgets de dashboard par rôle
export const DASHBOARD_WIDGETS = {
  agence: [
    {
      id: 'revenue-overview',
      title: 'Vue d\'ensemble des revenus',
      type: 'metric-card',
      size: 'large',
      priority: 1,
      data: ['monthly-revenue', 'yearly-growth', 'profit-margin']
    },
    {
      id: 'growth-metrics',
      title: 'Métriques de croissance',
      type: 'chart',
      size: 'medium',
      priority: 2,
      chartType: 'line',
      data: ['monthly-growth', 'customer-acquisition', 'market-share']
    },
    {
      id: 'route-profitability',
      title: 'Rentabilité par ligne',
      type: 'table',
      size: 'large',
      priority: 3,
      data: ['route-revenue', 'route-costs', 'route-profit']
    },
    {
      id: 'employee-performance',
      title: 'Performance des employés',
      type: 'chart',
      size: 'medium',
      priority: 4,
      chartType: 'bar',
      data: ['employee-sales', 'employee-satisfaction', 'employee-productivity']
    }
  ],

  admin: [
    {
      id: 'daily-operations',
      title: 'Opérations du jour',
      type: 'metric-grid',
      size: 'large',
      priority: 1,
      data: ['daily-bookings', 'active-trips', 'revenue-today', 'customer-satisfaction']
    },
    {
      id: 'booking-queue',
      title: 'File d\'attente réservations',
      type: 'list',
      size: 'medium',
      priority: 2,
      data: ['pending-bookings', 'priority-customers', 'urgent-requests']
    },
    {
      id: 'system-alerts',
      title: 'Alertes système',
      type: 'alert-panel',
      size: 'medium',
      priority: 3,
      data: ['system-issues', 'operational-alerts', 'maintenance-needs']
    },
    {
      id: 'team-performance',
      title: 'Performance équipe',
      type: 'chart',
      size: 'large',
      priority: 4,
      chartType: 'mixed',
      data: ['team-productivity', 'goal-achievement', 'customer-satisfaction']
    }
  ],

  manager: [
    {
      id: 'team-overview',
      title: 'Vue d\'ensemble équipe',
      type: 'team-grid',
      size: 'large',
      priority: 1,
      data: ['team-members', 'team-performance', 'team-goals']
    },
    {
      id: 'goal-progress',
      title: 'Progression des objectifs',
      type: 'progress-chart',
      size: 'medium',
      priority: 2,
      data: ['individual-goals', 'team-goals', 'monthly-targets']
    },
    {
      id: 'quality-metrics',
      title: 'Métriques qualité',
      type: 'gauge-chart',
      size: 'medium',
      priority: 3,
      data: ['service-quality', 'customer-satisfaction', 'process-efficiency']
    }
  ],

  employee: [
    {
      id: 'my-tasks',
      title: 'Mes tâches du jour',
      type: 'task-list',
      size: 'large',
      priority: 1,
      data: ['pending-tasks', 'urgent-tasks', 'completed-tasks']
    },
    {
      id: 'my-performance',
      title: 'Ma performance',
      type: 'personal-metrics',
      size: 'medium',
      priority: 2,
      data: ['personal-sales', 'customer-satisfaction', 'goal-progress']
    },
    {
      id: 'customer-queue',
      title: 'File clients',
      type: 'customer-list',
      size: 'medium',
      priority: 3,
      data: ['waiting-customers', 'callback-list', 'priority-customers']
    }
  ],

  driver: [
    {
      id: 'current-trip',
      title: 'Trajet en cours',
      type: 'trip-card',
      size: 'large',
      priority: 1,
      mobile: true,
      data: ['trip-details', 'passenger-count', 'eta', 'route-status']
    },
    {
      id: 'vehicle-status',
      title: 'État du véhicule',
      type: 'vehicle-panel',
      size: 'medium',
      priority: 2,
      mobile: true,
      data: ['fuel-level', 'maintenance-status', 'vehicle-health']
    },
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'map-widget',
      size: 'large',
      priority: 3,
      mobile: true,
      data: ['gps-location', 'route-map', 'traffic-info']
    }
  ]
};

// Configuration des actions par rôle et contexte
export const ROLE_ACTIONS = {
  agence: {
    global: ['create-employee', 'financial-reports', 'strategic-planning', 'system-configuration'],
    contextual: {
      trips: ['create-route', 'pricing-strategy', 'market-analysis'],
      bookings: ['override-policies', 'bulk-operations', 'advanced-analytics'],
      customers: ['marketing-campaigns', 'loyalty-programs', 'vip-management'],
      employees: ['hire-fire', 'salary-management', 'organizational-changes']
    }
  },

  admin: {
    global: ['operational-management', 'team-coordination', 'system-monitoring'],
    contextual: {
      trips: ['create-trips', 'assign-resources', 'schedule-management'],
      bookings: ['process-bookings', 'payment-processing', 'customer-support'],
      customers: ['customer-management', 'complaint-resolution', 'service-coordination'],
      employees: ['team-management', 'performance-monitoring', 'training-coordination']
    }
  },

  manager: {
    global: ['team-supervision', 'quality-control', 'goal-management'],
    contextual: {
      trips: ['coordinate-assignments', 'quality-monitoring'],
      bookings: ['supervise-processing', 'escalation-handling'],
      customers: ['service-supervision', 'relationship-management'],
      employees: ['performance-coaching', 'goal-setting', 'team-development']
    }
  },

  employee: {
    global: ['daily-operations', 'customer-service', 'task-completion'],
    contextual: {
      trips: ['information-provision', 'customer-assistance'],
      bookings: ['booking-processing', 'payment-handling', 'customer-communication'],
      customers: ['profile-management', 'service-delivery', 'feedback-collection']
    }
  },

  driver: {
    global: ['trip-execution', 'passenger-management', 'vehicle-operation'],
    contextual: {
      trips: ['departure-confirmation', 'location-updates', 'passenger-coordination'],
      bookings: ['ticket-validation', 'passenger-check-in', 'boarding-assistance'],
      activity: ['activity-logging', 'incident-reporting', 'safety-compliance']
    }
  }
};

// Messages et labels personnalisés par rôle
export const ROLE_MESSAGES = {
  agence: {
    welcome: 'Bienvenue dans votre tableau de bord stratégique',
    dashboard_subtitle: 'Vue d\'ensemble de votre agence de transport',
    primary_focus: 'Croissance et rentabilité'
  },
  admin: {
    welcome: 'Centre de contrôle opérationnel',
    dashboard_subtitle: 'Gestion des opérations quotidiennes',
    primary_focus: 'Efficacité opérationnelle'
  },
  manager: {
    welcome: 'Supervision et coordination d\'équipe',
    dashboard_subtitle: 'Performance et qualité de service',
    primary_focus: 'Excellence d\'équipe'
  },
  employee: {
    welcome: 'Votre espace de travail personnel',
    dashboard_subtitle: 'Vos tâches et performances du jour',
    primary_focus: 'Service client de qualité'
  },
  driver: {
    welcome: 'Interface conducteur mobile',
    dashboard_subtitle: 'Vos trajets et informations essentielles',
    primary_focus: 'Sécurité et ponctualité'
  }
};

// Export pour utilisation dans les composants
export default {
  ROLE_CONFIGS,
  DASHBOARD_WIDGETS,
  ROLE_ACTIONS,
  ROLE_MESSAGES
};
