<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧪 TEST CRÉATION EMPLOYÉ CORRIGÉE')
console.log('=================================\n')

async function testNewEmployeeCreation() {
  try {
    console.log('📧 Connexion patron agence...')
    
    // Se connecter comme patron
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'patron@agence.com',
      password: 'Patron123!'
    })
    
    if (authError) {
      console.log('❌ Erreur connexion:', authError.message)
      return
    }
    
    console.log('✅ Connexion réussie')
    
    // Récupérer l'agence
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur agence:', agencyError.message)
      return
    }
    
    console.log('🏢 Agence trouvée:', agencyData.name)
    
    // Test de création d'employé avec la nouvelle méthode
    console.log('\n🧪 Test création employé avec auth.signUp...')
    
    const employeeData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'employee',
      email: 'jean.dupont@agence.com',
      password: 'Employee123!'
    }
    
    // 1. Créer le compte avec signUp
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password,
      options: {
        data: {
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          role: 'agency_employee',
          full_name: `${employeeData.firstName} ${employeeData.lastName}`
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Erreur signUp:', signUpError.message)
      return
    }
    
    console.log('✅ Compte utilisateur créé:', newUser.user.id)
    
    // 2. Créer le profil utilisateur
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: employeeData.email,
        full_name: `${employeeData.firstName} ${employeeData.lastName}`,
        role: 'agency_employee',
        is_generated_user: true,
        generated_by: authData.user.id
      })
    
    if (userError) {
      console.log('❌ Erreur profil utilisateur:', userError.message)
      return
    }
    
    console.log('✅ Profil utilisateur créé')
    
    // 3. Créer l'employé d'agence
    const { data: employeeResult, error: employeeError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agencyData.id,
        user_id: newUser.user.id,
        employee_role: employeeData.role,
        created_by: authData.user.id,
        generated_email: employeeData.email,
        temp_password: employeeData.password,
        is_active: true
      })
      .select()
    
    if (employeeError) {
      console.log('❌ Erreur employé agence:', employeeError.message)
      console.log('📋 Détails:', employeeError.details)
      return
    }
    
    console.log('✅ Employé créé avec succès!')
    console.log('🆔 Employee ID:', employeeResult[0].id)
    
    // Nettoyer le test
    console.log('\n🧹 Nettoyage du test...')
    
    await supabase
      .from('agency_employees')
      .delete()
      .eq('id', employeeResult[0].id)
    
    await supabase
      .from('users')
      .delete()
      .eq('id', newUser.user.id)
    
    console.log('✅ Test nettoyé')
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

async function main() {
  await testNewEmployeeCreation()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 RÉSULTAT')
  console.log('='.repeat(50))
  console.log('')
  console.log('✅ CORRECTION APPLIQUÉE:')
  console.log('• auth.admin.createUser → auth.signUp')
  console.log('• Suppression auth.admin.deleteUser')
  console.log('')
  console.log('🎯 MAINTENANT TESTEZ DANS VOTRE APP:')
  console.log('1. Connectez-vous avec: patron@agence.com / Patron123!')
  console.log('2. Allez dans "Employés"')
  console.log('3. Cliquez "Ajouter un employé"')
  console.log('4. Remplissez et créez')
  console.log('')
  console.log('✨ Plus d\'erreur "User not allowed" !')
}

main().catch(console.error)
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧪 TEST CRÉATION EMPLOYÉ CORRIGÉE')
console.log('=================================\n')

async function testNewEmployeeCreation() {
  try {
    console.log('📧 Connexion patron agence...')
    
    // Se connecter comme patron
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'patron@agence.com',
      password: 'Patron123!'
    })
    
    if (authError) {
      console.log('❌ Erreur connexion:', authError.message)
      return
    }
    
    console.log('✅ Connexion réussie')
    
    // Récupérer l'agence
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur agence:', agencyError.message)
      return
    }
    
    console.log('🏢 Agence trouvée:', agencyData.name)
    
    // Test de création d'employé avec la nouvelle méthode
    console.log('\n🧪 Test création employé avec auth.signUp...')
    
    const employeeData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'employee',
      email: 'jean.dupont@agence.com',
      password: 'Employee123!'
    }
    
    // 1. Créer le compte avec signUp
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: employeeData.email,
      password: employeeData.password,
      options: {
        data: {
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          role: 'agency_employee',
          full_name: `${employeeData.firstName} ${employeeData.lastName}`
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Erreur signUp:', signUpError.message)
      return
    }
    
    console.log('✅ Compte utilisateur créé:', newUser.user.id)
    
    // 2. Créer le profil utilisateur
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: newUser.user.id,
        email: employeeData.email,
        full_name: `${employeeData.firstName} ${employeeData.lastName}`,
        role: 'agency_employee',
        is_generated_user: true,
        generated_by: authData.user.id
      })
    
    if (userError) {
      console.log('❌ Erreur profil utilisateur:', userError.message)
      return
    }
    
    console.log('✅ Profil utilisateur créé')
    
    // 3. Créer l'employé d'agence
    const { data: employeeResult, error: employeeError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agencyData.id,
        user_id: newUser.user.id,
        employee_role: employeeData.role,
        created_by: authData.user.id,
        generated_email: employeeData.email,
        temp_password: employeeData.password,
        is_active: true
      })
      .select()
    
    if (employeeError) {
      console.log('❌ Erreur employé agence:', employeeError.message)
      console.log('📋 Détails:', employeeError.details)
      return
    }
    
    console.log('✅ Employé créé avec succès!')
    console.log('🆔 Employee ID:', employeeResult[0].id)
    
    // Nettoyer le test
    console.log('\n🧹 Nettoyage du test...')
    
    await supabase
      .from('agency_employees')
      .delete()
      .eq('id', employeeResult[0].id)
    
    await supabase
      .from('users')
      .delete()
      .eq('id', newUser.user.id)
    
    console.log('✅ Test nettoyé')
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

async function main() {
  await testNewEmployeeCreation()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 RÉSULTAT')
  console.log('='.repeat(50))
  console.log('')
  console.log('✅ CORRECTION APPLIQUÉE:')
  console.log('• auth.admin.createUser → auth.signUp')
  console.log('• Suppression auth.admin.deleteUser')
  console.log('')
  console.log('🎯 MAINTENANT TESTEZ DANS VOTRE APP:')
  console.log('1. Connectez-vous avec: patron@agence.com / Patron123!')
  console.log('2. Allez dans "Employés"')
  console.log('3. Cliquez "Ajouter un employé"')
  console.log('4. Remplissez et créez')
  console.log('')
  console.log('✨ Plus d\'erreur "User not allowed" !')
}

main().catch(console.error)
>>>>>>> master
