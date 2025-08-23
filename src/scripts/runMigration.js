#!/usr/bin/env node

/**
 * Script de migration Seat Maps - Exécution directe VSCode
 * Usage: node src/scripts/runMigration.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration des variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configuration Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Génère les données par défaut pour un siège
 */
const generateSeatData = (tripId, seatNumber, isOccupied) => {
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
};

/**
 * Migre un seul voyage
 */
async function migrateSingleTrip(tripId) {
  try {
    console.log(`🔄 Migration du voyage ${tripId}...`);

    // Vérifier si le voyage a déjà des sièges
    const { data: existingSeats, error: checkError } = await supabase
      .from('seat_maps')
      .select('seat_number')
      .eq('trip_id', tripId);

    if (checkError) throw checkError;

    if (existingSeats && existingSeats.length > 0) {
      console.log(`⚠️  Le voyage ${tripId} a déjà ${existingSeats.length} sièges configurés - ignoré`);
      return { skipped: true, count: existingSeats.length };
    }

    // Récupérer les informations du voyage
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, bus_id, buses(total_seats)')
      .eq('id', tripId)
      .single();

    if (tripError) throw tripError;

    // Récupérer les réservations existantes
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('seat_number')
      .eq('trip_id', tripId)
      .not('seat_number', 'is', null);

    if (bookingError) throw bookingError;

    const occupiedSeats = (bookings || []).map(b => b.seat_number);
    const totalSeats = trip.buses?.total_seats || 40;

    // Créer les données des sièges
    const seatData = [];
    for (let i = 1; i <= totalSeats; i++) {
      const seatNumber = i.toString();
      const isOccupied = occupiedSeats.includes(seatNumber);
      const seat = generateSeatData(tripId, seatNumber, isOccupied);
      seatData.push(seat);
    }

    // Insérer les sièges
    const { data: insertedSeats, error: insertError } = await supabase
      .from('seat_maps')
      .insert(seatData)
      .select();

    if (insertError) throw insertError;

    const occupiedCount = insertedSeats.filter(s => !s.is_available).length;
    
    console.log(`✅ Voyage ${tripId} migré avec succès:`);
    console.log(`   - ${insertedSeats.length} sièges créés`);
    console.log(`   - ${occupiedCount} sièges occupés`);
    console.log(`   - ${insertedSeats.length - occupiedCount} sièges disponibles`);

    return {
      success: true,
      tripId,
      totalSeats: insertedSeats.length,
      occupiedSeats: occupiedCount
    };

  } catch (error) {
    console.error(`❌ Erreur migration voyage ${tripId}:`, error.message);
    return { success: false, tripId, error: error.message };
  }
}

/**
 * Vérifie l'état de la migration
 */
async function checkMigrationStatus() {
  try {
    console.log('📊 VÉRIFICATION DE L\'ÉTAT DE LA MIGRATION');
    console.log('==========================================');

    // Compter tous les voyages
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

    console.log(`📋 Total voyages: ${totalTrips}`);
    console.log(`✅ Voyages avec seat_maps: ${uniqueTripsWithSeats}`);
    console.log(`⚠️  Voyages sans seat_maps: ${tripsWithoutSeats}`);

    if (tripsWithoutSeats > 0) {
      console.log(`\n🔧 ${tripsWithoutSeats} voyages nécessitent une migration`);
    } else {
      console.log(`\n✅ Tous les voyages ont leurs seat_maps configurés`);
    }

    return {
      totalTrips,
      tripsWithSeats: uniqueTripsWithSeats,
      tripsWithoutSeats,
      migrationNeeded: tripsWithoutSeats > 0
    };

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    throw error;
  }
}

/**
 * Migration complète de tous les voyages
 */
async function migrateAllTrips() {
  try {
    console.log('🚀 DÉMARRAGE MIGRATION COMPLÈTE');
    console.log('================================');

    // 1. Vérifier l'état initial
    const status = await checkMigrationStatus();
    
    if (status.tripsWithoutSeats === 0) {
      console.log('✅ Aucune migration nécessaire');
      return { message: 'Aucune migration nécessaire' };
    }

    // 2. Récupérer les voyages sans seat_maps
    const { data: tripsWithoutSeats, error: queryError } = await supabase
      .from('trips')
      .select('id, departure_city, arrival_city, departure_date')
      .not('id', 'in', `(
        SELECT DISTINCT trip_id 
        FROM seat_maps 
        WHERE trip_id IS NOT NULL
      )`);

    if (queryError) throw queryError;

    console.log(`\n🔄 Migration de ${tripsWithoutSeats.length} voyages...`);

    // 3. Migrer chaque voyage
    const results = {
      success: [],
      errors: [],
      skipped: []
    };

    for (let i = 0; i < tripsWithoutSeats.length; i++) {
      const trip = tripsWithoutSeats[i];
      
      console.log(`\n[${i + 1}/${tripsWithoutSeats.length}] ${trip.departure_city} → ${trip.arrival_city} (${trip.departure_date})`);
      
      const result = await migrateSingleTrip(trip.id);
      
      if (result.success) {
        results.success.push(result);
      } else if (result.skipped) {
        results.skipped.push(result);
      } else {
        results.errors.push(result);
      }

      // Pause entre migrations
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 4. Rapport final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RAPPORT FINAL');
    console.log('='.repeat(50));
    console.log(`✅ Migrations réussies: ${results.success.length}`);
    console.log(`⚠️  Migrations ignorées: ${results.skipped.length}`);
    console.log(`❌ Erreurs: ${results.errors.length}`);

    if (results.success.length > 0) {
      const totalSeats = results.success.reduce((sum, r) => sum + r.totalSeats, 0);
      const totalOccupied = results.success.reduce((sum, r) => sum + r.occupiedSeats, 0);
      console.log(`\n📈 STATISTIQUES:`);
      console.log(`   - Sièges créés: ${totalSeats}`);
      console.log(`   - Sièges occupés: ${totalOccupied}`);
      console.log(`   - Sièges disponibles: ${totalSeats - totalOccupied}`);
    }

    if (results.errors.length > 0) {
      console.log(`\n❌ ERREURS:`);
      results.errors.forEach(error => {
        console.log(`   - ${error.tripId}: ${error.error}`);
      });
    }

    return results;

  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error.message);
    throw error;
  }
}

// Gestion des arguments de ligne de commande
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'check':
      case 'status':
        await checkMigrationStatus();
        break;
        
      case 'migrate':
        if (args[1]) {
          // Migration d'un voyage spécifique
          const tripId = args[1];
          console.log(`🎯 Migration du voyage spécifique: ${tripId}`);
          await migrateSingleTrip(tripId);
        } else {
          // Migration complète
          await migrateAllTrips();
        }
        break;
        
      default:
        console.log('🔧 SCRIPT DE MIGRATION SEAT_MAPS');
        console.log('=================================');
        console.log('');
        console.log('Usage:');
        console.log('  node src/scripts/runMigration.js check           # Vérifier l\'état');
        console.log('  node src/scripts/runMigration.js migrate         # Migrer tous les voyages');
        console.log('  node src/scripts/runMigration.js migrate TRIP_ID # Migrer un voyage spécifique');
        console.log('');
        console.log('Exemples:');
        console.log('  node src/scripts/runMigration.js check');
        console.log('  node src/scripts/runMigration.js migrate');
        console.log('  node src/scripts/runMigration.js migrate abc123-def456-789');
    }
  } catch (error) {
    console.error('💥 Erreur d\'exécution:', error.message);
    process.exit(1);
  }
}

main();
