import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config()

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test de connexion à Supabase
async function testSupabaseConnection() {
  console.log('🔍 Test de connexion à Supabase...')
  console.log('URL:', supabaseUrl)
  console.log('Key preview:', supabaseAnonKey.substring(0, 50) + '...')
  
  try {
    // Test 1: Vérifier la connexion basique
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Erreur de connexion à Supabase:', error)
      
      if (error.code === 'PGRST116') {
        console.log('ℹ️  Table "users" existe mais nécessite une authentification (RLS activé)')
        return true
      }
      
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
        if (error.code === 'PGRST116') {
          console.log(`✅ Table "${table}" existe (RLS activé)`)
        } else if (error.code === '42P01') {
          console.error(`❌ Table "${table}" n'existe pas`)
        } else {
          console.error(`❌ Table "${table}" erreur:`, error.message)
        }
      } else {
        console.log(`✅ Table "${table}" existe et accessible`)
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
      
      if (error.message.includes('signup is disabled')) {
        console.log('ℹ️  L\'inscription publique est désactivée dans Supabase')
      } else if (error.message.includes('email')) {
        console.log('ℹ️  Problème avec l\'email (peut-être déjà utilisé ou format invalide)')
      }
      
      return false
    }
    
    console.log('✅ Inscription test réussie pour:', testEmail)
    console.log('📧 User créé:', data.user?.id)
    console.log('📧 Email confirmation requis:', !data.user?.email_confirmed_at)
    
    return true
  } catch (err) {
    console.error('❌ Erreur lors du test d\'inscription:', err.message)
    return false
  }
}

// Test de la version et des paramètres Supabase
async function testSupabaseStatus() {
  console.log('\n⚙️  Test des paramètres Supabase...')
  
  try {
    // Test de la session actuelle
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ Erreur lors de la récupération de la session:', error.message)
    } else {
      console.log('📋 Session actuelle:', session ? 'Connecté' : 'Non connecté')
    }
    
    // Test de l'utilisateur actuel
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', userError.message)
    } else {
      console.log('👤 Utilisateur actuel:', user ? user.email : 'Aucun')
    }
    
  } catch (err) {
    console.error('❌ Erreur lors du test des paramètres:', err.message)
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Début des tests Supabase\n')
  
  const connectionOk = await testSupabaseConnection()
  
  await testTables()
  await testSupabaseStatus()
  await testRegistration()
  
  console.log('\n✨ Tests terminés')
  
  if (!connectionOk) {
    console.log('\n🔧 Actions recommandées:')
    console.log('1. Vérifiez que votre projet Supabase est actif')
    console.log('2. Vérifiez les clés API dans le fichier .env')
    console.log('3. Créez les tables nécessaires dans votre base de données')
    console.log('4. Configurez les politiques RLS si nécessaire')
  }
}

// Exécuter les tests
runAllTests().catch(console.error)
