import { createClient } from '@supabase/supabase-js'

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
    'bookings',
    'favorites',
    'seat_maps',
    'trip_services',
    'trips',
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
      
      if (error) {
        console.log(`   ⚠️  Erreur: ${error.message}`)
      } else {
        console.log(`   ✅ Table ${table} nettoyée`)
      }
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`)
    }
  }
  
  console.log('\n✅ Nettoyage terminé!')
}

// Créer le super admin principal
async function createMainSuperAdmin() {
  console.log('\n👑 Création du Super Admin principal...\n')
  
  const adminData = {
    email: 'superadmin@hotmail.com',
    password: 'SuperAdmin123!',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+237600000000',
    role: 'super_admin'
  }
  
  try {
    // Créer le compte d'authentification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          phone: adminData.phone,
          role: adminData.role
        }
      }
    })
    
    if (authError) {
      console.error('❌ Erreur création compte:', authError.message)
      return false
    }
    
    const user = authData.user
    console.log('✅ Compte créé - ID:', user.id)
    
    // Créer le profil utilisateur
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        full_name: `${adminData.firstName} ${adminData.lastName}`,
        phone: adminData.phone,
        role: adminData.role,
        is_active: true
      })
    
    if (profileError) {
      console.error('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Super Admin principal créé')
    console.log(`   📧 Email: ${adminData.email}`)
    console.log(`   🔑 Password: ${adminData.password}`)
    
    return { user, credentials: adminData }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    return false
  }
}

// Créer les directeurs d'agences
async function createAgencyDirectors() {
  console.log('\n🏢 Création des Directeurs d\'agences...\n')
  
  const directors = [
    {
      email: 'directeur.transport@hotmail.com',
      password: 'Directeur123!',
      firstName: 'Jean',
      lastName: 'Kouam',
      phone: '+237691111111',
      agencyName: 'Transport Express Cameroun',
      agencyAddress: 'Yaoundé, Centre, Cameroun'
    },
    {
      email: 'directeur.voyage@yahoo.com',
      password: 'Directeur123!',
      firstName: 'Marie',
      lastName: 'Ngono',
      phone: '+237692222222',
      agencyName: 'Voyage Rapide Douala',
      agencyAddress: 'Douala, Littoral, Cameroun'
    },
    {
      email: 'directeur.express@hotmail.com',
      password: 'Directeur123!',
      firstName: 'Paul',
      lastName: 'Mbida',
      phone: '+237693333333',
      agencyName: 'Express Travel Bafoussam',
      agencyAddress: 'Bafoussam, Ouest, Cameroun'
    }
  ]
  
  const createdDirectors = []
  
  for (const directorData of directors) {
    try {
      console.log(`👤 Création: ${directorData.firstName} ${directorData.lastName}`)
      
      // Créer le compte d'authentification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: directorData.email,
        password: directorData.password,
        options: {
          data: {
            first_name: directorData.firstName,
            last_name: directorData.lastName,
            phone: directorData.phone,
            role: 'agency_admin'
          }
        }
      })
      
      if (authError) {
        console.log(`   ❌ Erreur compte: ${authError.message}`)
        continue
      }
      
      const user = authData.user
      console.log(`   ✅ Compte créé - ID: ${user.id}`)
      
      // Créer le profil utilisateur
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: `${directorData.firstName} ${directorData.lastName}`,
          phone: directorData.phone,
          role: 'agency_admin',
          is_active: true
        })
      
      if (profileError) {
        console.log(`   ❌ Erreur profil: ${profileError.message}`)
        continue
      }
      
      // Créer l'agence
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          user_id: user.id,
          name: directorData.agencyName,
          email: directorData.email,
          phone: directorData.phone,
          address: directorData.agencyAddress,
          license_number: `RC/${directorData.agencyName.replace(/\s+/g, '')}/2024`,
          description: `Agence de transport dirigée par ${directorData.firstName} ${directorData.lastName}`,
          is_verified: true, // Pré-validée
          is_active: true
        })
        .select()
        .single()
      
      if (agencyError) {
        console.log(`   ❌ Erreur agence: ${agencyError.message}`)
        continue
      }
      
      console.log(`   ✅ Agence "${directorData.agencyName}" créée`)
      
      // Ajouter des capacités par défaut
      await supabase
        .from('agency_capabilities')
        .insert({
          agency_id: agencyData.id,
          bus_count: 10,
          total_seats: 400,
          employee_count: 15,
          max_daily_trips: 20,
          coverage_areas: [directorData.agencyAddress.split(',')[1].trim()]
        })
      
      createdDirectors.push({
        user,
        agency: agencyData,
        credentials: {
          email: directorData.email,
          password: directorData.password,
          agencyName: directorData.agencyName
        }
      })
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`)
    }
    
    // Pause entre les créations
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  return createdDirectors
}

// Afficher le résumé final
function showFinalSummary(superAdmin, directors) {
  console.log('\n' + '='.repeat(70))
  console.log('                    COMPTES CRÉÉS AVEC SUCCÈS')
  console.log('='.repeat(70))
  
  console.log('\n👑 SUPER ADMIN PRINCIPAL:')
  console.log(`📧 Email: ${superAdmin.credentials.email}`)
  console.log(`🔑 Password: ${superAdmin.credentials.password}`)
  console.log('🛡️  Rôle: Super Admin (accès complet)')
  
  console.log('\n🏢 DIRECTEURS D\'AGENCES:')
  directors.forEach((director, index) => {
    console.log(`\n${index + 1}. ${director.credentials.agencyName}`)
    console.log(`   📧 Email: ${director.credentials.email}`)
    console.log(`   🔑 Password: ${director.credentials.password}`)
    console.log(`   🛡️  Rôle: Directeur d'agence`)
    console.log(`   🏢 Agence: ${director.credentials.agencyName}`)
  })
  
  console.log('\n🎯 FONCTIONNALITÉS:')
  console.log('• Super Admin: Gestion complète du système')
  console.log('• Directeurs: Gestion de leur agence + ajout employés')
  console.log('• Tous les comptes sont actifs et vérifiés')
  
  console.log('\n' + '='.repeat(70))
}

// Fonction principale
async function setupCompleteSystem() {
  console.log('🚀 CONFIGURATION COMPLÈTE DU SYSTÈME\n')
  console.log('='.repeat(50))
  
  // Étape 1: Nettoyer
  await cleanAllTables()
  
  // Étape 2: Créer le super admin
  const superAdmin = await createMainSuperAdmin()
  
  if (!superAdmin) {
    console.log('❌ Échec création super admin')
    return
  }
  
  // Étape 3: Créer les directeurs
  const directors = await createAgencyDirectors()
  
  // Étape 4: Afficher le résumé
  showFinalSummary(superAdmin, directors)
  
  console.log('\n🎉 SYSTÈME CONFIGURÉ AVEC SUCCÈS!')
}

setupCompleteSystem().catch(console.error)
