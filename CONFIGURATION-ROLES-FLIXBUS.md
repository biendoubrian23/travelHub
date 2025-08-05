# 🚌 CONFIGURATION COMPLÈTE DES RÔLES - STYLE FLIXBUS
## Inspiré de FlixBus pour un service optimal de transport

---

## 🎯 **VUE D'ENSEMBLE DES RÔLES**

### 🏢 **PATRON D'AGENCE** (role: `agence`)
- **Accès complet** à toutes les fonctionnalités
- **Seul à voir** l'onglet "Employés"
- **Vision stratégique** de l'agence

### 👨‍💼 **ADMIN AGENCE** (employee_role: `admin`)
- **Gestion opérationnelle** complète
- **Peut créer** d'autres employés (sauf patron)
- **Accès financier** complet

### 👔 **MANAGER** (employee_role: `manager`)
- **Gestion équipe** limitée
- **Supervision** des opérations quotidiennes
- **Rapports** et statistiques

### 👨‍💻 **EMPLOYÉ** (employee_role: `employee`)
- **Opérations** quotidiennes
- **Gestion clients** et réservations
- **Consultation** des trajets

### 🚐 **CHAUFFEUR** (employee_role: `driver`)
- **Vue mobile-first** optimisée
- **Gestion** de ses trajets assignés
- **Communication** avec dispatch

---

## 📱 **CONFIGURATION DÉTAILLÉE PAR ONGLET**

### 🏠 **DASHBOARD**

#### 🏢 **PATRON D'AGENCE**
```jsx
// KPIs Stratégiques
- 📊 Chiffre d'affaires mensuel/annuel
- 📈 Croissance par rapport à l'année précédente
- 🚌 Taux d'occupation moyen des bus
- 💰 Marge bénéficiaire
- ⭐ Note moyenne satisfaction client
- 🎯 Objectifs vs Réalisé

// Graphiques
- 📉 Évolution CA sur 12 mois
- 🗺️ Carte des trajets les plus rentables
- 📊 Répartition revenus par ligne
- 👥 Performance par employé

// Actions Rapides
- ➕ Créer nouvel employé
- 📋 Rapport financier complet
- ⚙️ Paramètres agence
- 🔔 Notifications importantes
```

#### 👨‍💼 **ADMIN AGENCE**
```jsx
// KPIs Opérationnels
- 📊 Réservations du jour
- 🚌 Bus en service
- 💺 Taux d'occupation temps réel
- ⚠️ Alertes et incidents
- 💰 Revenus journaliers
- 📞 Satisfaction client

// Tableaux de Bord
- 🎫 Réservations en attente
- 🚨 Alertes système
- 📱 Activité employés
- 🔄 Trajets en cours

// Actions Rapides
- 🎫 Nouvelle réservation
- 🚌 Ajouter trajet
- 👤 Créer employé
- 📢 Envoyer notification
```

#### 👔 **MANAGER**
```jsx
// KPIs Équipe
- 👥 Employés actifs
- 📊 Performance équipe
- 🎫 Réservations gérées
- ⏰ Ponctualité trajets
- 📞 Réclamations client
- 💡 Suggestions amélioration

// Supervision
- 📋 Planning équipe
- 🚌 Trajets supervisés
- 📊 Statistiques hebdomadaires
- 🎯 Objectifs équipe

// Actions
- 📅 Planifier équipe
- 📊 Générer rapport
- 💬 Message équipe
- 🎫 Gérer réservation
```

#### 👨‍💻 **EMPLOYÉ**
```jsx
// KPIs Personnels
- 🎫 Mes réservations aujourd'hui
- 📞 Clients servis
- ⭐ Ma note satisfaction
- 💰 Ventes réalisées
- 🏆 Objectifs personnels
- 📈 Progression mensuelle

// Tâches du Jour
- ✅ Réservations à traiter
- 📞 Clients à rappeler
- 🎫 Tickets à imprimer
- 📋 Rapports à compléter

// Actions Rapides
- 🎫 Nouvelle réservation
- 📞 Appeler client
- 🔍 Rechercher trajet
- 📊 Mon rapport journalier
```

