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
 * Génère les données par défaut pour un siège
 * @param {string} tripId - ID du voyage
 * @param {string} seatNumber - Numéro du siège
 * @param {boolean} isOccupied - Statut d'occupation
 */
const generateSeatData = (tripId, seatNumber, isOccupied) => {
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
    seat_type: 'standard',
    is_available: !isOccupied,
    price_modifier_fcfa: 0
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
    console.error('Erreur lors de la création de réservation avec sync:', error);
    throw error;
  }
};

/**
 * Annule une réservation et libère le siège
 * @param {string} bookingId - ID de la réservation
 * @param {string} tripId - ID du voyage
 * @param {string} seatNumber - Numéro du siège
 */
export const cancelBookingWithSeatSync = async (bookingId, tripId, seatNumber) => {
  try {
    // 1. Annuler la réservation
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ 
        booking_status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingError) throw bookingError;

    // 2. Libérer le siège
    await syncSeatMapWithBooking(tripId, seatNumber, false);

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'annulation avec sync:', error);
    throw error;
  }
};

/**
 * Récupère tous les sièges occupés pour un voyage
 * @param {string} tripId - ID du voyage
 */
export const getOccupiedSeatsForTrip = async (tripId) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('seat_number')
      .eq('trip_id', tripId)
      .in('booking_status', ['confirmed', 'pending'])
      .not('seat_number', 'is', null);

    if (error) throw error;

    return bookings.map(booking => parseInt(booking.seat_number)).filter(seat => !isNaN(seat));
  } catch (error) {
    console.error('Erreur lors de la récupération des sièges occupés:', error);
    return [];
  }
};

/**
 * Initialise la table seat_maps pour un voyage si elle est vide
 * @param {string} tripId - ID du voyage
 * @param {number} totalSeats - Nombre total de sièges
 */
export const initializeSeatMapForTrip = async (tripId, totalSeats = 50) => {
  try {
    // Vérifier si des sièges existent déjà
    const { data: existingSeats, error: checkError } = await supabase
      .from('seat_maps')
      .select('id')
      .eq('trip_id', tripId)
      .limit(1);

    if (checkError) throw checkError;

    if (existingSeats && existingSeats.length > 0) {
      console.log('Les sièges existent déjà pour ce voyage');
      return;
    }

    // Créer tous les sièges
    const seats = [];
    for (let i = 1; i <= totalSeats; i++) {
      seats.push(generateSeatData(tripId, i.toString(), false));
    }

    const { error: insertError } = await supabase
      .from('seat_maps')
      .insert(seats);

    if (insertError) throw insertError;

    console.log(`Initialisation de ${totalSeats} sièges pour le voyage ${tripId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des sièges:', error);
    throw error;
  }
};

/**
 * Synchronise toutes les réservations existantes avec seat_maps
 * @param {string} tripId - ID du voyage
 */
export const syncAllBookingsWithSeatMap = async (tripId) => {
  try {
    // Récupérer toutes les réservations confirmées
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('seat_number')
      .eq('trip_id', tripId)
      .in('booking_status', ['confirmed', 'pending'])
      .not('seat_number', 'is', null);

    if (bookingsError) throw bookingsError;

    // Synchroniser chaque siège occupé
    for (const booking of bookings) {
      await syncSeatMapWithBooking(tripId, booking.seat_number, true);
    }

    console.log(`Synchronisation de ${bookings.length} réservations avec seat_maps`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la synchronisation complète:', error);
    throw error;
  }
};

/**
 * Obtient les statistiques d'occupation d'un voyage
 * @param {string} tripId - ID du voyage
 */
export const getTripOccupancyStats = async (tripId) => {
  try {
    // Compter les sièges depuis seat_maps
    const { data: seatMaps, error: seatMapsError } = await supabase
      .from('seat_maps')
      .select('is_available')
      .eq('trip_id', tripId);

    if (seatMapsError) throw seatMapsError;

    // Compter les réservations confirmées
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('trip_id', tripId)
      .in('booking_status', ['confirmed', 'pending']);

    if (bookingsError) throw bookingsError;

    const totalSeats = seatMaps?.length || 0;
    const occupiedSeats = seatMaps?.filter(seat => !seat.is_available).length || 0;
    const confirmedBookings = bookings?.length || 0;

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
