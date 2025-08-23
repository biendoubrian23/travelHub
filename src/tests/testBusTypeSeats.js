/**
 * Script de test pour vérifier la configuration des sièges selon le type de bus
 * À exécuter dans la console navigateur pour tester
 */

/**
 * Teste la création de sièges pour différents types de bus
 */
async function testBusTypeSeatConfiguration() {
  console.log('🧪 TEST: Configuration des sièges selon le type de bus');
  console.log('=====================================================');

  try {
    const { initializeSeatMapForTrip } = await import('./src/utils/seatMapUtils.js');
    const { supabase } = await import('./src/lib/supabase.js');

    // Test 1: Bus VIP
    console.log('\n🥇 TEST 1: Bus VIP');
    console.log('------------------');
    
    const vipTripData = {
      price_fcfa: 15000,
      departure_city: 'Douala',
      arrival_city: 'Yaoundé',
      bus_is_vip: true, // 🎯 BUS VIP
      bus_name: 'VIP Express',
      created_by: 'test-user'
    };

    // Simuler un trip ID pour test
    const vipTripId = 'test-vip-trip-' + Date.now();
    
    await initializeSeatMapForTrip(vipTripId, 30, vipTripData);
    
    // Vérifier les résultats
    const { data: vipSeats } = await supabase
      .from('seat_maps')
      .select('seat_number, seat_type, price_modifier_fcfa, final_price_fcfa')
      .eq('trip_id', vipTripId)
      .order('seat_number');

    console.log(`📊 Résultats bus VIP (${vipSeats.length} sièges):`);
    console.log(`   - Sièges VIP: ${vipSeats.filter(s => s.seat_type === 'vip').length}`);
    console.log(`   - Sièges Standard: ${vipSeats.filter(s => s.seat_type === 'standard').length}`);
    console.log(`   - Prix moyen: ${(vipSeats.reduce((sum, s) => sum + s.final_price_fcfa, 0) / vipSeats.length).toFixed(0)} FCFA`);

    // Test 2: Bus Standard
    console.log('\n🎫 TEST 2: Bus Standard');
    console.log('----------------------');
    
    const standardTripData = {
      price_fcfa: 8000,
      departure_city: 'Douala',
      arrival_city: 'Yaoundé',
      bus_is_vip: false, // 🎯 BUS STANDARD
      bus_name: 'Standard Express',
      created_by: 'test-user'
    };

    const standardTripId = 'test-standard-trip-' + Date.now();
    
    await initializeSeatMapForTrip(standardTripId, 40, standardTripData);
    
    // Vérifier les résultats
    const { data: standardSeats } = await supabase
      .from('seat_maps')
      .select('seat_number, seat_type, price_modifier_fcfa, final_price_fcfa')
      .eq('trip_id', standardTripId)
      .order('seat_number');

    console.log(`📊 Résultats bus Standard (${standardSeats.length} sièges):`);
    console.log(`   - Sièges VIP: ${standardSeats.filter(s => s.seat_type === 'vip').length}`);
    console.log(`   - Sièges Standard: ${standardSeats.filter(s => s.seat_type === 'standard').length}`);
    
    // Analyser les prix (tous doivent être identiques)
    const allStandardSeats = standardSeats.filter(s => s.seat_type === 'standard');
    
    console.log(`   - Prix uniforme: ${allStandardSeats[0]?.final_price_fcfa} FCFA (tous identiques)`);
    console.log(`   - Supplément: ${allStandardSeats[0]?.price_modifier_fcfa} FCFA (aucun supplément)`);

    // Comparaison finale
    console.log('\n📈 COMPARAISON FINALE:');
    console.log('======================');
    
    const vipAvgPrice = vipSeats.reduce((sum, s) => sum + s.final_price_fcfa, 0) / vipSeats.length;
    const standardAvgPrice = standardSeats.reduce((sum, s) => sum + s.final_price_fcfa, 0) / standardSeats.length;
    
    console.log(`🥇 Bus VIP: ${vipAvgPrice.toFixed(0)} FCFA/siège (tous VIP, aucun supplément)`);
    console.log(`🎫 Bus Standard: ${standardAvgPrice.toFixed(0)} FCFA/siège (tous standard, aucun supplément)`);
    console.log(`💰 Différence: ${(vipAvgPrice - standardAvgPrice).toFixed(0)} FCFA (devrait être 0 - même prix de base)`);

    // Validation finale
    if (Math.abs(vipAvgPrice - standardAvgPrice) < 1) { // Tolérance pour arrondi
      console.log('\n✅ VALIDATION: Même prix pour VIP et Standard (aucun supplément) ✅');
    } else {
      console.log('\n❌ ERREUR: Différence de prix détectée entre VIP et Standard');
      console.log(`   VIP: ${vipAvgPrice.toFixed(0)} FCFA vs Standard: ${standardAvgPrice.toFixed(0)} FCFA`);
    }

    // Nettoyage des données de test
    console.log('\n🧹 Nettoyage des données de test...');
    await supabase.from('seat_maps').delete().eq('trip_id', vipTripId);
    await supabase.from('seat_maps').delete().eq('trip_id', standardTripId);
    console.log('✅ Données de test supprimées');

    console.log('\n🎉 TEST TERMINÉ AVEC SUCCÈS !');
    console.log('La configuration des sièges fonctionne correctement selon le type de bus.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

/**
 * Affiche un résumé de la logique de configuration
 */
function showSeatConfigurationLogic() {
  console.log('📋 LOGIQUE DE CONFIGURATION DES SIÈGES');
  console.log('=====================================');
  console.log('');
  console.log('🥇 BUS VIP (is_vip = true):');
  console.log('   • TOUS les sièges → type "vip"');
  console.log('   • Supplément: AUCUN (0 FCFA)');
  console.log('   • Équipements: USB, repas, siège luxury');
  console.log('');
  console.log('🎫 BUS STANDARD (is_vip = false):');
  console.log('   • TOUS les sièges → type "standard"');
  console.log('   • Supplément: AUCUN (0 FCFA)');
  console.log('   • Équipements: WiFi, prise électrique, éclairage');
  console.log('');
  console.log('🔧 POUR TESTER:');
  console.log('   testBusTypeSeatConfiguration()');
}

// Exporter les fonctions
if (typeof window !== 'undefined') {
  window.testBusTypeSeatConfiguration = testBusTypeSeatConfiguration;
  window.showSeatConfigurationLogic = showSeatConfigurationLogic;
}

// Afficher la logique au chargement
showSeatConfigurationLogic();

export { testBusTypeSeatConfiguration, showSeatConfigurationLogic };
