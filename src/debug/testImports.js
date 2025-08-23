/**
 * Script de test simple pour vérifier l'import de seatMapUtils
 * Pour diagnostiquer les problèmes d'import dans TripFormModal
 */

// Test d'import simple
try {
  console.log('🔍 Test d\'import de seatMapUtils...');
  
  // Simuler l'import comme dans TripFormModal
  const { initializeSeatMapForTrip } = await import('../utils/seatMapUtils.js');
  
  console.log('✅ Import réussi');
  console.log('📋 Fonction disponible:', typeof initializeSeatMapForTrip);
  
  if (typeof initializeSeatMapForTrip === 'function') {
    console.log('✅ La fonction initializeSeatMapForTrip est correctement importée');
  } else {
    console.log('❌ La fonction initializeSeatMapForTrip n\'est pas une fonction');
  }
  
} catch (error) {
  console.error('❌ Erreur d\'import:', error);
}

// Test d'import de supabase
try {
  console.log('\n🔍 Test d\'import de supabase...');
  
  const { supabase } = await import('../lib/supabase.js');
  
  console.log('✅ Supabase importé');
  console.log('📋 Client disponible:', !!supabase);
  
  if (supabase) {
    console.log('✅ Client Supabase prêt');
  } else {
    console.log('❌ Client Supabase non disponible');
  }
  
} catch (error) {
  console.error('❌ Erreur d\'import Supabase:', error);
}

export { };  // Pour faire de ce fichier un module
