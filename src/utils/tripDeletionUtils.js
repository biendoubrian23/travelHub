/**
 * GESTION SÉCURISÉE DE LA SUPPRESSION DE TRAJETS
 * 
 * Ce module gère la suppression sécurisée des trajets avec :
 * - Vérification des réservations existantes
 * - Gestion des remboursements
 * - Nettoyage des données liées
 * - Notifications aux passagers
 * - Audit trail complet
 */

import { supabase } from '../lib/supabase';

/**
 * Vérifie si un trajet peut être supprimé en toute sécurité
 * @param {string} tripId - ID du trajet
 * @returns {Object} - Statut et détails
 */
export const checkTripDeletionSafety = async (tripId) => {
  try {
    console.log(`🔍 Vérification sécurité suppression trajet ${tripId}...`);

    // 1. Récupérer les informations du trajet
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select(`
        id, 
        departure_city, 
        arrival_city, 
        departure_time,
        arrival_time,
        price_fcfa,
        total_seats,
        available_seats,
        bus_type,
        is_active
      `)
      .eq('id', tripId)
      .single();

    if (tripError) throw tripError;
    if (!trip) throw new Error('Trajet introuvable');

    // 2. Vérifier les réservations existantes
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id, 
        user_id,
        passenger_name, 
        passenger_phone, 
        seat_number, 
        booking_status,
        payment_status,
        total_price_fcfa,
        created_at,
        users(email)
      `)
      .eq('trip_id', tripId);

    if (bookingsError) throw bookingsError;

    // 3. Vérifier les seat_maps
    const { data: seatMaps, error: seatMapsError } = await supabase
      .from('seat_maps')
      .select('id, seat_number, is_available')
      .eq('trip_id', tripId);

    if (seatMapsError) throw seatMapsError;

    // 4. Calculer les impacts
    const confirmedBookings = bookings.filter(b => b.booking_status === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.total_price_fcfa || 0), 0);
    const departureDateTime = new Date(trip.departure_time); // departure_time contient déjà la date complète
    const now = new Date();
    const hoursToDeparture = (departureDateTime - now) / (1000 * 60 * 60);

    // 5. Déterminer la sécurité de suppression
    const canDelete = {
      hasBookings: bookings.length > 0,
      confirmedBookingsCount: confirmedBookings.length,
      totalRevenue,
      hoursToDeparture: Math.round(hoursToDeparture),
      isDeparted: hoursToDeparture < 0,
      isImminent: hoursToDeparture < 24 && hoursToDeparture > 0,
      requiresRefund: confirmedBookings.length > 0 && totalRevenue > 0
    };

    // 6. Recommandations de sécurité
    let safetyLevel = 'SAFE';
    let warnings = [];
    let actions = [];

    if (canDelete.hasBookings) {
      safetyLevel = 'WARNING';
      warnings.push(`${bookings.length} réservation(s) existante(s)`);
      actions.push('Notifier les passagers');
    }

    if (canDelete.requiresRefund) {
      safetyLevel = 'CRITICAL';
      warnings.push(`${totalRevenue.toLocaleString()} FCFA à rembourser`);
      actions.push('Gérer les remboursements');
    }

    if (canDelete.isImminent) {
      safetyLevel = 'CRITICAL';
      warnings.push('Départ dans moins de 24h');
      actions.push('Contact d\'urgence obligatoire');
    }

    if (canDelete.isDeparted) {
      safetyLevel = 'FORBIDDEN';
      warnings.push('Trajet déjà parti');
      actions.push('Suppression interdite');
    }

    return {
      success: true,
      trip,
      bookings,
      seatMaps: seatMaps || [],
      safety: {
        level: safetyLevel,
        canDelete: safetyLevel !== 'FORBIDDEN',
        warnings,
        actions,
        ...canDelete
      }
    };

  } catch (error) {
    console.error('Erreur vérification sécurité:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Supprime un trajet de manière sécurisée avec nettoyage complet
 * @param {string} tripId - ID du trajet
 * @param {Object} options - Options de suppression
 */
export const safeTripDeletion = async (tripId, options = {}) => {
  const {
    forceDelete = false,           // Forcer même avec réservations
    notifyPassengers = true,       // Notifier les passagers
    processRefunds = true,         // Traiter les remboursements
    reason = 'Suppression administrative'
  } = options;

  try {
    console.log(`🗑️ Suppression sécurisée du trajet ${tripId}...`);

    // 1. Vérifier la sécurité
    const safetyCheck = await checkTripDeletionSafety(tripId);
    
    if (!safetyCheck.success) {
      throw new Error(`Vérification échouée: ${safetyCheck.error}`);
    }

    const { trip, bookings, safety } = safetyCheck;

    // 2. Bloquer si trajet déjà parti
    if (safety.level === 'FORBIDDEN') {
      throw new Error('Impossible de supprimer un trajet déjà parti');
    }

    // 3. Vérifier les permissions pour suppression forcée
    if (safety.level === 'CRITICAL' && !forceDelete) {
      return {
        success: false,
        requiresConfirmation: true,
        safety,
        message: 'Suppression critique - confirmation requise'
      };
    }

    const deletionLog = {
      tripId,
      tripDetails: trip,
      bookingsAffected: bookings.length,
      reason,
      timestamp: new Date().toISOString(),
      actions: []
    };

    // 4. Traiter les réservations existantes
    if (bookings.length > 0) {
      console.log(`📧 Traitement de ${bookings.length} réservation(s)...`);

      for (const booking of bookings) {
        try {
          // Marquer la réservation comme annulée au lieu de la supprimer
          const { error: cancelError } = await supabase
            .from('bookings')
            .update({
              booking_status: 'cancelled'
            })
            .eq('id', booking.id);

          if (cancelError) throw cancelError;

          deletionLog.actions.push({
            type: 'booking_cancelled',
            bookingId: booking.id,
            passenger: booking.passenger_name,
            seat: booking.seat_number
          });

          // Notification passager (simulation - à implémenter selon votre système)
          if (notifyPassengers && booking.passenger_phone) {
            console.log(`📱 Notification à ${booking.passenger_name} (${booking.passenger_phone})`);
            deletionLog.actions.push({
              type: 'passenger_notified',
              passenger: booking.passenger_name,
              contact: booking.passenger_phone
            });
          }

          // Gestion remboursement (simulation - à implémenter selon votre système)
          if (processRefunds && booking.payment_status === 'paid' && booking.total_price_fcfa > 0) {
            console.log(`💰 Remboursement ${booking.total_price_fcfa} FCFA pour ${booking.passenger_name}`);
            deletionLog.actions.push({
              type: 'refund_initiated',
              amount: booking.total_price_fcfa,
              passenger: booking.passenger_name
            });
          }

        } catch (bookingError) {
          console.error(`Erreur traitement réservation ${booking.id}:`, bookingError);
          deletionLog.actions.push({
            type: 'booking_error',
            bookingId: booking.id,
            error: bookingError.message
          });
        }
      }
    }

    // 5. Supprimer les seat_maps associés
    const { error: seatMapsError } = await supabase
      .from('seat_maps')
      .delete()
      .eq('trip_id', tripId);

    if (seatMapsError) {
      console.warn('Erreur suppression seat_maps:', seatMapsError);
    } else {
      console.log(`🪑 ${safetyCheck.seatMaps.length} seat_maps supprimés`);
      deletionLog.actions.push({
        type: 'seat_maps_deleted',
        count: safetyCheck.seatMaps.length
      });
    }

    // 6. Supprimer le trajet principal
    const { error: tripDeleteError } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (tripDeleteError) throw tripDeleteError;

    deletionLog.actions.push({
      type: 'trip_deleted',
      tripId: tripId
    });

    // 7. Enregistrer dans les logs d'audit (si table existe)
    try {
      await supabase
        .from('audit_logs')
        .insert({
          action: 'trip_deletion',
          table_name: 'trips',
          record_id: tripId,
          old_values: trip,
          new_values: null,
          reason,
          metadata: deletionLog
        });
    } catch (auditError) {
      console.warn('Impossible d\'enregistrer dans audit_logs:', auditError.message);
    }

    console.log(`✅ Trajet ${tripId} supprimé avec succès`);
    console.log(`📊 Actions effectuées: ${deletionLog.actions.length}`);

    return {
      success: true,
      deletionLog,
      message: `Trajet supprimé avec ${bookings.length} réservation(s) traitée(s)`
    };

  } catch (error) {
    console.error('Erreur suppression sécurisée:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Interface simple pour la suppression avec confirmation
 * @param {string} tripId - ID du trajet  
 * @param {Function} confirmCallback - Callback de confirmation
 */
export const requestTripDeletion = async (tripId, confirmCallback) => {
  try {
    // 1. Vérifier la sécurité
    const safetyCheck = await checkTripDeletionSafety(tripId);
    
    if (!safetyCheck.success) {
      throw new Error(safetyCheck.error);
    }

    const { trip, safety } = safetyCheck;

    // 2. Construire le message de confirmation
    let confirmMessage = `Êtes-vous sûr de vouloir supprimer le trajet ?\n\n`;
    confirmMessage += `🚌 ${trip.departure_city} → ${trip.arrival_city}\n`;
    confirmMessage += `📅 ${new Date(trip.departure_time).toLocaleDateString('fr-FR')} à ${new Date(trip.departure_time).toLocaleTimeString('fr-FR')}\n\n`;

    if (safety.warnings.length > 0) {
      confirmMessage += `⚠️ ATTENTION :\n`;
      safety.warnings.forEach(warning => {
        confirmMessage += `• ${warning}\n`;
      });
      confirmMessage += `\n`;
    }

    if (safety.actions.length > 0) {
      confirmMessage += `📋 Actions qui seront effectuées :\n`;
      safety.actions.forEach(action => {
        confirmMessage += `• ${action}\n`;
      });
    }

    // 3. Demander confirmation selon le niveau de sécurité
    if (safety.level === 'SAFE') {
      if (confirmCallback(confirmMessage)) {
        return await safeTripDeletion(tripId);
      }
    } else if (safety.level === 'WARNING') {
      confirmMessage += `\nContinuer la suppression ?`;
      if (confirmCallback(confirmMessage)) {
        return await safeTripDeletion(tripId, { forceDelete: true });
      }
    } else if (safety.level === 'CRITICAL') {
      confirmMessage += `\n🚨 SUPPRESSION CRITIQUE - Tapez "SUPPRIMER" pour confirmer`;
      // Nécessite une confirmation spéciale
      return {
        success: false,
        requiresSpecialConfirmation: true,
        safety,
        message: confirmMessage
      };
    }

    return { success: false, cancelled: true };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  checkTripDeletionSafety,
  safeTripDeletion,
  requestTripDeletion
};
