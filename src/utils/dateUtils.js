/**
 * Utilitaires de gestion des dates pour TravelHub
 */

/**
 * Vérifie si une date est passée (antérieure à aujourd'hui)
 * @param {string|Date} dateString - La date à vérifier
 * @returns {boolean} - true si la date est passée, false sinon
 */
export const isDatePassed = (dateString) => {
  if (!dateString) return false;
  
  const targetDate = new Date(dateString);
  const currentDate = new Date();
  
  // Reset time to start of day for accurate comparison
  currentDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  return targetDate < currentDate;
};

/**
 * Formate une date pour l'affichage français
 * @param {string|Date} dateString - La date à formater
 * @returns {string} - La date formatée
 */
export const formatDateFR = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formate une heure pour l'affichage français
 * @param {string|Date} timeString - L'heure à formater
 * @returns {string} - L'heure formatée
 */
export const formatTimeFR = (timeString) => {
  if (!timeString) return '';
  
  return new Date(timeString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
