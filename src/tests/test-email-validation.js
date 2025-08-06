<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test avec différents formats d'email
async function testEmailValidation() {
  console.log('📧 Test de validation d\'email Supabase...\n')
  
  const testEmails = [
    'test@gmail.com',
    'user@yahoo.com',
    'admin@outlook.com',
    'contact@hotmail.com',
    'directeur@example.com',
    'agence@test.com'
  ]
  
  for (const email of testEmails) {
    try {
      console.log(`🔍 Test: ${email}`)
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      })
      
      if (error) {
        if (error.message.includes('User already registered')) {
          console.log('  ✅ Email valide (utilisateur existe déjà)')
        } else if (error.message.includes('invalid')) {
          console.log('  ❌ Email invalide:', error.message)
        } else {
          console.log('  ⚠️  Autre erreur:', error.message)
        }
      } else {
        console.log('  ✅ Email valide, inscription réussie')
        console.log('  📧 Confirmation requise:', !data.user?.email_confirmed_at)
      }
      
    } catch (err) {
      console.log('  ❌ Erreur:', err.message)
    }
    
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Test avec un email réel recommandé
async function testWithValidEmail() {
  console.log('\n🚀 Test avec email valide recommandé...\n')
  
  const testData = {
    email: 'admin@gmail.com', // Email avec domaine populaire
    password: 'TestPassword123!',
    firstName: 'Jean',
    lastName: 'Kouam',
    phone: '+237691234567',
    agencyName: 'Transport Express',
    address: 'Yaoundé, Cameroun'
  }
  
  try {
    console.log('📝 Tentative d\'inscription avec:', testData.email)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: {
          first_name: testData.firstName,
          last_name: testData.lastName,
          phone: testData.phone,
          role: 'agence'
        }
      }
    })
    
    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('✅ Email valide - Utilisateur déjà enregistré')
        
        // Tester la connexion
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testData.email,
          password: testData.password
        })
        
        if (signInError) {
          console.log('❌ Erreur de connexion:', signInError.message)
        } else {
          console.log('✅ Connexion réussie!')
          
          // Tester la création d'agence
          const { data: agencyData, error: agencyError } = await supabase
            .from('agencies')
            .upsert({
              user_id: signInData.user.id,
              name: testData.agencyName,
              email: testData.email,
              phone: testData.phone,
              address: testData.address,
              is_verified: false
            })
            .select()
            .single()
          
          if (agencyError) {
            console.log('❌ Erreur création agence:', agencyError.message)
          } else {
            console.log('✅ Agence créée avec succès!')
            console.log('🏢 Nom:', agencyData.name)
            console.log('📧 Email:', agencyData.email)
            
            return true
          }
        }
      } else {
        console.log('❌ Erreur d\'inscription:', authError.message)
      }
    } else {
      console.log('✅ Inscription réussie!')
      console.log('📧 ID utilisateur:', authData.user?.id)
      console.log('📬 Confirmation requise:', !authData.user?.email_confirmed_at)
      
      return true
    }
    
  } catch (err) {
    console.log('❌ Erreur générale:', err.message)
  }
  
  return false
}

// Recommandations pour l'utilisateur
function showRecommendations() {
  console.log('\n📋 RECOMMANDATIONS POUR VOTRE APPLICATION:\n')
  
  console.log('1. 📧 Formats d\'email acceptés:')
  console.log('   ✅ Utilisez des domaines populaires: gmail.com, yahoo.com, outlook.com')
  console.log('   ❌ Évitez les domaines personnalisés ou peu connus')
  
  console.log('\n2. 🔧 Dans votre composant Register.jsx:')
  console.log('   - Ajoutez une validation côté client pour les formats d\'email')
  console.log('   - Affichez un message d\'erreur clair si l\'email est rejeté')
  console.log('   - Suggérez des formats d\'email valides')
  
  console.log('\n3. 🎯 Test recommandé:')
  console.log('   - Utilisez votre propre email Gmail/Yahoo/Outlook pour tester')
  console.log('   - Vérifiez votre boîte email pour le lien de confirmation')
  
  console.log('\n4. 🔒 Configuration Supabase (optionnel):')
  console.log('   - Dans Dashboard > Authentication > Settings')
  console.log('   - Vous pouvez ajuster la validation d\'email si nécessaire')
}

// Exécuter tous les tests
async function runEmailTests() {
  console.log('='.repeat(60))
  console.log('         TEST DE VALIDATION D\'EMAIL SUPABASE')
  console.log('='.repeat(60))
  
  await testEmailValidation()
  const success = await testWithValidEmail()
  
  showRecommendations()
  
  console.log('\n' + '='.repeat(60))
  if (success) {
    console.log('🎉 RÉSULTAT: Le système fonctionne avec les bons formats d\'email!')
  } else {
    console.log('⚠️  RÉSULTAT: Utilisez des emails avec domaines populaires')
  }
  console.log('='.repeat(60))
}

