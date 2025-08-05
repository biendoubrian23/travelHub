# 🔧 Guide de Troubleshooting - Problème getUser() Nouveaux Onglets

## 🎯 Problème Identifié
**Symptôme :** La requête `getUser()` ne s'exécute pas quand un nouvel onglet est ouvert alors qu'une session est active dans un autre onglet.

## 📊 Diagnostic Étape par Étape

### Étape 1: Vérification de Base
```bash
# Dans la console développeur du nouvel onglet :
window.location.href  # Vérifier l'URL
typeof window.supabase  # Devrait retourner "object"
```

### Étape 2: Inspection localStorage
```javascript
// Vérifier les données d'auth
Object.keys(localStorage).filter(k => k.includes('supabase'))

// Inspecter le contenu
const authData = localStorage.getItem('supabase.auth.token')
console.log(JSON.parse(authData))
```

### Étape 3: Test Manuel getUser()
```javascript
// Test direct dans la console
const { data, error } = await window.supabase.auth.getUser()
console.log('getUser result:', { data, error })
```

### Étape 4: Test Manuel getSession()
```javascript
// Fallback method
const { data, error } = await window.supabase.auth.getSession()
console.log('getSession result:', { data, error })
```

## 🔍 Causes Probables Identifiées

### 1. **Race Condition au Chargement**
- **Problème :** AuthContext s'initialise avant que Supabase soit prêt
- **Solution :** Délai d'initialisation ajouté (100ms)
- **Vérification :** Le timer est-il bien dans `useEffect` ?

### 2. **Client Supabase Non Initialisé**
- **Problème :** `supabase` objet non disponible au moment de l'appel
- **Solution :** Vérification `if (supabase)` avant appel
- **Vérification :** `window.supabase` existe-t-il ?

### 3. **useEffect Non Déclenché**
- **Problème :** Dépendances ou conditions empêchent l'exécution
- **Solution :** Logging ajouté pour tracer l'exécution
- **Vérification :** Voir logs "🔄 Tentative de récupération utilisateur"

### 4. **Session localStorage Corrompue**
- **Problème :** Données invalides ou expirées
- **Solution :** Nettoyage automatique en cas d'erreur
- **Vérification :** `diagnoseSession()` pour analyse complète

## 🛠️ Solutions Implémentées

### ✅ Timer d'Initialisation
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    getInitialUser(); // Exécution différée
  }, 100);
  return () => clearTimeout(timer);
}, []);
```

### ✅ Fallback getSession()
```javascript
// Si getUser() échoue, utiliser getSession()
if (!currentUser && supabase) {
  const { data: sessionData } = await supabase.auth.getSession();
  currentUser = sessionData?.session?.user;
}
```

### ✅ Logging Détaillé
```javascript
console.log('📊 localStorage auth keys:', authKeys);
console.log('🔄 Tentative getUser()...');
console.log('✅ Utilisateur récupéré:', user?.email);
```

### ✅ Nettoyage Auto en Cas d'Erreur
```javascript
if (error) {
  console.log('🧹 Nettoyage session corrompue');
  await supabase.auth.signOut();
}
```

## 🧪 Tests de Validation

### Test 1: Ouverture Nouvel Onglet
1. Connectez-vous dans l'onglet principal
2. Ouvrez un nouvel onglet
3. Vérifiez console pour logs d'initialisation
4. L'utilisateur devrait être automatiquement connecté

### Test 2: Diagnostic Manuel
```javascript
// Dans le nouvel onglet
window.useAuth().diagnoseSession()
```

### Test 3: Script de Debug
1. Copiez le contenu de `debug-getuser-issue.js`
2. Collez dans console du nouvel onglet
3. Analysez les résultats
4. Suivez les solutions proposées

## 🔧 Actions de Dépannage

### Si getUser() Ne S'exécute Pas :
1. **Vérifiez timer :** Console devrait montrer initialisation après 100ms
2. **Forcez exécution :** `window.useAuth().diagnoseSession()`
3. **Vérifiez Supabase :** `typeof window.supabase`

### Si Session Non Récupérée :
1. **Nettoyez localStorage :** Bouton de déconnexion puis reconnexion
2. **Vérifiez expiration :** Token peut être expiré
3. **Testez navigation :** Rechargez page principale puis nouveaux onglets

### Si Problème Persiste :
1. **Mode incognito :** Testez session fraîche
2. **Navigateur différent :** Vérifiez compatibilité
3. **Logs réseau :** F12 > Network pour voir requêtes auth

## 📋 Checklist de Validation

- [ ] Console montre "🔄 Tentative de récupération utilisateur"
- [ ] Timer de 100ms s'exécute
- [ ] `window.supabase` est défini
- [ ] localStorage contient données auth valides
- [ ] getUser() OU getSession() retourne utilisateur
- [ ] useAuth() context mis à jour avec utilisateur
- [ ] Interface utilisateur reflète état connecté

## 🆘 Contact de Support

Si le problème persiste après ces étapes :

1. **Collectez logs :** Copiez console output complet
2. **Contexte :** Navigateur, OS, étapes de reproduction
3. **Script diagnostic :** Résultats de `debug-getuser-issue.js`
4. **Données session :** État localStorage (sans tokens sensibles)

---

*Guide créé suite au debugging de l'AuthContext TravelHub*
*Dernière mise à jour : Session recovery enhancements*
