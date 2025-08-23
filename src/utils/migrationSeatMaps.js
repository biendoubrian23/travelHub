import { supabase } from '../lib/supabase';
import { initializeSeatMapForTrip, syncSeatMapWithExistingBookings } from './seatMapUtils';

/**
 * Script de migration pour initialiser les places des trajets existants
 * À exécuter une seule fois après la mise en place du système seat_maps
 */

/**
 * Migre tous les trajets existants vers le système seat_maps
 */
export const migrateExistingTripsToSeatMaps = async () => {
  try {
    console.log('🚀 Début de la migration des trajets existants...');
    
    // 1. Récupérer tous les trajets qui n'ont pas encore de seat_maps
    const { data: tripsWithoutSeats, error: tripsError } = await supabase
      .from('trips')
      .select(`
        id,
        total_seats,
        buses!bus_id (
          id,
          total_seats
        )
      `)
      .eq('is_active', true);

    if (tripsError) throw tripsError;

    console.log(`📊 ${tripsWithoutSeats?.length || 0} trajets trouvés`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const trip of tripsWithoutSeats || []) {
      try {
        // Vérifier si le trajet a déjà des seat_maps
        const { data: existingSeats, error: checkError } = await supabase
          .from('seat_maps')
          .select('id')
          .eq('trip_id', trip.id)
          .limit(1);

        if (checkError) throw checkError;

        if (existingSeats && existingSeats.length > 0) {
          console.log(`⏭️  Trajet ${trip.id} déjà migré`);
          skippedCount++;
          continue;
        }

        // Déterminer le nombre de places
        const totalSeats = trip.buses?.total_seats || trip.total_seats || 40;
        
        console.log(`🔄 Migration du trajet ${trip.id} (${totalSeats} places)...`);

        // 2. Initialiser les places pour ce trajet
        await initializeSeatMapForTrip(trip.id, totalSeats);

        // 3. Synchroniser avec les réservations existantes
        await syncSeatMapWithExistingBookings(trip.id);

        migratedCount++;
        console.log(`✅ Trajet ${trip.id} migré avec succès`);

        // Petite pause pour éviter la surcharge
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Erreur migration trajet ${trip.id}:`, error);
        errorCount++;
      }
    }

    console.log('🎉 Migration terminée !');
    console.log(`📊 Résumé :`);
    console.log(`   ✅ Migrés: ${migratedCount}`);
    console.log(`   ⏭️  Ignorés: ${skippedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);

    return {
      success: true,
      migratedCount,
      skippedCount,
      errorCount
    };

  } catch (error) {
    console.error('💥 Erreur générale de migration:', error);
    throw error;
  }
};

/**
 * Migre un trajet spécifique (utile pour les corrections manuelles)
 * @param {string} tripId - ID du trajet à migrer
 */
export const migrateSingleTrip = async (tripId) => {
  try {
    console.log(`🎯 Migration du trajet ${tripId}...`);

    // Récupérer les infos du trajet
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select(`
        id,
        total_seats,
        buses!bus_id (
          id,
          total_seats
        )
      `)
      .eq('id', tripId)
      .single();

    if (tripError) throw tripError;
    if (!trip) throw new Error('Trajet non trouvé');

    const totalSeats = trip.buses?.total_seats || trip.total_seats || 40;

    // Initialiser les places
    await initializeSeatMapForTrip(tripId, totalSeats);

    // Synchroniser avec les réservations
    await syncSeatMapWithExistingBookings(tripId);

    console.log(`✅ Trajet ${tripId} migré avec succès`);
    return { success: true };

  } catch (error) {
    console.error(`❌ Erreur migration trajet ${tripId}:`, error);
    throw error;
  }
};

/**
 * Vérifie l'état de migration de tous les trajets
 */
export const checkMigrationStatus = async () => {
  try {
    // Compter les trajets totaux
    const { count: totalTrips, error: tripsError } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (tripsError) throw tripsError;

    // Compter les trajets avec seat_maps
    const { data: tripsWithSeats, error: seatsError } = await supabase
      .from('seat_maps')
      .select('trip_id')
      .not('trip_id', 'is', null);

    if (seatsError) throw seatsError;

    const uniqueTripsWithSeats = new Set(tripsWithSeats?.map(s => s.trip_id) || []).size;

    return {
      totalTrips: totalTrips || 0,
      migratedTrips: uniqueTripsWithSeats,
      pendingTrips: (totalTrips || 0) - uniqueTripsWithSeats,
      migrationComplete: (totalTrips || 0) === uniqueTripsWithSeats
    };

  } catch (error) {
    console.error('Erreur vérification migration:', error);
    throw error;
  }
};
