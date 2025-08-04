import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test complet avec un email Hotmail (qui fonctionne)
async function testCompleteRegistrationHotmail() {
  console.log('🚀 Test complet avec email Hotmail\n')
  
  const testData = {
    email: 'directeur.agence@hotmail.com',
    password: 'MotDePasse123!',
    firstName: 'Jean',
    lastName: 'Kouam',
    phone: '+237691234567',
    agencyName: 'Transport Express Cameroun',
    businessType: 'transport',
    registrationNumber: 'RC/YAO/2024/A/456',
    description: 'Agence de transport interurbain',
    address: '123 Avenue de l\'Indépendance, Yaoundé, Centre, Cameroun'
  }
  
  try {
    console.log('📝 Inscription avec:', testData.email)
    
    // Étape 1: Inscription
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
    
    if (authError && !authError.message.includes('User already registered')) {
      console.error('❌ Erreur d\'inscription:', authError.message)
      return false
    }
    
    let user = authData?.user
    
    // Si l'utilisateur existe déjà, on se connecte
    if (authError?.message.includes('User already registered')) {
      console.log('ℹ️  Utilisateur existant, connexion...')
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testData.email,
        password: testData.password
      })
      
      if (signInError) {
        console.error('❌ Erreur de connexion:', signInError.message)
        return false
      }
      
      user = signInData.user
      console.log('✅ Connexion réussie')
    } else {
      console.log('✅ Inscription réussie')
    }
    
    if (!user) {
      console.error('❌ Aucun utilisateur obtenu')
      return false
    }
    
    console.log('👤 User ID:', user.id)
    
    // Étape 2: Créer le profil
    console.log('\n📋 Création du profil utilisateur...')
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
      console.error('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil créé:', profileData.full_name)
    
    // Étape 3: Créer l'agence
    console.log('\n🏢 Création de l\'agence...')
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .upsert({
        user_id: user.id,
        name: testData.agencyName,
        email: testData.email,
        phone: testData.phone,
        address: testData.address,
        license_number: testData.registrationNumber,
        description: testData.description,
        is_verified: false
      })
      .select()
      .single()
    
    if (agencyError) {
      console.error('❌ Erreur agence:', agencyError.message)
      return false
    }
    
    console.log('✅ Agence créée:', agencyData.name)
    
    // Étape 4: Vérifier les données
    console.log('\n🔍 Vérification des données créées...')
    
    // Récupérer l'agence complète
    const { data: fullAgency, error: fetchError } = await supabase
      .from('agencies')
      .select(`
        *,
        users!agencies_user_id_fkey(*)
      `)
      .eq('user_id', user.id)
      .single()
    
    if (fetchError) {
      console.error('❌ Erreur de récupération:', fetchError.message)
      return false
    }
    
    console.log('✅ Données vérifiées:')
    console.log('  📧 Email:', fullAgency.email)
    console.log('  🏢 Agence:', fullAgency.name)
    console.log('  👤 Directeur:', fullAgency.users?.full_name)
    console.log('  📱 Téléphone:', fullAgency.phone)
    console.log('  🏠 Adresse:', fullAgency.address)
    console.log('  ✅ Vérifiée:', fullAgency.is_verified ? 'Oui' : 'Non')
    
    return {
      user: user,
      profile: profileData,
      agency: agencyData
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    return false
  }
}

// Simuler le processus de votre application
async function simulateAppFlow() {
  console.log('\n' + '='.repeat(60))
  console.log('     SIMULATION DU FLUX D\'INSCRIPTION DE L\'APP')
  console.log('='.repeat(60))
  
  const result = await testCompleteRegistrationHotmail()
  
  if (result) {
    console.log('\n🎉 SUCCÈS COMPLET!')
    console.log('\n📋 Résumé de ce qui a été créé:')
    console.log('  1. ✅ Compte utilisateur Supabase')
    console.log('  2. ✅ Profil dans la table "users"')
    console.log('  3. ✅ Agence dans la table "agencies"')
    console.log('  4. ✅ Liaison user ↔ agence')
    
    console.log('\n🔧 POUR VOTRE APPLICATION:')
    console.log('  1. Utilisez des emails @hotmail.com pour les tests')
    console.log('  2. Le processus d\'inscription fonctionne parfaitement')
    console.log('  3. Après inscription, l\'utilisateur devrait voir:')
    console.log('     - Le nom de son agence en haut à droite')
    console.log('     - Son nom et rôle')
    console.log('     - Le dashboard de l\'agence')
    
    console.log('\n✉️  ÉTAPE SUIVANTE:')
    console.log('  - Vérifiez votre boîte email Hotmail')
    console.log('  - Cliquez sur le lien de confirmation')
    console.log('  - Testez la connexion depuis votre app')
    
    return true
  } else {
    console.log('\n❌ Échec - Vérifiez les logs ci-dessus')
    return false
  }
}

simulateAppFlow().catch(console.error)
