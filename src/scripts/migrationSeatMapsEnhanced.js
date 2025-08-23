/**
 * Script de migration amélioré pour seat_maps avec nouvelles colonnes
 * Exécuter après avoir appliqué seat_maps_improvements.sql
 * 
 * Utilisation :
 * npm run dev puis dans la console navigateur :
 * import('./src/scripts/migrationSeatMapsEnhanced.js').then(m => m.runEnhancedMigration())
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Génère les données de siège avec les nouvelles colonnes
 */
const generateEnhancedSeatData = (tripId, seatNumber, tripData, bookingData = null) => {
  const seatNum = parseInt(seatNumber);
  
  // Configuration bus standard
  const SEATS_PER_ROW = 4;
  const row = Math.ceil(seatNum / SEATS_PER_ROW);
  const column = ((seatNum - 1) % SEATS_PER_ROW) + 1;

  // Fonctionnalités du siège
  const isWindow = column === 1 || column === 4;
  const isVip = seatNum <= 4;
  
  const seatFeatures = {
    is_window: isWindow,
    is_aisle: !isWindow,
    is_vip: isVip,
    has_power_outlet: true,
    has_wifi: true,
    has_reading_light: true,
    has_usb_port: isVip,
    is_accessible: seatNum >= 37 && seatNum <= 40 // Derniers sièges accessibles
  };

  const basePrice = tripData.price_fcfa || 0;
  const priceModifier = isVip ? 1000 : 0;
  const finalPrice = basePrice + priceModifier;

  return {
    trip_id: tripId,
    seat_number: seatNumber,
    position_row: row,
    position_column: column,
    seat_type: isVip ? 'vip' : 'standard',
    is_available: !bookingData,
    price_modifier_fcfa: priceModifier,
    
    // 🆕 Nouvelles colonnes
    reservation_status: bookingData ? 'occupied' : 'available',
    base_price_fcfa: basePrice,
    final_price_fcfa: finalPrice,
    seat_features: seatFeatures,
    reserved_by: bookingData?.passenger_name || null,
    booking_id: bookingData?.id || null,
    reserved_at: bookingData?.created_at || null,
    created_by: 'migration-system',
    notes: bookingData ? `Migration automatique - Réservé par ${bookingData.passenger_name}` : null
  };
};

/**
 * Migre un seul voyage avec les nouvelles colonnes
 */
export const migrateEnhancedSingleTrip = async (tripId) => {
  try {
    console.log(`🚀 Migration améliorée du voyage ${tripId}...`);

    // 1. Récupérer les données du voyage
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select(`
        id, 
        departure_city, 
        arrival_city, 
        departure_date, 
        price_fcfa,
        bus_id,
        buses (total_seats)
      `)
      .eq('id', tripId)
      .single();

    if (tripError) throw tripError;
    if (!trip) throw new Error(`Voyage ${tripId} introuvable`);

    // 2. Vérifier si des sièges existent déjà
    const { data: existingSeats, error: checkError } = await supabase
      .from('seat_maps')
      .select('seat_number')
      .eq('trip_id', tripId);

    if (checkError) throw checkError;

    if (existingSeats && existingSeats.length > 0) {
      console.log(`⚠️  Le voyage ${tripId} a déjà ${existingSeats.length} sièges - migration ignorée`);
      return { skipped: true, reason: 'seats_already_exist', count: existingSeats.length };
    }

    // 3. Récupérer les réservations existantes
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, seat_number, passenger_name, created_at')
      .eq('trip_id', tripId)
      .not('seat_number', 'is', null);

    if (bookingError) throw bookingError;

    // 4. Créer un map des réservations par siège
    const bookingMap = new Map();
    (bookings || []).forEach(booking => {
      if (booking.seat_number) {
        bookingMap.set(booking.seat_number, booking);
      }
    });

    // 5. Déterminer le nombre total de sièges
    const totalSeats = trip.buses?.total_seats || 40;
    console.log(`📊 Création de ${totalSeats} sièges, ${bookings?.length || 0} réservations existantes`);

    // 6. Générer les données des sièges
    const seatData = [];
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = i.toString();
      const booking = bookingMap.get(seatNumber);
      const seat = generateEnhancedSeatData(tripId, seatNumber, trip, booking);
      seatData.push(seat);
    }

    // 7. Insérer les sièges en lot
    const { data: insertedSeats, error: insertError } = await supabase
      .from('seat_maps')
      .insert(seatData)
      .select();

    if (insertError) throw insertError;

    const occupiedCount = insertedSeats.filter(s => !s.is_available).length;
    
    console.log(`✅ Migration réussie pour ${tripId}:`);
    console.log(`   - ${insertedSeats.length} sièges créés`);
    console.log(`   - ${occupiedCount} sièges occupés`);
    console.log(`   - ${insertedSeats.length - occupiedCount} sièges disponibles`);

    return {
      success: true,
      tripId,
      totalSeats: insertedSeats.length,
      occupiedSeats: occupiedCount,
      availableSeats: insertedSeats.length - occupiedCount
    };

  } catch (error) {
    console.error(`❌ Erreur migration voyage ${tripId}:`, error);
    return { success: false, tripId, error: error.message };
  }
};

