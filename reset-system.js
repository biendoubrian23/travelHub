const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Nettoyer toutes les tables
async function cleanAllTables() {
  console.log('🧹 Nettoyage de toutes les tables...\n')
  
  const tables = [
    'agency_documents',
    'agency_services', 
    'agency_capabilities',
    'agency_employees',
    'agency_notifications',
    'agency_settings',
    'agency_statistics',
    'audit_logs',
    'agencies',
    'users'
  ]
  
  for (const table of tables) {
    try {
      console.log(`🗑️  Nettoyage de la table: ${table}`)
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Supprime tout sauf un ID impossible
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = pas de lignes trouvées
        console.log(`⚠️  Avertissement pour ${table}:`, error.message)
      } else {
        console.log(`✅ Table ${table} nettoyée`)
      }
    } catch (err) {
      console.log(`❌ Erreur lors du nettoyage de ${table}:`, err.message)
    }
  }
  
  console.log('\n✨ Nettoyage terminé!\n')
}

// Créer le super admin principal
async function createMainSuperAdmin() {
  console.log('👑 Création du Super Admin principal...\n')
  
  try {
    // Créer l'utilisateur avec auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'superadmin@travelhub.com',
      password: 'SuperAdmin2024!',
      options: {
        data: {
          full_name: 'Super Administrator',
          user_type: 'super_admin'
        }
      }
    })
    
    if (authError) {
      console.log('❌ Erreur auth super admin:', authError.message)
      return false
    }
    
    console.log('✅ Super Admin créé avec succès')
    console.log('📧 Email: superadmin@travelhub.com')
    console.log('🔐 Mot de passe: SuperAdmin2024!')
    
    // Insérer dans la table users
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: 'Super Administrator',
          user_type: 'super_admin',
          is_active: true,
          created_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.log('⚠️  Erreur profil super admin:', profileError.message)
      } else {
        console.log('✅ Profil super admin créé dans users')
      }
    }
    
    return true
  } catch (error) {
    console.log('❌ Erreur création super admin:', error.message)
    return false
  }
}

// Créer les directeurs d'agence
async function createAgencyDirectors() {
  console.log('🏢 Création des directeurs d\'agence...\n')
  
  const directors = [
    {
      email: 'directeur.afrique@travelhub.com',
      password: 'DirecteurAfrique2024!',
      name: 'Directeur Afrique',
      agency_name: 'TravelHub Afrique',
      agency_code: 'TH-AFR'
    },
    {
      email: 'directeur.europe@travelhub.com', 
      password: 'DirecteurEurope2024!',
      name: 'Directeur Europe',
      agency_name: 'TravelHub Europe',
      agency_code: 'TH-EUR'
    },
    {
      email: 'directeur.amerique@travelhub.com',
      password: 'DirecteurAmerique2024!', 
      name: 'Directeur Amérique',
      agency_name: 'TravelHub Amérique',
      agency_code: 'TH-AME'
    }
  ]
  
  for (const director of directors) {
    try {
      console.log(`👨‍💼 Création du directeur: ${director.name}`)
      
      // Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: director.email,
        password: director.password,
        options: {
          data: {
            full_name: director.name,
            user_type: 'agency_admin'
          }
        }
      })
      
      if (authError) {
        console.log(`❌ Erreur auth ${director.name}:`, authError.message)
        continue
      }
      
      // Créer l'agence
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          name: director.agency_name,
          code: director.agency_code,
          contact_email: director.email,
          is_active: true,
          owner_id: authData.user?.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (agencyError) {
        console.log(`❌ Erreur agence ${director.agency_name}:`, agencyError.message)
        continue
      }
      
      // Créer le profil utilisateur
      if (authData.user && agencyData) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: director.name,
            user_type: 'agency_admin',
            agency_id: agencyData.id,
            is_active: true,
            created_at: new Date().toISOString()
          })
        
        if (profileError) {
          console.log(`⚠️  Erreur profil ${director.name}:`, profileError.message)
        }
      }
      
      console.log(`✅ ${director.name} créé avec succès`)
      console.log(`   📧 Email: ${director.email}`)
      console.log(`   🔐 Mot de passe: ${director.password}`)
      console.log(`   🏢 Agence: ${director.agency_name} (${director.agency_code})`)
      console.log('')
      
    } catch (error) {
      console.log(`❌ Erreur création ${director.name}:`, error.message)
    }
  }
}

// Fonction principale
async function setupCompleteSystem() {
  console.log('🚀 CONFIGURATION COMPLÈTE DU SYSTÈME')
  console.log('==================================================\n')
  
  try {
    // 1. Nettoyer toutes les tables
    await cleanAllTables()
    
    // 2. Créer le super admin
    const superAdminCreated = await createMainSuperAdmin()
    
    if (superAdminCreated) {
      console.log('\n' + '='.repeat(50))
      
      // 3. Créer les directeurs d'agence
      await createAgencyDirectors()
      
      console.log('🎉 SYSTÈME CONFIGURÉ AVEC SUCCÈS!')
      console.log('==================================================')
      console.log('')
      console.log('🔑 COMPTES CRÉÉS:')
      console.log('')
      console.log('👑 SUPER ADMIN:')
      console.log('   📧 Email: superadmin@travelhub.com')
      console.log('   🔐 Mot de passe: SuperAdmin2024!')
      console.log('')
      console.log('👨‍💼 DIRECTEURS D\'AGENCE:')
      console.log('   📧 directeur.afrique@travelhub.com (DirecteurAfrique2024!)')
      console.log('   📧 directeur.europe@travelhub.com (DirecteurEurope2024!)')
      console.log('   📧 directeur.amerique@travelhub.com (DirecteurAmerique2024!)')
      console.log('')
      console.log('✨ Vous pouvez maintenant vous connecter avec ces comptes!')
      
    } else {
      console.log('❌ Échec de la création du super admin')
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

// Exécuter le setup
setupCompleteSystem()
