// Test simple de création d'employé
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dgqncbnvyviurirsddtyu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncW5jYm52eXZpdXJpcnNkZHR5dSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMxOTUwNDA2LCJleHAiOjIwNDc1MjY0MDZ9.q4pKVm8BefDtjpKpA2Vvl-Q6vILlHINDWdPD1eC2XPo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmployeeCreation() {
  try {
    console.log('🧪 Test de création d\'employé...')
    
    // 1. Se connecter en tant que patron
    console.log('🔐 Connexion en tant que patron...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'patron@agence.com',
      password: 'Patron123!'
    })
    
    if (loginError) {
      console.error('❌ Erreur de connexion patron:', loginError.message)
      return
    }
    
    console.log('✅ Connecté en tant que patron:', loginData.user.email)
    
    // 2. Récupérer les infos de l'agence
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError.message)
      return
    }
    
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_id', loginData.user.id)
      .single()
    
    if (agencyError) {
      console.error('❌ Erreur récupération agence:', agencyError.message)
      return
    }
    
    console.log('✅ Agence trouvée:', agency.name)
    
    // 3. Sauvegarder la session actuelle
    const currentSession = await supabase.auth.getSession()
    console.log('💾 Session patron sauvegardée')
    
    // 4. Créer un employé de test
    const employeeEmail = 'jean.dupont@testAgence.travelhub.cm'
    const employeePassword = 'TempPass123!'
    
    console.log('🔄 Création du compte employé...')
    const { data: empData, error: empError } = await supabase.auth.signUp({
      email: employeeEmail,
      password: employeePassword,
      options: {
        data: {
          first_name: 'Jean',
          last_name: 'Dupont',
          role: 'agency_employee',
          full_name: 'Jean Dupont'
        }
      }
    })
    
    if (empError) {
      console.error('❌ Erreur création employé:', empError.message)
      return
    }
    
    console.log('✅ Compte employé créé:', empData.user.id)
    
    // 5. Restaurer immédiatement la session du patron
    if (currentSession.data.session) {
      console.log('🔄 Restauration de la session patron...')
      await supabase.auth.setSession(currentSession.data.session)
      console.log('✅ Session patron restaurée')
    }
    
    // 6. Vérifier qui est connecté maintenant
    const { data: sessionCheck } = await supabase.auth.getUser()
    console.log('👤 Utilisateur actuellement connecté:', sessionCheck.user?.email)
    
    // 7. Créer l'entrée dans agency_employees
    console.log('🔄 Ajout à la table agency_employees...')
    const { data: employeeRecord, error: recordError } = await supabase
      .from('agency_employees')
      .insert({
        agency_id: agency.id,
        user_id: empData.user.id,
        employee_role: 'employee',
        generated_email: employeeEmail,
        temp_password: employeePassword,
        created_by: profile.id
      })
      .select()
    
    if (recordError) {
      console.error('❌ Erreur ajout à agency_employees:', recordError.message)
      return
    }
    
    console.log('✅ Employé ajouté à l\'agence!')
    
    // 8. Vérifier la liste des employés
    console.log('🔍 Vérification de la liste des employés...')
    const { data: employees, error: empListError } = await supabase
      .from('agency_employees')
      .select(`
        *,
        users!inner(id, full_name, email)
      `)
      .eq('agency_id', agency.id)
    
    if (empListError) {
      console.error('❌ Erreur récupération employés:', empListError.message)
    } else {
      console.log('✅ Employés trouvés:', employees.length)
      employees.forEach(emp => {
        console.log(`   - ${emp.users.full_name} (${emp.users.email})`)
      })
    }
    
    console.log('\n🎉 Test terminé avec succès!')
    
  } catch (error) {
    console.error('💥 Erreur générale:', error.message)
  }
}

testEmployeeCreation()
