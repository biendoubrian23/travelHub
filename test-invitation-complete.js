import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co'; // Remplacez par votre URL
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Remplacez par votre clé service

// Client avec clé service pour les tests
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInvitationFlow() {
  console.log('🧪 Test complet du flow d\'invitation');
  
  try {
    // 1. Créer une invitation de test
    console.log('\n1. Création d\'une invitation de test...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: invitation, error: inviteError } = await supabase
      .from('agency_employee_invitations')
      .insert({
        email: testEmail,
        first_name: 'Test',
        last_name: 'Employee',
        employee_role: 'employee',
        agency_id: 1, // Remplacez par un ID d'agence valide
        invitation_token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      })
      .select()
      .single();
    
    if (inviteError) {
      console.error('❌ Erreur création invitation:', inviteError);
      return;
    }
    
    console.log('✅ Invitation créée:', invitation);
    
    // 2. Simuler l'inscription de l'utilisateur
    console.log('\n2. Simulation inscription utilisateur...');
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          invitation_token: invitation.invitation_token
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Erreur inscription:', signUpError);
      return;
    }
    
    console.log('✅ Utilisateur créé dans auth:', authUser.user?.id);
    
    // 3. Attendre un peu pour que le trigger s'exécute
    console.log('\n3. Attente exécution du trigger...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 4. Vérifier le statut de l'invitation
    console.log('\n4. Vérification statut invitation...');
    const { data: updatedInvitation } = await supabase
      .from('agency_employee_invitations')
      .select('*')
      .eq('id', invitation.id)
      .single();
    
    console.log('📋 Statut invitation:', updatedInvitation?.status);
    
    // 5. Vérifier la création dans public.users
    console.log('\n5. Vérification table public.users...');
    const { data: publicUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    console.log('👤 Utilisateur public:', publicUser);
    
    // 6. Vérifier la création dans agency_employees
    console.log('\n6. Vérification table agency_employees...');
    const { data: employee } = await supabase
      .from('agency_employees')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    console.log('👨‍💼 Employé:', employee);
    
    // 7. Résumé des résultats
    console.log('\n📊 RÉSUMÉ DU TEST:');
    console.log('✅ Invitation créée:', !!invitation);
    console.log('✅ Utilisateur auth créé:', !!authUser.user);
    console.log('✅ Invitation acceptée:', updatedInvitation?.status === 'accepted');
    console.log('✅ Utilisateur public créé:', !!publicUser);
    console.log('✅ Rôle correct:', publicUser?.role === 'agency_employee');
    console.log('✅ Employé créé:', !!employee);
    
    if (updatedInvitation?.status === 'accepted' && 
        publicUser?.role === 'agency_employee' && 
        employee) {
      console.log('\n🎉 TEST RÉUSSI - Le flow d\'invitation fonctionne !');
    } else {
      console.log('\n❌ TEST ÉCHOUÉ - Vérifiez les logs du trigger');
    }
    
    // 8. Nettoyage (optionnel)
    console.log('\n8. Nettoyage...');
    await supabase.from('agency_employees').delete().eq('email', testEmail);
    await supabase.from('users').delete().eq('email', testEmail);
    await supabase.from('agency_employee_invitations').delete().eq('id', invitation.id);
    console.log('✅ Données de test supprimées');
    
  } catch (error) {
    console.error('❌ Erreur globale du test:', error);
  }
}

// Exécuter le test
testInvitationFlow();
