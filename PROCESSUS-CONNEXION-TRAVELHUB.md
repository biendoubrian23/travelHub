# 🔐 Processus de Connexion - TravelHub

## Vue d'ensemble du système d'authentification

TravelHub utilise **Supabase Auth** comme système d'authentification avec une architecture basée sur les rôles et agences. Voici le flux complet de connexion :

---

## 📋 Étapes du processus de connexion

### 1. **Interface de connexion** (`Login.jsx`)
- **Champs requis** : Email + Mot de passe
- **Validation** : Vérification locale des champs obligatoires
- **UI/UX** : Affichage/masquage du mot de passe, états de chargement

### 2. **Soumission des identifiants**
```javascript
handleSubmit(email, password) → signIn(email, password)
```

### 3. **Authentification Supabase** (`AuthContext.jsx`)
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

#### Vérifications Supabase :
- ✅ **Email existe** dans `auth.users`
- ✅ **Mot de passe correct**
- ✅ **Email confirmé** (`email_confirmed_at`)
- ✅ **Compte actif** (`is_active`)

### 4. **Chargement du profil utilisateur**
```javascript
await loadUserProfile(user.id)
```

#### Récupération depuis la table `users` :
```sql
SELECT * FROM users WHERE id = ${userId}
```

#### Données du profil :
- `id` : UUID de l'utilisateur
- `full_name` : Nom complet
- `email` : Email de connexion
- `role` : Rôle principal (`agence`, `agency_admin`, etc.)
- `is_active` : Statut actif/inactif

### 5. **Détermination du type d'utilisateur**

#### 🏢 **Propriétaire d'agence** (`role = 'agence'`)
```javascript
// Récupération de l'agence
const agency = await getAgencyByUserId(userId)
setAgency(agency)
```

#### 👥 **Employé d'agence** (`role.includes('agency')`)
```javascript
// Récupération des données employé + agence
const employeeData = await supabase
  .from('agency_employees')
  .select(`*, agency:agencies(*)`)
  .eq('user_id', userId)
  .single()
  
setEmployeeData(employeeData)
setAgency(employeeData.agency)
```

### 6. **Gestion des permissions**
Système de permissions basé sur le rôle de l'employé :

| Rôle | Permissions |
|------|-------------|
| **admin** | Accès total à l'agence |
| **manager** | Trajets, réservations, employés, finances |
| **employee** | Trajets (lecture), réservations limitées |
| **driver** | Trajets (lecture seule), réservations (lecture) |

---

## 🎯 États de l'application après connexion

### Contexte d'authentification disponible :
```javascript
const {
  user,           // Objet utilisateur Supabase
  userProfile,    // Profil depuis table 'users'
  agency,         // Données de l'agence
  employeeData,   // Données employé (si applicable)
  loading,        // État de chargement
  hasPermission,  // Fonction de vérification des permissions
  isAgencyOwner,  // Booléen : propriétaire d'agence
  isAgencyEmployee // Booléen : employé d'agence
} = useAuth()
```

---

## 🔄 Flux de redirection

### Vérifications de sécurité :
1. **Utilisateur non connecté** → `Login.jsx`
2. **Page d'invitation** → `InvitationPage.jsx` (sans auth)
3. **Agence non vérifiée** → `AgencyPendingVerification`
4. **Utilisateur connecté** → `MainApp`

### Page par défaut selon le rôle :
- **Propriétaire/Manager** → `Dashboard`
- **Employé/Conducteur** → `Trips` (Gestion des trajets)

---

## 🏗️ Architecture des données

### Tables principales :

#### `auth.users` (Supabase Auth)
```sql
id, email, email_confirmed_at, created_at, updated_at
```

#### `public.users` (Profil utilisateur)
```sql
id, full_name, email, role, is_active, created_at, updated_at
```

#### `public.agencies` (Agences)
```sql
id, name, owner_id, is_verified, created_at, updated_at
```

#### `public.agency_employees` (Employés)
```sql
id, agency_id, user_id, employee_role, is_active, hire_date
first_name, last_name, phone, date_of_birth, notes
```

---

## 🔒 Gestion des erreurs de connexion

### Messages d'erreur localisés :
| Erreur Supabase | Message utilisateur |
|-----------------|---------------------|
| `Invalid login credentials` | "Email ou mot de passe incorrect" |
| `Email not confirmed` | "Veuillez confirmer votre email" |
| `Too many requests` | "Trop de tentatives. Réessayer plus tard" |

### Logs de débogage :
```javascript
console.log('🔍 Tentative de connexion avec:', email)
console.log('📋 Résultat signIn:', error ? 'ERREUR' : 'SUCCÈS')
console.log('✅ Utilisateur connecté:', user.id)
console.log('📧 Email confirmé:', user.email_confirmed_at ? 'OUI' : 'NON')
```

