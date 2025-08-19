// Test pour vérifier la récupération des conducteurs depuis agency_employee_invitations
// À supprimer après test

import { supabase } from './src/lib/supabase.js';

async function testDriversFetch() {
  try {
    console.log('🔍 Test de récupération des conducteurs...');
    
    // 1. Vérifier l'utilisateur connecté
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ Aucun utilisateur connecté');
      return;
    }
    console.log('✅ Utilisateur connecté:', user.email);

    // 2. Récupérer l'agence de l'utilisateur
    const { data: agencies, error: agencyError } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('user_id', user.id);

    if (agencyError) {
      console.error('❌ Erreur agence:', agencyError);
      return;
    }
    console.log('✅ Agences trouvées:', agencies);

    if (agencies.length === 0) {
      console.log('⚠️ Aucune agence trouvée pour cet utilisateur');
      return;
    }

    const agencyId = agencies[0].id;

    // 3. Récupérer les conducteurs
    const { data: drivers, error: driversError } = await supabase
      .from('agency_employee_invitations')
      .select('id, first_name, last_name, phone, employee_role, status, email')
      .eq('agency_id', agencyId)
      .eq('status', 'accepted')
      .in('employee_role', ['driver', 'conducteur', 'chauffeur']);

    if (driversError) {
      console.error('❌ Erreur conducteurs:', driversError);
      return;
    }

    console.log('✅ Conducteurs trouvés:', drivers);
    console.log(`📊 Total: ${drivers.length} conducteur(s)`);

    // 4. Formatter pour affichage
    const formattedDrivers = drivers.map(driver => ({
      id: driver.id,
      name: `${driver.first_name} ${driver.last_name}`,
      phone: driver.phone || 'Non renseigné',
      email: driver.email,
      role: driver.employee_role
    }));

    console.log('✅ Conducteurs formatés:', formattedDrivers);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exporter la fonction pour usage dans la console
window.testDriversFetch = testDriversFetch;

console.log('🧪 Fonction de test ajoutée. Utilisez testDriversFetch() dans la console.');
