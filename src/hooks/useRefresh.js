import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer le rechargement des données sans recharger la page
 * @param {Function} refreshFunction - Fonction à exécuter pour actualiser les données
 * @param {Object} options - Options de configuration
 * @returns {Object} - Objet contenant les fonctions et états de rechargement
 */
export const useRefresh = (refreshFunction, options = {}) => {
  const { 
    onSuccess, 
    onError, 
    autoRefreshInterval
  } = options;
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const refresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    const startTime = Date.now();

    try {
      console.log('🔄 Début de l\'actualisation des données...');
      
      if (typeof refreshFunction === 'function') {
        await refreshFunction();
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Actualisation terminée en ${duration}ms`);
      
      setLastRefresh(new Date());
      setRefreshCount(prev => prev + 1);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation:', error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshFunction, onSuccess, onError, isRefreshing]);

  // Auto-refresh si spécifié
  useState(() => {
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      const interval = setInterval(refresh, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, autoRefreshInterval]);

  return {
    refresh,
    isRefreshing,
    lastRefresh,
    refreshCount
  };
};

export default useRefresh;