runEmailTests().catch(console.error)
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test avec différents formats d'email
async function testEmailValidation() {
  console.log('📧 Test de validation d\'email Supabase...\n')
  
  const testEmails = [
    'test@gmail.com',
    'user@yahoo.com',
    'admin@outlook.com',
    'contact@hotmail.com',
    'directeur@example.com',
    'agence@test.com'
  ]
  
  for (const email of testEmails) {
    try {
      console.log(`🔍 Test: ${email}`)
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      })
      
      if (error) {
        if (error.message.includes('User already registered')) {
          console.log('  ✅ Email valide (utilisateur existe déjà)')
        } else if (error.message.includes('invalid')) {
          console.log('  ❌ Email invalide:', error.message)
        } else {
          console.log('  ⚠️  Autre erreur:', error.message)
        }
      } else {
        console.log('  ✅ Email valide, inscription réussie')
        console.log('  📧 Confirmation requise:', !data.user?.email_confirmed_at)
      }
      
    } catch (err) {
      console.log('  ❌ Erreur:', err.message)
    }
    
    // Petite pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

// Test avec un email réel recommandé
async function testWithValidEmail() {
  console.log('\n🚀 Test avec email valide recommandé...\n')
  
  const testData = {
    email: 'admin@gmail.com', // Email avec domaine populaire
    password: 'TestPassword123!',
    firstName: 'Jean',
    lastName: 'Kouam',
    phone: '+237691234567',
    agencyName: 'Transport Express',
    address: 'Yaoundé, Cameroun'
  }
  
  try {
    console.log('📝 Tentative d\'inscription avec:', testData.email)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: {
          first_name: testData.firstName,
          last_name: testData.lastName,
          phone: testData.phone,
          role: 'agence'
        }
      }
    })
    
    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('✅ Email valide - Utilisateur déjà enregistré')
        
        // Tester la connexion
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: testData.email,
          password: testData.password
        })
        
        if (signInError) {
          console.log('❌ Erreur de connexion:', signInError.message)
        } else {
          console.log('✅ Connexion réussie!')
          
          // Tester la création d'agence
          const { data: agencyData, error: agencyError } = await supabase
            .from('agencies')
            .upsert({
              user_id: signInData.user.id,
              name: testData.agencyName,
              email: testData.email,
              phone: testData.phone,
              address: testData.address,
              is_verified: false
            })
            .select()
            .single()
          
          if (agencyError) {
            console.log('❌ Erreur création agence:', agencyError.message)
          } else {
            console.log('✅ Agence créée avec succès!')
            console.log('🏢 Nom:', agencyData.name)
            console.log('📧 Email:', agencyData.email)
            
            return true
          }
        }
      } else {
        console.log('❌ Erreur d\'inscription:', authError.message)
      }
    } else {
      console.log('✅ Inscription réussie!')
      console.log('📧 ID utilisateur:', authData.user?.id)
      console.log('📬 Confirmation requise:', !authData.user?.email_confirmed_at)
      
      return true
    }
    
  } catch (err) {
    console.log('❌ Erreur générale:', err.message)
  }
  
  return false
}

// Recommandations pour l'utilisateur
function showRecommendations() {
  console.log('\n📋 RECOMMANDATIONS POUR VOTRE APPLICATION:\n')
  
  console.log('1. 📧 Formats d\'email acceptés:')
  console.log('   ✅ Utilisez des domaines populaires: gmail.com, yahoo.com, outlook.com')
  console.log('   ❌ Évitez les domaines personnalisés ou peu connus')
  
  console.log('\n2. 🔧 Dans votre composant Register.jsx:')
  console.log('   - Ajoutez une validation côté client pour les formats d\'email')
  console.log('   - Affichez un message d\'erreur clair si l\'email est rejeté')
  console.log('   - Suggérez des formats d\'email valides')
  
  console.log('\n3. 🎯 Test recommandé:')
  console.log('   - Utilisez votre propre email Gmail/Yahoo/Outlook pour tester')
  console.log('   - Vérifiez votre boîte email pour le lien de confirmation')
  
  console.log('\n4. 🔒 Configuration Supabase (optionnel):')
  console.log('   - Dans Dashboard > Authentication > Settings')
  console.log('   - Vous pouvez ajuster la validation d\'email si nécessaire')
}

// Exécuter tous les tests
async function runEmailTests() {
  console.log('='.repeat(60))
  console.log('         TEST DE VALIDATION D\'EMAIL SUPABASE')
  console.log('='.repeat(60))
  
  await testEmailValidation()
  const success = await testWithValidEmail()
  
  showRecommendations()
  
  console.log('\n' + '='.repeat(60))
  if (success) {
    console.log('🎉 RÉSULTAT: Le système fonctionne avec les bons formats d\'email!')
  } else {
    console.log('⚠️  RÉSULTAT: Utilisez des emails avec domaines populaires')
  }
  console.log('='.repeat(60))
}

runEmailTests().catch(console.error)
>>>>>>> master
