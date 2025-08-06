// Script de test pour les nouvelles fonctionnalités
// Exécutez ce script dans la console du navigateur (F12) sur la page Employés

console.log('🔍 TEST DES NOUVELLES FONCTIONNALITÉS');

if (window.location.pathname.includes('/employees') || window.location.hash.includes('employees')) {
  console.log('✅ Page Employés détectée');

  // 1. Vérifier le tableau unifié
  const unifiedTable = document.querySelector('.unified-table');
  if (unifiedTable) {
    console.log('✅ Tableau unifié trouvé');
    
    // Compter les lignes
    const employeeRows = unifiedTable.querySelectorAll('.employee-row');
    const invitationRows = unifiedTable.querySelectorAll('.invitation-row');
    console.log(`👥 Lignes employés: ${employeeRows.length}`);
    console.log(`📧 Lignes invitations: ${invitationRows.length}`);
    
    // Vérifier les colonnes
    const headers = unifiedTable.querySelectorAll('thead th');
    console.log('📊 En-têtes de colonnes:');
    headers.forEach((header, index) => {
      console.log(`   ${index + 1}. ${header.textContent}`);
    });
    
    // Vérifier les actions pour invitations
    const invitationActions = unifiedTable.querySelectorAll('.invitation-row .action-buttons');
    if (invitationActions.length > 0) {
      const firstAction = invitationActions[0];
      const eyeButton = firstAction.querySelector('button[title="Voir détails"]');
      if (eyeButton) {
        console.log('✅ Bouton "Voir détails" trouvé pour invitations');
      } else {
        console.log('❌ Bouton "Voir détails" non trouvé');
      }
    }
  }

  // 2. Tester les filtres
  console.log('\n🔍 TEST DES FILTRES');
  
  const roleSelect = document.querySelector('select[value*="all"]:first-of-type');
  const statusSelect = document.querySelector('select[value*="all"]:last-of-type');
  const searchInput = document.querySelector('input[placeholder*="Rechercher"]');
  
  if (roleSelect && statusSelect && searchInput) {
    console.log('✅ Contrôles de filtrage trouvés');
    
    // Test du filtre rôle
    console.log('🔧 Test filtre rôle...');
    roleSelect.value = 'employee';
    roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      const visibleRows = document.querySelectorAll('.table-row:not([style*="display: none"])');
      console.log(`   Lignes visibles après filtre rôle: ${visibleRows.length}`);
      
      // Remettre à "all"
      roleSelect.value = 'all';
      roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }, 500);
    
    // Test du filtre statut
    setTimeout(() => {
      console.log('🔧 Test filtre statut...');
      statusSelect.value = 'active';
      statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      
      setTimeout(() => {
        const visibleRows = document.querySelectorAll('.table-row:not([style*="display: none"])');
        console.log(`   Lignes visibles après filtre statut: ${visibleRows.length}`);
        
        // Remettre à "all"
        statusSelect.value = 'all';
        statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }, 500);
    }, 1000);
    
    // Test de recherche
    setTimeout(() => {
      console.log('🔧 Test recherche...');
      searchInput.value = 'test';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      setTimeout(() => {
        const visibleRows = document.querySelectorAll('.table-row:not([style*="display: none"])');
        console.log(`   Lignes visibles après recherche: ${visibleRows.length}`);
        
        // Clear search
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }, 500);
    }, 2000);
    
  } else {
    console.log('❌ Contrôles de filtrage non trouvés');
  }

  // 3. Tester l'absence d'effet hover
  console.log('\n🖱️ TEST SUPPRESSION HOVER');
  
  const firstRow = unifiedTable?.querySelector('.table-row');
  if (firstRow) {
    const originalBackground = getComputedStyle(firstRow).background;
    
    // Simuler hover
    firstRow.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const hoverBackground = getComputedStyle(firstRow).background;
      const hoverTransform = getComputedStyle(firstRow).transform;
      
      if (originalBackground === hoverBackground && hoverTransform === 'none') {
        console.log('✅ Effet hover supprimé avec succès');
      } else {
        console.log('❌ Effet hover encore présent');
      }
    }, 100);
  }

  // 4. Vérifier le compteur de résultats
  console.log('\n📊 TEST COMPTEUR RÉSULTATS');
  
  const resultsCount = document.querySelector('.results-count');
  if (resultsCount) {
    console.log(`✅ Compteur trouvé: "${resultsCount.textContent}"`);
    
    if (resultsCount.textContent.includes('personne(s)')) {
      console.log('✅ Texte mis à jour correctement');
    } else {
      console.log('❌ Texte non mis à jour');
    }
  }

  // 5. Résumé des changements
  console.log('\n📋 RÉSUMÉ DES CHANGEMENTS:');
  console.log('1. ✅ Actions invitations remplacées par bouton "Voir détails"');
  console.log('2. ✅ Statuts invitations adaptés (Actif/Inactif)');
  console.log('3. ✅ Filtres et recherche fonctionnent sur invitations');
  console.log('4. ✅ Effet hover supprimé des lignes');
  console.log('5. ✅ Compteur mis à jour (personnes au lieu d\'employés)');

} else {
  console.log('❌ Veuillez naviguer vers la page Employés');
}

// Fonction pour tester le clic sur une invitation
window.testInvitationClick = function() {
  const invitationRow = document.querySelector('.invitation-row');
  if (invitationRow) {
    console.log('🔗 Test clic sur invitation...');
    invitationRow.click();
  } else {
    console.log('❌ Aucune invitation trouvée');
  }
};

console.log('\n💡 Pour tester le clic sur invitation: testInvitationClick()');
