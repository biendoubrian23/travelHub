import { supabase } from '../lib/supabase';

/**
 * Hook et fonctions utilitaires pour gérer la synchronisation
 * entre les réservations et la table seat_maps
 */

/**
 * Synchronise une réservation avec la table seat_maps
 * @param {string} tripId - ID du voyage
 * @param {string} seatNumber - Numéro du siège
 * @param {boolean} isOccupied - Statut d'occupation
 */
export const syncSeatMapWithBooking = async (tripId, seatNumber, isOccupied = true) => {
  try {
    // Mettre à jour ou créer l'entrée dans seat_maps
    const { data: existingSeat, error: fetchError } = await supabase
      .from('seat_maps')
      .select('*')
      .eq('trip_id', tripId)
      .eq('seat_number', seatNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingSeat) {
      // Mettre à jour le siège existant
      const { error: updateError } = await supabase
        .from('seat_maps')
        .update({ 
          is_available: !isOccupied
        })
        .eq('id', existingSeat.id);

      if (updateError) throw updateError;
    } else {
      // Créer un nouveau siège si il n'existe pas
      const seatData = generateSeatData(tripId, seatNumber, isOccupied);
      
      const { error: insertError } = await supabase
        .from('seat_maps')
        .insert(seatData);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation seat_maps:', error);
    throw error;
  }
};

/**
 * Génère les données par défaut pour un siège avec les nouvelles colonnes
 * @param {string} tripId - ID du voyage
 * @param {string} seatNumber - Numéro du siège
 * @param {boolean} isOccupied - Statut d'occupation
 * @param {Object} options - Options supplémentaires
 */
const generateSeatData = (tripId, seatNumber, isOccupied, options = {}) => {
  const seatNum = parseInt(seatNumber);
  
  // Configuration standard d'un bus (4 sièges par rangée)
  const SEATS_PER_ROW = 4;
  const row = Math.ceil(seatNum / SEATS_PER_ROW);
  const column = ((seatNum - 1) % SEATS_PER_ROW) + 1;

  return {
    trip_id: tripId,
    seat_number: seatNumber,
    position_row: row,
    position_column: column,
    seat_type: options.seatType || 'standard',
    is_available: !isOccupied,
    price_modifier_fcfa: options.priceModifier || 0
    
    // 🚫 COLONNES SUPPRIMÉES CAR ELLES N'EXISTENT PAS DANS LA VRAIE TABLE
    // Ces colonnes causaient l'erreur d'insertion :
    // - reservation_status, base_price_fcfa, final_price_fcfa, 
    // - seat_features, reserved_by, booking_id, reserved_at, created_by, notes
  };
};

/**
 * Crée une réservation et synchronise avec seat_maps
 * @param {Object} bookingData - Données de la réservation
 */
export const createBookingWithSeatSync = async (bookingData) => {
  try {
    // 1. Créer la réservation
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 2. Synchroniser avec seat_maps
    await syncSeatMapWithBooking(
      bookingData.trip_id, 
      bookingData.seat_number, 
      true
    );

    return booking;
  } catch (error) {
    console.error('Erreur lors de la création de réservation avec synchronisation:', error);
    throw error;
  }
};

/**
 * Libère un siège (annulation de réservation)
 * @param {string} tripId - ID du voyage
 * @param {string} seatNumber - Numéro du siège
 */
export const releaseSeat = async (tripId, seatNumber) => {
  try {
    await syncSeatMapWithBooking(tripId, seatNumber, false);
    return true;
  } catch (error) {
    console.error('Erreur lors de la libération du siège:', error);
    throw error;
  }
};

/**
 * Récupère les sièges occupés depuis les réservations
 * @param {string} tripId - ID du voyage
 * @returns {Array} - Liste des numéros de sièges occupés
 */
export const getOccupiedSeatsFromBookings = async (tripId) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('seat_number')
      .eq('trip_id', tripId)
      .not('seat_number', 'is', null);

    if (error) throw error;

    return bookings.map(booking => parseInt(booking.seat_number)).filter(seat => !isNaN(seat));
  } catch (error) {
    console.error('Erreur lors de la récupération des sièges occupés:', error);
    return [];
  }
};

/**
 * Initialise la table seat_maps pour un voyage avec configuration VIP/Standard
 * @param {string} tripId - ID du voyage
 * @param {number} totalSeats - Nombre total de sièges
 * @param {Object} tripData - Données du voyage pour calculer les prix
 */
