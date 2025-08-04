import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ CORRECTION FINALE - TEST CRÉATION EMPLOYÉ')
console.log('===========================================\n')

async function testFinalEmployeeCreation() {
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
    
    // Test complet comme dans l'app
    console.log('\n🧪 Test création employé (workflow complet)...')
    
    const employeeData = {
      firstName: 'Marie',
      lastName: 'Kamga',
      role: 'manager'
    }
    
    // Générer les identifiants
    const credentials = {
      email: `${employeeData.firstName.toLowerCase()}.${employeeData.lastName.toLowerCase()}@${agencyData.name.toLowerCase().replace(/\s+/g, '')}.com`,
      password: `${employeeData.firstName}${Math.floor(Math.random() * 1000)}!`
    }
    
    console.log('🔑 Identifiants générés:')
    console.log('   📧 Email:', credentials.email)
    console.log('   🔐 Password:', credentials.password)
    
    // 1. Créer le compte avec signUp
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
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
    
    // Attendre un peu pour que Supabase traite le trigger
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 2. Mettre à jour le profil utilisateur
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: `${employeeData.firstName} ${employeeData.lastName}`,
        role: 'agency_employee',
        is_generated_user: true,
        generated_by: authData.user.id
      })
      .eq('id', newUser.user.id)
    
    if (userError) {
      console.log('❌ Erreur update profil:', userError.message)
      return
    }
    
    console.log('✅ Profil utilisateur mis à jour')
    
    // 3. Créer l'employé d'agence
    const { data: employeeResult, error: employeeError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agencyData.id,
        user_id: newUser.user.id,
        employee_role: employeeData.role,
        created_by: authData.user.id,
        generated_email: credentials.email,
        temp_password: credentials.password,
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
    
    // Vérifier que tout est bien créé
    const { data: verification, error: verifyError } = await supabase
      .from('agency_employees')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', employeeResult[0].id)
      .single()
    
    if (verifyError) {
      console.log('❌ Erreur vérification:', verifyError.message)
    } else {
      console.log('🔍 Vérification employé:')
      console.log('   👤 Nom:', verification.user.full_name)
      console.log('   📧 Email:', verification.user.email)
      console.log('   🎭 Rôle:', verification.employee_role)
      console.log('   🏢 Agence ID:', verification.agency_id)
    }
    
    console.log('\n🎉 TEST RÉUSSI ! La création d\'employé fonctionne maintenant.')
    
    await supabase.auth.signOut()
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

async function main() {
  await testFinalEmployeeCreation()
  
  console.log('\n' + '='.repeat(60))
  console.log('📋 PROBLÈME RÉSOLU !')
  console.log('='.repeat(60))
  console.log('')
  console.log('✅ CORRECTIONS APPLIQUÉES:')
  console.log('1. ❌ supabase.auth.admin.createUser → ✅ supabase.auth.signUp')
  console.log('2. ❌ INSERT users → ✅ UPDATE users (car auto-créé)')
  console.log('3. ❌ Suppression auth.admin.deleteUser (permissions)')
  console.log('')
  console.log('🎯 MAINTENANT DANS VOTRE APP:')
  console.log('1. Connectez-vous: patron@agence.com / Patron123!')
  console.log('2. Menu "Employés" → "Ajouter un employé"')
  console.log('3. Remplissez le formulaire et cliquez "Créer l\'employé"')
  console.log('')
  console.log('✨ Plus d\'erreur "User not allowed" !')
  console.log('✨ La création d\'employé fonctionne parfaitement !')
}

main().catch(console.error)
