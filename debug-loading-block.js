// Script de debug pour identifier le blocage de chargement
console.log('🔬 === DEBUG BLOCAGE CHARGEMENT ===');

function monitorLoadingState() {
  console.log('\n🔍 Monitoring état loading...');
  
  let loadingCheckCount = 0;
  const maxChecks = 30; // 30 secondes max
  
  const interval = setInterval(() => {
    loadingCheckCount++;
    
    try {
      // Vérifier l'état du contexte auth
      if (typeof window !== 'undefined' && window.useAuth) {
        const auth = window.useAuth();
        console.log(`⏱️ Check ${loadingCheckCount}: loading=${auth.loading}, user=${!!auth.user}, userProfile=${!!auth.userProfile}`);
        
        // Si loading est false ou si on a un utilisateur, arrêter le monitoring
        if (!auth.loading || auth.user) {
          console.log('✅ État stable détecté, arrêt monitoring');
          clearInterval(interval);
          return;
        }
      }
      
      // Arrêter après 30 checks
      if (loadingCheckCount >= maxChecks) {
        console.log('⚠️ Timeout monitoring - Loading bloqué !');
        console.log('🔍 État final:', {
          checks: loadingCheckCount,
          duration: `${loadingCheckCount}s`,
          status: 'BLOQUÉ'
        });
        clearInterval(interval);
      }
    } catch (error) {
      console.error('❌ Erreur monitoring:', error);
      clearInterval(interval);
    }
  }, 1000);
  
  return interval;
}

function analyzeBlockingPoints() {
  console.log('\n🔍 Points de blocage possibles:');
  
  const blockingPoints = [
    '1. 🔄 getSession() prioritaire ne retourne jamais',
    '2. 🔄 loadUserProfile() bloqué sur requête DB',
    '3. 🔄 loadAgencyData() ne termine jamais',
    '4. 🔄 setLoading(false) pas appelé',
    '5. 🔄 Promise non résolue dans useEffect',
    '6. 🔄 Erreur silencieuse dans catch'
  ];
  
  blockingPoints.forEach(point => console.log(point));
}

function createForceUnblock() {
  console.log('\n🛠️ Fonction de déblocage forcé:');
  
  if (typeof window !== 'undefined') {
    window.forceUnblockLoading = () => {
      console.log('🚨 DÉBLOCAGE FORCÉ DU LOADING');
      try {
        const auth = window.useAuth();
        if (auth.loading) {
          console.log('🔧 Forcer setLoading(false)...');
          // Note: On ne peut pas directement appeler setLoading depuis l'extérieur
          // Mais on peut déclencher une reconnexion
          console.log('💡 Conseil: Rafraîchissez la page ou déconnectez/reconnectez');
        }
      } catch (error) {
        console.error('❌ Erreur déblocage:', error);
      }
    };
    
    window.debugAuthState = () => {
      console.log('🔬 État auth actuel:');
      try {
        const auth = window.useAuth();
        console.log({
          loading: auth.loading,
          hasUser: !!auth.user,
          hasUserProfile: !!auth.userProfile,
          hasAgency: !!auth.agency,
          hasEmployeeData: !!auth.employeeData
        });
      } catch (error) {
        console.error('❌ Erreur debug:', error);
      }
    };
    
    console.log('✅ Fonctions ajoutées:');
    console.log('• window.forceUnblockLoading() - Tenter déblocage');
    console.log('• window.debugAuthState() - Voir état actuel');
  }
}

function showSolutions() {
  console.log('\n💡 Solutions de déblocage:');
  
  const solutions = [
    '1. 🔄 Rafraîchir la page (F5)',
    '2. 🔄 Vider cache navigateur (Ctrl+Shift+R)',
    '3. 🔄 Déconnexion/reconnexion manuel',
    '4. 🔄 Nettoyer localStorage et reconnexion',
    '5. 🔄 Vérifier Network tab pour requêtes bloquées',
    '6. 🔄 Vérifier Console pour erreurs silencieuses'
  ];
  
  solutions.forEach(solution => console.log(solution));
  
  console.log('\n📋 Code de nettoyage localStorage:');
  console.log('```javascript');
  console.log('// Nettoyer toutes les données auth');
  console.log('Object.keys(localStorage)');
  console.log('  .filter(k => k.includes("supabase") || k.startsWith("sb-"))');
  console.log('  .forEach(k => localStorage.removeItem(k))');
  console.log('// Puis rafraîchir la page');
  console.log('```');
}

// Exécution
analyzeBlockingPoints();
createForceUnblock();
showSolutions();

// Démarrer monitoring automatique
if (typeof window !== 'undefined') {
  console.log('\n🔄 Démarrage monitoring automatique...');
  const monitorInterval = monitorLoadingState();
  
  // Arrêter automatiquement après 30 secondes
  setTimeout(() => {
    clearInterval(monitorInterval);
    console.log('⏰ Fin monitoring automatique');
  }, 30000);
}

console.log('\n🏁 === FIN DEBUG BLOCAGE ===');
