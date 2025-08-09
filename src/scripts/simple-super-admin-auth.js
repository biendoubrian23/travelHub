// Script simplifié pour créer l'authentification Super Admin
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const SUPER_ADMIN_CREDENTIALS = {
    email: 'djayoubrian@gmail.com',
    password: 'SuperAdmin2024@Brian!',
    fullName: 'Brian Djayou'
}

async function createSuperAdminAuthSimple() {
    console.log('🔐 CRÉATION DE L\'AUTHENTIFICATION SUPER ADMIN')
    console.log('===============================================\n')
    
    try {
        // 1. Essayer de créer le compte d'authentification
        console.log('1. Création du compte d\'authentification...')
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: SUPER_ADMIN_CREDENTIALS.email,
            password: SUPER_ADMIN_CREDENTIALS.password,
            options: {
                data: {
                    full_name: SUPER_ADMIN_CREDENTIALS.fullName,
                    role: 'super_admin'
                }
            }
        })
        
        if (signUpError) {
            if (signUpError.message.includes('already registered')) {
                console.log('✅ Compte auth existe déjà')
                
                // Essayer de se connecter pour vérifier
                console.log('2. Test de connexion...')
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: SUPER_ADMIN_CREDENTIALS.email,
                    password: SUPER_ADMIN_CREDENTIALS.password
                })
                
                if (loginError) {
                    console.log('❌ Échec de la connexion:', loginError.message)
                    console.log('💡 Le compte existe mais le mot de passe est peut-être différent')
                    return false
                } else {
                    console.log('✅ Connexion réussie!')
                    console.log('🆔 Auth ID:', loginData.user.id)
                    
                    // Mettre à jour la table users avec le bon ID
                    console.log('3. Synchronisation avec la table users...')
                    
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({
                            id: loginData.user.id,
                            role: 'super_admin',
                            full_name: SUPER_ADMIN_CREDENTIALS.fullName,
                            is_active: true
                        })
                        .eq('email', SUPER_ADMIN_CREDENTIALS.email)
                    
                    if (updateError) {
                        console.log('❌ Erreur lors de la mise à jour:', updateError)
                    } else {
                        console.log('✅ Table users synchronisée')
                    }
                    
                    // Déconnexion
                    await supabase.auth.signOut()
                    return true
                }
            } else {
                console.error('❌ Erreur lors de la création:', signUpError)
                return false
            }
        } else {
            console.log('✅ Nouveau compte auth créé!')
            console.log('🆔 Auth ID:', signUpData.user.id)
            console.log('📧 Email:', signUpData.user.email)
            
            // Mettre à jour la table users
            console.log('2. Mise à jour de la table users...')
            
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    id: signUpData.user.id,
                    role: 'super_admin',
                    full_name: SUPER_ADMIN_CREDENTIALS.fullName,
                    is_active: true
                })
                .eq('email', SUPER_ADMIN_CREDENTIALS.email)
            
            if (updateError) {
                console.log('❌ Erreur lors de la mise à jour:', updateError)
            } else {
                console.log('✅ Table users mise à jour')
            }
            
            return true
        }
        
    } catch (error) {
        console.error('💥 Erreur générale:', error)
        return false
    }
}

async function main() {
    const success = await createSuperAdminAuthSimple()
    
    if (success) {
        console.log('\n🎉 CONFIGURATION TERMINÉE!')
        console.log('===========================')
        console.log('✅ Authentification configurée')
        console.log('✅ Super Admin prêt')
        console.log('\n📋 Informations de connexion:')
        console.log('📧 Email:', SUPER_ADMIN_CREDENTIALS.email)
        console.log('🔑 Mot de passe:', SUPER_ADMIN_CREDENTIALS.password)
        console.log('\n🚀 Vous pouvez maintenant vous connecter!')
    } else {
        console.log('\n❌ Échec de la configuration')
    }
}

main()
