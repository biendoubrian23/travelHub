// Script pour identifier la vraie clé localStorage de Supabase
console.log('🔍 === DÉTECTION CLÉ SUPABASE ===');

function detectSupabaseKey() {
  console.log('\n📦 Toutes les clés localStorage:');
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`📋 ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
  });
  
  console.log('\n🔍 Clés contenant "supabase":');
  const supabaseKeys = allKeys.filter(k => k.toLowerCase().includes('supabase'));
  supabaseKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`🔑 ${key}:`, value ? 'PRÉSENT' : 'VIDE');
    
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`   📊 Structure:`, {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          hasUser: !!parsed.user,
          hasSession: !!parsed.session,
          type: typeof parsed
        });
      } catch {
        console.log(`   📊 Contenu (non-JSON):`, value.substring(0, 100));
      }
    }
  });
  
  console.log('\n🔍 Clés contenant "auth":');
  const authKeys = allKeys.filter(k => k.toLowerCase().includes('auth'));
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && !supabaseKeys.includes(key)) {
      console.log(`🔐 ${key}:`, 'PRÉSENT');
    }
  });
  
  console.log('\n🔍 Clés commençant par "sb-":');
  const sbKeys = allKeys.filter(k => k.startsWith('sb-'));
  sbKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`⚡ ${key}:`, value ? 'PRÉSENT' : 'VIDE');
    
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`   📊 Structure SB:`, {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          hasUser: !!parsed.user,
          hasSession: !!parsed.session
        });
      } catch {
        console.log(`   📊 Contenu SB:`, value.substring(0, 50));
      }
    }
  });
}

function generateSupabaseKeyPattern() {
  console.log('\n🎯 Génération pattern clé Supabase:');
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  console.log('🌐 Info site:', { hostname, protocol, port });
  
  const possiblePatterns = [
    `sb-${hostname}-auth-token`,
    `sb-${hostname}:${port}-auth-token`,
    `sb-localhost-auth-token`,
    `sb-127.0.0.1-auth-token`,
    'supabase.auth.token',
    'supabase.session',
    'sb-auth-token'
  ];
  
  console.log('🔑 Patterns possibles:', possiblePatterns);
  
  possiblePatterns.forEach(pattern => {
    const value = localStorage.getItem(pattern);
    if (value) {
      console.log(`✅ TROUVÉ: ${pattern}`);
      return pattern;
    } else {
      console.log(`❌ Absent: ${pattern}`);
    }
  });
}

function testSupabaseSession() {
  console.log('\n🧪 Test session Supabase directe:');
  
  if (window.supabase) {
    window.supabase.auth.getSession().then(({ data, error }) => {
      console.log('📋 getSession() result:', {
        hasSession: !!data.session,
        hasUser: !!data.session?.user,
        error: error?.message
      });
      
      if (data.session) {
        console.log('👤 User info:', {
          id: data.session.user.id,
          email: data.session.user.email,
          confirmedAt: data.session.user.email_confirmed_at
        });
      }
    });
  } else {
    console.log('❌ window.supabase non disponible');
  }
}

// Instructions d'utilisation
function showInstructions() {
  console.log('\n📋 === INSTRUCTIONS ===');
  console.log('1. Connectez-vous dans l\'onglet principal');
  console.log('2. Exécutez ce script dans le même onglet');
  console.log('3. Notez la clé qui contient les données auth');
  console.log('4. Ouvrez un nouvel onglet');
  console.log('5. Exécutez à nouveau pour comparer');
  console.log('\n🎯 Objectif: Identifier la vraie clé localStorage de Supabase');
}

// Fonction principale
function runDetection() {
  console.log('🚀 === DÉTECTION CLÉ SUPABASE ===\n');
  showInstructions();
  detectSupabaseKey();
  generateSupabaseKeyPattern();
  testSupabaseSession();
  console.log('\n🏁 === FIN DÉTECTION ===');
}

// Ajout fonction utilitaire window
if (typeof window !== 'undefined') {
  window.detectSupabaseKey = runDetection;
  console.log('🛠️ Fonction ajoutée: window.detectSupabaseKey()');
}

// Exécution
runDetection();
