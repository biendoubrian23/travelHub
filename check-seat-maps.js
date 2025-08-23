/**
 * Script de vérification rapide pour voir l'état de seat_maps
 * À exécuter avec: node check-seat-maps.js
 */

console.log('🔍 VÉRIFICATION RAPIDE DE SEAT_MAPS');
console.log('==================================');

console.log('\n📋 Instructions:');
console.log('1. Aller dans votre interface web TravelHub');
console.log('2. Ouvrir la console navigateur (F12)');
console.log('3. Exécuter cette commande:');
console.log('');
console.log('// --- COPIER CETTE COMMANDE DANS LA CONSOLE NAVIGATEUR ---');
console.log('');
console.log(`
async function checkSeatMaps() {
  console.log('🔍 Vérification de seat_maps...');
  
  // Récupérer tous les trajets récents
  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('id, departure_city, arrival_city, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (tripsError) {
    console.error('❌ Erreur trajets:', tripsError);
    return;
  }
  
  console.log(\`📊 \${trips.length} trajets récents trouvés\`);
  
  for (const trip of trips) {
    const { data: seats, error: seatsError } = await supabase
      .from('seat_maps')
      .select('id')
      .eq('trip_id', trip.id);
      
    const seatCount = seats ? seats.length : 0;
    const status = seatCount > 0 ? '✅' : '❌';
    
    console.log(\`\${status} Trajet \${trip.id}: \${trip.departure_city} → \${trip.arrival_city} (\${seatCount} sièges)\`);
  }
  
  // Vérifier le nombre total d'entrées dans seat_maps
  const { count, error: countError } = await supabase
    .from('seat_maps')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('❌ Erreur count:', countError);
  } else {
    console.log(\`\\n📊 Total dans seat_maps: \${count || 0} entrées\`);
  }
}

checkSeatMaps();
`);
console.log('');
console.log('// --- FIN DE LA COMMANDE ---');
console.log('');
console.log('💡 Cela vous dira quels trajets ont des sièges configurés');
console.log('💡 Si aucun trajet n\'a de sièges, le problème est dans l\'initialisation automatique');
console.log('');