#### 🚐 **CHAUFFEUR**
```jsx
// KPIs Conduite
- 🚌 Mon bus aujourd'hui
- 📍 Trajets assignés
- ⏰ Horaires de service
- 👥 Passagers à bord
- ⛽ Niveau carburant
- 🛠️ État véhicule

// Vue Mobile Optimisée
- 🗺️ Itinéraire GPS intégré
- 📱 Communication dispatch
- 👥 Liste passagers
- ⏰ Horaires en temps réel

// Actions Chauffeur
- ✅ Confirmer départ
- 📍 Signaler position
- 🚨 Signaler incident
- 📞 Contacter dispatch
```

---

### 🗺️ **TRAJETS**

#### 🏢 **PATRON D'AGENCE**
```jsx
// Vue Stratégique
- 📊 Analyse rentabilité par ligne
- 🗺️ Carte complète du réseau
- 📈 Tendances et saisonnalité
- 💰 Optimisation tarifaire
- 🚌 Allocation des ressources

// Gestion Avancée
- ➕ Créer nouvelle ligne
- 📊 Analyser performance
- 🎯 Définir stratégie prix
- 🗺️ Expansion géographique

// Tables/Vues
- 📋 Tous les trajets (vue complète)
- 💰 Rentabilité par trajet
- 📊 Statistiques détaillées
- 🔄 Historique complet
```

#### 👨‍💼 **ADMIN AGENCE**
```jsx
// Gestion Opérationnelle
- ➕ Créer/modifier trajets
- 🚌 Assigner bus et chauffeurs
- ⏰ Gérer horaires
- 💰 Fixer tarifs
- 📊 Surveiller performance

// Vue Détaillée
- 📋 Planning hebdomadaire
- 🚌 Attribution des ressources
- 👥 Charge de travail chauffeurs
- 📊 Taux de remplissage

// Actions
- ➕ Nouveau trajet
- ✏️ Modifier trajet existant
- 🚌 Changer bus/chauffeur
- 💰 Ajuster prix
- 📊 Rapport détaillé
```

#### 👔 **MANAGER**
```jsx
// Supervision Trajets
- 📋 Trajets du jour/semaine
- 🚌 État des bus
- 👥 Planning chauffeurs
- ⚠️ Alertes et retards
- 📊 Performance équipe

// Vue Opérationnelle
- 🎫 Réservations par trajet
- ⏰ Respect des horaires
- 🚨 Incidents en cours
- 📞 Communication clients

// Actions Limitées
- ✏️ Modifier horaires (avec approbation)
- 📊 Générer rapports
- 🚨 Signaler problèmes
- 👥 Coordonner équipe
```

#### 👨‍💻 **EMPLOYÉ**
```jsx
// Vue Consultation
- 📋 Trajets disponibles (lecture seule)
- 🔍 Recherche pour clients
- 💺 Disponibilité places
- 💰 Tarifs actuels
- ⏰ Horaires jour/semaine

// Information Client
- 🗺️ Itinéraires détaillés
- ⏰ Durée voyage
- 🚌 Type de bus
- 💰 Prix par catégorie
- 📱 Services inclus

// Actions
- 🔍 Rechercher trajet
- 💰 Consulter prix
- 📋 Voir disponibilités
- 📞 Informer client
```

#### 🚐 **CHAUFFEUR**
```jsx
// Mes Trajets
- 🚌 Mes trajets assignés
- ⏰ Planning personnel
- 📍 Itinéraires détaillés
- 👥 Passagers attendus
- 📱 Instructions spéciales

// Vue Mobile Optimisée
- 🗺️ GPS intégré
- ⏰ Countdown départ
- 👥 Check-list passagers
- 📞 Contact dispatch
- 🚨 Bouton urgence

// Actions
- ✅ Confirmer prise de service
- 📍 Mettre à jour position
- 👥 Valider montée passagers
- 🚨 Signaler incident
- 📞 Appeler central
```

---

### 📅 **RÉSERVATIONS**

