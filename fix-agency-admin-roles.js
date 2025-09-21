/**
 * Script de correction pour fixer les rôles des admins d'agence
 * Ce script corrige les utilisateurs qui devraient avoir le rôle "agence"
 */

import { supabase } from '../src/lib/supabase.js'

const fixAgencyAdminRoles = async () => {
  console.log('🔧 === CORRECTION RÔLES ADMIN AGENCE ===\n')
  
  try {
    // 1. Identifier les utilisateurs avec email d'agence qui n'ont pas le bon rôle
    console.log('🔍 1. Recherche des utilisateurs à corriger...')
    const { data: usersToFix, error: usersError } = await supabase
      .from('users')
      .select('*')
      .like('email', '%.admin@%')
      .neq('role', 'agence')
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError.message)
      return
    }
    
    if (usersToFix.length === 0) {
      console.log('✅ Aucun utilisateur à corriger trouvé!')
      return
    }
    
    console.log(`🎯 Trouvé ${usersToFix.length} utilisateur(s) à corriger:`)
    usersToFix.forEach(user => {
      console.log(`   📧 ${user.email} | 🎭 Rôle actuel: "${user.role}" → devrait être "agence"`)
    })
    console.log('')
    
    // 2. Corriger les rôles
    console.log('🔧 2. Correction des rôles...')
    
    for (const user of usersToFix) {
      console.log(`🔄 Correction de ${user.email}...`)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'agence',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error(`   ❌ Erreur correction ${user.email}:`, updateError.message)
      } else {
        console.log(`   ✅ ${user.email} corrigé avec succès`)
      }
    }
    console.log('')
    
    // 3. Vérification finale
    console.log('✅ 3. Vérification finale...')
    const { data: verifyUsers, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .in('id', usersToFix.map(u => u.id))
    
    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError.message)
      return
    }
    
    verifyUsers.forEach(user => {
      const isCorrect = user.role === 'agence'
      console.log(`   ${isCorrect ? '✅' : '❌'} ${user.email}: rôle = "${user.role}"`)
    })
    
    const correctedCount = verifyUsers.filter(u => u.role === 'agence').length
    console.log(`\n📊 Résultat: ${correctedCount}/${usersToFix.length} utilisateurs corrigés avec succès`)
    
    console.log('\n🔧 === FIN DE LA CORRECTION ===')
    
  } catch (error) {
    console.error('💥 Erreur lors de la correction:', error)
  }
}

// Fonction pour aussi corriger les métadonnées dans auth.users si nécessaire
const fixAuthMetadata = async () => {
  console.log('🔧 === CORRECTION MÉTADONNÉES AUTH ===\n')
  
  try {
    // Récupérer les admins d'agence
    const { data: agencyAdmins, error: adminsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agence')
    
    if (adminsError) {
      console.error('❌ Erreur récupération admins:', adminsError.message)
      return
    }
    
    console.log(`🎯 Mise à jour des métadonnées pour ${agencyAdmins.length} admin(s)...`)
    
    for (const admin of agencyAdmins) {
      console.log(`🔄 Mise à jour métadonnées pour ${admin.email}...`)
      
      try {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          admin.id,
          {
            user_metadata: {
              full_name: admin.full_name,
              role: 'agence',
              agency_id: admin.agency_id,
              phone: admin.phone
            }
          }
        )
        
        if (updateError) {
          console.error(`   ❌ Erreur métadonnées ${admin.email}:`, updateError.message)
        } else {
          console.log(`   ✅ Métadonnées ${admin.email} mises à jour`)
        }
      } catch (error) {
        console.error(`   ❌ Erreur métadonnées ${admin.email}:`, error.message)
      }
    }
    
    console.log('\n🔧 === FIN CORRECTION MÉTADONNÉES ===')
    
  } catch (error) {
    console.error('💥 Erreur lors de la correction des métadonnées:', error)
  }
}

// Exécuter les corrections
const runAllFixes = async () => {
  await fixAgencyAdminRoles()
  console.log('\n' + '='.repeat(50) + '\n')
  await fixAuthMetadata()
}

runAllFixes()
  .then(() => {
    console.log('\n✅ Toutes les corrections terminées')
  })
  .catch(error => {
    console.error('\n❌ Erreur fatale:', error)
  })