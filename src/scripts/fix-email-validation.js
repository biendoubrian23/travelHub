<<<<<<< HEAD
// Script pour désactiver la validation stricte d'email dans Supabase
// Ce script utilise l'API Management de Supabase

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test pour vérifier l'état actuel de la validation d'email
async function checkCurrentEmailValidation() {
  console.log('🔍 Vérification de l\'état actuel de la validation d\'email...\n')
  
  const testEmails = [
    'test@gmail.com',
    'user@yahoo.com', 
    'admin@outlook.com',
    'contact@hotmail.com'
  ]
  
  console.log('📧 Test des domaines d\'email:')
  
  for (const email of testEmails) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: { test: true }
        }
      })
      
      if (error) {
        if (error.message.includes('invalid')) {
          console.log(`  ❌ ${email} - REJETÉ`)
        } else if (error.message.includes('User already registered')) {
          console.log(`  ✅ ${email} - ACCEPTÉ (utilisateur existe)`)
        } else {
          console.log(`  ⚠️  ${email} - ${error.message}`)
        }
      } else {
        console.log(`  ✅ ${email} - ACCEPTÉ`)
      }
    } catch (err) {
      console.log(`  ❌ ${email} - Erreur: ${err.message}`)
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

// Instructions détaillées pour l'utilisateur
function showDetailedInstructions() {
  console.log('\n' + '='.repeat(70))
  console.log('           INSTRUCTIONS POUR DÉSACTIVER LA VALIDATION EMAIL')
  console.log('='.repeat(70))
  
  console.log('\n📋 ÉTAPES DANS LE DASHBOARD SUPABASE:')
  console.log('\n1. 🌐 Ouvrez votre navigateur et allez à:')
  console.log('   👉 https://supabase.com/dashboard/project/dqoncbnvyviurirsdtyu')
  
  console.log('\n2. 🔐 Connectez-vous à votre compte Supabase')
  
  console.log('\n3. 📱 Dans le menu de gauche, cliquez sur:')
  console.log('   👉 "Authentication" (icône de cadenas)')
  
  console.log('\n4. ⚙️  Cliquez ensuite sur:')
  console.log('   👉 "Settings" (dans le sous-menu Authentication)')
  
  console.log('\n5. 📧 Cherchez une de ces sections:')
  console.log('   • "Email Auth Settings"')
  console.log('   • "Auth Providers" > "Email"')
  console.log('   • "Email validation"')
  console.log('   • "Domain restrictions"')
  
  console.log('\n6. 🔧 Cherchez et modifiez ces options:')
  console.log('   ✅ ACTIVEZ: "Allow all email domains"')
  console.log('   ✅ ACTIVEZ: "Disable email validation"')
  console.log('   ❌ DÉSACTIVEZ: "Email domain restrictions"')
  console.log('   ❌ DÉSACTIVEZ: "Validate email domains"')
  
  console.log('\n7. 💾 Cliquez sur "Save" ou "Update"')
  
  console.log('\n8. ⏱️  Attendez 1-2 minutes pour la prise en effet')
  
  console.log('\n🔄 ALTERNATIVE - Configuration par SQL:')
  console.log('\n   Si les options ne sont pas visibles dans l\'interface:')
  console.log('   1. Allez dans "SQL Editor"')
  console.log('   2. Exécutez cette requête:')
  console.log('   ')
  console.log('   -- Désactiver la validation stricte d\'email')
  console.log('   UPDATE auth.config')
  console.log('   SET email_validation = false')
  console.log('   WHERE parameter = \'email_validation\';')
  
  console.log('\n📱 APRÈS LA MODIFICATION:')
  console.log('   • Testez à nouveau l\'inscription avec un email @gmail.com')
  console.log('   • Utilisez ce script pour vérifier: node check-email-validation.js')
  
  console.log('\n⚠️  NOTES IMPORTANTES:')
  console.log('   • Cette modification affecte tout votre projet Supabase')
  console.log('   • Les emails factices seront acceptés (test@test.com)')
  console.log('   • La confirmation par email reste nécessaire')
  
  console.log('\n' + '='.repeat(70))
}

// Test après modification
async function testAfterChanges() {
  console.log('\n🧪 TEST APRÈS MODIFICATIONS:')
  console.log('\nPour vérifier que la modification a fonctionné,')
  console.log('relancez ce script avec: node check-email-validation.js')
  console.log('\nSi @gmail.com est accepté, la modification a réussi!')
}

// Fonction principale
async function main() {
  console.log('🔍 DIAGNOSTIC DE LA VALIDATION EMAIL SUPABASE\n')
  
  await checkCurrentEmailValidation()
  showDetailedInstructions()
  await testAfterChanges()
}

main().catch(console.error)
=======
// Script pour désactiver la validation stricte d'email dans Supabase
// Ce script utilise l'API Management de Supabase

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test pour vérifier l'état actuel de la validation d'email
async function checkCurrentEmailValidation() {
  console.log('🔍 Vérification de l\'état actuel de la validation d\'email...\n')
  
  const testEmails = [
    'test@gmail.com',
    'user@yahoo.com', 
    'admin@outlook.com',
    'contact@hotmail.com'
  ]
  
  console.log('📧 Test des domaines d\'email:')
  
  for (const email of testEmails) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: 'TestPassword123!',
        options: {
          data: { test: true }
        }
      })
      
      if (error) {
        if (error.message.includes('invalid')) {
          console.log(`  ❌ ${email} - REJETÉ`)
        } else if (error.message.includes('User already registered')) {
          console.log(`  ✅ ${email} - ACCEPTÉ (utilisateur existe)`)
        } else {
          console.log(`  ⚠️  ${email} - ${error.message}`)
        }
      } else {
        console.log(`  ✅ ${email} - ACCEPTÉ`)
      }
    } catch (err) {
      console.log(`  ❌ ${email} - Erreur: ${err.message}`)
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 300))
  }
}

