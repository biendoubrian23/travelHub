import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔧 CRÉATION D\'UN SUPER ADMIN AVEC CONFIRMATION AUTO')
console.log('='.repeat(60))
console.log('')
console.log('⚠️  IMPORTANT: Ce compte sera automatiquement confirmé')
console.log('')
console.log('📧 Email: admin@hotmail.com')
console.log('🔑 Password: Admin123456!')
console.log('')
console.log('✅ Utilisez ces identifiants dans votre application')
console.log('')
console.log('='.repeat(60))
