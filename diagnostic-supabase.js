<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test avec un email valide pour voir si l'inscription fonctionne
async function testValidRegistration() {
  console.log('📝 Test d\'inscription avec email valide...')
  
  const testEmail = 'test@gmail.com'  // Email avec domaine valide
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
      console.error('❌ Erreur lors de l\'inscription:', error.message)
      
      if (error.message.includes('User already registered')) {
        console.log('ℹ️  L\'utilisateur existe déjà - c\'est normal pour un test')
        return true
      }
      
      return false
    }
    
    console.log('✅ Inscription réussie pour:', testEmail)
    console.log('📧 User ID:', data.user?.id)
    console.log('📧 Email confirmé:', data.user?.email_confirmed_at ? 'Oui' : 'Non')
    
    return true
  } catch (err) {
    console.error('❌ Erreur lors du test d\'inscription:', err.message)
    return false
  }
}

// Test de création d'un profil utilisateur
async function testCreateUserProfile() {
  console.log('\n👤 Test de création de profil utilisateur...')
  
  // D'abord, on s'inscrit
  const testEmail = 'profiletest@gmail.com'
  const testPassword = 'TestPassword123!'
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })
    
    if (authError && !authError.message.includes('User already registered')) {
      console.error('❌ Erreur d\'inscription:', authError.message)
      return false
    }
    
    // Si l'utilisateur existe déjà, on essaie de se connecter
    let userId = authData?.user?.id
    
    if (!userId) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signInError) {
        console.error('❌ Erreur de connexion:', signInError.message)
        return false
      }
      
      userId = signInData.user?.id
    }
    
    if (!userId) {
      console.error('❌ Impossible d\'obtenir un ID utilisateur')
      return false
    }
    
    // Maintenant, on essaie de créer le profil
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: testEmail,
        full_name: 'Test User',
        phone: '+237123456789',
        role: 'agence'
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Erreur de création de profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil utilisateur créé:', profileData)
    return true
    
  } catch (err) {
    console.error('❌ Erreur lors du test de profil:', err.message)
    return false
  }
}

// Test de vérification des permissions d'authentification
async function testAuthSettings() {
  console.log('\n🔐 Test des paramètres d\'authentification...')
  
  try {
    // Tenter de s'inscrire avec des paramètres différents
    const { data, error } = await supabase.auth.signUp({
      email: 'authtest@gmail.com',
      password: 'SimplePass123'
    })
    
    if (error) {
      console.log('❌ Erreur d\'inscription:', error.message)
      
      if (error.message.includes('signup is disabled')) {
        console.log('ℹ️  L\'inscription publique est désactivée')
        console.log('   👉 Activez l\'inscription dans: Dashboard Supabase > Authentication > Settings')
      } else if (error.message.includes('password')) {
        console.log('ℹ️  Problème de politique de mot de passe')
        console.log('   👉 Vérifiez: Dashboard Supabase > Authentication > Settings > Password policy')
      }
    } else {
      console.log('✅ Inscription autorisée')
      console.log('📧 Confirmation d\'email requise:', !data.user?.email_confirmed_at)
    }
    
  } catch (err) {
    console.error('❌ Erreur lors du test d\'authentification:', err.message)
  }
}

// Exécuter tous les tests
async function runDiagnostics() {
  console.log('🔍 Diagnostic complet de Supabase\n')
  
  await testAuthSettings()
  await testValidRegistration()
  await testCreateUserProfile()
  
  console.log('\n📋 Résumé des actions à effectuer:')
  console.log('1. Exécuter le script SQL create-missing-tables.sql dans votre dashboard Supabase')
  console.log('2. Vérifier que l\'inscription est activée dans Authentication > Settings')
  console.log('3. Tester à nouveau l\'inscription depuis votre application')
  console.log('\n🔗 Dashboard Supabase: https://supabase.com/dashboard/project/dqoncbnvyviurirsdtyu')
}

