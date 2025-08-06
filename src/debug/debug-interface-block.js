// Script pour vérifier pourquoi l'interface ne se met pas à jour
console.log('🔬 === DIAGNOSTIC INTERFACE BLOQUÉE ===');

function checkAuthState() {
  console.log('\n📊 Vérification état authentification:');
  
  try {
    if (typeof window !== 'undefined' && window.useAuth) {
      const auth = window.useAuth();
      
      const state = {
        loading: auth.loading,
        hasUser: !!auth.user,
        userEmail: auth.user?.email,
        hasUserProfile: !!auth.userProfile,
        profileName: auth.userProfile?.full_name,
        hasAgency: !!auth.agency,
        agencyName: auth.agency?.name,
        hasEmployeeData: !!auth.employeeData
      };
      
      console.log('🔍 État AuthContext:', state);
      
      // Vérifier incohérences
      if (!auth.loading && auth.user && auth.userProfile) {
        console.log('✅ Tout semble correct - L\'utilisateur devrait être connecté !');
        console.log('❓ Si vous voyez encore l\'écran de chargement, c\'est un problème d\'interface');
      } else if (!auth.loading && !auth.user) {
        console.log('❌ Pas d\'utilisateur - Normal d\'être déconnecté');
      } else if (auth.loading) {
        console.log('⏳ Loading encore à true - Attendre ou forcer setLoading(false)');
      }
      
      return state;
    } else {
      console.log('❌ useAuth non disponible');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur vérification état:', error);
    return null;
  }
}

function checkComponentRender() {
  console.log('\n🎨 Vérification rendu composant:');
  
  // Vérifier si des composants React sont bloqués
  const reactProblems = [
    '• Composant parent bloqué sur loading=true',
    '• Condition de rendu incorrecte',
    '• État loading pas mis à jour',
    '• Erreur dans le rendu causant crash silencieux',
    '• Route protégée bloquant la navigation'
  ];
  
  console.log('🔍 Problèmes potentiels:', reactProblems);
}

function forceDebugMode() {
  console.log('\n🛠️ Mode debug forcé:');
  
  if (typeof window !== 'undefined') {
    // Fonction pour forcer le déblocage
    window.forceStopLoading = () => {
      console.log('🚨 FORCER ARRÊT LOADING');
      try {
        // On ne peut pas directement modifier l'état, mais on peut diagnostiquer
        const auth = window.useAuth();
        console.log('📊 État avant force:', {
          loading: auth.loading,
          user: !!auth.user
        });
        
        if (auth.user && auth.loading) {
          console.log('⚠️ INCOHÉRENCE DÉTECTÉE: Utilisateur présent mais loading=true');
          console.log('💡 Solution: Vérifiez votre composant App.jsx ou composant principal');
          console.log('💡 Recherchez une condition comme: if (loading) return <Loading />');
        }
      } catch (error) {
        console.error('❌ Erreur force stop:', error);
      }
    };
    
    // Fonction pour surveiller les changements
    window.watchAuthChanges = () => {
      console.log('👁️ Surveillance changements auth...');
      
      let lastState = null;
      const interval = setInterval(() => {
        try {
          const auth = window.useAuth();
          const currentState = {
            loading: auth.loading,
            hasUser: !!auth.user,
            hasProfile: !!auth.userProfile
          };
          
          if (JSON.stringify(currentState) !== JSON.stringify(lastState)) {
            console.log('🔄 Changement détecté:', currentState);
            lastState = currentState;
            
            if (!currentState.loading && currentState.hasUser) {
              console.log('✅ État final atteint - Arrêt surveillance');
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('❌ Erreur surveillance:', error);
          clearInterval(interval);
        }
      }, 500);
      
      // Arrêter après 30 secondes
      setTimeout(() => {
        clearInterval(interval);
        console.log('⏰ Fin surveillance automatique');
      }, 30000);
      
      return interval;
    };
    
    console.log('✅ Fonctions ajoutées:');
    console.log('• window.forceStopLoading() - Diagnostiquer blocage loading');
    console.log('• window.watchAuthChanges() - Surveiller changements');
  }
}

function suggestSolutions() {
  console.log('\n💡 Solutions suggérées:');
  
  const solutions = [
    '1. 🔍 Vérifier App.jsx - condition "if (loading) return <Spinner />"',
    '2. 🔍 Vérifier route protégée - AuthGuard ou ProtectedRoute',
    '3. 🔄 Rafraîchir page complètement (Ctrl+F5)',
    '4. 🧹 Nettoyer cache React DevTools',
    '5. 🔄 Redémarrer serveur dev (npm run dev)',
    '6. 🔍 Vérifier erreurs JavaScript silencieuses'
  ];
  
  solutions.forEach(solution => console.log(solution));
  
  console.log('\n📋 Code à vérifier dans votre App.jsx:');
  console.log('```jsx');
  console.log('const { loading, user } = useAuth()');
  console.log('');
  console.log('if (loading) {');
  console.log('  return <div>Chargement...</div> // ← VÉRIFIEZ ICI');
  console.log('}');
  console.log('```');
}

// Exécution
checkAuthState();
checkComponentRender();
forceDebugMode();
suggestSolutions();

// Auto-diagnostic au chargement
setTimeout(() => {
  console.log('\n🔄 Auto-diagnostic après 2 secondes...');
  const state = checkAuthState();
  
  if (state && !state.loading && state.hasUser) {
    console.log('🚨 PROBLÈME CONFIRMÉ: Auth OK mais interface bloquée');
    console.log('💡 VÉRIFIEZ VOTRE COMPOSANT APP.JSX ou COMPOSANT PRINCIPAL');
  }
}, 2000);

console.log('\n🏁 === FIN DIAGNOSTIC INTERFACE ===');
