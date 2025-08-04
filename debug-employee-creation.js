<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 DIAGNOSTIC PERMISSIONS CRÉATION EMPLOYÉ')
console.log('==========================================\n')

async function testEmployeeCreationPermissions() {
  try {
    console.log('📧 Test connexion patron agence...')
    
    // Se connecter comme patron d'agence
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'patron@agence.com',
      password: 'Patron123!'
    })
    
    if (authError) {
      console.log('❌ Erreur connexion patron:', authError.message)
      return
    }
    
    console.log('✅ Connexion patron réussie')
    console.log('🆔 User ID:', authData.user.id)
    
    // Vérifier le profil
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Erreur récupération profil:', profileError.message)
      return
    }
    
    console.log('👤 Profil patron:')
    console.log('   📝 Nom:', profile.full_name)
    console.log('   🎭 Rôle:', profile.role)
    console.log('   🚦 Actif:', profile.is_active)
    
    // Vérifier l'agence
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur récupération agence:', agencyError.message)
      return
    }
    
    console.log('🏢 Agence trouvée:')
    console.log('   🏢 Nom:', agencyData.name)
    console.log('   🆔 ID:', agencyData.id)
    console.log('   ✅ Vérifiée:', agencyData.is_verified)
    
    // Test 1: Créer un utilisateur avec auth.admin
    console.log('\n🧪 Test 1: Création compte utilisateur...')
    
    const testEmployeeData = {
      email: 'employe.test@agence.com',
      password: 'EmployeTest123!'
    }
    
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: testEmployeeData.email,
      password: testEmployeeData.password,
      email_confirm: true
    })
    
    if (createUserError) {
      console.log('❌ Erreur création utilisateur auth:', createUserError.message)
      console.log('📋 Code erreur:', createUserError.status)
      
      if (createUserError.message.includes('not allowed')) {
        console.log('\n🔧 PROBLÈME IDENTIFIÉ:')
        console.log('• Les permissions admin ne sont pas activées')
        console.log('• Il faut utiliser le service key au lieu de anon key')
        console.log('• Ou activer les permissions admin dans Supabase Dashboard')
      }
      
      // Essayer avec auth.signUp à la place
      console.log('\n🧪 Test alternatif: Création avec signUp...')
      
      const { data: signUpUser, error: signUpError } = await supabase.auth.signUp({
        email: testEmployeeData.email,
        password: testEmployeeData.password
      })
      
      if (signUpError) {
        console.log('❌ Erreur signUp:', signUpError.message)
      } else {
        console.log('✅ SignUp réussi avec user ID:', signUpUser.user?.id)
        
        // Nettoyer le test
        if (signUpUser.user?.id) {
          await supabase.auth.admin.deleteUser(signUpUser.user.id)
          console.log('🧹 Utilisateur test supprimé')
        }
      }
      
    } else {
      console.log('✅ Création utilisateur réussie:', newUser.user.id)
      
      // Nettoyer le test
      await supabase.auth.admin.deleteUser(newUser.user.id)
      console.log('🧹 Utilisateur test supprimé')
    }
    
    // Test 2: Vérifier les permissions sur la table agency_employees
    console.log('\n🧪 Test 2: Permissions table agency_employees...')
    
    const { data: testInsert, error: insertError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agencyData.id,
        user_id: authData.user.id, // Utiliser le patron comme test
        employee_role: 'admin',
        full_name: 'Test Employee',
        email: 'test.employee@test.com',
        phone: '+237600000000',
        is_active: true
      })
      .select()
    
    if (insertError) {
      console.log('❌ Erreur insertion agency_employees:', insertError.message)
      console.log('📋 Code erreur:', insertError.code)
      console.log('📋 Détails:', insertError.details)
    } else {
      console.log('✅ Insertion agency_employees réussie')
      
      // Nettoyer le test
      await supabase
        .from('agency_employees')
        .delete()
        .eq('id', testInsert[0].id)
      console.log('🧹 Entrée test supprimée')
    }
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

async function checkSupabaseSettings() {
  console.log('\n🔧 VÉRIFICATION PARAMÈTRES SUPABASE')
  console.log('===================================')
  
  console.log('📋 Configuration actuelle:')
  console.log('   🌐 URL:', supabaseUrl)
  console.log('   🔑 Key type: anon (public)')
  console.log('')
  console.log('⚠️  PROBLÈME PROBABLE:')
  console.log('• auth.admin nécessite une service_role key')
  console.log('• La anon key n\'a pas les permissions admin')
  console.log('')
  console.log('🔧 SOLUTIONS:')
  console.log('1. Utiliser auth.signUp au lieu de auth.admin')
  console.log('2. Ou obtenir la service_role key de Supabase')
  console.log('3. Ou configurer les permissions RLS')
}

async function main() {
  await testEmployeeCreationPermissions()
  await checkSupabaseSettings()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 RÉSUMÉ DU DIAGNOSTIC')
  console.log('='.repeat(50))
  console.log('')
  console.log('🎯 CAUSE PROBABLE: Permissions insuffisantes')
  console.log('💡 SOLUTION: Modifier le code pour utiliser auth.signUp')
  console.log('')
  console.log('🔧 PROCHAINES ÉTAPES:')
  console.log('1. Modifier EmployeeManagement.jsx')
  console.log('2. Remplacer auth.admin par auth.signUp')
  console.log('3. Ajouter confirmation automatique')
}