#### 🏢 **PATRON D'AGENCE**
```jsx
// Analytics Réservations
- 📊 Vue d'ensemble toutes réservations
- 💰 Revenus par période
- 📈 Tendances réservation
- 🎯 Conversion prospects
- ⭐ Satisfaction client
- 💳 Analyse paiements

// Reporting Avancé
- 📊 Dashboard BI
- 🔄 Analyse saisonnalité
- 🎯 Segmentation client
- 💰 Yield management
- 📈 Prévisions demande

// Actions Stratégiques
- 📊 Rapports exécutifs
- 🎯 Définir objectifs
- 💰 Stratégie pricing
- 🔄 Optimiser processus
```

#### 👨‍💼 **ADMIN AGENCE**
```jsx
// Gestion Complète
- 📋 Toutes les réservations
- ➕ Créer réservation manuelle
- ✏️ Modifier réservations
- ❌ Annuler avec remboursement
- 🔄 Gérer les échanges
- 💳 Traiter paiements

// Outils Avancés
- 🔍 Recherche multicritères
- 📊 Filtres avancés
- 💰 Gestion tarifs spéciaux
- 🎫 Émission tickets
- 📧 Communication client

// Tableaux de Bord
- 🚨 Réservations problème
- ⏰ Réservations urgentes
- 💰 En attente paiement
- 🔄 Modifications demandées
```

#### 👔 **MANAGER**
```jsx
// Supervision Réservations
- 📋 Réservations équipe
- 📊 Performance commerciale
- 🎯 Objectifs vs réalisé
- ⚠️ Alertes et problèmes
- 📞 Gestion réclamations

// Outils Opérationnels
- ✏️ Modifier réservations (limitées)
- 📊 Rapports hebdomadaires
- 👥 Répartition travail équipe
- 📞 Support client niveau 2

// Actions
- 📊 Générer rapports
- 👥 Superviser équipe
- 🎯 Suivre objectifs
- 📞 Résoudre problèmes
```

#### 👨‍💻 **EMPLOYÉ**
```jsx
// Gestion Quotidienne
- ➕ Créer nouvelle réservation
- 🔍 Rechercher réservation client
- ✏️ Modifier réservations simples
- 📞 Contacter clients
- 🎫 Imprimer tickets
- 💳 Encaisser paiements

// Interface Optimisée
- 🚀 Création rapide réservation
- 🔍 Recherche intelligente
- 💺 Sélection places graphique
- 💰 Calculateur prix automatique
- 📧 Envoi confirmations

// Mes KPIs
- 🎫 Mes réservations du jour
- 💰 Mes ventes
- ⭐ Ma satisfaction client
- 🎯 Mes objectifs
```

#### 🚐 **CHAUFFEUR**
```jsx
// Vue Passagers
- 👥 Liste passagers mon bus
- ✅ Check-in embarquement
- 📱 QR codes validation
- 📞 Contact clients urgence
- 🎫 Statut réservations

// Interface Mobile
- 📱 Scan QR passagers
- ✅ Validation embarquement
- 👥 Compteur passagers
- 🚨 Signaler absence
- 📞 Appel dispatch

// Actions
- ✅ Valider embarquement
- 📱 Scanner tickets
- 🚨 Signaler problème
- 👥 Compter passagers
- 📞 Contact central
```

---

### 👥 **CLIENTS**

#### 🏢 **PATRON D'AGENCE**
```jsx
// Analytics Clients
- 📊 Base client complète
- 📈 Acquisition nouveaux clients
- 🔄 Taux de rétention
- 💰 Valeur vie client (LTV)
- 🎯 Segmentation avancée
- ⭐ Analyse satisfaction

// Business Intelligence
- 📊 Profiling clients
- 🎯 Marketing segments
- 💰 Rentabilité par client
- 🔄 Patterns de voyage
- 📈 Prédictions comportement

// Actions Stratégiques
- 🎯 Stratégie acquisition
- 💰 Programmes fidélité
- 📧 Campagnes marketing
- 📊 Études marché
```

#### 👨‍💼 **ADMIN AGENCE**
```jsx
// Gestion Client Complète
- 📋 Base de données clients
- ➕ Créer profil client
- ✏️ Modifier informations
- 🎫 Historique réservations
- 💳 Gestion paiements
- 📞 Support avancé

// Outils CRM
- 🔍 Recherche avancée
- 📊 Fiche client détaillée
- 💰 Crédit/remboursements
- 🎯 Marketing ciblé
- 📧 Communication masse

// Services Premium
- 🌟 Clients VIP
- 💳 Programmes fidélité
- 🎁 Offres spéciales
- 📞 Support prioritaire
```

