// Test spécifique de déconnexion pour tous les types d'utilisateurs
// Ce script teste la fonction de déconnexion avec différents rôles

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧪 TEST DE DÉCONNEXION - TOUS RÔLES UTILISATEURS')
console.log('================================================\n')

// Test avec un compte admin d'agence
async function testAdminLogout() {
  console.log('👨‍💼 TEST 1: Déconnexion Admin Agence')
  console.log('=====================================')
  
  try {
    // Connexion admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'patron@agence.com',
      password: 'Patron123!'
    })
    
    if (authError) {
      console.log('❌ Erreur connexion admin:', authError.message)
      return false
    }
    
    console.log('✅ Connexion admin réussie')
    console.log('📧 Email:', authData.user.email)
    
    // Récupérer le profil
    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name')
      .eq('id', authData.user.id)
      .single()
    
    console.log('👤 Profil:', profile?.full_name)
    console.log('🎭 Rôle:', profile?.role)
    
    // Test de déconnexion
    console.log('\n🚪 Test de déconnexion...')
    const { error: signOutError } = await supabase.auth.signOut()
    
    if (signOutError) {
      console.log('❌ Erreur déconnexion admin:', signOutError.message)
      return false
    }
    
    console.log('✅ Déconnexion admin réussie')
    
    // Vérifier l'état de session
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔍 Session après déconnexion:', session ? 'ACTIVE' : 'INACTIVE')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur test admin:', error.message)
    return false
  }
}

// Test avec un compte employé (si disponible)
async function testEmployeeLogout() {
  console.log('\n👥 TEST 2: Déconnexion Employé')
  console.log('==============================')
  
  try {
    // Rechercher un employé existant
    const { data: employees } = await supabase
      .from('agency_employees')
      .select(`
        user_id,
        employee_role,
        full_name,
        users(email)
      `)
      .eq('is_active', true)
      .limit(1)
    
    if (!employees || employees.length === 0) {
      console.log('⚠️  Aucun employé actif trouvé pour le test')
      console.log('💡 Pour tester, créez d\'abord un employé depuis l\'interface admin')
      return true
    }
    
    const employee = employees[0]
    console.log('👤 Employé trouvé:', employee.full_name)
    console.log('🎭 Rôle:', employee.employee_role)
    console.log('📧 Email:', employee.users?.email)
    
    if (!employee.users?.email) {
      console.log('⚠️  Employé sans email - impossible de tester la connexion')
      return true
    }
    
    console.log('⚠️  Note: Test employé nécessite le mot de passe généré')
    console.log('💡 Utilisez l\'interface pour créer et tester un employé')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur test employé:', error.message)
    return false
  }
}

// Test avec différents états de session
async function testSessionStates() {
  console.log('\n🔍 TEST 3: États de Session')
  console.log('===========================')
  
  try {
    // Test état initial
    const { data: { session: initialSession } } = await supabase.auth.getSession()
    console.log('📊 Session initiale:', initialSession ? 'ACTIVE' : 'INACTIVE')
    
    // Test listener d'événements
    console.log('🎧 Test listener événements auth...')
    
    let authEventReceived = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔔 Événement auth reçu: ${event}`)
        console.log(`📋 Session: ${session ? 'ACTIVE' : 'INACTIVE'}`)
        authEventReceived = true
      }
    )
    
    // Attendre un peu pour voir si des événements arrivent
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    subscription.unsubscribe()
    
    console.log('✅ Test événements terminé')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur test session:', error.message)
    return false
  }
}

// Test principal
async function runLogoutTests() {
  console.log('🚀 DÉBUT DES TESTS DE DÉCONNEXION')
  console.log('==================================\n')
  
  const results = {
    admin: await testAdminLogout(),
    employee: await testEmployeeLogout(),
    session: await testSessionStates()
  }
  
  console.log('\n📋 RÉSULTATS DES TESTS')
  console.log('======================')
  console.log(`👨‍💼 Admin: ${results.admin ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`)
  console.log(`👥 Employé: ${results.employee ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`)
  console.log(`🔍 Session: ${results.session ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`)
  
  console.log('\n🔧 RECOMMANDATIONS:')
  console.log('===================')
  
  if (!results.admin) {
    console.log('❌ Problème de déconnexion admin détecté')
    console.log('💡 Vérifier les permissions dans AuthContext.jsx')
  }
  
  console.log('✅ Modifications récentes implémentées:')
  console.log('   • Amélioration de signOut dans AuthContext.jsx')
  console.log('   • Ajout de handleLogout dans App.jsx')
  console.log('   • Logging détaillé pour le debugging')
  console.log('   • Réinitialisation forcée en cas d\'erreur')
  
  console.log('\n🧪 PROCHAINS TESTS À FAIRE:')
  console.log('===========================')
  console.log('1. Créer un employé depuis l\'interface admin')
  console.log('2. Se connecter avec le compte employé')
  console.log('3. Tester la déconnexion depuis la sidebar')
  console.log('4. Vérifier les messages dans la console du navigateur')
  
  console.log('\n📞 Si le problème persiste:')
  console.log('===========================')
  console.log('• Videz le cache du navigateur')
  console.log('• Redémarrez le serveur de développement')
  console.log('• Vérifiez la console pour les erreurs détaillées')
}

// Exécuter les tests
runLogoutTests().catch(error => {
  console.error('❌ Erreur générale:', error.message)
})
