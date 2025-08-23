/**
 * Script de test pour la console navigateur
 * Copier-coller dans la console pour tester la création de sièges
 */

// 🔧 FONCTION DE TEST À COPIER DANS LA CONSOLE DU NAVIGATEUR
async function testSeatMapCreation() {
  console.log('🧪 TEST: Création manuelle de sièges');
  console.log('===================================');
  
  try {
    // 1. Récupérer le dernier trajet créé
    const { data: latestTrip, error: tripError } = await supabase
      .from('trips')
      .select(`
        id,
        departure_city,
        arrival_city,
        price_fcfa,
        created_by,
        bus_id,
        buses!bus_id (
          id,
          name,
          total_seats,
          is_vip
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tripError) {
      console.error('❌ Erreur récupération trajet:', tripError);
      return;
    }

    console.log('📋 Trajet trouvé:', latestTrip);
    console.log(`   Route: ${latestTrip.departure_city} → ${latestTrip.arrival_city}`);
    console.log(`   Bus: ${latestTrip.buses?.name} (${latestTrip.buses?.total_seats} sièges)`);
    console.log(`   Type: ${latestTrip.buses?.is_vip ? '🥇 VIP' : '🎫 Standard'}`);

    // 2. Vérifier si ce trajet a déjà des sièges
    const { data: existingSeats, error: seatCheckError } = await supabase
      .from('seat_maps')
      .select('id')
      .eq('trip_id', latestTrip.id);

    if (seatCheckError) {
      console.error('❌ Erreur vérification sièges:', seatCheckError);
      return;
    }

    if (existingSeats && existingSeats.length > 0) {
      console.log(`✅ Ce trajet a déjà ${existingSeats.length} sièges configurés`);
      return;
    }

    console.log('❌ Aucun siège trouvé pour ce trajet. Création...');

    // 3. Créer manuellement les sièges
    const totalSeats = latestTrip.buses?.total_seats || 40;
    const busIsVip = latestTrip.buses?.is_vip || false;
    const basePriceFcfa = latestTrip.price_fcfa || 15000;

    const seats = [];
    
    // Générer les données de sièges
    for (let seatNum = 1; seatNum <= totalSeats; seatNum++) {
      const row = Math.ceil(seatNum / 4); // 4 sièges par rangée
      const column = ((seatNum - 1) % 4) + 1;
      
      // Configuration selon le type de bus
      const seatType = busIsVip ? 'vip' : 'standard';
      const priceModifier = 0; // Aucun supplément selon les nouvelles règles
      
      seats.push({
        trip_id: latestTrip.id,
        seat_number: seatNum.toString(),
        position_row: row,
        position_column: column,
        seat_type: seatType,
        is_available: true,
        price_modifier_fcfa: priceModifier,
        reservation_status: 'available',
        base_price_fcfa: basePriceFcfa,
        final_price_fcfa: basePriceFcfa + priceModifier,
        seat_features: busIsVip ? 
          { comfort: 'luxury', amenities: ['USB', 'meal', 'premium_seat'] } : 
          { comfort: 'standard', amenities: ['wifi', 'power_outlet', 'reading_light'] },
        created_by: latestTrip.created_by
      });
    }

    console.log(`📦 Préparation de ${seats.length} sièges de type "${seatType}"...`);

    // 4. Insérer dans la base de données
    const { data: insertedSeats, error: insertError } = await supabase
      .from('seat_maps')
      .insert(seats)
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion sièges:', insertError);
      return;
    }

    console.log(`✅ ${insertedSeats.length} sièges créés avec succès !`);
    console.log('📊 Répartition:');
    
    const vipSeats = insertedSeats.filter(s => s.seat_type === 'vip').length;
    const standardSeats = insertedSeats.filter(s => s.seat_type === 'standard').length;
    
    console.log(`   🥇 VIP: ${vipSeats} sièges`);
    console.log(`   🎫 Standard: ${standardSeats} sièges`);
    console.log(`   💰 Prix uniforme: ${insertedSeats[0].final_price_fcfa} FCFA`);
    console.log(`   💰 Supplément: ${insertedSeats[0].price_modifier_fcfa} FCFA`);

    // 5. Vérifier dans la table
    const { data: verification, error: verifyError } = await supabase
      .from('seat_maps')
      .select('seat_number, seat_type, final_price_fcfa')
      .eq('trip_id', latestTrip.id)
      .order('seat_number');

    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError);
      return;
    }

    console.log('\n🎯 VÉRIFICATION FINALE:');
    console.log(`✅ ${verification.length} sièges trouvés dans seat_maps`);
    console.log('✅ Table seat_maps correctement peuplée !');

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Message d'instructions
console.log('🔧 DIAGNOSTIC SEAT_MAPS');
console.log('========================');
console.log('');
console.log('📋 Pour tester la création de sièges:');
console.log('   1. Ouvrez la console navigateur (F12)');
console.log('   2. Copiez-collez cette fonction');
console.log('   3. Exécutez: testSeatMapCreation()');
console.log('');
console.log('💡 Cela testera la création manuelle de sièges pour le dernier trajet');
console.log('');

export { testSeatMapCreation };
