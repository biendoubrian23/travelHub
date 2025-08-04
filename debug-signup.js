import { supabase } from './src/lib/supabase.js';

// Script de diagnostic pour tester signUp
async function debugSignUp() {
  console.log('🔍 Diagnostic SignUp Supabase');
  console.log('===============================');

  // 1. Test de connexion basique
  try {
    console.log('1️⃣ Test de connexion Supabase...');
    const { data, error } = await supabase.from('agencies').select('count').limit(1);
    if (error) {
      console.error('❌ Connexion DB échouée:', error.message);
      return;
    }
    console.log('✅ Connexion DB OK');
  } catch (err) {
    console.error('💥 Erreur de connexion:', err);
    return;
  }

  // 2. Test d'une invitation existante
  try {
    console.log('\n2️⃣ Recherche d\'invitations en attente...');
    const { data: invitations, error } = await supabase
      .from('agency_employee_invitations')
      .select('*')
      .eq('status', 'pending')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur lecture invitations:', error.message);
      return;
    }
    
    if (!invitations || invitations.length === 0) {
      console.log('⚠️ Aucune invitation en attente trouvée');
      return;
    }
    
    const invitation = invitations[0];
    console.log('✅ Invitation trouvée:', {
      email: invitation.email,
      agency_id: invitation.agency_id,
      token: invitation.invitation_token
    });

    // 3. Test SignUp avec données réelles
    console.log('\n3️⃣ Test SignUp...');
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `test-${Date.now()}@example.com`, // Email unique pour éviter conflits
      password: testPassword,
      options: {
        data: {
          full_name: `${invitation.first_name} ${invitation.last_name}`,
          phone: invitation.phone,
          agency_id: invitation.agency_id,
          employee_role: invitation.employee_role,
          invitation_token: invitation.invitation_token
        }
      }
    });

    if (authError) {
      console.error('❌ Erreur SignUp:', {
        status: authError.status,
        message: authError.message,
        details: authError
      });
    } else {
      console.log('✅ SignUp réussi:', authData.user?.id);
      
      // Nettoyer le test
      if (authData.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('🧹 Utilisateur test supprimé');
      }
    }

  } catch (err) {
    console.error('💥 Erreur générale:', err);
  }

  // 4. Vérifier les triggers
  console.log('\n4️⃣ Vérification des triggers...');
  try {
    const { data, error } = await supabase
      .rpc('check_trigger_exists', { trigger_name: 'on_auth_user_created_invitation' });
    
    if (error) {
      console.log('⚠️ Impossible de vérifier les triggers (fonction non trouvée)');
    } else {
      console.log('✅ Trigger vérifié');
    }
  } catch (err) {
    console.log('⚠️ Vérification trigger ignorée');
  }
}

// Exécuter le diagnostic
debugSignUp().then(() => {
  console.log('\n✨ Diagnostic terminé');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
