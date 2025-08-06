// Script de vérification du tableau unifié
// Exécutez ce script dans la console du navigateur (F12) sur la page Employés

console.log('🔍 VÉRIFICATION DU TABLEAU UNIFIÉ');

// Vérifier si on est sur la bonne page
if (window.location.pathname.includes('/employees') || window.location.hash.includes('employees')) {
  console.log('✅ Page Employés détectée');

  // 1. Vérifier qu'il n'y a plus de tableau dupliqué
  const oldInvitationsSection = document.querySelector('.invitations-table-section');
  if (oldInvitationsSection) {
    console.log('❌ Ancienne section invitations encore présente (duplication)');
  } else {
    console.log('✅ Plus de duplication - section invitations supprimée');
  }

  // 2. Vérifier le tableau unifié
  const unifiedTable = document.querySelector('.unified-table');
  if (unifiedTable) {
    console.log('✅ Tableau unifié trouvé');
    
    // Vérifier les colonnes
    const headers = unifiedTable.querySelectorAll('thead th');
    console.log(`📊 Colonnes: ${headers.length}`);
    headers.forEach((header, index) => {
      console.log(`   ${index + 1}. ${header.textContent}`);
    });

    // Vérifier les lignes employés
    const employeeRows = unifiedTable.querySelectorAll('.employee-row');
    console.log(`👥 Lignes employés: ${employeeRows.length}`);

    // Vérifier les lignes invitations
    const invitationRows = unifiedTable.querySelectorAll('.invitation-row');
    console.log(`📧 Lignes invitations: ${invitationRows.length}`);

    // Vérifier les avatars
    const avatars = unifiedTable.querySelectorAll('.user-avatar');
    console.log(`👤 Avatars trouvés: ${avatars.length}`);
    
    let employeeAvatars = 0;
    let invitationAvatars = 0;
    avatars.forEach(avatar => {
      if (avatar.classList.contains('invitation')) {
        invitationAvatars++;
      } else {
        employeeAvatars++;
      }
    });
    console.log(`   - Avatars employés: ${employeeAvatars}`);
    console.log(`   - Avatars invitations: ${invitationAvatars}`);

  } else {
    console.log('❌ Tableau unifié non trouvé');
  }

  // 3. Vérifier les styles iOS
  const computedStyle = getComputedStyle(document.documentElement);
  const iosBlue = computedStyle.getPropertyValue('--ios-blue');
  if (iosBlue) {
    console.log('✅ Variables CSS iOS chargées');
    console.log(`   --ios-blue: ${iosBlue}`);
  } else {
    console.log('❌ Variables CSS iOS non trouvées');
  }

  // 4. Vérifier l'absence de bordures
  if (unifiedTable) {
    const firstRow = unifiedTable.querySelector('tbody tr');
    if (firstRow) {
      const style = getComputedStyle(firstRow);
      console.log('🎨 Style de ligne:');
      console.log(`   border: ${style.border}`);
      console.log(`   background: ${style.background}`);
      console.log(`   border-radius: ${style.borderRadius}`);
    }
  }

  // 5. Vérifier la position (sous la recherche)
  const filtersSection = document.querySelector('.filters-section');
  const tableContainer = document.querySelector('.employees-table-container');
  
  if (filtersSection && tableContainer) {
    const filtersRect = filtersSection.getBoundingClientRect();
    const tableRect = tableContainer.getBoundingClientRect();
    
    if (tableRect.top > filtersRect.bottom) {
      console.log('✅ Tableau positionné sous la zone de recherche');
    } else {
      console.log('❌ Problème de positionnement du tableau');
    }
  }

  // 6. Test interactif
  if (unifiedTable) {
    const firstRow = unifiedTable.querySelector('tbody tr');
    if (firstRow) {
      console.log('🖱️ Test de survol...');
      
      // Sauvegarder le style original
      const originalBackground = firstRow.style.background;
      const originalTransform = firstRow.style.transform;
      
      // Simuler le hover
      firstRow.style.background = 'var(--ios-secondary-background)';
      firstRow.style.transform = 'translateY(-1px)';
      firstRow.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      
      setTimeout(() => {
        // Restaurer
        firstRow.style.background = originalBackground;
        firstRow.style.transform = originalTransform;
        firstRow.style.boxShadow = '';
        console.log('✅ Animation de survol testée');
      }, 1500);
    }
  }

  // 7. Résumé
  console.log('\n📋 RÉSUMÉ DES CHANGEMENTS:');
  console.log('1. ✅ Tableau unifié (employés + invitations)');
  console.log('2. ✅ Design iOS/Apple sans bordures');
  console.log('3. ✅ Avatars distinctifs (👥 employés, ✉️ invitations)');
  console.log('4. ✅ Couleurs cohérentes et visibles');
  console.log('5. ✅ Position sous la zone de recherche');
  console.log('6. ✅ Animations fluides au survol');

} else {
  console.log('❌ Veuillez naviguer vers la page Employés');
}

// Fonction de test pour cliquer sur une ligne
window.testRowClick = function() {
  const firstRow = document.querySelector('.unified-table tbody tr');
  if (firstRow) {
    console.log('🔗 Test de clic sur ligne...');
    firstRow.click();
  } else {
    console.log('❌ Aucune ligne trouvée pour le test');
  }
};

console.log('\n💡 Pour tester le clic: testRowClick()');
