import React from 'react';

const Statistics = () => {
  return (
    <div className="sadmin-statistics">
      <div className="sadmin-charts-row">
        <div className="sadmin-chart-container">
          <div className="sadmin-chart-header">
            <h3 className="sadmin-chart-title">Évolution des réservations</h3>
          </div>
          <div className="sadmin-chart-placeholder" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p>Graphique d'évolution des réservations sur 12 mois</p>
          </div>
        </div>
      </div>
      
      <div className="sadmin-charts-row">
        <div className="sadmin-chart-container" style={{ flex: '1' }}>
          <div className="sadmin-chart-header">
            <h3 className="sadmin-chart-title">Répartition par agence</h3>
          </div>
          <div className="sadmin-chart-placeholder" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p>Graphique de répartition des réservations par agence</p>
          </div>
        </div>
        
        <div className="sadmin-chart-container" style={{ flex: '1' }}>
          <div className="sadmin-chart-header">
            <h3 className="sadmin-chart-title">Répartition par destination</h3>
          </div>
          <div className="sadmin-chart-placeholder" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p>Graphique de répartition par destination</p>
          </div>
        </div>
      </div>
      
      <div className="sadmin-section">
        <h3 className="sadmin-section-title">Statistiques détaillées</h3>
        <div className="sadmin-table-container">
          <table className="sadmin-table">
            <thead>
              <tr>
                <th>Métrique</th>
                <th>Valeur actuelle</th>
                <th>Mois précédent</th>
                <th>Variation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nombre total de réservations</td>
                <td>8521</td>
                <td>7604</td>
                <td className="sadmin-positive">+12%</td>
              </tr>
              <tr>
                <td>Réservations moyennes par agence</td>
                <td>355</td>
                <td>317</td>
                <td className="sadmin-positive">+12%</td>
              </tr>
              <tr>
                <td>Taux de conversion</td>
                <td>22.4%</td>
                <td>21.8%</td>
                <td className="sadmin-positive">+0.6%</td>
              </tr>
              <tr>
                <td>Durée moyenne de session</td>
                <td>5:32 min</td>
                <td>5:18 min</td>
                <td className="sadmin-positive">+4.4%</td>
              </tr>
              <tr>
                <td>Taux d'annulation</td>
                <td>3.2%</td>
                <td>3.5%</td>
                <td className="sadmin-positive">-0.3%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
