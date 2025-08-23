/**
 * Script de correction pour initialiser les sièges des trajets existants
 * À exécuter quand seat_maps est vide pour les trajets existants
 */

import { supabase } from '../lib/supabase.js';
import { initializeSeatMapForTrip } from '../utils/seatMapUtils.js';

export const fixMissingSeatMaps = async () => {
  try {
    console.log('🔧 CORRECTION: Initialisation des sièges manquants');
    console.log('===============================================');

    // 1. Trouver tous les trajets sans seat_maps
    const { data: tripsWithoutSeats, error: tripsError } = await supabase
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
      .eq('is_active', true);

    if (tripsError) {
      console.error('❌ Erreur lors de la récupération des trajets:', tripsError);
      return;
    }

    console.log(`📊 ${tripsWithoutSeats?.length || 0} trajets trouvés`);

    const tripsToFix = [];
    
    // 2. Vérifier quels trajets n'ont pas de seat_maps
    for (const trip of tripsWithoutSeats || []) {
      const { data: existingSeats, error: checkError } = await supabase
        .from('seat_maps')
        .select('id')
        .eq('trip_id', trip.id)
        .limit(1);

      if (checkError) {
        console.log(`⚠️  Erreur vérification trajet ${trip.id}: ${checkError.message}`);
        continue;
      }

      if (!existingSeats || existingSeats.length === 0) {
        tripsToFix.push(trip);
      }
    }

    console.log(`\n🎯 ${tripsToFix.length} trajets nécessitent une correction`);

    if (tripsToFix.length === 0) {
      console.log('✅ Tous les trajets ont déjà leurs sièges configurés !');
      return;
    }

    // 3. Corriger chaque trajet
    let fixedCount = 0;
    let errorCount = 0;

    for (const trip of tripsToFix) {
      try {
        console.log(`\n🔧 Correction du trajet ${trip.id}:`);
        console.log(`   Route: ${trip.departure_city} → ${trip.arrival_city}`);
        console.log(`   Bus: ${trip.buses?.name || 'N/A'} (${trip.buses?.total_seats || 40} sièges)`);
        console.log(`   Type: ${trip.buses?.is_vip ? '🥇 VIP' : '🎫 Standard'}`);

        // Préparer les données pour l'initialisation
        const tripDataForSeats = {
          price_fcfa: trip.price_fcfa || 0,
          departure_city: trip.departure_city,
          arrival_city: trip.arrival_city,
          created_by: trip.created_by,
          bus_is_vip: trip.buses?.is_vip || false,
          bus_name: trip.buses?.name || 'Bus inconnu'
        };

        // Initialiser les sièges
        await initializeSeatMapForTrip(
          trip.id,
          trip.buses?.total_seats || 40,
          tripDataForSeats
        );

        console.log(`   ✅ Sièges initialisés avec succès`);
        fixedCount++;

      } catch (error) {
        console.error(`   ❌ Erreur lors de la correction du trajet ${trip.id}:`, error);
        errorCount++;
      }
    }

    // 4. Résumé final
    console.log('\n📊 RÉSUMÉ DE LA CORRECTION:');
    console.log('===========================');
    console.log(`✅ Trajets corrigés: ${fixedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📋 Total traités: ${tripsToFix.length}`);

    if (fixedCount > 0) {
      console.log('\n🎉 Correction terminée avec succès !');
      console.log('Vérifiez maintenant la table seat_maps dans Supabase.');
    }

  } catch (error) {
    console.error('❌ Erreur globale lors de la correction:', error);
  }
};

// Auto-exécution si le script est appelé directement
if (typeof window === 'undefined') {
  // Environnement Node.js
  fixMissingSeatMaps();
} else {
  // Environnement navigateur
  console.log('🔧 Fonction fixMissingSeatMaps() disponible');
  console.log('💡 Tapez: fixMissingSeatMaps() dans la console');
}
