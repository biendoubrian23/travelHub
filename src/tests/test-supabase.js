<<<<<<< HEAD
import { supabase } from './src/lib/supabase.js'

// Test de connexion à Supabase
async function testSupabaseConnection() {
  console.log('🔍 Test de connexion à Supabase...')
  
  try {
    // Test 1: Vérifier la connexion
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error)
      return false
    }
    
    console.log('✅ Connexion à Supabase réussie')
    return true
  } catch (err) {
    console.error('❌ Erreur lors du test de connexion:', err)
    return false
  }
}

// Test des tables nécessaires
async function testTables() {
  console.log('\n🗄️  Vérification des tables...')
  
  const tables = ['users', 'agencies', 'agency_documents', 'agency_services', 'agency_capabilities']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error(`❌ Table "${table}" non trouvée ou erreur:`, error.message)
      } else {
        console.log(`✅ Table "${table}" existe`)
      }
    } catch (err) {
      console.error(`❌ Erreur lors de la vérification de la table "${table}":`, err.message)
    }
  }
}

// Test d'inscription simple
async function testRegistration() {
  console.log('\n📝 Test d\'inscription simple...')
  
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          phone: '+237123456789',
          role: 'agence'
        }
      }
    })
    
    if (error) {
      console.error('❌ Erreur lors de l\'inscription test:', error.message)
      return false
    }
    
    console.log('✅ Inscription test réussie pour:', testEmail)
    console.log('📧 User créé:', data.user?.id)
    
    // Nettoyage : supprimer l'utilisateur test
    if (data.user) {
      try {
        await supabase.auth.admin.deleteUser(data.user.id)
        console.log('🧹 Utilisateur test supprimé')
      } catch (cleanupError) {
        console.warn('⚠️  Impossible de supprimer l\'utilisateur test:', cleanupError.message)
      }
    }
    
    return true
  } catch (err) {
    console.error('❌ Erreur lors du test d\'inscription:', err.message)
    return false
  }
}

// Test de la politique d'authentification
async function testAuthPolicies() {
  console.log('\n🔐 Test des politiques d\'authentification...')
  
  try {
    // Vérifier si on peut accéder aux tables sans authentification
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Politique de sécurité RLS active (c\'est normal)')
    } else if (error) {
      console.error('❌ Erreur de politique:', error.message)
    } else {
      console.log('⚠️  Attention: Accès aux données sans authentification possible')
    }
  } catch (err) {
    console.error('❌ Erreur lors du test des politiques:', err.message)
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Début des tests Supabase\n')
  
  const connectionOk = await testSupabaseConnection()
  
  if (connectionOk) {
    await testTables()
    await testAuthPolicies()
    await testRegistration()
  }
  
  console.log('\n✨ Tests terminés')
}

// Exécuter les tests
runAllTests().catch(console.error)
=======
import { supabase } from './src/lib/supabase.js'

// Test de connexion à Supabase
async function testSupabaseConnection() {
  console.log('🔍 Test de connexion à Supabase...')
  
  try {
    // Test 1: Vérifier la connexion
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error)
      return false
    }
    
    console.log('✅ Connexion à Supabase réussie')
    return true
  } catch (err) {
    console.error('❌ Erreur lors du test de connexion:', err)
    return false
  }
}

// Test des tables nécessaires
async function testTables() {
  console.log('\n🗄️  Vérification des tables...')
  
  const tables = ['users', 'agencies', 'agency_documents', 'agency_services', 'agency_capabilities']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error(`❌ Table "${table}" non trouvée ou erreur:`, error.message)
      } else {
        console.log(`✅ Table "${table}" existe`)
      }
    } catch (err) {
      console.error(`❌ Erreur lors de la vérification de la table "${table}":`, err.message)
    }
  }
}

// Test d'inscription simple
async function testRegistration() {
  console.log('\n📝 Test d\'inscription simple...')
  
  const testEmail = `test${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          phone: '+237123456789',
          role: 'agence'
        }
      }
    })
    
    if (error) {
      console.error('❌ Erreur lors de l\'inscription test:', error.message)
      return false
    }
    
    console.log('✅ Inscription test réussie pour:', testEmail)
    console.log('📧 User créé:', data.user?.id)
    
    // Nettoyage : supprimer l'utilisateur test
    if (data.user) {
      try {
        await supabase.auth.admin.deleteUser(data.user.id)
        console.log('🧹 Utilisateur test supprimé')
      } catch (cleanupError) {
        console.warn('⚠️  Impossible de supprimer l\'utilisateur test:', cleanupError.message)
      }
    }
    
    return true
  } catch (err) {
    console.error('❌ Erreur lors du test d\'inscription:', err.message)
    return false
  }
}

// Test de la politique d'authentification
async function testAuthPolicies() {
  console.log('\n🔐 Test des politiques d\'authentification...')
  
  try {
    // Vérifier si on peut accéder aux tables sans authentification
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Politique de sécurité RLS active (c\'est normal)')
    } else if (error) {
      console.error('❌ Erreur de politique:', error.message)
    } else {
      console.log('⚠️  Attention: Accès aux données sans authentification possible')
    }
  } catch (err) {
    console.error('❌ Erreur lors du test des politiques:', err.message)
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Début des tests Supabase\n')
  
  const connectionOk = await testSupabaseConnection()
  
  if (connectionOk) {
    await testTables()
    await testAuthPolicies()
    await testRegistration()
  }
  
  console.log('\n✨ Tests terminés')
}

// Exécuter les tests
runAllTests().catch(console.error)
>>>>>>> master
