// Configuration simple des rôles - Style iOS épuré
// 3 rôles simples et efficaces pour la gestion d'agence

export const SIMPLE_ROLES = {
  // � PATRON - Propriétaire de l'agence (SEUL CRÉATEUR DE RÔLES)
  patron: {
    label: 'Patron',
    icon: '👑',
    color: '#8B5CF6', // Violet Royal
    description: 'Propriétaire agence - Contrôle total',
    
    // Onglets visibles - TOUT sauf customers
    visibleTabs: [
      'dashboard',
      'trips', 
      'bookings',
      'buses', // 🚌 Gestion des bus
      'finances',
      'employees', // 👥 Gestion des employés - EXCLUSIF PATRON
      'settings'
    ],
    
    // Permissions complètes + création de rôles
    permissions: {
      // 👥 GESTION EMPLOYÉS - EXCLUSIF PATRON
      employees: {
        create: true,
        edit: true,
        delete: true,
        view: true,
        assignRoles: true, // 🔑 EXCLUSIF
        managePermissions: true // 🔑 EXCLUSIF
      },
      
      // 💰 FINANCES - Complet
      finances: {
        viewRevenue: true,
        viewPrices: true,
        editPrices: true,
        applyDiscounts: true,
        viewReports: true,
        exportData: true
      },
      
      // 🚌 TRAJETS - Complet
      trips: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        manageSchedules: true,
        setCapacity: true
      },

      // 🚌 BUS - Complet PATRON
      buses: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        manageMaintenance: true,
        assignDriver: true,
        viewSeating: true,
        manageSeating: true
      },
      
      // 📋 RÉSERVATIONS - Complet  
      bookings: {
        view: true,
        create: true,
        modify: true,
        cancel: true,
        refund: true
      },
      
      // ⚙️ PARAMÈTRES - Complet
      settings: {
        agencySettings: true,
        employeeManagement: true,
        systemConfig: true
      }
    }
  },

  // 👨‍💼 MANAGER - Accès complet SAUF création de rôles
  manager: {
    label: 'Manager',
    icon: '👨‍💼',
    color: '#007AFF', // Bleu iOS
    description: 'Gestion complète (créé par le patron)',
    
    // Onglets visibles - RETRAIT de l'onglet employés
    visibleTabs: [
      'trips', 
      'bookings',
      'buses', // 🚌 Gestion des bus
      'finances', // 💰 Peut voir les finances
      'settings'
    ],
    
    // Rôles qu'il peut créer - AUCUN
    canCreateRoles: [],
    
    // Permissions - AVEC gestion employés limitée
    permissions: {
      // 👥 GESTION EMPLOYÉS - RETIRÉE COMPLÈTEMENT
      employees: {
        create: false, // ❌ Ne peut pas créer d'employés
        edit: false,   // ❌ Ne peut pas modifier d'employés
        delete: false, // ❌ Ne peut pas supprimer d'employés
        view: false,   // ❌ Ne peut pas voir les employés
        assignRoles: false, // ❌ Ne peut pas assigner de rôles
        managePermissions: false // ❌ Pas de gestion permissions
      },
      
      // 💰 FINANCES - Complet SAUF exportation
      finances: {
        viewRevenue: true,
        viewPrices: true,
        editPrices: true,
        applyDiscounts: true,
        viewReports: true
      },
      
      // 🚌 TRAJETS - Complet
      trips: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        manageSchedules: true,
        setCapacity: true
      },

      // 🚌 BUS - Complet sauf suppression MANAGER
      buses: {
        view: true,
        create: true,
        edit: true,
        delete: false, // ❌ Ne peut pas supprimer
        manageMaintenance: true,
        assignDriver: true,
        viewSeating: true,
        manageSeating: true
      },
      
      // 📋 RÉSERVATIONS - Complet  
      bookings: {
        view: true,
        create: true,
        modify: true,
        cancel: true,
        refund: true
      },
      
      // ⚙️ PARAMÈTRES - Limité
      settings: {
        agencySettings: false, // ❌ Pas accès paramètres agence
        employeeManagement: false, // ❌ Pas gestion employés
        systemConfig: false // ❌ Pas config système
      }
    }
  },

  // 👨‍💻 EMPLOYÉ - Gestion opérationnelle sans finances
  employee: {
    label: 'Employé',
    icon: '👨‍💻',
    color: '#34C759', // Vert iOS
    description: 'Gestion trajets et services (sans finances)',
    
    // Onglets visibles - PAS de finances ni customers ni dashboard
    visibleTabs: [
      'trips',
      'bookings',
      'buses', // 🚌 Gestion des bus
      'services' // Gestion des services bus
    ],
    
    permissions: {
      // 🚌 TRAJETS - Gestion complète sauf prix
      trips: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        manageSchedules: true,
        setCapacity: true,
        manageServices: true, // Services dans le bus
        setDeparture: true,
        setArrival: true,
        setTiming: true
      },

      // 🚌 BUS - Gestion opérationnelle EMPLOYÉ
      buses: {
        view: true,
        create: false, // ❌ Ne peut pas créer
        edit: true,
        delete: false, // ❌ Ne peut pas supprimer
        manageMaintenance: false, // ❌ Pas maintenance
        assignDriver: false, // ❌ Pas assignation
        viewSeating: true,
        manageSeating: true // ✅ Gestion des sièges
      },
      
      // 📋 RÉSERVATIONS - Gestion sans prix
      bookings: {
        view: true,
        create: true,
        modify: true,
        cancel: false, // Pas d'annulation (remboursement)
        search: true,
        customerInfo: true
      },
      
      // 🎯 SERVICES - Gestion complète
      services: {
        viewServices: true,
        editServices: true,
        addServices: true,
        setBusAmenities: true
      }
    }
  },

  // 🚗 CONDUCTEUR - Consultation trajets et réservations
  driver: {
    label: 'Conducteur',
    icon: '🚗',
    color: '#FF9500', // Orange iOS
    description: 'Consultation trajets et réservations',
    
    // Onglets visibles - Lecture seule (pas de dashboard)
    visibleTabs: [
      'trips', // Consultation des trajets
      'bookings', // Consultation des réservations
      'buses' // 🚌 Voir les bus assignés
    ],
    
    permissions: {
      // 🚌 TRAJETS - Lecture seule
      trips: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        viewAssigned: true, // Ses trajets uniquement
        viewSchedules: true,
        viewItinerary: true,
        manageSchedules: false,
        setCapacity: false
      },

      // 📋 RÉSERVATIONS - Consultation seule
      bookings: {
        view: true,
        create: false,
        modify: false,
        cancel: false,
        refund: false,
        search: true,
        viewPassengers: true // Voir les passagers de ses trajets
      },

      // 🚌 BUS - Consultation uniquement CONDUCTEUR
      buses: {
        view: true,
        viewAssigned: true, // Bus qui lui sont assignés
        create: false,
        edit: false,
        delete: false,
        manageMaintenance: false,
        assignDriver: false,
        viewSeating: true, // ✅ Voir plan des sièges
        manageSeating: false // ❌ Pas de gestion
      },
      
      // 👥 PASSAGERS - Consultation
      passengers: {
        viewList: true,
        viewDetails: true,
        search: true,
        checkIn: true // Peut cocher présence
      },
      
      // 📊 DASHBOARD - Infos personnelles
      dashboard: {
        viewPersonalStats: true,
        viewSchedule: true,
        viewAssignments: true
      }
    }
  }
}

