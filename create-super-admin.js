import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Informations du super admin à créer
const SUPER_ADMIN_DATA = {
  email: 'superadmin@hotmail.com',
  password: 'SuperAdmin123!',
  firstName: 'Super',
  lastName: 'Admin',
  phone: '+237600000000',
  role: 'super_admin'
}

async function createSuperAdmin() {
  console.log('🔧 Création du compte Super Admin...\n')
  
  try {
    // Étape 1: Créer le compte d'authentification
    console.log('📝 Étape 1: Création du compte d\'authentification...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: SUPER_ADMIN_DATA.email,
      password: SUPER_ADMIN_DATA.password,
      options: {
        data: {
          first_name: SUPER_ADMIN_DATA.firstName,
          last_name: SUPER_ADMIN_DATA.lastName,
          phone: SUPER_ADMIN_DATA.phone,
          role: SUPER_ADMIN_DATA.role
        }
      }
    })
    
    if (authError && !authError.message.includes('User already registered')) {
      console.error('❌ Erreur de création du compte:', authError.message)
      return false
    }
    
    let user = authData?.user
    
    // Si l'utilisateur existe déjà, on se connecte
    if (authError?.message.includes('User already registered')) {
      console.log('ℹ️  Utilisateur existant, tentative de connexion...')
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: SUPER_ADMIN_DATA.email,
        password: SUPER_ADMIN_DATA.password
      })
      
      if (signInError) {
        console.error('❌ Erreur de connexion:', signInError.message)
        return false
      }
      
      user = signInData.user
      console.log('✅ Connexion réussie au compte existant')
    } else {
      console.log('✅ Nouveau compte créé avec succès')
    }
    
    if (!user) {
      console.error('❌ Aucun utilisateur obtenu')
      return false
    }
    
    console.log('👤 User ID:', user.id)
    
    // Étape 2: Créer le profil dans la table users
    console.log('\n📋 Étape 2: Création du profil utilisateur...')
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: `${SUPER_ADMIN_DATA.firstName} ${SUPER_ADMIN_DATA.lastName}`,
        phone: SUPER_ADMIN_DATA.phone,
        role: SUPER_ADMIN_DATA.role,
        is_active: true
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('❌ Erreur de création du profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil super admin créé:', profileData.full_name)
    console.log('🔐 Rôle assigné:', profileData.role)
    
    // Étape 3: Vérifier les permissions
    console.log('\n🔒 Étape 3: Vérification des permissions...')
    
    // Tester l'accès aux tables principales
    const tables = ['users', 'agencies', 'agency_documents', 'trips', 'bookings']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true })
        
        if (error) {
          console.log(`  ⚠️  Table ${table}: ${error.message}`)
        } else {
          console.log(`  ✅ Table ${table}: Accès autorisé`)
        }
      } catch (err) {
        console.log(`  ❌ Table ${table}: ${err.message}`)
      }
    }
    
    return {
      user: user,
      profile: profileData,
      credentials: {
        email: SUPER_ADMIN_DATA.email,
        password: SUPER_ADMIN_DATA.password
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
    return false
  }
}