#### 👔 **MANAGER**
```jsx
// Supervision Client
- 📋 Clients de l'équipe
- 📞 Gestion réclamations
- 📊 Satisfaction équipe
- 🎯 Objectifs client
- ⚠️ Problèmes escaladés

// Outils Équipe
- 👥 Répartition portefeuille
- 📊 Performance commerciale
- 📞 Support niveau 2
- 🎯 Coaching équipe

// Actions
- 📞 Résoudre réclamations
- 👥 Former équipe
- 📊 Analyser performance
- 🎯 Fixer objectifs
```

#### 👨‍💻 **EMPLOYÉ**
```jsx
// Gestion Quotidienne
- 🔍 Rechercher client
- ➕ Créer nouveau client
- ✏️ Mettre à jour infos
- 📞 Appeler client
- 🎫 Historique achats
- ⭐ Recueillir feedback

// Interface Simple
- 🚀 Fiche client rapide
- 📞 Numérotation directe
- 📧 Email pré-rempli
- 🎫 Réservations client
- 💰 Statut paiements

// Mon Portefeuille
- 👥 Mes clients réguliers
- 📞 Clients à recontacter
- ⭐ Satisfaction mes clients
- 🎯 Mes objectifs client
```

#### 🚐 **CHAUFFEUR**
```jsx
// Info Passagers
- 👥 Passagers du voyage
- 📞 Contacts urgence
- 🎫 Statut réservations
- 💺 Plan de cabine
- 📱 Besoins spéciaux

// Communication
- 📞 Numéros urgence
- 📱 Chat dispatch
- 🚨 Signaler incident
- 👥 Info passagers

// Actions Limitées
- ✅ Confirmer présence
- 📞 Appel urgence
- 🚨 Incident passager
- 📱 Message central
```

---

### 📊 **ACTIVITÉ**

#### 🏢 **PATRON D'AGENCE**
```jsx
// Tableau de Bord Exécutif
- 📊 KPIs globaux temps réel
- 📈 Tendances business
- 💰 Performance financière
- 🎯 Objectifs stratégiques
- ⚠️ Alertes critiques
- 🏆 Benchmarks marché

// Analytics Avancées
- 📊 Business Intelligence
- 🔄 Analyse prédictive
- 📈 Modélisation revenus
- 🎯 Opportunités croissance
- 💡 Recommandations IA

// Rapports Exécutifs
- 📊 Rapport mensuel conseil
- 💰 Analyse P&L
- 🎯 Performance objectifs
- 🏆 Classement concurrence
```

#### 👨‍💼 **ADMIN AGENCE**
```jsx
// Monitoring Opérationnel
- 🚨 Alertes système
- 📊 Performance temps réel
- 👥 Activité employés
- 🚌 État de la flotte
- 💰 Transactions jour
- 📞 Service client

// Outils de Gestion
- 📊 Dashboards détaillés
- 🔄 Logs système
- 👥 Suivi activités utilisateurs
- 📊 Rapports opérationnels
- ⚙️ Configuration système

// Actions
- 🚨 Gérer alertes
- 📊 Générer rapports
- ⚙️ Configurer système
- 👥 Surveiller équipe
```

#### 👔 **MANAGER**
```jsx
// Supervision Équipe
- 👥 Activité équipe temps réel
- 📊 Performance individuelle
- 🎯 Suivi objectifs
- ⏰ Plannings et présences
- 📞 Qualité service
- 🎓 Besoins formation

// Outils Manager
- 📊 Tableaux de bord équipe
- 🎯 Indicateurs performance
- 👥 Planning ressources
- 📚 Suivi formation
- 💬 Communication équipe

// Actions
- 👥 Planifier équipe
- 🎯 Fixer objectifs
- 📊 Analyser performance
- 🎓 Organiser formation
```