---

## 🎨 Interface utilisateur

### États visuels :
- **Loading** : Spinner avec animation de bus
- **Erreur** : Message d'erreur rouge avec bouton de fermeture
- **Succès** : Redirection automatique vers l'application

### Composants :
- `Login.jsx` : Formulaire de connexion
- `LoadingSpinner` : Animation de chargement
- `AuthPages` : Gestion Login/Register
- `MainApp` : Application principale après connexion

---

## 🌐 Gestion des sessions multi-onglets

### Comportement lors de l'ouverture d'un nouvel onglet

Quand vous ouvrez un **nouvel onglet** alors que vous êtes déjà connecté dans un autre, voici ce qui se passe :

#### 1. **Récupération automatique de la session**
```javascript
// Au chargement du nouvel onglet
const { data: { user: currentUser } } = await supabase.auth.getUser()
```

**Supabase** stocke la session dans le **localStorage** du navigateur, donc :
- ✅ **Session partagée** entre tous les onglets du même domaine
- ✅ **Connexion automatique** sans ressaisir les identifiants
- ✅ **État synchronisé** entre les onglets

#### 2. **Séquence de chargement dans le nouvel onglet**
```
🔄 Récupération de l'utilisateur initial...
✅ Utilisateur trouvé: user@example.com
🔄 Chargement du profil utilisateur pour: [USER_ID]
✅ Profil utilisateur chargé: John Doe
🔄 Chargement des données d'agence pour: agence
✅ Agence chargée: Mon Agence Transport
```

#### 3. **Synchronisation en temps réel**
L'**écouteur d'événements** `onAuthStateChange` assure la synchronisation :

```javascript
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 Changement d\'authentification:', event)
  // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
})
```

### Actions synchronisées entre onglets :

| Action dans un onglet | Effet sur les autres onglets |
|-----------------------|-------------------------------|
| **Déconnexion** | 🔴 Déconnexion immédiate de tous les onglets |
| **Rafraîchissement du token** | 🔄 Mise à jour automatique partout |
| **Expiration de session** | ⏰ Redirection vers login sur tous les onglets |
| **Modification de profil** | 🔄 Peut nécessiter un refresh manuel |

### Cas particuliers :

#### 🔒 **Si la session expire**
- **Détection automatique** dans tous les onglets
- **Redirection vers login** synchronized
- **Nettoyage des états** (user, agency, etc.)

#### 🔄 **Rafraîchissement automatique**
```javascript
// Supabase rafraîchit automatiquement les tokens
autoRefreshToken: true  // par défaut
```

#### 🚪 **Déconnexion depuis un onglet**
```javascript
await signOut() // Dans l'onglet A
// → Tous les autres onglets détectent automatiquement la déconnexion
// → Redirection automatique vers la page de login
```

---

## 🔧 Configuration technique

### Variables d'environnement requises :
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_SUPABASE_SERVICE_KEY=eyJxxx... (pour admin)
```

### Client Supabase :
```javascript
// Client standard (utilisateurs)
export const supabase = createClient(url, anonKey)

// Client admin (opérations privilégiées)
export const supabaseAdmin = createClient(url, serviceKey)
```

### Avantages de cette approche :

#### ✅ **Expérience utilisateur fluide**
- Pas besoin de se reconnecter dans chaque onglet
- Navigation naturelle entre les pages de l'application
- Continuité du travail sur plusieurs onglets

#### ✅ **Synchronisation automatique**
- État de connexion uniforme
- Déconnexion sécurisée sur tous les onglets
- Gestion centralisée des permissions

#### ✅ **Performance optimisée**
- Session stockée localement (pas de requête serveur à chaque onglet)
- Chargement rapide des données utilisateur en cache
- Rafraîchissement intelligent des tokens

### Considérations de sécurité :

#### 🔒 **Sécurité renforcée**
- **Expiration automatique** des sessions (configurable)
- **Tokens JWT** avec signature cryptographique
- **Nettoyage automatique** lors de la fermeture du navigateur

#### ⚠️ **Points d'attention**
- **Ordinateur partagé** : risque si l'utilisateur oublie de se déconnecter
- **Session hijacking** : protection via HTTPS et tokens sécurisés
- **Durée de vie** : configurer l'expiration selon les besoins de sécurité

---

## 🎯 Résultat final

Après une connexion réussie, l'utilisateur accède à :

1. **Interface adaptée à son rôle** (dashboard ou trajets)
2. **Permissions configurées** selon son rôle d'employé
3. **Données d'agence chargées** (nom, statut, etc.)
4. **Navigation sécurisée** avec contrôle d'accès par page
5. **Session persistante** maintenue par Supabase

Le système garantit que chaque utilisateur ne voit que les fonctionnalités auxquelles il a droit, avec une expérience fluide et sécurisée.