// Créer quelques utilisateurs de test pour tester la gestion
async function createTestUsers() {
  console.log('\n👥 Création d\'utilisateurs de test...\n')
  
  const testUsers = [
    {
      email: 'agence1@hotmail.com',
      password: 'Agence123!',
      firstName: 'Marie',
      lastName: 'Dubois',
      phone: '+237691111111',
      role: 'agence',
      agencyName: 'Transport Rapide'
    },
    {
      email: 'agence2@yahoo.com',
      password: 'Agence123!',
      firstName: 'Paul',
      lastName: 'Martin',
      phone: '+237692222222',
      role: 'agence',
      agencyName: 'Voyage Express'
    },
    {
      email: 'client1@hotmail.com',
      password: 'Client123!',
      firstName: 'Jean',
      lastName: 'Client',
      phone: '+237693333333',
      role: 'client'
    }
  ]
  
  for (const userData of testUsers) {
    try {
      console.log(`📝 Création: ${userData.email}`)
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            role: userData.role
          }
        }
      })
      
      if (authError && !authError.message.includes('User already registered')) {
        console.log(`  ❌ Erreur: ${authError.message}`)
        continue
      }
      
      let user = authData?.user
      
      if (authError?.message.includes('User already registered')) {
        console.log(`  ℹ️  Utilisateur ${userData.email} existe déjà`)
        continue
      }
      
      if (!user) continue
      
      // Créer le profil
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          phone: userData.phone,
          role: userData.role,
          is_active: true
        })
      
      if (profileError) {
        console.log(`  ❌ Erreur profil: ${profileError.message}`)
        continue
      }
      
      // Si c'est une agence, créer l'agence
      if (userData.role === 'agence' && userData.agencyName) {
        const { error: agencyError } = await supabase
          .from('agencies')
          .upsert({
            user_id: user.id,
            name: userData.agencyName,
            email: userData.email,
            phone: userData.phone,
            address: 'Adresse test, Yaoundé, Cameroun',
            is_verified: false
          })
        
        if (agencyError) {
          console.log(`  ❌ Erreur agence: ${agencyError.message}`)
        } else {
          console.log(`  ✅ Agence "${userData.agencyName}" créée`)
        }
      } else {
        console.log(`  ✅ Client créé`)
      }
      
    } catch (err) {
      console.log(`  ❌ Erreur: ${err.message}`)
    }
    
    // Pause entre les créations
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Afficher les informations de connexion
function showLoginCredentials(result) {
  console.log('\n' + '='.repeat(70))
  console.log('                    INFORMATIONS DE CONNEXION')
  console.log('='.repeat(70))
  
  console.log('\n🔐 SUPER ADMIN - IDENTIFIANTS DE CONNEXION:')
  console.log(`📧 Email: ${result.credentials.email}`)
  console.log(`🔑 Mot de passe: ${result.credentials.password}`)
  console.log(`👤 Nom complet: ${result.profile.full_name}`)
  console.log(`🛡️  Rôle: ${result.profile.role}`)
  
  console.log('\n🎯 POUR VOUS CONNECTER DANS VOTRE APP:')
  console.log('1. Allez sur votre page de connexion')
  console.log(`2. Entrez l\'email: ${result.credentials.email}`)
  console.log(`3. Entrez le mot de passe: ${result.credentials.password}`)
  console.log('4. Cliquez sur "Se connecter"')
  
  console.log('\n🔧 FONCTIONNALITÉS SUPER ADMIN DISPONIBLES:')
  console.log('• ✅ Voir tous les utilisateurs')
  console.log('• ✅ Ajouter/modifier/supprimer des agences')
  console.log('• ✅ Valider les agences en attente')
  console.log('• ✅ Générer des rapports')
  console.log('• ✅ Accès à toutes les données')
  console.log('• ✅ Interface d\'administration complète')
  
  console.log('\n👥 UTILISATEURS DE TEST CRÉÉS:')
  console.log('📧 agence1@hotmail.com (mot de passe: Agence123!) - Transport Rapide')
  console.log('📧 agence2@yahoo.com (mot de passe: Agence123!) - Voyage Express')
  console.log('📧 client1@hotmail.com (mot de passe: Client123!) - Client test')
  
  console.log('\n' + '='.repeat(70))
}

// Fonction principale
async function setupSuperAdmin() {
  console.log('🚀 CONFIGURATION DU SUPER ADMIN\n')
  console.log('='.repeat(50))
  
  const result = await createSuperAdmin()
  
  if (result) {
    await createTestUsers()
    showLoginCredentials(result)
    
    console.log('\n🎉 CONFIGURATION TERMINÉE AVEC SUCCÈS!')
    console.log('\nVous pouvez maintenant vous connecter avec les identifiants ci-dessus.')
  } else {
    console.log('\n❌ Échec de la configuration du super admin')
  }
}

setupSuperAdmin().catch(console.error)
