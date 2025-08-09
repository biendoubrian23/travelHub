// Super Admin Setup - Script d'initialisation pour Brian Djayou
// Script pour créer le Super Admin et configurer le système

import { createClient } from '@supabase/supabase-js'

// Configuration Supabase - Vraies clés du projet
const supabaseUrl = 'https://dqoncbnvyviurirsdtyu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE3Nzg0MSwiZXhwIjoyMDY5NzUzODQxfQ.CsosOLPlbl0qWmf2ffuFxtvRrGTSUVf3E15xPneI1Qs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBrianSuperAdmin() {
    console.log('👑 CRÉATION DU SUPER ADMIN - BRIAN DJAYOU')
    console.log('==========================================\n')
    
    try {
        // 1. Vérifier si l'utilisateur existe déjà
        console.log('1. Vérification de l\'existence du compte...')
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'djayoubrian@gmail.com')
            .single()
        
        if (existingUser) {
            console.log('📧 Utilisateur trouvé:', existingUser.email)
            console.log('🔄 Mise à jour du rôle vers super_admin...')
            
            // Mettre à jour le rôle
            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update({
                    role: 'super_admin',
                    full_name: 'Brian Djayou',
                    is_active: true,
                    updated_at: new Date().toISOString()
                })
                .eq('email', 'djayoubrian@gmail.com')
                .select()
                .single()
                
            if (updateError) {
                console.error('❌ Erreur lors de la mise à jour:', updateError)
                return false
            }
            
            console.log('✅ Super Admin mis à jour!')
            console.log('📧 Email:', updatedUser.email)
            console.log('👤 Nom:', updatedUser.full_name)
            console.log('🔑 Rôle:', updatedUser.role)
            console.log('🆔 ID:', updatedUser.id)
            
        } else {
            console.log('2. Création du nouveau Super Admin...')
            
            // Créer le super admin
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{
                    email: 'djayoubrian@gmail.com',
                    role: 'super_admin',
                    full_name: 'Brian Djayou',
                    phone: '+237123456789',
                    is_active: true,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single()
                
            if (createError) {
                console.error('❌ Erreur lors de la création:', createError)
                return false
            }
            
            console.log('✅ Super Admin créé avec succès!')
            console.log('📧 Email:', newUser.email)
            console.log('👤 Nom:', newUser.full_name)
            console.log('🔑 Rôle:', newUser.role)
            console.log('🆔 ID:', newUser.id)
        }
        
        // 3. Vérifier les permissions
        console.log('\n3. Vérification des permissions...')
        const { data: finalUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'djayoubrian@gmail.com')
            .single()
            
        if (finalUser && finalUser.role === 'super_admin') {
            console.log('✅ Permissions Super Admin confirmées!')
        } else {
            console.warn('⚠️ Problème avec les permissions')
        }
        
        console.log('\n🎉 CONFIGURATION TERMINÉE!')
        console.log('=============================')
        console.log('✅ Brian Djayou est maintenant Super Admin')
        console.log('✅ Email: djayoubrian@gmail.com')
        console.log('✅ Rôle: super_admin')
        console.log('✅ Statut: Actif\n')
        
        console.log('🚀 Prochaines étapes:')
        console.log('   1. Interface de création d\'agences')
        console.log('   2. Système d\'invitation des admins')
        console.log('   3. Génération automatique des emails\n')
        
        return true
        
    } catch (error) {
        console.error('💥 Erreur générale:', error)
        return false
    }
}

// Fonction pour tester la connexion
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1)
            
        if (error) {
            console.error('❌ Problème de connexion Supabase:', error)
            return false
        }
        
        console.log('✅ Connexion Supabase OK')
        return true
    } catch (error) {
        console.error('❌ Erreur de connexion:', error)
        return false
    }
}

// Exécution du script
async function main() {
    console.log('🔌 Test de connexion Supabase...')
    const connected = await testConnection()
    
    if (!connected) {
        console.error('❌ Impossible de se connecter à Supabase')
        return
    }
    
    const success = await createBrianSuperAdmin()
    
    if (success) {
        console.log('🎯 Script exécuté avec succès!')
    } else {
        console.error('❌ Échec du script')
    }
}

// Lancer le script
main()
