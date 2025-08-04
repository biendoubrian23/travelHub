// Script de test pour le processus d'invitation final
import { supabase } from './src/lib/supabase.js';

async function testFinalInvitationProcess() {
  console.log('🧪 Test du processus d\'invitation FINAL');
  console.log('=====================================');

  try {
    // 1. Vérifier qu'il y a des invitations en attente
    console.log('\n1️⃣ Recherche d\'invitations en attente...');
    const { data: pendingInvitations, error: invError } = await supabase
      .from('agency_employee_invitations')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .limit(3);

    if (invError) {
      console.error('❌ Erreur:', invError.message);
      return;
    }

    console.log(`✅ ${pendingInvitations?.length || 0} invitation(s) en attente`);
    
    if (!pendingInvitations || pendingInvitations.length === 0) {
      console.log('⚠️ Aucune invitation en attente. Créez une invitation d\'abord.');
      return;
    }

    const testInvitation = pendingInvitations[0];
    console.log('📧 Test avec:', {
      email: testInvitation.email,
      role: testInvitation.employee_role,
      expires: new Date(testInvitation.expires_at).toLocaleString()
    });

    // 2. Instructions pour le test manuel
    console.log('\n2️⃣ INSTRUCTIONS DE TEST:');
    console.log('═'.repeat(50));
    console.log('🔗 Lien d\'invitation à utiliser:');
    console.log(`   ${window?.location?.origin || 'http://localhost:5173'}/invitation?token=${testInvitation.invitation_token}`);
    console.log('\n📋 Processus attendu:');
    console.log('   1. Ouvrir le lien ci-dessus');
    console.log('   2. Saisir un mot de passe (ex: Password123!)');
    console.log('   3. Cliquer sur "Créer mon compte"');
    console.log('\n✅ Vérifications à faire:');
    console.log('   - Invitation status → "accepted"');
    console.log('   - Utilisateur créé dans auth.users');
    console.log('   - Profil créé dans public.users avec bon rôle');
    console.log('   - Employé créé dans agency_employees');
    console.log('   - Interface admin mise à jour');

    // 3. Fonction pour vérifier après test
    console.log('\n3️⃣ Après le test, exécutez:');
    console.log('   checkInvitationResult("' + testInvitation.invitation_token + '")');

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

// Fonction pour vérifier le résultat après test manuel
async function checkInvitationResult(token) {
  console.log('\n🔍 Vérification du résultat...');
  console.log('==============================');

  try {
    // 1. Vérifier le statut de l'invitation
    const { data: invitation, error: invError } = await supabase
      .from('agency_employee_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (invError) {
      console.error('❌ Invitation non trouvée:', invError.message);
      return;
    }

    console.log('📧 Invitation:', {
      email: invitation.email,
      status: invitation.status,
      accepted_at: invitation.accepted_at,
      user_id: invitation.user_id
    });

    if (invitation.status !== 'accepted') {
      console.log('⚠️ Invitation pas encore acceptée');
      return;
    }

    // 2. Vérifier l'utilisateur créé
    if (invitation.user_id) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', invitation.user_id)
        .single();

      if (userError) {
        console.error('❌ Utilisateur non trouvé:', userError.message);
      } else {
        console.log('✅ Utilisateur créé:', {
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.created_at
        });

        // Vérifier que le rôle est correct
        const expectedRole = getRoleMapping(invitation.employee_role);
        if (user.role === expectedRole) {
          console.log('✅ Rôle correct:', expectedRole);
        } else {
          console.error('❌ Rôle incorrect:', {
            attendu: expectedRole,
            obtenu: user.role
          });
        }
      }

      // 3. Vérifier l'employé créé
      const { data: employee, error: empError } = await supabase
        .from('agency_employees')
        .select('*')
        .eq('user_id', invitation.user_id)
        .single();

      if (empError) {
        console.error('❌ Employé non trouvé:', empError.message);
      } else {
        console.log('✅ Employé créé:', {
          agency_id: employee.agency_id,
          employee_role: employee.employee_role,
          name: `${employee.first_name} ${employee.last_name}`,
          hire_date: employee.hire_date
        });
      }
    }

    console.log('\n🎉 Processus terminé avec succès!');

  } catch (error) {
    console.error('💥 Erreur vérification:', error);
  }
}

function getRoleMapping(employeeRole) {
  const mapping = {
    'admin': 'agency_admin',
    'manager': 'agency_manager',
    'employee': 'agency_employee',
    'driver': 'agency_driver'
  };
  return mapping[employeeRole] || 'agency_employee';
}

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.testFinalInvitationProcess = testFinalInvitationProcess;
  window.checkInvitationResult = checkInvitationResult;
}

// Auto-exécution
testFinalInvitationProcess();