#### 👨‍💻 **EMPLOYÉ**
```jsx
// Mon Activité
- 📊 Mon tableau de bord
- 🎫 Mes réservations
- 📞 Mes appels clients
- ⭐ Ma satisfaction
- 🎯 Mes objectifs
- 🏆 Mes performances

// Suivi Personnel
- ⏰ Mes horaires
- 📈 Mon évolution
- 🎓 Mes formations
- 💡 Mes suggestions
- 📚 Ressources utiles

// Actions
- 📊 Consulter mes stats
- 🎯 Suivre objectifs
- 📚 Accéder formations
- 💡 Faire suggestions
```

#### 🚐 **CHAUFFEUR**
```jsx
// Mon Tableau de Bord
- 🚌 Mes trajets du jour
- ⏰ Planning personnel
- 🛠️ État mon véhicule
- 👥 Passagers transportés
- ⭐ Évaluations reçues
- 🏆 Mes performances

// Outils Chauffeur
- 📱 App mobile optimisée
- 🗺️ GPS intégré
- 📞 Communication directe
- 🚨 Signalement incidents
- ⛽ Suivi carburant

// Actions
- ✅ Pointer service
- 📍 Localisation GPS
- 🚨 Signaler problème
- 📞 Contacter dispatch
```

---

### ⚙️ **PARAMÈTRES**

#### 🏢 **PATRON D'AGENCE**
```jsx
// Configuration Globale
- 🏢 Informations agence
- 💰 Paramètres financiers
- 🎯 Objectifs et stratégie
- 👥 Gestion utilisateurs
- 🔐 Sécurité avancée
- 🔄 Intégrations externes

// Administration
- 📊 Configuration rapports
- 💳 Paramètres paiement
- 📧 Templates communication
- 🎨 Personnalisation interface
- 🔒 Politique accès

// Actions Avancées
- ⚙️ Configuration système
- 👥 Gérer permissions
- 📊 Paramétrer KPIs
- 🔄 Configurer workflows
```

#### 👨‍💼 **ADMIN AGENCE**
```jsx
// Configuration Opérationnelle
- 🚌 Gestion flotte
- 👥 Paramètres employés
- 📊 Configuration rapports
- 💰 Tarification
- 📧 Communication
- 🔄 Processus métier

// Outils Admin
- ⚙️ Paramètres système
- 👥 Rôles et permissions
- 📊 Personnalisation dashboards
- 🔔 Configuration alertes
- 📱 Paramètres mobile

// Actions
- ⚙️ Configurer modules
- 👥 Gérer accès
- 📊 Personnaliser vues
- 🔔 Paramétrer notifications
```

#### 👔 **MANAGER**
```jsx
// Paramètres Équipe
- 👥 Configuration équipe
- 📊 Paramètres rapports
- 🎯 Objectifs équipe
- 📧 Templates équipe
- 🔔 Alertes manager
- 📚 Ressources formation

// Outils Limités
- 👥 Paramètres équipe
- 📊 Vues personnalisées
- 🎯 Configuration objectifs
- 📧 Messages type
- 🔔 Notifications équipe

// Actions
- 👥 Configurer équipe
- 📊 Personnaliser rapports
- 🎯 Définir objectifs
- 📧 Gérer communication
```

#### 👨‍💻 **EMPLOYÉ**
```jsx
// Paramètres Personnels
- 👤 Mon profil
- 📧 Mes préférences
- 🔔 Mes notifications
- 🎨 Mon interface
- 📱 Paramètres mobile
- 🔐 Mon mot de passe

// Personnalisation
- 🎨 Thème interface
- 📊 Widgets dashboard
- 🔔 Types notifications
- 📧 Signature email
- ⏰ Paramètres horaires

// Actions Limitées
- ✏️ Modifier profil
- 🎨 Personnaliser vue
- 🔔 Gérer notifications
- 🔐 Changer mot de passe
```

