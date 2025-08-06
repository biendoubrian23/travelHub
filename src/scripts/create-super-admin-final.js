<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('👑 CRÉATION DU SUPER ADMIN')
console.log('=========================\n')

const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@travelhub.cm',
  password: 'SuperAdmin2024!',
  fullName: 'Super Administrateur',
  role: 'super_admin'
}

async function createSuperAdmin() {
  try {
    console.log('🔐 Création du compte d\'authentification...')
    
    // 1. Créer le compte d'authentification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: SUPER_ADMIN_CREDENTIALS.email,
      password: SUPER_ADMIN_CREDENTIALS.password,
      options: {
        data: {
          full_name: SUPER_ADMIN_CREDENTIALS.fullName,
          role: SUPER_ADMIN_CREDENTIALS.role
        }
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.log('❌ Erreur auth:', authError.message)
      return false
    }
    
    const userId = authData.user?.id
    if (!userId) {
      console.log('❌ Pas d\'ID utilisateur obtenu')
      return false
    }
    
    console.log('✅ Compte auth créé avec ID:', userId)
    
    // 2. Créer le profil dans la table users
    console.log('👤 Création du profil utilisateur...')
    
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: SUPER_ADMIN_CREDENTIALS.email,
        full_name: SUPER_ADMIN_CREDENTIALS.fullName,
        role: SUPER_ADMIN_CREDENTIALS.role,
        is_active: true,
        created_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil utilisateur créé')
    
    // 3. Vérifier la création
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('email', SUPER_ADMIN_CREDENTIALS.email)
      .single()
    
    if (verifyError) {
      console.log('❌ Erreur vérification:', verifyError.message)
      return false
    }
    
    console.log('✅ Vérification réussie')
    
    console.log('\n🎉 SUPER ADMIN CRÉÉ AVEC SUCCÈS!')
    console.log('===============================')
    console.log('📧 Email:', SUPER_ADMIN_CREDENTIALS.email)
    console.log('🔐 Mot de passe:', SUPER_ADMIN_CREDENTIALS.password)
    console.log('👤 Nom:', SUPER_ADMIN_CREDENTIALS.fullName)
    console.log('🎭 Rôle:', SUPER_ADMIN_CREDENTIALS.role)
    console.log('🆔 ID:', userId)
    console.log('')
    console.log('🔧 POUVOIRS DU SUPER ADMIN:')
    console.log('• 👑 Accès administrateur complet')
    console.log('• 🏢 Gestion de toutes les agences')
    console.log('• 👥 Voir tous les utilisateurs')
    console.log('• ✅ Valider les nouvelles agences')
    console.log('• 📊 Rapports et statistiques globales')
    console.log('• ⚙️ Configuration système')
    console.log('')
    console.log('✨ Vous pouvez maintenant vous connecter!')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
    return false
  }
}

createSuperAdmin()
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('👑 CRÉATION DU SUPER ADMIN')
console.log('=========================\n')

const SUPER_ADMIN_CREDENTIALS = {
  email: 'superadmin@travelhub.cm',
  password: 'SuperAdmin2024!',
  fullName: 'Super Administrateur',
  role: 'super_admin'
}

async function createSuperAdmin() {
  try {
    console.log('🔐 Création du compte d\'authentification...')
    
    // 1. Créer le compte d'authentification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: SUPER_ADMIN_CREDENTIALS.email,
      password: SUPER_ADMIN_CREDENTIALS.password,
      options: {
        data: {
          full_name: SUPER_ADMIN_CREDENTIALS.fullName,
          role: SUPER_ADMIN_CREDENTIALS.role
        }
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.log('❌ Erreur auth:', authError.message)
      return false
    }
    
    const userId = authData.user?.id
    if (!userId) {
      console.log('❌ Pas d\'ID utilisateur obtenu')
      return false
    }
    
    console.log('✅ Compte auth créé avec ID:', userId)
    
    // 2. Créer le profil dans la table users
    console.log('👤 Création du profil utilisateur...')
    
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: SUPER_ADMIN_CREDENTIALS.email,
        full_name: SUPER_ADMIN_CREDENTIALS.fullName,
        role: SUPER_ADMIN_CREDENTIALS.role,
        is_active: true,
        created_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil utilisateur créé')
    
    // 3. Vérifier la création
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('email', SUPER_ADMIN_CREDENTIALS.email)
      .single()
    
    if (verifyError) {
      console.log('❌ Erreur vérification:', verifyError.message)
      return false
    }
    
    console.log('✅ Vérification réussie')
    
    console.log('\n🎉 SUPER ADMIN CRÉÉ AVEC SUCCÈS!')
    console.log('===============================')
    console.log('📧 Email:', SUPER_ADMIN_CREDENTIALS.email)
    console.log('🔐 Mot de passe:', SUPER_ADMIN_CREDENTIALS.password)
    console.log('👤 Nom:', SUPER_ADMIN_CREDENTIALS.fullName)
    console.log('🎭 Rôle:', SUPER_ADMIN_CREDENTIALS.role)
    console.log('🆔 ID:', userId)
    console.log('')
    console.log('🔧 POUVOIRS DU SUPER ADMIN:')
    console.log('• 👑 Accès administrateur complet')
    console.log('• 🏢 Gestion de toutes les agences')
    console.log('• 👥 Voir tous les utilisateurs')
    console.log('• ✅ Valider les nouvelles agences')
    console.log('• 📊 Rapports et statistiques globales')
    console.log('• ⚙️ Configuration système')
    console.log('')
    console.log('✨ Vous pouvez maintenant vous connecter!')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message)
    return false
  }
}

createSuperAdmin()
>>>>>>> master
