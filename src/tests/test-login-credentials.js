<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSuperAdminLogin() {
  console.log('🔍 Test de connexion du Super Admin\n')
  
  const SUPER_ADMIN_EMAIL = 'superadmin@hotmail.com'
  const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!'
  
  try {
    console.log('📝 Tentative de connexion avec:')
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`)
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`)
    
    // Test de connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    })
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n🔧 SOLUTIONS POSSIBLES:')
        console.log('1. Vérifiez que l\'email est exact (sensible à la casse)')
        console.log('2. Vérifiez que le mot de passe est exact')
        console.log('3. L\'utilisateur doit confirmer son email')
        console.log('4. Recréez le compte super admin')
      }
      
      return false
    }
    
    console.log('✅ Connexion réussie!')
    console.log('👤 User ID:', data.user.id)
    console.log('📧 Email:', data.user.email)
    console.log('📬 Email confirmé:', data.user.email_confirmed_at ? 'OUI' : 'NON')
    
    // Vérifier le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erreur de récupération du profil:', profileError.message)
    } else {
      console.log('✅ Profil trouvé:')
      console.log('   Nom:', profile.full_name)
      console.log('   Rôle:', profile.role)
      console.log('   Actif:', profile.is_active ? 'OUI' : 'NON')
    }
    
    // Se déconnecter
    await supabase.auth.signOut()
    console.log('🔓 Déconnexion effectuée')
    
    return true
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message)
    return false
  }
}

