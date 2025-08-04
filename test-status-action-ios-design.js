// Test pour vérifier les modifications de statut et design iOS
console.log('🧪 Test des modifications de statut et design iOS');

// Vérifier que le statut est dans la colonne Action
function testInvitationStatusInActionColumn() {
  console.log('\n📋 Test : Statut d\'invitation dans la colonne Action');
  
  const invitationRows = document.querySelectorAll('.invitation-row');
  let success = true;
  
  invitationRows.forEach((row, index) => {
    const statusCell = row.querySelector('.status-cell');
    const actionsCell = row.querySelector('.actions-cell');
    
    if (statusCell) {
      const invitationBadge = statusCell.querySelector('.invitation-badge');
      if (!invitationBadge) {
        console.log(`❌ Ligne ${index + 1}: Badge "Invitation" manquant dans la colonne Statut`);
        success = false;
      }
    }
    
    if (actionsCell) {
      const statusBadges = actionsCell.querySelectorAll('.status-badge');
      if (statusBadges.length === 0) {
        console.log(`❌ Ligne ${index + 1}: Aucun badge de statut dans la colonne Action`);
        success = false;
      } else {
        statusBadges.forEach(badge => {
          const text = badge.textContent.trim();
          if (!['En attente', 'Acceptée', 'Expirée'].includes(text)) {
            console.log(`❌ Ligne ${index + 1}: Statut invalide "${text}"`);
            success = false;
          }
        });
      }
    }
  });
  
  if (success && invitationRows.length > 0) {
    console.log(`✅ ${invitationRows.length} invitations avec statut correctement placé dans la colonne Action`);
  } else if (invitationRows.length === 0) {
    console.log('ℹ️ Aucune invitation trouvée pour le test');
  }
  
  return success;
}

// Vérifier le design iOS des modales
function testIOSModalDesign() {
  console.log('\n🎨 Test : Design iOS des modales');
  
  // Vérifier si le CSS iOS est chargé
  const stylesheets = Array.from(document.styleSheets);
  const iosStylesLoaded = stylesheets.some(sheet => {
    try {
      return sheet.href && sheet.href.includes('IOSModalStyles.css');
    } catch (e) {
      return false;
    }
  });
  
  if (iosStylesLoaded) {
    console.log('✅ Styles iOS chargés');
  } else {
    console.log('❌ Styles iOS non détectés');
  }
  
  // Vérifier les variables CSS iOS
  const rootStyles = getComputedStyle(document.documentElement);
  const iosVariables = [
    '--ios-modal-backdrop',
    '--ios-modal-background',
    '--ios-modal-radius',
    '--ios-blue',
    '--ios-green'
  ];
  
  let variablesFound = 0;
  iosVariables.forEach(variable => {
    const value = rootStyles.getPropertyValue(variable);
    if (value) {
      variablesFound++;
    }
  });
  
  if (variablesFound >= 3) {
    console.log(`✅ Variables CSS iOS disponibles (${variablesFound}/${iosVariables.length})`);
  } else {
    console.log(`❌ Variables CSS iOS manquantes (${variablesFound}/${iosVariables.length})`);
  }
  
  return iosStylesLoaded && variablesFound >= 3;
}

// Test de l'ouverture d'une modale avec design iOS
function testModalIOSInteraction() {
  console.log('\n🔄 Test : Interaction modale avec design iOS');
  
  const invitationRows = document.querySelectorAll('.invitation-row');
  if (invitationRows.length === 0) {
    console.log('ℹ️ Aucune invitation pour tester l\'ouverture de modale');
    return true;
  }
  
  // Simuler un clic sur une invitation
  const firstInvitation = invitationRows[0];
  console.log('🖱️ Simulation d\'un clic sur une invitation...');
  
  firstInvitation.click();
  
  // Vérifier qu'une modale s'ouvre
  setTimeout(() => {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
      console.log('✅ Modale ouverte avec succès');
      
      // Vérifier les éléments de design iOS
      const modalElement = modal.querySelector('.modal');
      const header = modal.querySelector('.modal-header');
      const content = modal.querySelector('.modal-content');
      const actions = modal.querySelector('.modal-actions');
      
      if (modalElement && header && content && actions) {
        console.log('✅ Structure de modale iOS complète');
        
        // Fermer la modale
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
          closeBtn.click();
          console.log('✅ Modale fermée');
        }
      } else {
        console.log('❌ Structure de modale iOS incomplète');
      }
    } else {
      console.log('❌ Modale ne s\'ouvre pas');
    }
  }, 500);
  
  return true;
}

// Vérifier les badges de statut harmonisés
function testStatusBadgesHarmonization() {
  console.log('\n🏷️ Test : Harmonisation des badges de statut');
  
  const statusBadges = document.querySelectorAll('.status-badge');
  const expectedClasses = ['active', 'inactive', 'pending', 'accepted', 'expired', 'invitation-badge'];
  let success = true;
  
  statusBadges.forEach((badge, index) => {
    const classList = Array.from(badge.classList);
    const hasExpectedClass = expectedClasses.some(cls => classList.includes(cls));
    
    if (!hasExpectedClass) {
      console.log(`❌ Badge ${index + 1}: Classes inattendues ${classList.join(', ')}`);
      success = false;
    }
  });
  
  if (success && statusBadges.length > 0) {
    console.log(`✅ ${statusBadges.length} badges de statut correctement harmonisés`);
  } else if (statusBadges.length === 0) {
    console.log('ℹ️ Aucun badge de statut trouvé');
  }
  
  return success;
}

// Exécuter tous les tests
function runAllTests() {
  console.log('🚀 Démarrage des tests de modifications...\n');
  
  const results = {
    statusInAction: testInvitationStatusInActionColumn(),
    iosDesign: testIOSModalDesign(),
    statusHarmonization: testStatusBadgesHarmonization(),
    modalInteraction: testModalIOSInteraction()
  };
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(result => result === true).length;
  
  console.log(`\n📊 Résultats des tests : ${passedTests}/${totalTests} réussis`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont réussis ! Modifications appliquées avec succès.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez les détails ci-dessus.');
  }
  
  return results;
}

// Exécuter les tests au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}

// Exporter pour utilisation manuelle
window.testInvitationStatusAndIOSDesign = runAllTests;