// Instructions détaillées pour l'utilisateur
function showDetailedInstructions() {
  console.log('\n' + '='.repeat(70))
  console.log('           INSTRUCTIONS POUR DÉSACTIVER LA VALIDATION EMAIL')
  console.log('='.repeat(70))
  
  console.log('\n📋 ÉTAPES DANS LE DASHBOARD SUPABASE:')
  console.log('\n1. 🌐 Ouvrez votre navigateur et allez à:')
  console.log('   👉 https://supabase.com/dashboard/project/dqoncbnvyviurirsdtyu')
  
  console.log('\n2. 🔐 Connectez-vous à votre compte Supabase')
  
  console.log('\n3. 📱 Dans le menu de gauche, cliquez sur:')
  console.log('   👉 "Authentication" (icône de cadenas)')
  
  console.log('\n4. ⚙️  Cliquez ensuite sur:')
  console.log('   👉 "Settings" (dans le sous-menu Authentication)')
  
  console.log('\n5. 📧 Cherchez une de ces sections:')
  console.log('   • "Email Auth Settings"')
  console.log('   • "Auth Providers" > "Email"')
  console.log('   • "Email validation"')
  console.log('   • "Domain restrictions"')
  
  console.log('\n6. 🔧 Cherchez et modifiez ces options:')
  console.log('   ✅ ACTIVEZ: "Allow all email domains"')
  console.log('   ✅ ACTIVEZ: "Disable email validation"')
  console.log('   ❌ DÉSACTIVEZ: "Email domain restrictions"')
  console.log('   ❌ DÉSACTIVEZ: "Validate email domains"')
  
  console.log('\n7. 💾 Cliquez sur "Save" ou "Update"')
  
  console.log('\n8. ⏱️  Attendez 1-2 minutes pour la prise en effet')
  
  console.log('\n🔄 ALTERNATIVE - Configuration par SQL:')
  console.log('\n   Si les options ne sont pas visibles dans l\'interface:')
  console.log('   1. Allez dans "SQL Editor"')
  console.log('   2. Exécutez cette requête:')
  console.log('   ')
  console.log('   -- Désactiver la validation stricte d\'email')
  console.log('   UPDATE auth.config')
  console.log('   SET email_validation = false')
  console.log('   WHERE parameter = \'email_validation\';')
  
  console.log('\n📱 APRÈS LA MODIFICATION:')
  console.log('   • Testez à nouveau l\'inscription avec un email @gmail.com')
  console.log('   • Utilisez ce script pour vérifier: node check-email-validation.js')
  
  console.log('\n⚠️  NOTES IMPORTANTES:')
  console.log('   • Cette modification affecte tout votre projet Supabase')
  console.log('   • Les emails factices seront acceptés (test@test.com)')
  console.log('   • La confirmation par email reste nécessaire')
  
  console.log('\n' + '='.repeat(70))
}

// Test après modification
async function testAfterChanges() {
  console.log('\n🧪 TEST APRÈS MODIFICATIONS:')
  console.log('\nPour vérifier que la modification a fonctionné,')
  console.log('relancez ce script avec: node check-email-validation.js')
  console.log('\nSi @gmail.com est accepté, la modification a réussi!')
}

// Fonction principale
async function main() {
  console.log('🔍 DIAGNOSTIC DE LA VALIDATION EMAIL SUPABASE\n')
  
  await checkCurrentEmailValidation()
  showDetailedInstructions()
  await testAfterChanges()
}

main().catch(console.error)
>>>>>>> master
