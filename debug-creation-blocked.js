import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🐛 DIAGNOSTIC CRÉATION EMPLOYÉ BLOQUÉE')
console.log('=====================================\n')

async function testEmployeeCreationStepByStep() {
  try {
    console.log('📧 Étape 1: Connexion patron...')
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'patron@agence.com',
      password: 'Patron123!'
    })
    
    if (authError) {
      console.log('❌ Erreur connexion:', authError.message)
      return
    }
    
    console.log('✅ Connexion OK')
    
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
    
    console.log('🏢 Agence OK:', agencyData.name)
    
    // Test 1: Générer email automatiquement
    console.log('\n📧 Étape 2: Test génération email...')
    
    const testEmail = `clarky.brian@agencetransportplus.travelhub.cm`
    const testPassword = Math.random().toString(36).slice(-8) + '!'
    
    console.log('📧 Email test:', testEmail)
    console.log('🔐 Password test:', testPassword)
    
    // Test 2: Créer le compte avec auth.signUp
    console.log('\n👤 Étape 3: Test auth.signUp...')
    console.log('⏳ Création du compte (peut prendre du temps)...')
    
    const startTime = Date.now()
    
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Clarky',
          last_name: 'Brian',
          role: 'agency_employee',
          full_name: 'Clarky Brian'
        }
      }
    })
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    if (signUpError) {
      console.log('❌ Erreur auth.signUp:', signUpError.message)
      console.log('📋 Code erreur:', signUpError.status)
      console.log('⏱️  Durée avant erreur:', duration + 'ms')
      
      if (signUpError.message.includes('already')) {
        console.log('\n💡 SOLUTION: Email déjà utilisé')
        console.log('Essayez avec un autre email ou supprimez l\'utilisateur existant')
      }
      
      if (duration > 30000) {
        console.log('\n💡 SOLUTION: Timeout - Problème de réseau ou Supabase')
      }
      
      return
    }
    
    console.log('✅ auth.signUp réussi en', duration + 'ms')
    console.log('🆔 User ID:', newUser.user.id)
    
    // Test 3: Mettre à jour le profil utilisateur
    console.log('\n📝 Étape 4: Test update profil...')
    
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: 'Clarky Brian',
        role: 'agency_employee',
        is_generated_user: true,
        generated_by: authData.user.id
      })
      .eq('id', newUser.user.id)
    
    if (userError) {
      console.log('❌ Erreur update profil:', userError.message)
      return
    }
    
    console.log('✅ Profil mis à jour')
    
    // Test 4: Créer l'employé d'agence
    console.log('\n👥 Étape 5: Test création agency_employees...')
    
    const { data: employeeResult, error: employeeError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agencyData.id,
        user_id: newUser.user.id,
        employee_role: 'manager',
        created_by: authData.user.id,
        generated_email: testEmail,
        temp_password: testPassword,
        is_active: true
      })
      .select()
    
    if (employeeError) {
      console.log('❌ Erreur agency_employees:', employeeError.message)
      console.log('📋 Détails:', employeeError.details)
      return
    }
    
    console.log('✅ Employé créé avec succès!')
    console.log('🆔 Employee ID:', employeeResult[0].id)
    
    console.log('\n🎉 TEST COMPLET RÉUSSI!')
    console.log('Le problème pourrait être ailleurs...')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    console.log('\n💡 SOLUTIONS POSSIBLES:')
    console.log('1. Vérifier la connexion internet')
    console.log('2. Vérifier les paramètres Supabase')
    console.log('3. Regarder la console du navigateur')
    console.log('4. Redémarrer le serveur de développement')
  }
}

async function main() {
  await testEmployeeCreationStepByStep()
  
  console.log('\n' + '='.repeat(50))
  console.log('📋 DIAGNOSTIC COMPLET')
  console.log('='.repeat(50))
  console.log('')
  console.log('🔍 CAUSES POSSIBLES DU BLOCAGE:')
  console.log('1. ⏳ Timeout réseau (auth.signUp trop lent)')
  console.log('2. 📧 Email déjà utilisé (conflict)')
  console.log('3. 🚫 Limite de création Supabase atteinte')
  console.log('4. 🔒 Problème de permissions RLS')
  console.log('5. 💾 Base de données surchargée')
  console.log('')
  console.log('🔧 SOLUTIONS IMMÉDIATES:')
  console.log('1. Rafraîchir la page et réessayer')
  console.log('2. Changer les noms (Prénom/Nom différents)')
  console.log('3. Ouvrir la console du navigateur (F12)')
  console.log('4. Redémarrer le serveur de développement')
}

main().catch(console.error)
