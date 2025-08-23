/**
 * Script de test pour valider la correction bus_type → seat_type
 */

console.log('🧪 TEST DE CORRECTION BUS_TYPE → SEAT_TYPE');
console.log('==========================================');

console.log('\n📋 Pour tester la correction, exécutez ceci dans la console navigateur:');
console.log('');
console.log('// --- COPIER DANS LA CONSOLE NAVIGATEUR ---');
console.log(`
async function testBusTypeFix() {
  console.log('🔧 Test de la correction bus_type → seat_type');
  
  // 1. Récupérer le trajet VIP récent
  const { data: vipTrip, error: tripError } = await supabase
    .from('trips')
    .select('id, bus_type, departure_city, arrival_city')
    .eq('bus_type', 'vip')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (tripError) {
    console.error('❌ Erreur récupération trajet VIP:', tripError);
    return;
  }
  
  console.log('📋 Trajet VIP trouvé:', vipTrip);
  console.log(\`🎯 Bus type dans trips: \${vipTrip.bus_type}\`);
  
  // 2. Vérifier les seat_type dans seat_maps pour ce trajet
  const { data: seats, error: seatsError } = await supabase
    .from('seat_maps')
    .select('seat_type, seat_number')
    .eq('trip_id', vipTrip.id)
    .limit(5);
    
  if (seatsError) {
    console.error('❌ Erreur sièges:', seatsError);
    return;
  }
  
  if (!seats || seats.length === 0) {
    console.log('⚠️ Aucun siège trouvé pour ce trajet');
    return;
  }
  
  console.log(\`📊 \${seats.length} sièges vérifiés:\`);
  
  const seatTypes = [...new Set(seats.map(s => s.seat_type))];
  
  for (const type of seatTypes) {
    const count = seats.filter(s => s.seat_type === type).length;
    console.log(\`   \${type}: \${count} sièges\`);
  }
  
  // 3. Validation
  if (vipTrip.bus_type === 'vip') {
    const allVip = seats.every(s => s.seat_type === 'vip');
    if (allVip) {
      console.log('✅ SUCCÈS: Tous les sièges sont VIP comme le bus !');
    } else {
      console.log('❌ PROBLÈME: Certains sièges ne sont pas VIP alors que le bus est VIP');
      console.log('🔧 Solution: Recréer les sièges avec la fonction corrigée');
    }
  }
}

testBusTypeFix();
`);

console.log('');
console.log('// --- FIN DE LA COMMANDE ---');
console.log('');
console.log('💡 Si le problème persiste, il faut supprimer les anciens sièges');
console.log('💡 et laisser la fonction corrigée les recréer automatiquement');
console.log('');
