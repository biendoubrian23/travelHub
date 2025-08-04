// Script de vérification des changements dans l'interface
// À exécuter dans la console du navigateur sur la page des employés

console.log('🔍 VÉRIFICATION DES CHANGEMENTS INTERFACE');
console.log('=======================================');

// 1. Vérifier que la colonne téléphone est présente
const headers = Array.from(document.querySelectorAll('.employees-table th')).map(th => th.textContent.trim());
console.log('📋 En-têtes du tableau:', headers);

if (headers.includes('Téléphone')) {
  console.log('✅ Colonne téléphone trouvée !');
} else {
  console.log('❌ Colonne téléphone manquante');
}

// 2. Vérifier le placeholder de recherche
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  console.log('🔍 Placeholder de recherche:', searchInput.placeholder);
  if (searchInput.placeholder.includes('téléphone')) {
    console.log('✅ Placeholder mis à jour !');
  } else {
    console.log('❌ Placeholder non mis à jour');
  }
} else {
  console.log('❌ Champ de recherche non trouvé');
}

// 3. Vérifier les données d'employés affichées
const employeeRows = document.querySelectorAll('.employee-row');
console.log(`👥 Nombre d'employés affichés: ${employeeRows.length}`);

if (employeeRows.length > 0) {
  const firstRow = employeeRows[0];
  const cells = firstRow.querySelectorAll('td');
  
  console.log('📊 Première ligne employé:');
  console.log('  Nom:', cells[0]?.textContent.trim());
  console.log('  Email:', cells[1]?.textContent.trim());
  console.log('  Téléphone:', cells[2]?.textContent.trim());
  console.log('  Rôle:', cells[3]?.textContent.trim());
  console.log('  Statut:', cells[4]?.textContent.trim());
  
  // Vérifier la classe CSS du téléphone
  const phoneCell = cells[2];
  if (phoneCell && phoneCell.classList.contains('employee-phone')) {
    console.log('✅ Classe CSS téléphone appliquée !');
  } else {
    console.log('❌ Classe CSS téléphone manquante');
  }
}

// 4. Tester la recherche par téléphone
if (searchInput && employeeRows.length > 0) {
  console.log('\n🧪 Test de recherche par téléphone...');
  
  // Récupérer un numéro de téléphone
  const firstPhoneCell = document.querySelector('.employee-phone');
  if (firstPhoneCell && firstPhoneCell.textContent.trim() !== 'Non renseigné') {
    const phoneNumber = firstPhoneCell.textContent.trim();
    console.log('📞 Test avec le numéro:', phoneNumber);
    
    // Simuler la recherche
    searchInput.value = phoneNumber.substring(0, 4); // Premiers chiffres
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    setTimeout(() => {
      const visibleRows = document.querySelectorAll('.employee-row:not([style*="display: none"])');
      console.log(`🔍 Résultats de recherche: ${visibleRows.length} employé(s) trouvé(s)`);
      
      // Remettre la recherche vide
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }, 500);
  } else {
    console.log('❌ Aucun numéro de téléphone pour tester');
  }
}

// 5. Instructions pour l'utilisateur
console.log('\n📝 POUR VOIR LES CHANGEMENTS:');
console.log('1. Vérifiez que la colonne "Téléphone" est bien présente');
console.log('2. Testez la recherche en tapant un numéro ou un nom');
console.log('3. Cliquez sur une ligne pour voir les détails complets');
console.log('4. Si rien ne change, rechargez la page (Ctrl+F5)');

// 6. Vérifier les styles CSS
console.log('\n🎨 VÉRIFICATION DES STYLES:');
const phoneElement = document.querySelector('.employee-phone');
if (phoneElement) {
  const styles = window.getComputedStyle(phoneElement);
  console.log('📱 Styles téléphone:');
  console.log('  Font-family:', styles.fontFamily);
  console.log('  Font-weight:', styles.fontWeight);
  console.log('  Letter-spacing:', styles.letterSpacing);
}

console.log('\n✨ Vérification terminée !');
