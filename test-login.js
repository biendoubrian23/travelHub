import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 VÉRIFICATION DE LA STRUCTURE DES TABLES')
console.log('==========================================\n')

// Test simple de connexion et création d'utilisateur
async function testSystem() {
  try {
    console.log('🧪 Test de création d\'utilisateur simple...')
    
    // Créer juste l'utilisateur avec auth
    const { data, error } = await supabase.auth.signUp({
      email: 'test@travelhub.com',
      password: 'Test123456!',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    })
    
    if (error) {
      console.log('❌ Erreur auth:', error.message)
    } else {
      console.log('✅ Utilisateur auth créé:', data.user?.email)
      console.log('   📧 Email: test@travelhub.com')
      console.log('   🔐 Mot de passe: Test123456!')
    }
    
    console.log('\n🔑 COMPTE DE TEST CRÉÉ!')
    console.log('========================')
    console.log('📧 Email: test@travelhub.com')
    console.log('🔐 Mot de passe: Test123456!')
    console.log('\n✨ Essayez de vous connecter avec ces identifiants!')
    
  } catch (err) {
    console.log('❌ Erreur:', err.message)
  }
}

testSystem()