async function testAllCredentials() {
  console.log('🧪 Test de tous les comptes créés\n')
  
  const accounts = [
    {
      name: 'Super Admin',
      email: 'superadmin@hotmail.com',
      password: 'SuperAdmin123!'
    },
    {
      name: 'Agence 1',
      email: 'agence1@hotmail.com',
      password: 'Agence123!'
    },
    {
      name: 'Agence 2', 
      email: 'agence2@yahoo.com',
      password: 'Agence123!'
    }
  ]
  
  for (const account of accounts) {
    try {
      console.log(`🔍 Test: ${account.name} (${account.email})`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      })
      
      if (error) {
        console.log(`   ❌ Échec: ${error.message}`)
        
        if (error.message.includes('Email not confirmed')) {
          console.log('   📧 Email non confirmé - Vérifiez votre boîte email')
        }
      } else {
        console.log(`   ✅ Succès - User ID: ${data.user.id}`)
        console.log(`   📧 Email confirmé: ${data.user.email_confirmed_at ? 'OUI' : 'NON'}`)
        
        // Se déconnecter immédiatement
        await supabase.auth.signOut()
      }
      
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`)
    }
    
    console.log('')
  }
}

async function main() {
  console.log('🔐 DIAGNOSTIC DE CONNEXION\n')
  console.log('='.repeat(50))
  
  const superAdminWorks = await testSuperAdminLogin()
  
  console.log('\n' + '='.repeat(50))
  
  await testAllCredentials()
  
  console.log('='.repeat(50))
  
  if (superAdminWorks) {
    console.log('✅ RÉSULTAT: Le Super Admin peut se connecter')
    console.log('\n🎯 UTILISEZ CES IDENTIFIANTS DANS VOTRE APP:')
    console.log('📧 Email: superadmin@hotmail.com')
    console.log('🔑 Password: SuperAdmin123!')
  } else {
    console.log('❌ RÉSULTAT: Problème avec la connexion du Super Admin')
    console.log('\n🔧 Relancez: node create-super-admin.js')
  }
  
  console.log('\n📋 ACTIONS:')
  console.log('1. Utilisez ces identifiants exacts dans votre app')
  console.log('2. Vérifiez la console du navigateur pour voir les logs')
  console.log('3. Si ça ne marche pas, regardez les erreurs dans la console')
}

main().catch(console.error)
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSuperAdminLogin() {
  console.log('🔍 Test de connexion du Super Admin\n')
  
  const SUPER_ADMIN_EMAIL = 'superadmin@hotmail.com'
  const SUPER_ADMIN_PASSWORD = 'SuperAdmin123!'
  
  try {
    console.log('📝 Tentative de connexion avec:')
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`)
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`)
    
    // Test de connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD
    })
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n🔧 SOLUTIONS POSSIBLES:')
        console.log('1. Vérifiez que l\'email est exact (sensible à la casse)')
        console.log('2. Vérifiez que le mot de passe est exact')
        console.log('3. L\'utilisateur doit confirmer son email')
        console.log('4. Recréez le compte super admin')
      }
      
      return false
    }
    
    console.log('✅ Connexion réussie!')
    console.log('👤 User ID:', data.user.id)
    console.log('📧 Email:', data.user.email)
    console.log('📬 Email confirmé:', data.user.email_confirmed_at ? 'OUI' : 'NON')
    
    // Vérifier le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erreur de récupération du profil:', profileError.message)
    } else {
      console.log('✅ Profil trouvé:')
      console.log('   Nom:', profile.full_name)
      console.log('   Rôle:', profile.role)
      console.log('   Actif:', profile.is_active ? 'OUI' : 'NON')
    }
    
    // Se déconnecter
    await supabase.auth.signOut()
    console.log('🔓 Déconnexion effectuée')
    
    return true
    
  } catch (err) {
    console.error('❌ Erreur générale:', err.message)
    return false
  }
}

async function testAllCredentials() {
  console.log('🧪 Test de tous les comptes créés\n')
  
  const accounts = [
    {
      name: 'Super Admin',
      email: 'superadmin@hotmail.com',
      password: 'SuperAdmin123!'
    },
    {
      name: 'Agence 1',
      email: 'agence1@hotmail.com',
      password: 'Agence123!'
    },
    {
      name: 'Agence 2', 
      email: 'agence2@yahoo.com',
      password: 'Agence123!'
    }
  ]
  
  for (const account of accounts) {
    try {
      console.log(`🔍 Test: ${account.name} (${account.email})`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      })
      
      if (error) {
        console.log(`   ❌ Échec: ${error.message}`)
        
        if (error.message.includes('Email not confirmed')) {
          console.log('   📧 Email non confirmé - Vérifiez votre boîte email')
        }
      } else {
        console.log(`   ✅ Succès - User ID: ${data.user.id}`)
        console.log(`   📧 Email confirmé: ${data.user.email_confirmed_at ? 'OUI' : 'NON'}`)
        
        // Se déconnecter immédiatement
        await supabase.auth.signOut()
      }
      
    } catch (err) {
      console.log(`   ❌ Erreur: ${err.message}`)
    }
    
    console.log('')
  }
}

async function main() {
  console.log('🔐 DIAGNOSTIC DE CONNEXION\n')
  console.log('='.repeat(50))
  
  const superAdminWorks = await testSuperAdminLogin()
  
  console.log('\n' + '='.repeat(50))
  
  await testAllCredentials()
  
  console.log('='.repeat(50))
  
  if (superAdminWorks) {
    console.log('✅ RÉSULTAT: Le Super Admin peut se connecter')
    console.log('\n🎯 UTILISEZ CES IDENTIFIANTS DANS VOTRE APP:')
    console.log('📧 Email: superadmin@hotmail.com')
    console.log('🔑 Password: SuperAdmin123!')
  } else {
    console.log('❌ RÉSULTAT: Problème avec la connexion du Super Admin')
    console.log('\n🔧 Relancez: node create-super-admin.js')
  }
  
  console.log('\n📋 ACTIONS:')
  console.log('1. Utilisez ces identifiants exacts dans votre app')
  console.log('2. Vérifiez la console du navigateur pour voir les logs')
  console.log('3. Si ça ne marche pas, regardez les erreurs dans la console')
}

main().catch(console.error)
>>>>>>> master
