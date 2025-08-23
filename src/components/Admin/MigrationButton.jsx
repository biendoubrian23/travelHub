import React, { useState } from 'react';
import { migrateExistingTripsToSeatMaps, checkMigrationStatus } from '../../utils/migrationSeatMaps.js';

const MigrationButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🚀 Démarrage de la migration...');
      const migrationResult = await migrateExistingTripsToSeatMaps();
      setResult(migrationResult);
      console.log('✅ Migration terminée:', migrationResult);
    } catch (error) {
      console.error('❌ Erreur de migration:', error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsLoading(true);
    try {
      const status = await checkMigrationStatus();
      console.log('📊 État de la migration:', status);
      setResult(status);
    } catch (error) {
      console.error('❌ Erreur de vérification:', error);
      setResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #f39c12', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#fff3cd'
    }}>
      <h3>🔧 Migration Seat Maps</h3>
      <p>
        <strong>⚠️ ATTENTION :</strong> Cette migration va créer les seat_maps pour tous les voyages existants.
        Exécuter uniquement une fois !
      </p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleCheckStatus}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '⏳ Chargement...' : '📊 Vérifier l\'état'}
        </button>
        
        <button
          onClick={handleMigration}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '⏳ Migration...' : '🚀 Lancer la migration'}
        </button>
      </div>

      {result && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: result.error ? '#f8d7da' : '#d4edda',
          border: `1px solid ${result.error ? '#f5c6cb' : '#c3e6cb'}`,
          borderRadius: '4px'
        }}>
          <h4>{result.error ? '❌ Erreur' : '✅ Résultat'}</h4>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MigrationButton;
