<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function quickEmailCheck() {
  console.log('🔍 Vérification rapide des emails acceptés...\n')
  
  const emails = ['test@gmail.com', 'user@yahoo.com', 'admin@outlook.com', 'contact@hotmail.com']
  
  for (const email of emails) {
    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: 'Test123!',
        options: { data: { test: true } }
      })
      
      if (error) {
        if (error.message.includes('invalid')) {
          console.log(`❌ ${email} - REJETÉ`)
        } else if (error.message.includes('already registered')) {
          console.log(`✅ ${email} - ACCEPTÉ`)
        } else {
          console.log(`⚠️  ${email} - ${error.message}`)
        }
      } else {
        console.log(`✅ ${email} - ACCEPTÉ`)
      }
    } catch (err) {
      console.log(`❌ ${email} - ${err.message}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('\n📝 Utilisez les domaines marqués ✅ pour vos tests')
}

quickEmailCheck().catch(console.error)
=======
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function quickEmailCheck() {
  console.log('🔍 Vérification rapide des emails acceptés...\n')
  
  const emails = ['test@gmail.com', 'user@yahoo.com', 'admin@outlook.com', 'contact@hotmail.com']
  
  for (const email of emails) {
    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: 'Test123!',
        options: { data: { test: true } }
      })
      
      if (error) {
        if (error.message.includes('invalid')) {
          console.log(`❌ ${email} - REJETÉ`)
        } else if (error.message.includes('already registered')) {
          console.log(`✅ ${email} - ACCEPTÉ`)
        } else {
          console.log(`⚠️  ${email} - ${error.message}`)
        }
      } else {
        console.log(`✅ ${email} - ACCEPTÉ`)
      }
    } catch (err) {
      console.log(`❌ ${email} - ${err.message}`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log('\n📝 Utilisez les domaines marqués ✅ pour vos tests')
}

quickEmailCheck().catch(console.error)
>>>>>>> master
