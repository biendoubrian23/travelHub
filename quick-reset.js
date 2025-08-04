import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🚀 RÉINITIALISATION DU SYSTÈME')
console.log('===============================\n')

// Nettoyer les tables principales
async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...')
  
  const tables = ['users', 'agencies', 'agency_employees']
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .gt('id', 0) // Supprime tout
      
      if (error && !error.message.includes('No rows found')) {
        console.log(`⚠️  ${table}: ${error.message}`)
      } else {
        console.log(`✅ Table ${table} nettoyée`)
      }
    } catch (err) {
      console.log(`❌ Erreur ${table}: ${err.message}`)
    }
  }
  console.log('')
}

// Créer le super admin
async function createSuperAdmin() {
  console.log('👑 Création du Super Admin...')
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'admin@travelhub.com',
      password: 'Admin123456!',
      options: {
        data: {
          full_name: 'Super Administrator',
          user_type: 'super_admin'
        }
      }
    })
    
    if (error) {
      console.log('❌ Erreur création super admin:', error.message)
      return false
    }
    
    // Ajouter dans la table users
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: 'Super Administrator',
          user_type: 'super_admin',
          is_active: true
        })
      
      if (profileError) {
        console.log('⚠️  Erreur profil:', profileError.message)
      }
    }
    
    console.log('✅ Super Admin créé')
    console.log('   📧 Email: admin@travelhub.com')
    console.log('   🔐 Mot de passe: Admin123456!')
    console.log('')
    return true
    
  } catch (err) {
    console.log('❌ Erreur:', err.message)
    return false
  }
}

// Créer un directeur d'agence de test
async function createTestDirector() {
  console.log('👨‍💼 Création d\'un directeur de test...')
  
  try {
    // Créer l'agence d'abord
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        name: 'Agence Test',
        code: 'TEST-001',
        contact_email: 'directeur@test.com',
        is_active: true
      })
      .select()
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur création agence:', agencyError.message)
      return false
    }
    
    // Créer l'utilisateur directeur
    const { data, error } = await supabase.auth.signUp({
      email: 'directeur@test.com',
      password: 'Directeur123!',
      options: {
        data: {
          full_name: 'Directeur Test',
          user_type: 'agency_admin'
        }
      }
    })
    
    if (error) {
      console.log('❌ Erreur création directeur:', error.message)
      return false
    }
    
    // Ajouter dans la table users avec l'agency_id
    if (data.user && agencyData) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: 'Directeur Test',
          user_type: 'agency_admin',
          agency_id: agencyData.id,
          is_active: true
        })
      
      if (profileError) {
        console.log('⚠️  Erreur profil directeur:', profileError.message)
      }
    }
    
    console.log('✅ Directeur créé')
    console.log('   📧 Email: directeur@test.com')
    console.log('   🔐 Mot de passe: Directeur123!')
    console.log('   🏢 Agence: Agence Test')
    console.log('')
    return true
    
  } catch (err) {
    console.log('❌ Erreur:', err.message)
    return false
  }
}

// Fonction principale
async function resetSystem() {
  try {
    await cleanDatabase()
    
    const superAdminOk = await createSuperAdmin()
    const directorOk = await createTestDirector()
    
    if (superAdminOk && directorOk) {
      console.log('🎉 SYSTÈME RÉINITIALISÉ AVEC SUCCÈS!')
      console.log('=====================================')
      console.log('')
      console.log('🔑 COMPTES DISPONIBLES:')
      console.log('')
      console.log('👑 SUPER ADMIN:')
      console.log('   📧 admin@travelhub.com')
      console.log('   🔐 Admin123456!')
      console.log('')
      console.log('👨‍💼 DIRECTEUR AGENCE:') 
      console.log('   📧 directeur@test.com')
      console.log('   🔐 Directeur123!')
      console.log('')
      console.log('✨ Vous pouvez maintenant tester la connexion!')
    } else {
      console.log('❌ Erreurs lors de la réinitialisation')
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
  }
}

resetSystem()
