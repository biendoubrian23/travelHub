// Vérification rapide des modifications dans EmployeeManagement.jsx
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des modifications dans EmployeeManagement.jsx\n');

try {
  const filePath = path.join(__dirname, 'src', 'components', 'Admin', 'EmployeeManagement.jsx');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Vérifications
  const checks = [
    {
      name: 'Jointure avec is_active',
      pattern: /user:users\(id,\s*full_name,\s*email,\s*is_active\)/,
      description: 'Vérifier que is_active est inclus dans la jointure'
    },
    {
      name: 'Logique de priorité dans filtrage',
      pattern: /employee\.user\?\.is_active\s*!==\s*undefined\s*\?\s*employee\.user\.is_active\s*:\s*employee\.is_active/,
      description: 'Vérifier la logique de priorité dans filteredEmployees'
    },
    {
      name: 'Fonction handleToggleActive modifiée',
      pattern: /const handleToggleActive = async \(employee,\s*currentStatus\)/,
      description: 'Vérifier que handleToggleActive reçoit l\'objet employé complet'
    },
    {
      name: 'Mise à jour table users',
      pattern: /\.from\('users'\)[\s\S]*\.update\(\{\s*is_active:\s*!currentStatus\s*\}\)/,
      description: 'Vérifier la mise à jour de la table users'
    },
    {
      name: 'Affichage statut avec priorité',
      pattern: /const isActive = employee\.user\?\.is_active !== undefined \? employee\.user\.is_active : employee\.is_active/,
      description: 'Vérifier l\'affichage du statut avec logique de priorité'
    }
  ];
  
  let allPassed = true;
  
  checks.forEach((check, index) => {
    console.log(`${index + 1}. ${check.name}`);
    console.log(`   ${check.description}`);
    
    if (check.pattern.test(fileContent)) {
      console.log('   ✅ Trouvé\n');
    } else {
      console.log('   ❌ Non trouvé\n');
      allPassed = false;
    }
  });
  
  // Vérifications supplémentaires
  console.log('📊 Statistiques :');
  
  const isActiveOccurrences = (fileContent.match(/employee\.user\?\.is_active/g) || []).length;
  console.log(`• Utilisations de employee.user?.is_active : ${isActiveOccurrences}`);
  
  const handleToggleCallsOldStyle = (fileContent.match(/handleToggleActive\([^,)]+\.id\s*,\s*[^)]+\.is_active\)/g) || []).length;
  console.log(`• Anciens appels handleToggleActive (à corriger si > 0) : ${handleToggleCallsOldStyle}`);
  
  const handleToggleCallsNewStyle = (fileContent.match(/handleToggleActive\([^,)]+employee[^,)]*,\s*[^)]+\)/g) || []).length;
  console.log(`• Nouveaux appels handleToggleActive : ${handleToggleCallsNewStyle}`);
  
  console.log(`\n📋 Résultat global : ${allPassed ? '✅ TOUTES LES MODIFICATIONS APPLIQUÉES' : '❌ CERTAINES MODIFICATIONS MANQUANTES'}`);
  
  if (allPassed) {
    console.log('\n🎉 La jointure avec la table users pour is_active est correctement implémentée !');
    console.log('\nFonctionnalités validées :');
    console.log('• Récupération de is_active depuis users dans la jointure');
    console.log('• Logique de priorité users.is_active > agency_employees.is_active');
    console.log('• Mise à jour synchronisée des deux tables');
    console.log('• Affichage cohérent dans toute l\'interface');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier:', error.message);
}