// Actions spécifiques par page selon le rôle
export const PAGE_ACTIONS = {
  // 🚌 PAGE TRAJETS
  trips: {
    manager: [
      'create-trip',
      'edit-trip', 
      'delete-trip',
      'set-price',
      'apply-discount',
      'view-revenue'
    ],
    employee: [
      'create-trip',
      'edit-trip',
      'delete-trip', 
      'set-schedule',
      'set-capacity',
      'manage-services'
    ],
    driver: [
      'view-my-trips',
      'view-schedule',
      'view-itinerary'
    ]
  },
  
  // 📋 PAGE RÉSERVATIONS  
  bookings: {
    manager: [
      'view-all',
      'create-booking',
      'modify-booking',
      'cancel-booking',
      'process-refund',
      'view-payments'
    ],
    employee: [
      'view-bookings',
      'create-booking', 
      'modify-booking',
      'search-customer',
      'customer-service'
    ],
    driver: [
      'view-bookings', // Peut voir toutes les réservations
      'search-passenger',
      'view-passenger-list'
    ]
  }
}

// Configuration des couleurs et style iOS
export const ROLE_THEME = {
  patron: {
    primary: '#8B5CF6',
    secondary: '#A78BFA', 
    background: '#F3F0FF',
    text: '#1D1D1F'
  },
  manager: {
    primary: '#007AFF',
    secondary: '#5AC8FA', 
    background: '#F2F8FF',
    text: '#1D1D1F'
  },
  employee: {
    primary: '#34C759',
    secondary: '#59D468',
    background: '#F2FFF4', 
    text: '#1D1D1F'
  },
  driver: {
    primary: '#FF9500',
    secondary: '#FFA726',
    background: '#FFF8F2',
    text: '#1D1D1F'
  }
}

// Fonction pour obtenir le rôle utilisateur
export const getUserRole = (user) => {
  if (!user || !user.employee_role) return null
  return SIMPLE_ROLES[user.employee_role] || null
}

// Fonction pour vérifier les permissions
export const hasPermission = (userRole, module, action) => {
  if (!userRole || !SIMPLE_ROLES[userRole]) return false
  
  const role = SIMPLE_ROLES[userRole]
  const modulePerms = role.permissions[module]
  
  if (!modulePerms) return false
  return modulePerms[action] === true
}

// Fonction pour obtenir les onglets visibles
export const getVisibleTabs = (userRole) => {
  if (!userRole || !SIMPLE_ROLES[userRole]) return []
  return SIMPLE_ROLES[userRole].visibleTabs
}
