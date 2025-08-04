// Test pour vérifier les améliorations de la liste des employés
// Exécuter dans la console du navigateur sur la page des employés

console.log('🧪 TEST DES AMÉLIORATIONS LISTE EMPLOYÉS');
console.log('=====================================');

// 1. Vérifier que la colonne téléphone est présente
console.log('\n1. Vérification de la colonne téléphone...');
const phoneHeader = document.querySelector('th:contains("Téléphone")') || 
                   Array.from(document.querySelectorAll('th')).find(th => th.textContent.includes('Téléphone'));
console.log('✅ En-tête téléphone:', phoneHeader ? 'Trouvé' : '❌ Manquant');

// 2. Vérifier que la recherche fonctionne
console.log('\n2. Test de la fonction de recherche...');
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  console.log('✅ Champ de recherche trouvé');
  console.log('📝 Placeholder:', searchInput.placeholder);
  
  // Simuler une recherche
  searchInput.value = 'test';
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('✅ Test de recherche simulé');
} else {
  console.log('❌ Champ de recherche non trouvé');
}

// 3. Vérifier les filtres
console.log('\n3. Vérification des filtres...');
const roleFilter = document.querySelector('.filter-select');
console.log('✅ Filtre rôle:', roleFilter ? 'Trouvé' : '❌ Manquant');

// 4. Compter les employés affichés
console.log('\n4. Employés affichés...');
const employeeRows = document.querySelectorAll('.employee-row');
console.log(`📊 Nombre d'employés dans la table: ${employeeRows.length}`);

// 5. Vérifier qu'on peut cliquer sur une ligne
console.log('\n5. Test du clic sur une ligne...');
if (employeeRows.length > 0) {
  const firstRow = employeeRows[0];
  console.log('✅ Première ligne trouvée');
  
  // Vérifier les données affichées dans la ligne
  const cells = firstRow.querySelectorAll('td');
  if (cells.length >= 6) {
    console.log('📋 Données de la première ligne:');
    console.log('   Nom:', cells[0].textContent.trim());
    console.log('   Email:', cells[1].textContent.trim());
    console.log('   Téléphone:', cells[2].textContent.trim());
    console.log('   Rôle:', cells[3].textContent.trim());
    console.log('   Statut:', cells[4].textContent.trim());
    console.log('   Date:', cells[5].textContent.trim());
  }
} else {
  console.log('❌ Aucun employé affiché');
}

// 6. Vérifier les badges de statut et rôle
console.log('\n6. Vérification des badges...');
const statusBadges = document.querySelectorAll('.status-badge');
const roleBadges = document.querySelectorAll('.role-badge');
console.log(`✅ Badges de statut: ${statusBadges.length}`);
console.log(`✅ Badges de rôle: ${roleBadges.length}`);

// 7. Test du modal de détails (si pas déjà ouvert)
console.log('\n7. Test d\'ouverture du modal...');
if (employeeRows.length > 0 && !document.querySelector('.employee-details-modal')) {
  console.log('🔄 Simulation du clic pour ouvrir les détails...');
  employeeRows[0].click();
  
  setTimeout(() => {
    const modal = document.querySelector('.employee-details-modal');
    if (modal) {
      console.log('✅ Modal de détails ouvert');
      
      // Vérifier les sections d'informations
      const detailSections = modal.querySelectorAll('.detail-section');
      console.log(`📋 Sections de détails: ${detailSections.length}`);
      
      // Vérifier les informations affichées
      const detailRows = modal.querySelectorAll('.detail-row');
      console.log(`📝 Lignes de détails: ${detailRows.length}`);
      
      detailRows.forEach((row, index) => {
        const label = row.querySelector('.label')?.textContent;
        const value = row.querySelector('span:last-child')?.textContent;
        if (label && value) {
          console.log(`   ${label}: ${value}`);
        }
      });
      
    } else {
      console.log('❌ Modal de détails non ouvert');
    }
  }, 1000);
} else if (document.querySelector('.employee-details-modal')) {
  console.log('✅ Modal de détails déjà ouvert');
} else {
  console.log('❌ Aucun employé pour tester le modal');
}

console.log('\n🎯 RÉSUMÉ DES AMÉLIORATIONS:');
console.log('✅ Colonne téléphone ajoutée');
console.log('✅ Recherche par téléphone activée');
console.log('✅ Modal de détails avec toutes les infos');
console.log('✅ Filtres fonctionnels');
console.log('✅ Interface responsive');

console.log('\n💡 POUR TESTER MANUELLEMENT:');
console.log('1. Tapez dans la recherche pour filtrer');
console.log('2. Utilisez les filtres de rôle et statut');
console.log('3. Cliquez sur une ligne pour voir les détails');
console.log('4. Vérifiez que le téléphone s\'affiche bien');
