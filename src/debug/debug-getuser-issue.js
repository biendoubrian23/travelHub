// Script de diagnostic pour le problème de getUser() dans les nouveaux onglets
console.log('🔬 Diagnostic TravelHub - Problème nouveaux onglets');

// Fonction pour vérifier l'état de Supabase
function checkSupabaseState() {
  console.log('\n📊 État de Supabase');
  
  // Vérifier si Supabase est chargé
  if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Client Supabase trouvé');
  } else {
    console.log('❌ Client Supabase non trouvé');
  }
  
  // Vérifier localStorage
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('supabase') || key.includes('auth')
  );
  
  console.log('📦 Clés auth localStorage:', authKeys);
  
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`🔑 ${key}:`, {
          type: typeof parsed,
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000) : null,
          isExpired: parsed.expires_at ? Date.now() > (parsed.expires_at * 1000) : false
        });
      } catch {
        console.log(`🔑 ${key}: ${value.substring(0, 50)}...`);
      }
    }
  });
}

// Fonction pour tester les méthodes Supabase
async function testSupabaseMethods() {
  console.log('\n🧪 Test des méthodes Supabase');
  
  if (typeof window === 'undefined' || !window.supabase) {
    console.log('❌ Supabase non disponible');
    return;
  }
  
  const { supabase } = window;
  
  // Test 1: getUser()
  try {
    console.log('🔄 Test getUser()...');
    const { data, error } = await supabase.auth.getUser();
    console.log('📋 Résultat getUser():', {
      success: !error,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      email: data?.user?.email,
      error: error?.message
    });
  } catch (error) {
    console.error('❌ Erreur getUser():', error);
  }
  
  // Test 2: getSession()
  try {
    console.log('🔄 Test getSession()...');
    const { data, error } = await supabase.auth.getSession();
    console.log('📋 Résultat getSession():', {
      success: !error,
      hasSession: !!data?.session,
      hasUser: !!data?.session?.user,
      accessToken: !!data?.session?.access_token,
      error: error?.message
    });
  } catch (error) {
    console.error('❌ Erreur getSession():', error);
  }
}

// Fonction pour vérifier le contexte React
function checkReactContext() {
  console.log('\n⚛️ État du contexte React');
  
  // Vérifier si useAuth est disponible
  if (typeof window !== 'undefined' && window.useAuth) {
    console.log('✅ Hook useAuth disponible');
    try {
      const auth = window.useAuth();
      console.log('📋 État auth:', {
        loading: auth.loading,
        hasUser: !!auth.user,
        hasUserProfile: !!auth.userProfile,
        hasAgency: !!auth.agency
      });
    } catch (error) {
      console.log('❌ Erreur useAuth:', error.message);
    }
  } else {
    console.log('❌ Hook useAuth non disponible');
  }
}

// Fonction pour simuler le problème
function simulateNewTabIssue() {
  console.log('\n🎭 Simulation du problème nouveau onglet');
  
  const commonIssues = [
    {
      issue: 'Client Supabase non initialisé',
      solution: 'Vérifier que supabase est importé et accessible',
      check: () => typeof window !== 'undefined' && window.supabase
    },
    {
      issue: 'Session expirée en localStorage',
      solution: 'Nettoyer localStorage ou rafraîchir token',
      check: () => {
        const session = localStorage.getItem('supabase.auth.token');
        if (!session) return false;
        try {
          const parsed = JSON.parse(session);
          return parsed.expires_at && Date.now() < (parsed.expires_at * 1000);
        } catch {
          return false;
        }
      }
    },
    {
      issue: 'useEffect non déclenché',
      solution: 'Vérifier les dépendances et le timing',
      check: () => true // Difficile à vérifier automatiquement
    },
    {
      issue: 'Race condition au chargement',
      solution: 'Ajouter délai ou vérifier état Supabase',
      check: () => true // Timing issue
    }
  ];
  
  commonIssues.forEach((item, index) => {
    const status = item.check() ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${item.issue}`);
    console.log(`   💡 Solution: ${item.solution}`);
  });
}

// Fonction pour proposer des solutions
function suggestSolutions() {
  console.log('\n💡 Solutions proposées');
  
  const solutions = [
    '1. 🔄 Ajouter fallback avec getSession()',
    '2. ⏱️ Introduire délai d\'initialisation (100ms)',
    '3. 🔍 Ajouter logging détaillé pour debugging',
    '4. 🧹 Nettoyer localStorage si données corrompues',
    '5. 🔄 Forcer refresh si getUser() échoue silencieusement',
    '6. 📱 Tester sur différents navigateurs/onglets privés'
  ];
  
  solutions.forEach(solution => console.log(solution));
  
  console.log('\n📝 Code à tester dans la console:');
  console.log('```javascript');
  console.log('// Diagnostic complet');
  console.log('await window.useAuth().diagnoseSession()');
  console.log('');
  console.log('// Test manuel getUser');
  console.log('await window.supabase.auth.getUser()');
  console.log('');
  console.log('// Test manuel getSession');
  console.log('await window.supabase.auth.getSession()');
  console.log('```');
}

// Fonction principale
async function runDiagnostic() {
  console.log('🚀 Diagnostic complet - Problème nouveaux onglets\n');
  
  checkSupabaseState();
  await testSupabaseMethods();
  checkReactContext();
  simulateNewTabIssue();
  suggestSolutions();
  
  console.log('\n🏁 Diagnostic terminé');
  console.log('💡 Vérifiez les solutions proposées et testez les méthodes manuellement');
}

// Fonction d'assistance pour la console développeur
function createConsoleHelper() {
  console.log('\n🛠️ Fonctions utiles ajoutées à window:');
  console.log('• window.diagnoseTravelHub() - Lancer diagnostic complet');
  console.log('• window.checkSupabase() - Vérifier état Supabase');
  console.log('• window.testAuth() - Tester méthodes auth');
  
  window.diagnoseTravelHub = runDiagnostic;
  window.checkSupabase = checkSupabaseState;
  window.testAuth = testSupabaseMethods;
}

// Exécution selon l'environnement
if (typeof window !== 'undefined') {
  // Navigateur - exécution immédiate
  runDiagnostic();
  createConsoleHelper();
} else {
  // Node.js - affichage instructions
  console.log('🌐 Ce script est conçu pour le navigateur');
  console.log('📋 Instructions:');
  console.log('1. Ouvrez la console développeur (F12)');
  console.log('2. Copiez-collez ce script');
  console.log('3. Analysez les résultats');
  console.log('4. Testez les solutions proposées');
}
