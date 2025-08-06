<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 TEST CONNEXION COMPTE CLIENT')
console.log('===============================\n')

async function testClientLogin() {
  try {
    console.log('📧 Tentative de connexion: test@travelhub.com')
    
    // Connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@travelhub.com',
      password: 'Client123!'
    })
    
    if (authError) {
      console.log('❌ Erreur de connexion:', authError.message)
      return false
    }
    
    console.log('✅ Connexion réussie')
    console.log('🆔 User ID:', authData.user.id)
    
    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
    } else {
      console.log('👤 Profil trouvé:')
      console.log('   📝 Nom:', profile.full_name)
      console.log('   📧 Email:', profile.email)
      console.log('   🎭 Rôle:', profile.role)
      console.log('   🚦 Actif:', profile.is_active ? 'OUI' : 'NON')
    }
    
    // Tester la recherche d'agence (ne devrait pas en avoir)
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
    
    if (agencyData && agencyData.length > 0) {
      console.log('🏢 Agence associée:', agencyData[0].name)
    } else {
      console.log('🏢 Aucune agence associée (normal pour un client)')
    }
    
    // Déconnexion
    await supabase.auth.signOut()
    console.log('🔓 Déconnexion effectuée')
    
    return true
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message)
    return false
  }
}

async function main() {
  const success = await testClientLogin()
  
  console.log('\n' + '='.repeat(50))
  
  if (success) {
    console.log('✅ RÉSULTAT: Le compte client fonctionne')
    console.log('')
    console.log('👤 COMPTE CLIENT - UTILISATION:')
    console.log('📧 Email: test@travelhub.com')
    console.log('🔑 Password: Client123!')
    console.log('')
    console.log('🎯 CE QUE VERRA LE CLIENT:')
    console.log('• 📊 Dashboard (statistiques réduites)')
    console.log('• 🗺️  Trajets (consultation des lignes disponibles)')
    console.log('• 📅 Réservations (ses propres réservations)')
    console.log('• ⚙️  Paramètres (profil personnel)')
    console.log('')
    console.log('❌ CE QU\'IL NE VERRA PAS:')
    console.log('• 👥 Clients (gestion clients)')
    console.log('• 👤 Employés (gestion employés)')
    console.log('• 📊 Activité (logs agence)')
    console.log('')
    console.log('🔧 INTERFACE ADAPTÉE:')
    console.log('• Menu simplifié pour passagers')
    console.log('• Fonctions de réservation uniquement')
    console.log('• Pas d\'accès aux données d\'agence')
  } else {
    console.log('❌ RÉSULTAT: Problème avec le compte client')
  }
}

main().catch(console.error)
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 TEST CONNEXION COMPTE CLIENT')
console.log('===============================\n')

async function testClientLogin() {
  try {
    console.log('📧 Tentative de connexion: test@travelhub.com')
    
    // Connexion
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@travelhub.com',
      password: 'Client123!'
    })
    
    if (authError) {
      console.log('❌ Erreur de connexion:', authError.message)
      return false
    }
    
    console.log('✅ Connexion réussie')
    console.log('🆔 User ID:', authData.user.id)
    
    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
    } else {
      console.log('👤 Profil trouvé:')
      console.log('   📝 Nom:', profile.full_name)
      console.log('   📧 Email:', profile.email)
      console.log('   🎭 Rôle:', profile.role)
      console.log('   🚦 Actif:', profile.is_active ? 'OUI' : 'NON')
    }
    
    // Tester la recherche d'agence (ne devrait pas en avoir)
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
    
    if (agencyData && agencyData.length > 0) {
      console.log('🏢 Agence associée:', agencyData[0].name)
    } else {
      console.log('🏢 Aucune agence associée (normal pour un client)')
    }
    
    // Déconnexion
    await supabase.auth.signOut()
    console.log('🔓 Déconnexion effectuée')
    
    return true
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message)
    return false
  }
}

async function main() {
  const success = await testClientLogin()
  
  console.log('\n' + '='.repeat(50))
  
  if (success) {
    console.log('✅ RÉSULTAT: Le compte client fonctionne')
    console.log('')
    console.log('👤 COMPTE CLIENT - UTILISATION:')
    console.log('📧 Email: test@travelhub.com')
    console.log('🔑 Password: Client123!')
    console.log('')
    console.log('🎯 CE QUE VERRA LE CLIENT:')
    console.log('• 📊 Dashboard (statistiques réduites)')
    console.log('• 🗺️  Trajets (consultation des lignes disponibles)')
    console.log('• 📅 Réservations (ses propres réservations)')
    console.log('• ⚙️  Paramètres (profil personnel)')
    console.log('')
    console.log('❌ CE QU\'IL NE VERRA PAS:')
    console.log('• 👥 Clients (gestion clients)')
    console.log('• 👤 Employés (gestion employés)')
    console.log('• 📊 Activité (logs agence)')
    console.log('')
    console.log('🔧 INTERFACE ADAPTÉE:')
    console.log('• Menu simplifié pour passagers')
    console.log('• Fonctions de réservation uniquement')
    console.log('• Pas d\'accès aux données d\'agence')
  } else {
    console.log('❌ RÉSULTAT: Problème avec le compte client')
  }
}

main().catch(console.error)
>>>>>>> master
