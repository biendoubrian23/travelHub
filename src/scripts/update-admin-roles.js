import { supabase } from '../lib/supabase.js'

/**
 * Script pour mettre à jour les rôles 'agency_admin' vers 'agence'
 * Exécuter ce script pour corriger les rôles dans la base de données
 */

async function updateAdminRoles() {
  console.log('🔄 Début de la mise à jour des rôles agency_admin vers agence...')

  try {
    // 1. Mettre à jour les utilisateurs qui ont le rôle 'agency_admin'
    const { data: updatedUsers, error } = await supabase
      .from('users')
      .update({ role: 'agence' })
      .eq('role', 'agency_admin')
      .select()

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error.message)
      return
    }

    console.log(`✅ ${updatedUsers.length} utilisateurs mis à jour de 'agency_admin' vers 'agence'`)

    // 2. Vérification : s'assurer qu'il n'y a plus d'utilisateurs avec le rôle 'agency_admin'
    const { data: remainingAdmins, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'agency_admin')

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError.message)
      return
    }

    if (remainingAdmins && remainingAdmins.length > 0) {
      console.warn(`⚠️ Il reste encore ${remainingAdmins.length} utilisateurs avec le rôle 'agency_admin'`)
    } else {
      console.log('✅ Aucun utilisateur ne possède plus le rôle agency_admin')
    }

  } catch (err) {
    console.error('❌ Erreur inattendue:', err.message)
  }
}

// Exécuter la fonction
updateAdminRoles().then(() => {
  console.log('🏁 Script terminé')
})
