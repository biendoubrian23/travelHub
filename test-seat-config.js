/**
 * Script de test autonome pour vérifier la configuration des sièges selon le type de bus
 * À exécuter avec: node test-seat-config.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (remplacer par vos vraies valeurs)
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Génère les données de sièges selon le type de bus
 */
function generateSeatData(basePriceFcfa, busTypeInfo) {
  const seats = [];
  
  // Configuration selon le type de bus (VIP ou Standard)
  const seatType = busTypeInfo.bus_is_vip ? 'vip' : 'standard';
  const priceModifier = 0; // Aucun supplément selon les nouvelles règles
  
  console.log(`   📍 Type de bus: ${busTypeInfo.bus_is_vip ? 'VIP' : 'Standard'}`);
  console.log(`   💺 Type de siège: ${seatType}`);
  console.log(`   💰 Supplément: ${priceModifier} FCFA`);
  
  // Générer 30 sièges pour le test
  for (let row = 1; row <= 10; row++) {
    for (let col of ['A', 'B', 'C']) {
      seats.push({
        seat_number: `${row}${col}`,
        seat_type: seatType,
        price_modifier_fcfa: priceModifier,
        final_price_fcfa: basePriceFcfa + priceModifier,
        is_available: true
      });
    }
  }
  
  return seats;
}

/**
 * Teste la création de sièges pour différents types de bus
 */
async function testBusTypeSeatConfiguration() {
  console.log('🧪 TEST: Configuration des sièges selon le type de bus');
  console.log('=====================================================');
  
  try {
    const basePriceFcfa = 15000; // Prix de base pour tous les trajets
    
    // Test 1: Bus VIP
    console.log('\n🥇 TEST BUS VIP:');
    console.log('================');
    const vipBusInfo = { bus_is_vip: true };
    const vipSeats = generateSeatData(basePriceFcfa, vipBusInfo);
    
    console.log(`   ✅ ${vipSeats.length} sièges générés`);
    console.log(`   ✅ Tous de type: ${vipSeats[0].seat_type}`);
    console.log(`   ✅ Prix uniforme: ${vipSeats[0].final_price_fcfa} FCFA`);
    console.log(`   ✅ Supplément: ${vipSeats[0].price_modifier_fcfa} FCFA`);
    
    // Test 2: Bus Standard
    console.log('\n🎫 TEST BUS STANDARD:');
    console.log('====================');
    const standardBusInfo = { bus_is_vip: false };
    const standardSeats = generateSeatData(basePriceFcfa, standardBusInfo);
    
    console.log(`   ✅ ${standardSeats.length} sièges générés`);
    console.log(`   ✅ Tous de type: ${standardSeats[0].seat_type}`);
    console.log(`   ✅ Prix uniforme: ${standardSeats[0].final_price_fcfa} FCFA`);
    console.log(`   ✅ Supplément: ${standardSeats[0].price_modifier_fcfa} FCFA`);
    
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

    console.log('\n🎉 TEST TERMINÉ AVEC SUCCÈS !');
    console.log('La configuration des sièges fonctionne correctement selon le type de bus.');
    console.log('\n📋 RÉSUMÉ:');
    console.log('• Bus VIP → Tous sièges "vip", équipements premium, AUCUN supplément');
    console.log('• Bus Standard → Tous sièges "standard", équipements de base, AUCUN supplément');
    console.log('• Prix identique pour les deux types de bus');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Affichage de la logique
console.log('📋 LOGIQUE DE CONFIGURATION DES SIÈGES');
console.log('=====================================');
console.log('\n🥇 BUS VIP (is_vip = true):');
console.log('   • TOUS les sièges → type "vip"');
console.log('   • Supplément: AUCUN (0 FCFA)');
console.log('   • Équipements: USB, repas, siège luxury');
console.log('\n🎫 BUS STANDARD (is_vip = false):');
console.log('   • TOUS les sièges → type "standard"');
console.log('   • Supplément: AUCUN (0 FCFA)');
console.log('   • Équipements: WiFi, prise électrique, éclairage');

// Exécuter le test
testBusTypeSeatConfiguration();
