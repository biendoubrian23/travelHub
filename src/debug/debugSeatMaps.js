/**
 * Script de débogage pour vérifier pourquoi seat_maps reste vide
 * Exécuter après avoir créé un trajet pour diagnostiquer le problème
 */

import { supabase } from '../lib/supabase.js';

// Configuration Supabase - Remplacer par vos vraies valeurs
// const supabaseUrl = 'https://your-project-url.supabase.co';
// const supabaseKey = 'your-anon-key';
// const supabase = createClient(supabaseUrl, supabaseKey);

export const debugSeatMapCreation = async () => {
  try {
    console.log('🔍 DIAGNOSTIC: Pourquoi seat_maps est vide');
    console.log('===========================================');

    // 1. Vérifier les trajets récents
    const { data: recentTrips, error: tripsError } = await supabase
      .from('trips')
      .select(`
        id,
        departure_city,
        arrival_city,
        created_at,
        bus_id,
        buses!bus_id (
          id,
          name,
          total_seats,
          is_vip
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (tripsError) {
      console.error('❌ Erreur lors de la récupération des trajets:', tripsError);
      return;
    }

    console.log(`\n📊 ${recentTrips?.length || 0} trajets récents trouvés:`);
    
    for (const trip of recentTrips || []) {
      console.log(`\n🚌 TRAJET ${trip.id}:`);
      console.log(`   Route: ${trip.departure_city} → ${trip.arrival_city}`);
      console.log(`   Créé: ${new Date(trip.created_at).toLocaleString('fr-FR')}`);
      console.log(`   Bus: ${trip.buses?.name || 'N/A'} (${trip.buses?.total_seats || 'N/A'} sièges)`);
      console.log(`   Type: ${trip.buses?.is_vip ? '🥇 VIP' : '🎫 Standard'}`);

      // Vérifier si ce trajet a des seat_maps
      const { data: seatMaps, error: seatMapsError } = await supabase
        .from('seat_maps')
        .select('id, seat_number, seat_type, is_available')
        .eq('trip_id', trip.id);

      if (seatMapsError) {
        console.log(`   ❌ Erreur seat_maps: ${seatMapsError.message}`);
      } else if (!seatMaps || seatMaps.length === 0) {
        console.log(`   ❌ PROBLÈME: Aucun siège dans seat_maps !`);
        
        // Proposer une solution
        console.log(`   💡 SOLUTION: Exécuter initializeSeatMapForTrip(${trip.id}, ${trip.buses?.total_seats || 40})`);
      } else {
        console.log(`   ✅ ${seatMaps.length} sièges trouvés dans seat_maps`);
        console.log(`   📋 Types: ${[...new Set(seatMaps.map(s => s.seat_type))].join(', ')}`);
        console.log(`   💺 Disponibles: ${seatMaps.filter(s => s.is_available).length}/${seatMaps.length}`);
      }
    }

    // 2. Vérifier la table seat_maps globalement
    const { data: allSeatMaps, error: allSeatMapsError } = await supabase
      .from('seat_maps')
      .select('trip_id')
      .limit(1);

    console.log('\n📋 ÉTAT GLOBAL DE LA TABLE SEAT_MAPS:');
    if (allSeatMapsError) {
      console.log(`❌ Erreur d'accès: ${allSeatMapsError.message}`);
    } else if (!allSeatMaps || allSeatMaps.length === 0) {
      console.log('❌ Table seat_maps complètement vide !');
      console.log('💡 Aucun trajet n\'a initialisé ses sièges');
    } else {
      console.log('✅ Table seat_maps contient des données');
    }

    // 3. Vérifier les permissions sur seat_maps
    console.log('\n🔐 TEST DES PERMISSIONS:');
    try {
      const { data: testInsert, error: insertError } = await supabase
        .from('seat_maps')
        .insert({
          trip_id: 'test-trip-id',
          seat_number: 'TEST',
          position_row: 1,
          position_column: 1,
          seat_type: 'standard',
          is_available: true,
          price_modifier_fcfa: 0
        })
        .select();

      if (insertError) {
        console.log(`❌ Erreur d'insertion: ${insertError.message}`);
        console.log('💡 Problème de permissions ou de structure de table');
      } else {
        console.log('✅ Insertion test réussie');
        // Nettoyer le test
        await supabase.from('seat_maps').delete().eq('trip_id', 'test-trip-id');
        console.log('🧹 Test nettoyé');
      }
    } catch (testError) {
      console.log(`❌ Erreur test: ${testError.message}`);
    }

    console.log('\n🎯 DIAGNOSTIC TERMINÉ');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Erreur globale lors du diagnostic:', error);
  }
};

// Auto-exécution si le script est appelé directement
if (typeof window === 'undefined') {
  // Environnement Node.js
  debugSeatMapCreation();
} else {
  // Environnement navigateur
  console.log('🔧 Fonction debugSeatMapCreation() disponible');
  console.log('💡 Tapez: debugSeatMapCreation() dans la console');
}
