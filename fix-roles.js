<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔧 CORRECTION DES RÔLES UTILISATEURS')
console.log('===================================\n')

async function fixUserRoles() {
  try {
    // Corriger le rôle du super admin
    const { error: superAdminError } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', 'admin@travelhub.com')
    
    if (superAdminError) {
      console.log('❌ Erreur correction super admin:', superAdminError.message)
    } else {
      console.log('✅ Super admin corrigé: admin@travelhub.com → role: super_admin')
    }
    
    // Vérifier que l'agence existe pour patron@agence.com
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('email', 'patron@agence.com')
      .single()
    
    if (agencyError) {
      console.log('⚠️  Agence pas trouvée, création...')
      
      // Créer l'agence pour le patron
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'patron@agence.com')
        .single()
      
      if (userData) {
        const { error: createAgencyError } = await supabase
          .from('agencies')
          .insert({
            user_id: userData.id,
            name: 'Agence Transport Plus',
            email: 'patron@agence.com',
            phone: '+237691234567',
            address: 'Yaoundé, Centre, Cameroun',
            is_verified: true
          })
        
        if (createAgencyError) {
          console.log('❌ Erreur création agence:', createAgencyError.message)
        } else {
          console.log('✅ Agence créée pour patron@agence.com')
        }
      }
    } else {
      console.log('✅ Agence existe déjà pour patron@agence.com')
    }
    
    // Afficher le résumé final
    const { data: allUsers } = await supabase
      .from('users')
      .select('email, full_name, role')
      .order('email')
    
    console.log('\n📋 UTILISATEURS APRÈS CORRECTION:')
    console.log('================================')
    allUsers?.forEach(user => {
      const roleIcon = user.role === 'super_admin' ? '👑' : 
                      user.role === 'agence' ? '👨‍💼' : '👤'
      console.log(`${roleIcon} ${user.email}`)
      console.log(`   📝 Nom: ${user.full_name}`)
      console.log(`   🎭 Rôle: ${user.role}`)
      console.log('')
    })
    
    console.log('🎯 COMPTES RECOMMANDÉS POUR VOUS:')
    console.log('=================================')
    console.log('👑 SUPER ADMIN (gestion système):')
    console.log('   📧 admin@travelhub.com')
    console.log('   🔐 Admin123456!')
    console.log('')
    console.log('👨‍💼 DIRIGEANT AGENCE (gestion employés):')
    console.log('   📧 patron@agence.com')
    console.log('   🔐 Patron123!')
    console.log('   🏢 Agence: Agence Transport Plus')
    console.log('   ✨ Accès au menu "Employés" dans la sidebar')
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
  }
}

fixUserRoles()
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔧 CORRECTION DES RÔLES UTILISATEURS')
console.log('===================================\n')

async function fixUserRoles() {
  try {
    // Corriger le rôle du super admin
    const { error: superAdminError } = await supabase
      .from('users')
      .update({ role: 'super_admin' })
      .eq('email', 'admin@travelhub.com')
    
    if (superAdminError) {
      console.log('❌ Erreur correction super admin:', superAdminError.message)
    } else {
      console.log('✅ Super admin corrigé: admin@travelhub.com → role: super_admin')
    }
    
    // Vérifier que l'agence existe pour patron@agence.com
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('email', 'patron@agence.com')
      .single()
    
    if (agencyError) {
      console.log('⚠️  Agence pas trouvée, création...')
      
      // Créer l'agence pour le patron
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'patron@agence.com')
        .single()
      
      if (userData) {
        const { error: createAgencyError } = await supabase
          .from('agencies')
          .insert({
            user_id: userData.id,
            name: 'Agence Transport Plus',
            email: 'patron@agence.com',
            phone: '+237691234567',
            address: 'Yaoundé, Centre, Cameroun',
            is_verified: true
          })
        
        if (createAgencyError) {
          console.log('❌ Erreur création agence:', createAgencyError.message)
        } else {
          console.log('✅ Agence créée pour patron@agence.com')
        }
      }
    } else {
      console.log('✅ Agence existe déjà pour patron@agence.com')
    }
    
    // Afficher le résumé final
    const { data: allUsers } = await supabase
      .from('users')
      .select('email, full_name, role')
      .order('email')
    
    console.log('\n📋 UTILISATEURS APRÈS CORRECTION:')
    console.log('================================')
    allUsers?.forEach(user => {
      const roleIcon = user.role === 'super_admin' ? '👑' : 
                      user.role === 'agence' ? '👨‍💼' : '👤'
      console.log(`${roleIcon} ${user.email}`)
      console.log(`   📝 Nom: ${user.full_name}`)
      console.log(`   🎭 Rôle: ${user.role}`)
      console.log('')
    })
    
    console.log('🎯 COMPTES RECOMMANDÉS POUR VOUS:')
    console.log('=================================')
    console.log('👑 SUPER ADMIN (gestion système):')
    console.log('   📧 admin@travelhub.com')
    console.log('   🔐 Admin123456!')
    console.log('')
    console.log('👨‍💼 DIRIGEANT AGENCE (gestion employés):')
    console.log('   📧 patron@agence.com')
    console.log('   🔐 Patron123!')
    console.log('   🏢 Agence: Agence Transport Plus')
    console.log('   ✨ Accès au menu "Employés" dans la sidebar')
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
  }
}

fixUserRoles()
>>>>>>> master
