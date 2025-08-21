import React from 'react';
import RefreshButton from './RefreshButton';
import { useRefresh } from '../../hooks/useRefresh';
import './PageWrapper.css';

/**
 * Composant wrapper pour les pages avec bouton de rechargement intégré
 * @param {Object} props - Props du composant
 * @param {Function} props.onRefresh - Fonction à exécuter lors du rechargement
 * @param {string} props.refreshTooltip - Texte du tooltip du bouton de rechargement
 * @param {React.ReactNode} props.children - Contenu de la page
 * @param {string} props.className - Classes CSS additionnelles
 * @param {boolean} props.showRefreshButton - Afficher ou masquer le bouton de rechargement
 * @returns {React.ReactElement} - Composant de page wrapper
 */
const PageWrapper = ({ 
  onRefresh, 
  refreshTooltip = 'Actualiser les données',
  children, 
  className = '',
  showRefreshButton = true
}) => {
  // Hook pour gérer le rechargement si une fonction est fournie
  const { refresh } = useRefresh(onRefresh);

  return (
    <div className={`page-wrapper ${className}`}>
      {/* Bouton de rechargement conditionnel */}
      {showRefreshButton && onRefresh && (
        <RefreshButton 
          onRefresh={refresh}
          tooltip={refreshTooltip}
        />
      )}
      
      {/* Contenu de la page */}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
