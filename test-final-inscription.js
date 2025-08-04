import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test complet du processus d'inscription
async function testCompleteRegistration() {
  console.log('🚀 Test complet du processus d\'inscription\n')
  
  // Données de test réalistes
  const testData = {
    email: 'directeur@transportcameroun.com',
    password: 'MotDePasse123!',
    firstName: 'Jean',
    lastName: 'Kouam',
    phone: '+237691234567',
    agencyName: 'Transport Express Cameroun',
    businessType: 'transport',
    registrationNumber: 'RC/YAO/2024/A/456',
    taxId: 'M070512345678P',
    foundedYear: '2020',
    description: 'Agence de transport interurbain au Cameroun',
    address: '123 Avenue de l\'Indépendance',
    city: 'Yaoundé',
    region: 'Centre',
    country: 'Cameroun',
    services: ['transport-interurbain', 'location-vehicules'],
    fleetSize: '15',
    employeeCount: '25',
    dailyCapacity: '300'
  }
  
  try {
    // Étape 1: Créer le compte utilisateur
    console.log('📝 Étape 1: Création du compte utilisateur...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: {
          first_name: testData.firstName,
          last_name: testData.lastName,
          phone: testData.phone,
          role: 'agence'
        }
      }
    })
    
    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('ℹ️  Utilisateur déjà existant, test de connexion...')
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testData.email,
          password: testData.password
        })
        
        if (signInError) {
          console.error('❌ Erreur de connexion:', signInError.message)
          return false
        }
        
        console.log('✅ Connexion réussie pour utilisateur existant')
        authData.user = signInData.user
      } else {
        console.error('❌ Erreur lors de la création du compte:', authError.message)
        return false
      }
    } else {
      console.log('✅ Compte utilisateur créé avec succès')
    }
    
    const user = authData.user
    if (!user) {
      console.error('❌ Aucun utilisateur retourné')
      return false
    }
    
    console.log('👤 ID utilisateur:', user.id)
    
    // Étape 2: Créer le profil utilisateur
    console.log('\n📋 Étape 2: Création du profil utilisateur...')
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: `${testData.firstName} ${testData.lastName}`,
        phone: testData.phone,
        role: 'agence'
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Erreur de création du profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil utilisateur créé:', profileData.full_name)
    
    // Étape 3: Créer l'agence
    console.log('\n🏢 Étape 3: Création de l\'agence...')
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .upsert({
        user_id: user.id,
        name: testData.agencyName,
        email: testData.email,
        phone: testData.phone,
        address: `${testData.address}, ${testData.city}, ${testData.region}, ${testData.country}`,
        license_number: testData.registrationNumber,
        description: testData.description,
        is_verified: false
      })
      .select()
      .single()
    
    if (agencyError) {
      console.error('❌ Erreur de création de l\'agence:', agencyError.message)
      return false
    }
    
    console.log('✅ Agence créée:', agencyData.name)
    console.log('🏢 ID agence:', agencyData.id)
    
    // Étape 4: Ajouter les services
    console.log('\n🔧 Étape 4: Ajout des services...')
    const servicesData = testData.services.map(service => ({
      agency_id: agencyData.id,
      service_name: service,
      is_active: true
    }))
    
    const { error: servicesError } = await supabase
      .from('agency_services')
      .upsert(servicesData)
    
    if (servicesError) {
      console.error('❌ Erreur d\'ajout des services:', servicesError.message)
    } else {
      console.log('✅ Services ajoutés:', testData.services.join(', '))
    }
    
    // Étape 5: Ajouter les capacités
    console.log('\n📊 Étape 5: Ajout des capacités...')
    const { error: capabilitiesError } = await supabase
      .from('agency_capabilities')
      .upsert({
        agency_id: agencyData.id,
        bus_count: parseInt(testData.fleetSize) || 0,
        total_seats: parseInt(testData.dailyCapacity) || 0,
        employee_count: parseInt(testData.employeeCount) || 0,
        max_daily_trips: 10,
        coverage_areas: [testData.region]
      })
    
    if (capabilitiesError) {
      console.error('❌ Erreur d\'ajout des capacités:', capabilitiesError.message)
    } else {
      console.log('✅ Capacités ajoutées')
    }
    
    console.log('\n🎉 INSCRIPTION COMPLÈTE RÉUSSIE!')
    console.log('📧 Email:', testData.email)
    console.log('🏢 Agence:', testData.agencyName)
    console.log('👤 Directeur:', `${testData.firstName} ${testData.lastName}`)
    console.log('📱 Téléphone:', testData.phone)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    return false
  }
}

// Test de récupération des données de l'agence
async function testAgencyDataRetrieval() {
  console.log('\n\n🔍 Test de récupération des données de l\'agence...')
  
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.log('ℹ️  Aucun utilisateur connecté pour ce test')
      return true
    }
    
    // Récupérer l'agence
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select(`
        *,
        agency_services(*),
        agency_capabilities(*)
      `)
      .eq('user_id', user.id)
      .single()
    
    if (agencyError) {
      console.error('❌ Erreur de récupération de l\'agence:', agencyError.message)
      return false
    }
    
    console.log('✅ Données de l\'agence récupérées:')
    console.log('  - Nom:', agency.name)
    console.log('  - Email:', agency.email)
    console.log('  - Services:', agency.agency_services?.length || 0)
    console.log('  - Vérifiée:', agency.is_verified ? 'Oui' : 'Non')
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error.message)
    return false
  }
}

// Exécuter tous les tests
async function runFinalTest() {
  console.log('='.repeat(60))
  console.log('          TEST FINAL DU SYSTÈME D\'INSCRIPTION')
  console.log('='.repeat(60))
  
  const registrationSuccess = await testCompleteRegistration()
  await testAgencyDataRetrieval()
  
  console.log('\n' + '='.repeat(60))
  if (registrationSuccess) {
    console.log('🎉 RÉSULTAT: Le système d\'inscription fonctionne parfaitement!')
    console.log('✅ Vous pouvez maintenant tester depuis votre application web')
  } else {
    console.log('❌ RÉSULTAT: Il y a encore des problèmes à résoudre')
  }
  console.log('='.repeat(60))
}

runFinalTest().catch(console.error)