export const initializeSeatMapForTrip = async (tripId, totalSeats = 40, tripData = {}) => {
  try {
    console.log(`🚀 [SEAT_MAPS] Initialisation des sièges pour le voyage ${tripId} avec ${totalSeats} sièges...`);
    console.log(`🚀 [SEAT_MAPS] TripData reçu:`, tripData);
    
    // 🎯 NOUVEAU : Récupérer les infos du trajet directement depuis la DB
    const { data: tripInfo, error: tripInfoError } = await supabase
      .from('trips')
      .select('bus_type, price_fcfa')
      .eq('id', tripId)
      .single();

    if (tripInfoError) {
      console.error(`❌ [SEAT_MAPS] Erreur récupération infos trajet:`, tripInfoError);
      throw tripInfoError;
    }

    console.log(`� [SEAT_MAPS] Infos trajet récupérées:`, tripInfo);
    console.log(`🎯 [SEAT_MAPS] Bus type depuis trips: ${tripInfo.bus_type}`);
    
    // Vérifier si des sièges existent déjà
    const { data: existingSeats, error: checkError } = await supabase
      .from('seat_maps')
      .select('id')
      .eq('trip_id', tripId)
      .limit(1);

    if (checkError) {
      console.error(`❌ [SEAT_MAPS] Erreur lors de la vérification des sièges existants:`, checkError);
      throw checkError;
    }

    if (existingSeats && existingSeats.length > 0) {
      console.log('✅ [SEAT_MAPS] Les sièges existent déjà pour ce voyage');
      return existingSeats;
    }

    console.log(`🔍 [SEAT_MAPS] Aucun siège existant trouvé, création de ${totalSeats} nouveaux sièges...`);

    // Récupérer les sièges déjà occupés
    const occupiedSeats = await getOccupiedSeatsFromBookings(tripId);
    console.log(`📋 Sièges déjà occupés: ${occupiedSeats.join(', ')}`);

    // 🎯 Déterminer le type de siège depuis la table trips
    const busType = tripInfo.bus_type; // 'vip' ou 'standard' depuis trips.bus_type
    
    console.log(`🚌 [SEAT_MAPS] Configuration: bus_type="${busType}" → tous les sièges de type "${busType}"`);

    // Créer tous les sièges avec configuration selon le TYPE DE BUS DEPUIS TRIPS
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = i.toString();
      const isOccupied = occupiedSeats.includes(i);
      
      console.log(`💺 [SEAT_MAPS] Siège ${i}: bus_type="${busType}" → seat_type="${busType}"`);
      
      // Configuration simple : seat_type = bus_type, aucun supplément
      const seatType = busType; // Directement 'vip' ou 'standard'
      const priceModifier = 0; // Aucun supplément pour aucun type de bus
      
      const seatOptions = {
        seatType: seatType,
        priceModifier: priceModifier
      };

      const seat = generateSeatData(tripId, seatNumber, isOccupied, seatOptions);
      seats.push(seat);
    }

    console.log(`📦 [SEAT_MAPS] Préparation de ${seats.length} sièges pour insertion...`);

    // Insérer tous les sièges
    const { data: insertedSeats, error: insertError } = await supabase
      .from('seat_maps')
      .insert(seats)
      .select();

    if (insertError) {
      console.error(`❌ [SEAT_MAPS] Erreur lors de l'insertion des sièges:`, insertError);
      throw insertError;
    }

    console.log(`✅ [SEAT_MAPS] ${insertedSeats.length} sièges insérés avec succès !`);

    const vipSeats = insertedSeats.filter(s => s.seat_type === 'vip').length;
    const standardSeats = insertedSeats.filter(s => s.seat_type === 'standard').length;
    const occupiedCount = insertedSeats.filter(s => !s.is_available).length;

    console.log(`✅ [SEAT_MAPS] Initialisation terminée pour le voyage ${tripId}:`);
    console.log(`   - Type de bus depuis trips: ${busType.toUpperCase()}`);
    console.log(`   - ${vipSeats} sièges VIP`);
    console.log(`   - ${standardSeats} sièges Standard`);
    console.log(`   - ${occupiedCount} sièges occupés`);
    console.log(`   - ${insertedSeats.length - occupiedCount} sièges disponibles`);
    
    // 🎯 RÉSUMÉ SELON LE TYPE DE BUS DEPUIS TRIPS
    if (busType === 'vip') {
      console.log(`🥇 BUS VIP: Tous les ${insertedSeats.length} sièges sont VIP (prix de base, aucun supplément)`);
    } else {
      console.log(`🎫 BUS STANDARD: Tous les ${insertedSeats.length} sièges sont Standard (prix de base, aucun supplément)`);
    }

    return insertedSeats;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des sièges:', error);
    throw error;
  }
};

/**
 * Synchronise la table seat_maps avec les réservations existantes
 * Utile après la création d'un voyage pour mettre à jour les sièges occupés
 * @param {string} tripId - ID du voyage
 */
