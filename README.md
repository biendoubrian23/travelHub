# IntranetTravelHub 🚌

Un système de gestion d'agence moderne pour TravelHub avec un design inspiré d'iOS, développé en React.

## 🎨 Design System

L'application utilise un système de design inspiré d'iOS avec :

- **Couleurs système** : Palette de couleurs authentique iOS
- **Typographie San Francisco** : Police système avec poids appropriés
- **Cards sans ombres** : Design épuré avec bordures subtiles
- **Espacement harmonieux** : Système d'espacement cohérent
- **Interface moderne** : Design propre et professionnel

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Authentification** : Page de connexion sécurisée
- **Dashboard** : Vue d'ensemble avec statistiques et graphiques
- **Navigation** : Sidebar responsive avec menu intuitif
- **Design responsive** : Adaptation mobile et tablette

### 🔄 En cours de développement
- **Gestion des trajets** : CRUD complet des trajets
- **Gestion des réservations** : Suivi des bookings clients
- **Gestion des clients** : Base de données clients
- **Activité et rapports** : Logs et analytics avancés
- **Paramètres** : Configuration de l'agence

## 🛠 Technologies

- **React 18** : Framework principal
- **Vite** : Build tool rapide
- **Lucide React** : Icônes modernes
- **Recharts** : Graphiques et visualisations
- **CSS Modules** : Styles composants
- **Date-fns** : Gestion des dates

## 📦 Installation

```bash
# Installation des dépendances
npm install

## ✨ Nouvelles fonctionnalités

### Configuration Supabase
L'application est maintenant intégrée avec Supabase pour une gestion complète des données.

#### Variables d'environnement requises :
```env
VITE_SUPABASE_URL=https://dqoncbnvyviurirsdtyu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0
```

### 🔐 Système d'authentification
- **Inscription complète** : 5 étapes avec validation
- **Connexion sécurisée** : Gestion des sessions
- **Vérification d'agence** : Processus d'approbation manuel
- **Système de rôles** : Admin, Manager, Employee, Driver

### 📊 Base de données étendue
- **Cohérence mobile/web** : Tables partagées avec l'app mobile
- **Tables spécifiques web** : agency_employees, agency_documents, audit_logs
- **Permissions granulaires** : RLS avec contrôle d'accès par rôle
- **Upload de fichiers** : Documents officiels et logos

### 🚀 Migrations à exécuter
Avant de lancer l'application, exécutez le script SQL :
```sql
-- Voir database/migrations/001_add_web_tables.sql
```

### 🛡️ Sécurité
- Row Level Security (RLS) activé
- Audit logs pour traçabilité
- Permissions basées sur les rôles
- Upload sécurisé des documents

Démarrez le serveur de développement :
```bash
npm run dev
```

# Build de production
npm run build
```

## 🎯 Structure du projet

```
src/
├── components/
│   ├── Auth/           # Authentification
│   ├── Dashboard/      # Tableau de bord
│   └── Sidebar/        # Navigation
├── styles/
│   └── globals.css     # Design system iOS
├── App.jsx             # Application principale
└── main.jsx           # Point d'entrée
```

## 🎨 Design System

### Couleurs
- **Background** : `#F8F9FA` (Gris très clair)
- **Surface** : `#FFFFFF` (Blanc pur)
- **Primary** : `#007AFF` (Bleu système iOS)
- **Secondary** : `#34C759` (Vert système iOS)
- **Warning** : `#FF9500` (Orange système iOS)
- **Danger** : `#FF3B30` (Rouge système iOS)

### Typographie
- **Titres** : `font-weight: 700` avec `letter-spacing: -0.4px`
- **Sous-titres** : `font-weight: 600`
- **Corps** : `font-weight: 400`
- **Légendes** : `font-weight: 500`

### Composants
- **Cards** : `border-radius: 20px`, bordures au lieu d'ombres
- **Boutons** : `border-radius: 12px`, couleurs système
- **Inputs** : Design épuré avec icônes

## 🔐 Authentification

Pour tester l'application, utilisez n'importe quel email/mot de passe.
L'authentification est actuellement mockée pour le développement.

## 📱 Responsive Design

L'application s'adapte automatiquement aux différentes tailles d'écran :
- **Desktop** : Sidebar fixe, layout en grille
- **Tablette** : Sidebar rétractable
- **Mobile** : Navigation adaptée, cards empilées

## 🎊 Statut du projet

✅ **Phase 1** : Infrastructure et design system  
🔄 **Phase 2** : Pages de gestion (en cours)  
🔮 **Phase 3** : Fonctionnalités avancées  

---

**Développé avec ❤️ pour TravelHub**
