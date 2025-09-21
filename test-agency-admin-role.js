/**
 * Script de test pour vérifier la création d'admin d'agence
 * Ce script vérifie que les admins d'agence sont créés avec le bon rôle
 */

import { supabase } from '../src/lib/supabase.js'

const testAgencyAdminCreation = async () => {
  console.log('🧪 === TEST CRÉATION ADMIN AGENCE ===\n')
  
  try {
    // 1. Vérifier les utilisateurs existants avec des emails d'agence
    console.log('📋 1. Vérification des utilisateurs d\'agence existants...')
    const { data: agencyUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .like('email', '%.admin@%')
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError.message)
      return
    }
    
    console.log(`✅ Trouvé ${agencyUsers.length} utilisateurs avec email d'agence:`)
    agencyUsers.forEach(user => {
      console.log(`   📧 ${user.email} | 🎭 Rôle: ${user.role} | 🆔 ID: ${user.id}`)
    })
    console.log('')
    
    // 2. Vérifier les invitations d'admin d'agence
    console.log('📋 2. Vérification des invitations admin d\'agence...')
    const { data: invitations, error: invitationsError } = await supabase
      .from('agency_admin_invitations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (invitationsError) {
      console.error('❌ Erreur récupération invitations:', invitationsError.message)
      return
    }
    
    console.log(`✅ Trouvé ${invitations.length} invitations récentes:`)
    invitations.forEach(inv => {
      console.log(`   📧 ${inv.admin_email} | 📊 Status: ${inv.is_used ? 'UTILISÉE' : 'PENDANTE'} | 📅 Créée: ${new Date(inv.created_at).toLocaleDateString('fr-FR')}`)
    })
    console.log('')
    
    // 3. Vérifier la correspondance entre auth.users et users
    console.log('📋 3. Vérification correspondance auth.users <-> users...')
    for (const user of agencyUsers) {
      // Vérifier si l'utilisateur existe dans auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id)
      
      if (authError) {
        console.log(`   ❌ ${user.email}: N'existe pas dans auth.users`)
      } else {
        const authRole = authUser.user.user_metadata?.role || 'non défini'
        const dbRole = user.role
        const roleMatch = authRole === dbRole || (authRole === 'non défini' && dbRole)
        
        console.log(`   ${roleMatch ? '✅' : '⚠️'} ${user.email}:`)
        console.log(`      🔐 Auth metadata role: ${authRole}`)
        console.log(`      🗃️ DB users role: ${dbRole}`)
        console.log(`      📊 Correspondance: ${roleMatch ? 'OUI' : 'NON'}`)
      }
    }
    console.log('')
    
    // 4. Recommandations
    console.log('📋 4. Recommandations...')
    const problemUsers = agencyUsers.filter(user => user.role !== 'agence' && user.email.includes('.admin@'))
    
    if (problemUsers.length > 0) {
      console.log('❌ Utilisateurs avec un rôle incorrect:')
      problemUsers.forEach(user => {
        console.log(`   📧 ${user.email} a le rôle "${user.role}" au lieu de "agence"`)
      })
      
      console.log('\n🔧 Pour corriger, exécutez:')
      problemUsers.forEach(user => {
        console.log(`   UPDATE users SET role = 'agence' WHERE id = '${user.id}';`)
      })
    } else {
      console.log('✅ Tous les admins d\'agence ont le bon rôle "agence"')
    }
    
    console.log('\n🧪 === FIN DU TEST ===')
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error)
  }
}

// Exécuter le test
testAgencyAdminCreation()
  .then(() => {
    console.log('✅ Test terminé')
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error)
  })