#### 🚐 **CHAUFFEUR**
```jsx
// Paramètres Chauffeur
- 👤 Mon profil
- 🚌 Mon véhicule
- 📱 App mobile
- 🔔 Notifications GPS
- 📞 Contacts urgence
- ⏰ Planning préférences

// Interface Mobile
- 📱 Paramètres app
- 🗺️ Préférences GPS
- 🔔 Alertes importantes
- 📞 Numéros urgence
- 🚌 Info véhicule

// Actions
- ✏️ Modifier profil
- 🚌 Mettre à jour véhicule
- 📱 Configurer app
- 🔔 Gérer alertes
```

---

## 🗄️ **TABLES SUPPLÉMENTAIRES NÉCESSAIRES**

### 📊 **Tables Analytics & Reporting**
```sql
-- Métriques temps réel pour dashboards
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id),
    date DATE NOT NULL,
    metric_type TEXT NOT NULL, -- 'revenue', 'bookings', 'occupancy', etc.
    metric_value NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objectifs par employé/équipe
CREATE TABLE employee_targets (
    id UUID PRIMARY KEY,
    employee_id UUID REFERENCES agency_employees(id),
    target_type TEXT NOT NULL, -- 'sales', 'satisfaction', 'bookings'
    target_value NUMERIC,
    period_start DATE,
    period_end DATE,
    current_value NUMERIC DEFAULT 0
);
```

### 🚌 **Tables Gestion Flotte**
```sql
-- Véhicules de l'agence
CREATE TABLE agency_vehicles (
    id UUID PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id),
    vehicle_number TEXT NOT NULL,
    model TEXT,
    capacity INTEGER,
    type bus_type,
    current_driver_id UUID REFERENCES agency_employees(id),
    is_active BOOLEAN DEFAULT true,
    last_maintenance DATE,
    next_maintenance DATE
);

-- Assignations chauffeur-véhicule
CREATE TABLE driver_assignments (
    id UUID PRIMARY KEY,
    driver_id UUID REFERENCES agency_employees(id),
    vehicle_id UUID REFERENCES agency_vehicles(id),
    trip_id UUID REFERENCES trips(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

### 📱 **Tables Communication**
```sql
-- Messages internes
CREATE TABLE internal_messages (
    id UUID PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id),
    sender_id UUID REFERENCES agency_employees(id),
    recipient_id UUID REFERENCES agency_employees(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    message_type TEXT DEFAULT 'normal', -- 'urgent', 'info', 'alert'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de communication
CREATE TABLE message_templates (
    id UUID PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id),
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'email', 'sms', 'notification'
    template_content TEXT NOT NULL,
    variables JSONB -- Variables dynamiques à remplacer
);
```

### 🎯 **Tables Performances**
```sql
-- Évaluations employés
CREATE TABLE employee_evaluations (
    id UUID PRIMARY KEY,
    employee_id UUID REFERENCES agency_employees(id),
    evaluator_id UUID REFERENCES agency_employees(id),
    evaluation_date DATE,
    criteria JSONB, -- Critères d'évaluation structurés
    score NUMERIC(3,2),
    comments TEXT,
    action_plan TEXT
);

-- Suggestions d'amélioration
CREATE TABLE improvement_suggestions (
    id UUID PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id),
    employee_id UUID REFERENCES agency_employees(id),
    suggestion_type TEXT, -- 'process', 'system', 'service'
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'implemented'
    priority TEXT DEFAULT 'medium'
);
```

---

## 🚀 **RECOMMANDATIONS D'IMPLÉMENTATION**

### 📱 **Interface Mobile-First pour Chauffeurs**
- Design optimisé grands boutons
- Mode sombre pour conduite nuit
- Géolocalisation temps réel
- Communication push instantanée

### 🎨 **UI/UX Inspiré FlixBus**
- **Couleurs** : Bleu/vert corporatif
- **Typographie** : Claire et lisible
- **Navigation** : Intuitive et rapide
- **Responsive** : Mobile et desktop

### 📊 **Analytics & BI**
- Dashboards temps réel
- Prédictions IA
- Recommandations automatiques
- Alertes intelligentes

### 🔐 **Sécurité Renforcée**
- Authentification 2FA pour admins
- Logs audit complets
- Permissions granulaires
- Chiffrement données sensibles

Cette configuration offre une expérience optimale pour chaque rôle tout en maintenant la sécurité et l'efficacité opérationnelle de votre agence de transport ! 🚌✨
