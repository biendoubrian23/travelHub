import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DashboardStats, DashboardCharts, TopAgenciesTable, QuickActions } from './SuperAdminComponents';

const Dashboard = ({ onAction }) => {
  // Exemple de fonction pour charger les données du tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Récupérer les statistiques d'agences
        const { data: agencies, error: agenciesError } = await supabase
          .from('agencies')
          .select('*');
          
        if (agenciesError) throw agenciesError;
        
        console.log('Données des agences chargées:', agencies?.length);
        
        // Vous pouvez ajouter d'autres chargements de données ici
        
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      }
    };
    
    loadDashboardData();
  }, []);
  
  return (
    <div className="dashboard-container">
      <h2 className="section-header">Tableau de bord</h2>
      <DashboardStats />
      <DashboardCharts />
      <div style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
        <div style={{ flex: 1.5 }}>
          <TopAgenciesTable />
        </div>
        <div style={{ flex: 1 }}>
          <QuickActions onAction={onAction} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
