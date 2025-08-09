// Script pour créer l'authentification du Super Admin
import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec la clé service pour créer des comptes
const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE3Nzg0MSwiZXhwIjoyMDY5NzUzODQxfQ.CsosOLPlbl0qWmf2ffuFxtvRrGTSUVf3E15xPneI1Qs'

// Client admin pour créer des comptes d'authentification
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const SUPER_ADMIN_CREDENTIALS = {
    email: 'djayoubrian@gmail.com',
    password: 'SuperAdmin2024@Brian!',
    fullName: 'Brian Djayou'
}

async function createSuperAdminAuth() {
    console.log('🔐 CRÉATION DE L\'AUTHENTIFICATION SUPER ADMIN')
    console.log('===============================================\n')
    
    try {
        // 1. Vérifier si l'utilisateur existe déjà dans auth.users
        console.log('1. Vérification de l\'existence dans auth.users...')
        
        const { data: existingAuthUser, error: checkAuthError } = await supabaseAdmin.auth.admin.getUserByEmail(SUPER_ADMIN_CREDENTIALS.email)
        
        if (existingAuthUser && existingAuthUser.user) {
            console.log('✅ Utilisateur existe déjà dans auth.users')
            console.log('📧 Auth ID:', existingAuthUser.user.id)
            
            // Vérifier et mettre à jour la table users si nécessaire
            const { data: userProfile, error: profileError } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', SUPER_ADMIN_CREDENTIALS.email)
                .single()
                
            if (userProfile) {
                // Mettre à jour l'ID auth dans la table users si différent
                if (userProfile.id !== existingAuthUser.user.id) {
                    console.log('🔄 Mise à jour de l\'ID auth dans la table users...')
                    
                    const { error: updateError } = await supabaseAdmin
                        .from('users')
                        .update({ 
                            id: existingAuthUser.user.id,
                            role: 'super_admin'
                        })
                        .eq('email', SUPER_ADMIN_CREDENTIALS.email)
                        
                    if (updateError) {
                        console.error('❌ Erreur lors de la mise à jour:', updateError)
                    } else {
                        console.log('✅ ID auth synchronisé')
                    }
                }
            }
            
        } else {
            console.log('2. Création du compte d\'authentification...')
            
            // Créer le compte d'authentification
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: SUPER_ADMIN_CREDENTIALS.email,
                password: SUPER_ADMIN_CREDENTIALS.password,
                email_confirm: true,
                user_metadata: {
                    full_name: SUPER_ADMIN_CREDENTIALS.fullName,
                    role: 'super_admin'
                }
            })
            
            if (authError) {
                console.error('❌ Erreur lors de la création auth:', authError)
                return false
            }
            
            console.log('✅ Compte auth créé!')
            console.log('🆔 Auth ID:', authData.user.id)
            console.log('📧 Email:', authData.user.email)
            
            // 3. Mettre à jour ou créer l'entrée dans la table users
            console.log('3. Mise à jour de la table users...')
            
            const { data: existingUser, error: checkUserError } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', SUPER_ADMIN_CREDENTIALS.email)
                .single()
                
            if (existingUser) {
                // Mettre à jour l'utilisateur existant avec le bon ID auth
                const { error: updateUserError } = await supabaseAdmin
                    .from('users')
                    .update({
                        id: authData.user.id,
                        role: 'super_admin',
                        full_name: SUPER_ADMIN_CREDENTIALS.fullName,
                        is_active: true
                    })
                    .eq('email', SUPER_ADMIN_CREDENTIALS.email)
                    
                if (updateUserError) {
                    console.error('❌ Erreur lors de la mise à jour user:', updateUserError)
                } else {
                    console.log('✅ Utilisateur mis à jour dans la table users')
                }
            } else {
                // Créer un nouvel utilisateur
                const { error: createUserError } = await supabaseAdmin
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        email: SUPER_ADMIN_CREDENTIALS.email,
                        role: 'super_admin',
                        full_name: SUPER_ADMIN_CREDENTIALS.fullName,
                        phone: '+237123456789',
                        is_active: true
                    }])
                    
                if (createUserError) {
                    console.error('❌ Erreur lors de la création user:', createUserError)
                } else {
                    console.log('✅ Nouvel utilisateur créé dans la table users')
                }
            }
        }
        
        // 4. Vérification finale
        console.log('\n4. Vérification finale...')
        
        const { data: finalAuthUser } = await supabaseAdmin.auth.admin.getUserByEmail(SUPER_ADMIN_CREDENTIALS.email)
        const { data: finalUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', SUPER_ADMIN_CREDENTIALS.email)
            .single()
            
        if (finalAuthUser && finalAuthUser.user && finalUser && finalUser.role === 'super_admin') {
            console.log('🎉 CONFIGURATION TERMINÉE AVEC SUCCÈS!')
            console.log('========================================')
            console.log('✅ Authentification créée')
            console.log('✅ Profil utilisateur configuré')
            console.log('✅ Rôle Super Admin assigné')
            console.log('\n📋 Informations de connexion:')
            console.log('📧 Email:', SUPER_ADMIN_CREDENTIALS.email)
            console.log('🔑 Mot de passe:', SUPER_ADMIN_CREDENTIALS.password)
            console.log('👤 Nom:', finalUser.full_name)
            console.log('🆔 Auth ID:', finalAuthUser.user.id)
            console.log('🆔 User ID:', finalUser.id)
            
            if (finalAuthUser.user.id === finalUser.id) {
                console.log('✅ IDs synchronisés correctement')
            } else {
                console.log('⚠️ IDs différents - vérification nécessaire')
            }
            
            return true
        } else {
            console.log('❌ Problème dans la configuration finale')
            return false
        }
        
    } catch (error) {
        console.error('💥 Erreur générale:', error)
        return false
    }
}

// Fonction pour tester la connexion
async function testSuperAdminLogin() {
    console.log('\n🧪 TEST DE CONNEXION SUPER ADMIN')
    console.log('=================================')
    
    try {
        const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
            email: SUPER_ADMIN_CREDENTIALS.email,
            password: SUPER_ADMIN_CREDENTIALS.password
        })
        
        if (loginError) {
            console.log('❌ Échec de la connexion:', loginError.message)
            return false
        }
        
        console.log('✅ Connexion réussie!')
        console.log('🆔 User ID:', loginData.user.id)
        console.log('📧 Email:', loginData.user.email)
        
        // Déconnexion immédiate
        await supabaseAdmin.auth.signOut()
        console.log('✅ Test terminé avec succès')
        
        return true
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error)
        return false
    }
}

// Exécution du script
async function main() {
    const success = await createSuperAdminAuth()
    
    if (success) {
        console.log('\n🔍 Test de la connexion...')
        await testSuperAdminLogin()
    }
    
    console.log('\n🏁 Script terminé')
}

main()