runDiagnostics().catch(console.error)
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test avec un email valide pour voir si l'inscription fonctionne
async function testValidRegistration() {
  console.log('📝 Test d\'inscription avec email valide...')
  
  const testEmail = 'test@gmail.com'  // Email avec domaine valide
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
      console.error('❌ Erreur lors de l\'inscription:', error.message)
      
      if (error.message.includes('User already registered')) {
        console.log('ℹ️  L\'utilisateur existe déjà - c\'est normal pour un test')
        return true
      }
      
      return false
    }
    
    console.log('✅ Inscription réussie pour:', testEmail)
    console.log('📧 User ID:', data.user?.id)
    console.log('📧 Email confirmé:', data.user?.email_confirmed_at ? 'Oui' : 'Non')
    
    return true
  } catch (err) {
    console.error('❌ Erreur lors du test d\'inscription:', err.message)
    return false
  }
}

// Test de création d'un profil utilisateur
async function testCreateUserProfile() {
  console.log('\n👤 Test de création de profil utilisateur...')
  
  // D'abord, on s'inscrit
  const testEmail = 'profiletest@gmail.com'
  const testPassword = 'TestPassword123!'
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })
    
    if (authError && !authError.message.includes('User already registered')) {
      console.error('❌ Erreur d\'inscription:', authError.message)
      return false
    }
    
    // Si l'utilisateur existe déjà, on essaie de se connecter
    let userId = authData?.user?.id
    
    if (!userId) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      })
      
      if (signInError) {
        console.error('❌ Erreur de connexion:', signInError.message)
        return false
      }
      
      userId = signInData.user?.id
    }
    
    if (!userId) {
      console.error('❌ Impossible d\'obtenir un ID utilisateur')
      return false
    }
    
    // Maintenant, on essaie de créer le profil
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: testEmail,
        full_name: 'Test User',
        phone: '+237123456789',
        role: 'agence'
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Erreur de création de profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil utilisateur créé:', profileData)
    return true
    
  } catch (err) {
    console.error('❌ Erreur lors du test de profil:', err.message)
    return false
  }
}

// Test de vérification des permissions d'authentification
async function testAuthSettings() {
  console.log('\n🔐 Test des paramètres d\'authentification...')
  
  try {
    // Tenter de s'inscrire avec des paramètres différents
    const { data, error } = await supabase.auth.signUp({
      email: 'authtest@gmail.com',
      password: 'SimplePass123'
    })
    
    if (error) {
      console.log('❌ Erreur d\'inscription:', error.message)
      
      if (error.message.includes('signup is disabled')) {
        console.log('ℹ️  L\'inscription publique est désactivée')
        console.log('   👉 Activez l\'inscription dans: Dashboard Supabase > Authentication > Settings')
      } else if (error.message.includes('password')) {
        console.log('ℹ️  Problème de politique de mot de passe')
        console.log('   👉 Vérifiez: Dashboard Supabase > Authentication > Settings > Password policy')
      }
    } else {
      console.log('✅ Inscription autorisée')
      console.log('📧 Confirmation d\'email requise:', !data.user?.email_confirmed_at)
    }
    
  } catch (err) {
    console.error('❌ Erreur lors du test d\'authentification:', err.message)
  }
}

// Exécuter tous les tests
async function runDiagnostics() {
  console.log('🔍 Diagnostic complet de Supabase\n')
  
  await testAuthSettings()
  await testValidRegistration()
  await testCreateUserProfile()
  
  console.log('\n📋 Résumé des actions à effectuer:')
  console.log('1. Exécuter le script SQL create-missing-tables.sql dans votre dashboard Supabase')
  console.log('2. Vérifier que l\'inscription est activée dans Authentication > Settings')
  console.log('3. Tester à nouveau l\'inscription depuis votre application')
  console.log('\n🔗 Dashboard Supabase: https://supabase.com/dashboard/project/dqoncbnvyviurirsdtyu')
}

runDiagnostics().catch(console.error)
>>>>>>> master
