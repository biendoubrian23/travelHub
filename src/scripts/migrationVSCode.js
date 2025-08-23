/**
 * Script de migration Seat Maps - Version VSCode Simple
 * Usage: Copier-coller ce code dans la console VSCode (Ctrl+Shift+`)
 */

// 🚀 SCRIPT DE MIGRATION SEAT_MAPS POUR VSCODE
console.log('🚀 SCRIPT DE MIGRATION SEAT_MAPS');
console.log('=================================');

// Configuration Supabase (à adapter selon votre .env)
const SUPABASE_CONFIG = {
  url: 'VOTRE_SUPABASE_URL_ICI',
  key: 'VOTRE_SUPABASE_KEY_ICI'
};

/**
 * ⚠️ INSTRUCTIONS D'UTILISATION :
 * 
 * 1. Remplacez SUPABASE_CONFIG par vos vraies valeurs
 * 2. Ouvrez le terminal VSCode (Ctrl+Shift+`)
 * 3. Tapez 'node' pour ouvrir le REPL Node.js
 * 4. Copiez-collez ce script
 * 5. Appelez les fonctions :
 *    - checkStatus() pour vérifier l'état
 *    - migrateAll() pour migrer tous les voyages
 *    - migrateSingle('TRIP_ID') pour un voyage spécifique
 */

// Import dynamique de Supabase
async function createSupabaseClient() {
  const { createClient } = await import('@supabase/supabase-js');
  return createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
}

// Fonction utilitaire pour générer les données de siège
function generateSeatData(tripId, seatNumber, isOccupied) {
  const seatNum = parseInt(seatNumber);
  const SEATS_PER_ROW = 4;
  const row = Math.ceil(seatNum / SEATS_PER_ROW);
  const column = ((seatNum - 1) % SEATS_PER_ROW) + 1;

  return {
    trip_id: tripId,
    seat_number: seatNumber,
    position_row: row,
    position_column: column,
    seat_type: 'standard',
    is_available: !isOccupied,
    price_modifier_fcfa: 0
  };
}

// Fonction pour vérifier le statut
async function checkStatus() {
  console.log('📊 Vérification du statut...');
  
  try {
    const supabase = await createSupabaseClient();
    
    // Compter tous les voyages
    const { count: totalTrips, error: tripsError } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true });

    if (tripsError) throw tripsError;

    // Compter les voyages avec seat_maps
    const { data: tripsWithSeats, error: seatsError } = await supabase
      .from('seat_maps')
      .select('trip_id');

    if (seatsError) throw seatsError;

    const uniqueTripsWithSeats = new Set(tripsWithSeats.map(s => s.trip_id)).size;
    const tripsWithoutSeats = totalTrips - uniqueTripsWithSeats;

    console.log('📋 ÉTAT ACTUEL:');
    console.log(`   Total voyages: ${totalTrips}`);
    console.log(`   Avec seat_maps: ${uniqueTripsWithSeats}`);
    console.log(`   Sans seat_maps: ${tripsWithoutSeats}`);
    
    return {
      totalTrips,
      withSeats: uniqueTripsWithSeats,
      withoutSeats: tripsWithoutSeats,
      needsMigration: tripsWithoutSeats > 0
    };
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return null;
  }
}

// Fonction pour migrer un voyage spécifique
async function migrateSingle(tripId) {
  console.log(`🔄 Migration du voyage ${tripId}...`);
  
  try {
    const supabase = await createSupabaseClient();
    
    // Vérifier si déjà migré
    const { data: existingSeats, error: checkError } = await supabase
      .from('seat_maps')
      .select('seat_number')
      .eq('trip_id', tripId);

    if (checkError) throw checkError;

    if (existingSeats && existingSeats.length > 0) {
      console.log(`⚠️ Voyage ${tripId} déjà migré (${existingSeats.length} sièges)`);
      return { skipped: true };
    }

    // Récupérer les infos du voyage
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, bus_id, buses(total_seats)')
      .eq('id', tripId)
      .single();

    if (tripError) throw tripError;

    // Récupérer les réservations
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('seat_number')
      .eq('trip_id', tripId)
      .not('seat_number', 'is', null);

    if (bookingError) throw bookingError;

    const occupiedSeats = (bookings || []).map(b => b.seat_number);
    const totalSeats = trip.buses?.total_seats || 40;

    // Créer les sièges
    const seatData = [];
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = i.toString();
      const isOccupied = occupiedSeats.includes(seatNumber);
      seatData.push(generateSeatData(tripId, seatNumber, isOccupied));
    }

    // Insérer
    const { data: insertedSeats, error: insertError } = await supabase
      .from('seat_maps')
      .insert(seatData)
      .select();

    if (insertError) throw insertError;

    const occupiedCount = insertedSeats.filter(s => !s.is_available).length;
    
    console.log(`✅ Voyage ${tripId} migré:`);
    console.log(`   ${insertedSeats.length} sièges créés`);
    console.log(`   ${occupiedCount} occupés, ${insertedSeats.length - occupiedCount} disponibles`);
    
    return {
      success: true,
      totalSeats: insertedSeats.length,
      occupied: occupiedCount
    };
    
  } catch (error) {
    console.error(`❌ Erreur voyage ${tripId}:`, error.message);
    return { error: error.message };
  }
}

// Fonction pour migrer tous les voyages
async function migrateAll() {
  console.log('🚀 MIGRATION COMPLÈTE');
  console.log('====================');
  
  try {
    const supabase = await createSupabaseClient();
    
    // Vérifier l'état
    const status = await checkStatus();
    if (!status || !status.needsMigration) {
      console.log('✅ Aucune migration nécessaire');
      return;
    }
    
    // Récupérer les voyages à migrer
    const { data: trips, error: tripsError } = await supabase
      .from('trips')
      .select('id, departure_city, arrival_city, departure_date')
      .not('id', 'in', `(
        SELECT DISTINCT trip_id 
        FROM seat_maps 
        WHERE trip_id IS NOT NULL
      )`);

    if (tripsError) throw tripsError;
    
    console.log(`📋 ${trips.length} voyages à migrer`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i];
      console.log(`\n[${i + 1}/${trips.length}] ${trip.departure_city} → ${trip.arrival_city}`);
      
      const result = await migrateSingle(trip.id);
      
      if (result.success) {
        successCount++;
      } else if (result.error) {
        errorCount++;
      }
      
      // Petite pause
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 RÉSULTATS FINAUX:');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log('🎉 Migration terminée !');
    
  } catch (error) {
    console.error('💥 Erreur critique:', error.message);
  }
}

// Afficher les instructions
console.log('📝 FONCTIONS DISPONIBLES:');
console.log('  checkStatus()        - Vérifier l\'état');
console.log('  migrateSingle(id)    - Migrer un voyage');
console.log('  migrateAll()         - Migrer tous les voyages');
console.log('');
console.log('⚠️  N\'oubliez pas de configurer SUPABASE_CONFIG !');

// Export des fonctions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkStatus, migrateSingle, migrateAll };
}