main().catch(console.error)
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 DIAGNOSTIC PERMISSIONS CRÉATION EMPLOYÉ')
console.log('==========================================\n')

async function testEmployeeCreationPermissions() {
  try {
    console.log('📧 Test connexion patron agence...')
    
    // Se connecter comme patron d'agence
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'patron@agence.com',
      password: 'Patron123!'
    })
    
    if (authError) {
      console.log('❌ Erreur connexion patron:', authError.message)
      return
    }
    
    console.log('✅ Connexion patron réussie')
    console.log('🆔 User ID:', authData.user.id)
    
    // Vérifier le profil
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    if (profileError) {
      console.log('❌ Erreur récupération profil:', profileError.message)
      return
    }
    
    console.log('👤 Profil patron:')
    console.log('   📝 Nom:', profile.full_name)
    console.log('   🎭 Rôle:', profile.role)
    console.log('   🚦 Actif:', profile.is_active)
    
    // Vérifier l'agence
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur récupération agence:', agencyError.message)
      return
    }
    
    console.log('🏢 Agence trouvée:')
    console.log('   🏢 Nom:', agencyData.name)
    console.log('   🆔 ID:', agencyData.id)
    console.log('   ✅ Vérifiée:', agencyData.is_verified)
    
    // Test 1: Créer un utilisateur avec auth.admin
    console.log('\n🧪 Test 1: Création compte utilisateur...')
    
    const testEmployeeData = {
      email: 'employe.test@agence.com',
      password: 'EmployeTest123!'
    }
    
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: testEmployeeData.email,
      password: testEmployeeData.password,
      email_confirm: true
    })
    
    if (createUserError) {
      console.log('❌ Erreur création utilisateur auth:', createUserError.message)
      console.log('📋 Code erreur:', createUserError.status)
      
      if (createUserError.message.includes('not allowed')) {
        console.log('\n🔧 PROBLÈME IDENTIFIÉ:')
        console.log('• Les permissions admin ne sont pas activées')
        console.log('• Il faut utiliser le service key au lieu de anon key')
        console.log('• Ou activer les permissions admin dans Supabase Dashboard')
      }
      
      // Essayer avec auth.signUp à la place
      console.log('\n🧪 Test alternatif: Création avec signUp...')
      
      const { data: signUpUser, error: signUpError } = await supabase.auth.signUp({
        email: testEmployeeData.email,
        password: testEmployeeData.password
      })
      
      if (signUpError) {
        console.log('❌ Erreur signUp:', signUpError.message)
      } else {
        console.log('✅ SignUp réussi avec user ID:', signUpUser.user?.id)
        
        // Nettoyer le test
        if (signUpUser.user?.id) {
          await supabase.auth.admin.deleteUser(signUpUser.user.id)
          console.log('🧹 Utilisateur test supprimé')
        }
      }
      
    } else {
      console.log('✅ Création utilisateur réussie:', newUser.user.id)
      
      // Nettoyer le test
      await supabase.auth.admin.deleteUser(newUser.user.id)
      console.log('🧹 Utilisateur test supprimé')
    }
    
    // Test 2: Vérifier les permissions sur la table agency_employees
    console.log('\n🧪 Test 2: Permissions table agency_employees...')
    
    const { data: testInsert, error: insertError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agencyData.id,
        user_id: authData.user.id, // Utiliser le patron comme test
        employee_role: 'admin',
        full_name: 'Test Employee',
        email: 'test.employee@test.com',
        phone: '+237600000000',
        is_active: true
      })
      .select()
    
    if (insertError) {
      console.log('❌ Erreur insertion agency_employees:', insertError.message)
      console.log('📋 Code erreur:', insertError.code)
      console.log('📋 Détails:', insertError.details)
    } else {
      console.log('✅ Insertion agency_employees réussie')
      
      // Nettoyer le test
      await supabase
        .from('agency_employees')
        .delete()
        .eq('id', testInsert[0].id)
      console.log('🧹 Entrée test supprimée')
    }
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

async function checkSupabaseSettings() {
  console.log('\n🔧 VÉRIFICATION PARAMÈTRES SUPABASE')
  console.log('===================================')
  
  console.log('📋 Configuration actuelle:')
  console.log('   🌐 URL:', supabaseUrl)
  console.log('   🔑 Key type: anon (public)')
  console.log('')
  console.log('⚠️  PROBLÈME PROBABLE:')
  console.log('• auth.admin nécessite une service_role key')
  console.log('• La anon key n\'a pas les permissions admin')
  console.log('')
  console.log('🔧 SOLUTIONS:')
  console.log('1. Utiliser auth.signUp au lieu de auth.admin')
  console.log('2. Ou obtenir la service_role key de Supabase')
  console.log('3. Ou configurer les permissions RLS')
}

async function main() {
  await testEmployeeCreationPermissions()
  await checkSupabaseSettings()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 RÉSUMÉ DU DIAGNOSTIC')
  console.log('='.repeat(50))
  console.log('')
  console.log('🎯 CAUSE PROBABLE: Permissions insuffisantes')
  console.log('💡 SOLUTION: Modifier le code pour utiliser auth.signUp')
  console.log('')
  console.log('🔧 PROCHAINES ÉTAPES:')
  console.log('1. Modifier EmployeeManagement.jsx')
  console.log('2. Remplacer auth.admin par auth.signUp')
  console.log('3. Ajouter confirmation automatique')
}

main().catch(console.error)
>>>>>>> master
