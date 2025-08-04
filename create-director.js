<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 CRÉATION SIMPLE D\'UN DIRIGEANT')
console.log('=================================\n')

async function createSimpleDirector() {
  try {
    // Créer juste un compte avec le bon rôle
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'patron@agence.com',
      password: 'Patron123!',
      options: {
        data: {
          full_name: 'Patron Agence',
          role: 'agence'
        }
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.log('❌ Erreur auth:', authError.message)
      return false
    }
    
    const userId = authData.user?.id
    console.log('✅ Compte créé:', userId)
    
    // Créer le profil avec le rôle 'agence'
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'patron@agence.com',
        full_name: 'Patron Agence',
        role: 'agence',
        is_active: true
      })
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil créé avec rôle "agence"')
    
    // Créer une agence simple
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        user_id: userId,
        name: 'Agence Transport Plus',
        email: 'patron@agence.com',
        phone: '+237691234567',
        address: 'Yaoundé, Centre, Cameroun',
        is_verified: true
      })
      .select()
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur agence:', agencyError.message)
      
      // Essayer sans is_verified si la colonne n'existe pas
      const { data: agencyData2, error: agencyError2 } = await supabase
        .from('agencies')
        .insert({
          user_id: userId,
          name: 'Agence Transport Plus',
          email: 'patron@agence.com',
          phone: '+237691234567',
          address: 'Yaoundé, Centre, Cameroun'
        })
        .select()
        .single()
      
      if (agencyError2) {
        console.log('❌ Erreur agence 2:', agencyError2.message)
        return false
      }
      
      console.log('✅ Agence créée (version simple)')
    } else {
      console.log('✅ Agence créée avec vérification')
    }
    
    console.log('\n🎉 DIRIGEANT CRÉÉ!')
    console.log('==================')
    console.log('📧 Email: patron@agence.com')
    console.log('🔐 Mot de passe: Patron123!')
    console.log('👤 Rôle: agence')
    console.log('🏢 Peut gérer les employés: OUI')
    console.log('\n✨ Connectez-vous avec ces identifiants!')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
    return false
  }
}

createSimpleDirector()
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 CRÉATION SIMPLE D\'UN DIRIGEANT')
console.log('=================================\n')

async function createSimpleDirector() {
  try {
    // Créer juste un compte avec le bon rôle
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'patron@agence.com',
      password: 'Patron123!',
      options: {
        data: {
          full_name: 'Patron Agence',
          role: 'agence'
        }
      }
    })
    
    if (authError && !authError.message.includes('already registered')) {
      console.log('❌ Erreur auth:', authError.message)
      return false
    }
    
    const userId = authData.user?.id
    console.log('✅ Compte créé:', userId)
    
    // Créer le profil avec le rôle 'agence'
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'patron@agence.com',
        full_name: 'Patron Agence',
        role: 'agence',
        is_active: true
      })
    
    if (profileError) {
      console.log('❌ Erreur profil:', profileError.message)
      return false
    }
    
    console.log('✅ Profil créé avec rôle "agence"')
    
    // Créer une agence simple
    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        user_id: userId,
        name: 'Agence Transport Plus',
        email: 'patron@agence.com',
        phone: '+237691234567',
        address: 'Yaoundé, Centre, Cameroun',
        is_verified: true
      })
      .select()
      .single()
    
    if (agencyError) {
      console.log('❌ Erreur agence:', agencyError.message)
      
      // Essayer sans is_verified si la colonne n'existe pas
      const { data: agencyData2, error: agencyError2 } = await supabase
        .from('agencies')
        .insert({
          user_id: userId,
          name: 'Agence Transport Plus',
          email: 'patron@agence.com',
          phone: '+237691234567',
          address: 'Yaoundé, Centre, Cameroun'
        })
        .select()
        .single()
      
      if (agencyError2) {
        console.log('❌ Erreur agence 2:', agencyError2.message)
        return false
      }
      
      console.log('✅ Agence créée (version simple)')
    } else {
      console.log('✅ Agence créée avec vérification')
    }
    
    console.log('\n🎉 DIRIGEANT CRÉÉ!')
    console.log('==================')
    console.log('📧 Email: patron@agence.com')
    console.log('🔐 Mot de passe: Patron123!')
    console.log('👤 Rôle: agence')
    console.log('🏢 Peut gérer les employés: OUI')
    console.log('\n✨ Connectez-vous avec ces identifiants!')
    
    return true
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
    return false
  }
}

createSimpleDirector()
>>>>>>> master
