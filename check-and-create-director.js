<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 VÉRIFICATION DU STATUT UTILISATEUR')
console.log('====================================\n')

async function checkUserStatus() {
  try {
    // Vérifier tous les utilisateurs existants
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.log('❌ Erreur lecture users:', usersError.message)
      return
    }
    
    console.log('👥 UTILISATEURS EXISTANTS:')
    users.forEach(user => {
      console.log(`  📧 ${user.email}`)
      console.log(`     📋 Rôle: ${user.role || user.user_type}`)
      console.log(`     ✅ Actif: ${user.is_active ? 'Oui' : 'Non'}`)
      console.log('')
    })
    
    // Vérifier les agences
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('*')
    
    if (agenciesError) {
      console.log('❌ Erreur lecture agencies:', agenciesError.message)
      return
    }
    
    console.log('🏢 AGENCES EXISTANTES:')
    agencies.forEach(agency => {
      console.log(`  🏢 ${agency.name}`)
      console.log(`     👤 Propriétaire: ${agency.user_id}`)
      console.log(`     ✅ Vérifiée: ${agency.is_verified ? 'Oui' : 'Non'}`)
      console.log(`     ✅ Active: ${agency.is_active ? 'Oui' : 'Non'}`)
      console.log('')
    })
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
  }
}

// Créer un dirigeant d'agence complet
async function createAgencyDirector() {
  console.log('\n👨‍💼 CRÉATION D\'UN DIRIGEANT D\'AGENCE')
  console.log('=====================================\n')
  
  try {
    // Créer le compte d'authentification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'dirigeant@monagence.com',
      password: 'Dirigeant123!',
      options: {
        data: {
          full_name: 'Directeur Agence',
          role: 'agence'
        }
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.log('❌ Erreur auth:', authError.message)
      return false
    }
    
    const userId = authData.user?.id
    if (!userId) {
      console.log('❌ Pas d\'ID utilisateur')
      return false
    }
    
    console.log('✅ Compte auth créé:', userId)
    
    // Créer l'agence
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .upsert({
        user_id: userId,
        name: 'Mon Agence Test',
        email: 'dirigeant@monagence.com',
        phone: '+237691234567',
        address: 'Yaoundé, Cameroun',
        license_number: 'AG-2024-001',
        description: 'Agence de transport test',
        is_verified: true, // Pré-vérifiée
        is_active: true
      })
      .select()
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur agence:', agencyError.message)
      return false
    }
    
    console.log('✅ Agence créée:', agencyData.name)
    
    // Créer le profil utilisateur
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'dirigeant@monagence.com',
        full_name: 'Directeur Agence',
        role: 'agence', // Rôle de propriétaire d'agence
        is_active: true
      })
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil utilisateur créé')
    
    console.log('\n🎉 DIRIGEANT CRÉÉ AVEC SUCCÈS!')
    console.log('================================')
    console.log('📧 Email: dirigeant@monagence.com')
    console.log('🔐 Mot de passe: Dirigeant123!')
    console.log('👤 Rôle: agence (propriétaire)')
    console.log('🏢 Agence: Mon Agence Test')
    console.log('\n✨ Vous pouvez maintenant vous connecter et accéder à la gestion des employés!')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
    return false
  }
}

async function main() {
  await checkUserStatus()
  await createAgencyDirector()
}

main()
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 VÉRIFICATION DU STATUT UTILISATEUR')
console.log('====================================\n')

async function checkUserStatus() {
  try {
    // Vérifier tous les utilisateurs existants
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.log('❌ Erreur lecture users:', usersError.message)
      return
    }
    
    console.log('👥 UTILISATEURS EXISTANTS:')
    users.forEach(user => {
      console.log(`  📧 ${user.email}`)
      console.log(`     📋 Rôle: ${user.role || user.user_type}`)
      console.log(`     ✅ Actif: ${user.is_active ? 'Oui' : 'Non'}`)
      console.log('')
    })
    
    // Vérifier les agences
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('*')
    
    if (agenciesError) {
      console.log('❌ Erreur lecture agencies:', agenciesError.message)
      return
    }
    
    console.log('🏢 AGENCES EXISTANTES:')
    agencies.forEach(agency => {
      console.log(`  🏢 ${agency.name}`)
      console.log(`     👤 Propriétaire: ${agency.user_id}`)
      console.log(`     ✅ Vérifiée: ${agency.is_verified ? 'Oui' : 'Non'}`)
      console.log(`     ✅ Active: ${agency.is_active ? 'Oui' : 'Non'}`)
      console.log('')
    })
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
  }
}

// Créer un dirigeant d'agence complet
async function createAgencyDirector() {
  console.log('\n👨‍💼 CRÉATION D\'UN DIRIGEANT D\'AGENCE')
  console.log('=====================================\n')
  
  try {
    // Créer le compte d'authentification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'dirigeant@monagence.com',
      password: 'Dirigeant123!',
      options: {
        data: {
          full_name: 'Directeur Agence',
          role: 'agence'
        }
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.log('❌ Erreur auth:', authError.message)
      return false
    }
    
    const userId = authData.user?.id
    if (!userId) {
      console.log('❌ Pas d\'ID utilisateur')
      return false
    }
    
    console.log('✅ Compte auth créé:', userId)
    
    // Créer l'agence
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .upsert({
        user_id: userId,
        name: 'Mon Agence Test',
        email: 'dirigeant@monagence.com',
        phone: '+237691234567',
        address: 'Yaoundé, Cameroun',
        license_number: 'AG-2024-001',
        description: 'Agence de transport test',
        is_verified: true, // Pré-vérifiée
        is_active: true
      })
      .select()
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur agence:', agencyError.message)
      return false
    }
    
    console.log('✅ Agence créée:', agencyData.name)
    
    // Créer le profil utilisateur
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'dirigeant@monagence.com',
        full_name: 'Directeur Agence',
        role: 'agence', // Rôle de propriétaire d'agence
        is_active: true
      })
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil utilisateur créé')
    
    console.log('\n🎉 DIRIGEANT CRÉÉ AVEC SUCCÈS!')
    console.log('================================')
    console.log('📧 Email: dirigeant@monagence.com')
    console.log('🔐 Mot de passe: Dirigeant123!')
    console.log('👤 Rôle: agence (propriétaire)')
    console.log('🏢 Agence: Mon Agence Test')
    console.log('\n✨ Vous pouvez maintenant vous connecter et accéder à la gestion des employés!')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
    return false
  }
}

async function main() {
  await checkUserStatus()
  await createAgencyDirector()
}

main()
>>>>>>> master