/**
 * Migration complète de tous les voyages sans seat_maps
 */
export const runEnhancedMigration = async () => {
  try {
    console.log('🚀 DÉMARRAGE MIGRATION AMÉLIORÉE SEAT_MAPS');
    console.log('============================================');

    // 1. Identifier les voyages sans seat_maps
    const { data: tripsWithoutSeats, error: queryError } = await supabase
      .from('trips')
      .select(`
        id, 
        departure_city, 
        arrival_city, 
        departure_date,
        price_fcfa,
        bus_id,
        buses (total_seats)
      `)
      .not('id', 'in', `(
        SELECT DISTINCT trip_id 
        FROM seat_maps 
        WHERE trip_id IS NOT NULL
      )`);

    if (queryError) throw queryError;

    if (!tripsWithoutSeats || tripsWithoutSeats.length === 0) {
      console.log('✅ Aucun voyage à migrer - tous ont déjà leurs seat_maps');
      return { message: 'Aucune migration nécessaire' };
    }

    console.log(`📋 ${tripsWithoutSeats.length} voyages à migrer`);

    // 2. Migrer chaque voyage
    const results = {
      success: [],
      errors: [],
      skipped: []
    };

    for (const trip of tripsWithoutSeats) {
      console.log(`\n🔄 Migration ${trip.departure_city} → ${trip.arrival_city} (${trip.departure_date})`);
      
      const result = await migrateEnhancedSingleTrip(trip.id);
      
      if (result.success) {
        results.success.push(result);
      } else if (result.skipped) {
        results.skipped.push(result);
      } else {
        results.errors.push(result);
      }

      // Pause entre les migrations pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Rapport final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RAPPORT FINAL MIGRATION');
    console.log('='.repeat(50));
    console.log(`✅ Migrations réussies: ${results.success.length}`);
    console.log(`⚠️  Migrations ignorées: ${results.skipped.length}`);
    console.log(`❌ Erreurs: ${results.errors.length}`);

    if (results.success.length > 0) {
      const totalSeats = results.success.reduce((sum, r) => sum + r.totalSeats, 0);
      const totalOccupied = results.success.reduce((sum, r) => sum + r.occupiedSeats, 0);
      console.log(`\n📈 STATISTIQUES:`);
      console.log(`   - Total sièges créés: ${totalSeats}`);
      console.log(`   - Sièges occupés: ${totalOccupied}`);
      console.log(`   - Sièges disponibles: ${totalSeats - totalOccupied}`);
      console.log(`   - Taux d'occupation: ${((totalOccupied / totalSeats) * 100).toFixed(1)}%`);
    }

    if (results.errors.length > 0) {
      console.log(`\n❌ ERREURS:`);
      results.errors.forEach(error => {
        console.log(`   - Voyage ${error.tripId}: ${error.error}`);
      });
    }

    return results;

  } catch (error) {
    console.error('💥 ERREUR CRITIQUE MIGRATION:', error);
    throw error;
  }
};

/**
 * Vérifie l'état de la migration
 */
export const checkEnhancedMigrationStatus = async () => {
  try {
    console.log('📊 VÉRIFICATION ÉTAT MIGRATION');
    console.log('==============================');

    // Compter les voyages
    const { count: totalTrips, error: tripsError } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true });

    if (tripsError) throw tripsError;

    // Compter les voyages avec seat_maps
    const { data: tripsWithSeats, error: seatsError } = await supabase
      .from('seat_maps')
      .select('trip_id')
      .not('trip_id', 'is', null);

    if (seatsError) throw seatsError;

    const uniqueTripsWithSeats = new Set(tripsWithSeats.map(s => s.trip_id)).size;
    const tripsWithoutSeats = totalTrips - uniqueTripsWithSeats;

    // Statistiques seat_maps
    const { count: totalSeatMaps, error: seatMapsError } = await supabase
      .from('seat_maps')
      .select('*', { count: 'exact', head: true });

    if (seatMapsError) throw seatMapsError;

    console.log(`📋 Voyages total: ${totalTrips}`);
    console.log(`✅ Voyages avec seat_maps: ${uniqueTripsWithSeats}`);
    console.log(`⚠️  Voyages sans seat_maps: ${tripsWithoutSeats}`);
    console.log(`🪑 Total sièges configurés: ${totalSeatMaps}`);

    if (tripsWithoutSeats > 0) {
      console.log(`\n🔧 Action recommandée: Exécuter la migration pour ${tripsWithoutSeats} voyages`);
      console.log(`   Commande: runEnhancedMigration()`);
    } else {
      console.log(`\n✅ Migration complète - tous les voyages ont leurs seat_maps`);
    }

    return {
      totalTrips,
      tripsWithSeats: uniqueTripsWithSeats,
      tripsWithoutSeats,
      totalSeatMaps,
      migrationNeeded: tripsWithoutSeats > 0
    };

  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    throw error;
  }
};

// Export pour utilisation directe
export default {
  runEnhancedMigration,
  migrateEnhancedSingleTrip,
  checkEnhancedMigrationStatus
};