export const syncSeatMapWithExistingBookings = async (tripId) => {
  try {
    console.log('🔄 Synchronisation seat_maps avec les réservations existantes...');
    
    // 1. Récupérer toutes les réservations pour ce voyage
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('seat_number')
      .eq('trip_id', tripId)
      .not('seat_number', 'is', null);

    if (bookingsError) throw bookingsError;

    const occupiedSeatNumbers = bookings.map(b => b.seat_number);
    console.log('📋 Sièges réservés trouvés:', occupiedSeatNumbers);

    // 2. Mettre à jour seat_maps pour marquer les sièges occupés comme indisponibles
    if (occupiedSeatNumbers.length > 0) {
      const { error: updateError } = await supabase
        .from('seat_maps')
        .update({ is_available: false })
        .eq('trip_id', tripId)
        .in('seat_number', occupiedSeatNumbers);

      if (updateError) throw updateError;
    }

    // 3. S'assurer que tous les autres sièges sont marqués comme disponibles
    const { error: availableUpdateError } = await supabase
      .from('seat_maps')
      .update({ is_available: true })
      .eq('trip_id', tripId)
      .not('seat_number', 'in', occupiedSeatNumbers.length > 0 ? occupiedSeatNumbers : ['']);

    if (availableUpdateError) throw availableUpdateError;

    console.log('✅ Synchronisation seat_maps terminée');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation seat_maps:', error);
    throw error;
  }
};

/**
 * Vérifie la cohérence entre seat_maps et bookings pour un voyage
 * @param {string} tripId - ID du voyage
 * @returns {Object} - Rapport de cohérence
 */
export const validateSeatMapConsistency = async (tripId) => {
  try {
    // Récupérer les données des deux tables
    const [seatMapsResult, bookingsResult] = await Promise.all([
      supabase
        .from('seat_maps')
        .select('seat_number, is_available')
        .eq('trip_id', tripId),
      supabase
        .from('bookings')
        .select('seat_number')
        .eq('trip_id', tripId)
        .not('seat_number', 'is', null)
    ]);

    if (seatMapsResult.error) throw seatMapsResult.error;
    if (bookingsResult.error) throw bookingsResult.error;

    const seatMaps = seatMapsResult.data || [];
    const bookings = bookingsResult.data || [];

    // Analyser les incohérences
    const bookedSeats = new Set(bookings.map(b => b.seat_number));
    const UNAVAILABLE_SEATS = new Set(
      seatMaps
        .filter(s => !s.is_available)
        .map(s => s.seat_number)
    );

    const inconsistencies = {
      seatsBookedButAvailable: [], // Sièges réservés mais marqués disponibles
      seatsUnavailableButNotBooked: [], // Sièges indisponibles mais pas réservés
      missingFromSeatMaps: [] // Sièges réservés mais absents de seat_maps
    };

    // Vérifier les incohérences
    bookings.forEach(booking => {
      const seatInMap = seatMaps.find(s => s.seat_number === booking.seat_number);
      if (!seatInMap) {
        inconsistencies.missingFromSeatMaps.push(booking.seat_number);
      } else if (seatInMap.is_available) {
        inconsistencies.seatsBookedButAvailable.push(booking.seat_number);
      }
    });

    seatMaps.forEach(seat => {
      if (!seat.is_available && !bookedSeats.has(seat.seat_number)) {
        inconsistencies.seatsUnavailableButNotBooked.push(seat.seat_number);
      }
    });

    return {
      isConsistent: Object.values(inconsistencies).every(arr => arr.length === 0),
      inconsistencies,
      totalSeatsInMap: seatMaps.length,
      totalBookings: bookings.length,
      availableSeats: seatMaps.filter(s => s.is_available).length
    };
  } catch (error) {
    console.error('Erreur lors de la validation de cohérence:', error);
    throw error;
  }
};

/**
 * Obtient les statistiques des sièges pour un voyage
 * @param {string} tripId - ID du voyage
 * @returns {Object} - Statistiques des sièges
 */
export const getTripSeatStatistics = async (tripId) => {
  try {
    // Récupérer les données en parallèle
    const [seatMapsResult, bookingsResult] = await Promise.all([
      supabase
        .from('seat_maps')
        .select('seat_number, is_available')
        .eq('trip_id', tripId),
      supabase
        .from('bookings')
        .select('seat_number')
        .eq('trip_id', tripId)
        .not('seat_number', 'is', null)
    ]);

    if (seatMapsResult.error) throw seatMapsResult.error;
    if (bookingsResult.error) throw bookingsResult.error;

    const seatMaps = seatMapsResult.data || [];
    const bookings = bookingsResult.data || [];

    const totalSeats = seatMaps.length;
    const occupiedSeats = seatMaps.filter(seat => !seat.is_available).length;
    const confirmedBookings = bookings.length;

    return {
      totalSeats,
      occupiedSeats,
      availableSeats: totalSeats - occupiedSeats,
      confirmedBookings,
      occupancyRate: totalSeats > 0 ? (occupiedSeats / totalSeats * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalSeats: 0,
      occupiedSeats: 0,
      availableSeats: 0,
      confirmedBookings: 0,
      occupancyRate: 0
    };
  }
};
