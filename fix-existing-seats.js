/**
 * Script de correction pour les trajets existants avec mauvais seat_type
 */

console.log('🔧 SCRIPT DE CORRECTION SEAT_TYPE');
console.log('=================================');

console.log('\n📋 Pour corriger les trajets existants, exécutez dans la console navigateur:');
console.log('');
console.log('// --- COPIER DANS LA CONSOLE NAVIGATEUR ---');
console.log(`
async function fixExistingSeatTypes() {
  console.log('🔧 Correction des seat_type incorrects...');
  
  try {
    // 1. Trouver tous les trajets avec des incohérences
    const { data: allTrips, error: tripsError } = await supabase
      .from('trips')
      .select('id, bus_type, departure_city, arrival_city')
      .order('created_at', { ascending: false });
      
    if (tripsError) {
      console.error('❌ Erreur trajets:', tripsError);
      return;
    }
    
    console.log(\`📊 \${allTrips.length} trajets à vérifier\`);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    
    for (const trip of allTrips) {
      console.log(\`\\n🔍 Vérification trajet \${trip.id}: \${trip.departure_city} → \${trip.arrival_city}\`);
      console.log(\`   Bus type: \${trip.bus_type}\`);
      
      // 2. Vérifier les sièges de ce trajet
      const { data: seats, error: seatsError } = await supabase
        .from('seat_maps')
        .select('seat_type')
        .eq('trip_id', trip.id);
        
      if (seatsError) {
        console.log(\`   ❌ Erreur sièges: \${seatsError.message}\`);
        continue;
      }
      
      if (!seats || seats.length === 0) {
        console.log(\`   ⚠️  Aucun siège trouvé\`);
        continue;
      }
      
      // 3. Vérifier si correction nécessaire
      const seatTypes = [...new Set(seats.map(s => s.seat_type))];
      const expectedSeatType = trip.bus_type; // 'vip' ou 'standard'
      
      console.log(\`   Sièges trouvés: \${seatTypes.join(', ')}\`);
      console.log(\`   Attendu: \${expectedSeatType}\`);
      
      const needsFix = !seatTypes.every(type => type === expectedSeatType);
      
      if (needsFix) {
        console.log(\`   🔧 CORRECTION NÉCESSAIRE: \${seatTypes.join(', ')} → \${expectedSeatType}\`);
        
        // 4. Corriger tous les sièges de ce trajet
        const { error: updateError } = await supabase
          .from('seat_maps')
          .update({ seat_type: expectedSeatType })
          .eq('trip_id', trip.id);
          
        if (updateError) {
          console.log(\`   ❌ Erreur correction: \${updateError.message}\`);
        } else {
          console.log(\`   ✅ \${seats.length} sièges corrigés en \${expectedSeatType}\`);
          fixedCount++;
        }
      } else {
        console.log(\`   ✅ Déjà correct\`);
        alreadyCorrectCount++;
      }
    }
    
    // 5. Résumé
    console.log(\`\\n📊 RÉSUMÉ DE LA CORRECTION:\`);
    console.log(\`✅ Trajets corrigés: \${fixedCount}\`);
    console.log(\`✅ Trajets déjà corrects: \${alreadyCorrectCount}\`);
    console.log(\`📋 Total traités: \${allTrips.length}\`);
    
    if (fixedCount > 0) {
      console.log(\`\\n🎉 Correction terminée ! Vérifiez la table seat_maps.\`);
    }
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

fixExistingSeatTypes();
`);

console.log('');
console.log('// --- FIN DE LA COMMANDE ---');
console.log('');
console.log('🎯 Cette fonction va:');
console.log('   1. Vérifier tous les trajets');
console.log('   2. Comparer bus_type (trips) avec seat_type (seat_maps)');
console.log('   3. Corriger automatiquement les incohérences');
console.log('');
console.log('💡 Après correction, tous les sièges auront le bon type !');
console.log('');
