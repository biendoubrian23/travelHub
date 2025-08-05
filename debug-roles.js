// Debug script pour tester les rôles utilisateur
// A ajouter temporairement dans TripForm.jsx pour debug

console.log('🔍 DEBUG ROLES dans TripForm:');
console.log('  - userRole:', userRole);
console.log('  - userRole !== "driver":', userRole !== 'driver');
console.log('  - Checkbox visible:', userRole !== 'driver');

// Pour tester différents rôles:
// patron - doit voir la checkbox
// manager - doit voir la checkbox  
// employee - doit voir la checkbox
// driver - NE doit PAS voir la checkbox
