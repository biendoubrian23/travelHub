/**
 * Script de test pour vérifier le nouveau format d'email des employés
 */

// Fonction de test pour simuler la génération d'email
function testEmailGeneration() {
  const testCases = [
    {
      firstName: 'Jean',
      lastName: 'Dupont', 
      agencyName: 'Mon Agence',
      expected: 'jean.dupont@monagence.com'
    },
    {
      firstName: 'Marie',
      lastName: 'Martin',
      agencyName: 'Voyages Plus',
      expected: 'marie.martin@voyagesplus.com'
    },
    {
      firstName: 'Paul',
      lastName: 'Biyong',
      agencyName: 'Afrique Travel',
      expected: 'paul.biyong@afriquetravel.com'
    }
  ];

  console.log('🧪 Test du nouveau format d\'email des employés\n');
  console.log('Format attendu: nom.prenom@agence.com (sans travelhub)\n');
  
  testCases.forEach((testCase, index) => {
    // Simulation de la logique de génération d'email
    const firstName = testCase.firstName.toLowerCase();
    const lastName = testCase.lastName.toLowerCase(); 
    const agencyName = testCase.agencyName.toLowerCase().replace(/\s+/g, '');
    const generatedEmail = `${firstName}.${lastName}@${agencyName}.com`;
    
    console.log(`Test ${index + 1}:`);
    console.log(`  Employé: ${testCase.firstName} ${testCase.lastName}`);
    console.log(`  Agence: ${testCase.agencyName}`);
    console.log(`  Email généré: ${generatedEmail}`);
    console.log(`  Email attendu: ${testCase.expected}`);
    console.log(`  ✅ ${generatedEmail === testCase.expected ? 'SUCCÈS' : 'ÉCHEC'}\n`);
  });
}

// Exemples de comparaison ancien vs nouveau format
function showFormatComparison() {
  console.log('📧 Comparaison Ancien vs Nouveau Format\n');
  
  const examples = [
    { firstName: 'Jean', lastName: 'Dupont', agency: 'MonAgence' },
    { firstName: 'Marie', lastName: 'Martin', agency: 'VoyagesPlus' },
    { firstName: 'Paul', lastName: 'Biyong', agency: 'AfriqueTravel' }
  ];
  
  examples.forEach((example, index) => {
    const oldFormat = `${example.firstName.toLowerCase()}.${example.lastName.toLowerCase()}@${example.agency.toLowerCase()}.travelhub.com`;
    const newFormat = `${example.firstName.toLowerCase()}.${example.lastName.toLowerCase()}@${example.agency.toLowerCase()}.com`;
    
    console.log(`Exemple ${index + 1}:`);
    console.log(`  ❌ Ancien: ${oldFormat}`);
    console.log(`  ✅ Nouveau: ${newFormat}\n`);
  });
}

// Exécution des tests si ce script est lancé directement
if (typeof window === 'undefined') {
  // Environnement Node.js
  testEmailGeneration();
  showFormatComparison();
} else {
  // Environnement navigateur - exposer les fonctions globalement
  window.testEmailGeneration = testEmailGeneration;
  window.showFormatComparison = showFormatComparison;
  
  console.log('📧 Fonctions de test d\'email disponibles:');
  console.log('- testEmailGeneration()');
  console.log('- showFormatComparison()');
}

export { testEmailGeneration, showFormatComparison };
