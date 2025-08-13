import React from 'react';

const Finance = () => {
  return (
    <div className="sadmin-finance">
      <div className="sadmin-stats-grid">
        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}>
              💰
            </div>
            <div className="sadmin-stat-title">Revenus totaux</div>
          </div>
          <div className="sadmin-stat-value">€132,580</div>
          <div className="sadmin-stat-change sadmin-positive">+18% par rapport au mois dernier</div>
        </div>

        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd' }}>
              💼
            </div>
            <div className="sadmin-stat-title">Commissions</div>
          </div>
          <div className="sadmin-stat-value">€19,887</div>
          <div className="sadmin-stat-change sadmin-positive">+22% par rapport au mois dernier</div>
        </div>

        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
              📉
            </div>
            <div className="sadmin-stat-title">Dépenses</div>
          </div>
          <div className="sadmin-stat-value">€8,450</div>
          <div className="sadmin-stat-change sadmin-negative">+5% par rapport au mois dernier</div>
        </div>

        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}>
              📊
            </div>
            <div className="sadmin-stat-title">Bénéfice net</div>
          </div>
          <div className="sadmin-stat-value">€11,437</div>
          <div className="sadmin-stat-change sadmin-positive">+28% par rapport au mois dernier</div>
        </div>
      </div>
      
      <div className="sadmin-charts-row">
        <div className="sadmin-chart-container">
          <div className="sadmin-chart-header">
            <h3 className="sadmin-chart-title">Évolution des revenus (12 derniers mois)</h3>
          </div>
          <div className="sadmin-chart-placeholder" style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p>Graphique d'évolution des revenus</p>
          </div>
        </div>
      </div>
      
      <div className="sadmin-section">
        <h3 className="sadmin-section-title">Revenus par agence</h3>
        <div className="sadmin-table-container">
          <table className="sadmin-table">
            <thead>
              <tr>
                <th>Agence</th>
                <th>Revenus</th>
                <th>Commissions</th>
                <th>Croissance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Voyage Express</td>
                <td>€45,250</td>
                <td>€6,787</td>
                <td className="sadmin-positive">+23%</td>
                <td className="sadmin-actions-cell">
                  <button className="sadmin-action-button sadmin-view-button">👁️</button>
                </td>
              </tr>
              <tr>
                <td>Africa Tours</td>
                <td>€38,720</td>
                <td>€5,808</td>
                <td className="sadmin-positive">+18%</td>
                <td className="sadmin-actions-cell">
                  <button className="sadmin-action-button sadmin-view-button">👁️</button>
                </td>
              </tr>
              <tr>
                <td>Sun Travel</td>
                <td>€31,890</td>
                <td>€4,783</td>
                <td className="sadmin-positive">+15%</td>
                <td className="sadmin-actions-cell">
                  <button className="sadmin-action-button sadmin-view-button">👁️</button>
                </td>
              </tr>
              <tr>
                <td>Dream Voyages</td>
                <td>€16,720</td>
                <td>€2,508</td>
                <td className="sadmin-positive">+10%</td>
                <td className="sadmin-actions-cell">
                  <button className="sadmin-action-button sadmin-view-button">👁️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="sadmin-actions-section">
        <h3 className="sadmin-actions-title">Actions financières</h3>
        <div className="sadmin-actions-grid">
          <div className="sadmin-action-card">
            <div className="sadmin-action-icon" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd' }}>
              📄
            </div>
            <h4 className="sadmin-action-title">Générer un rapport</h4>
            <p className="sadmin-action-desc">Télécharger un rapport financier complet</p>
          </div>

          <div className="sadmin-action-card">
            <div className="sadmin-action-icon" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}>
              💸
            </div>
            <h4 className="sadmin-action-title">Paiements</h4>
            <p className="sadmin-action-desc">Gérer les paiements aux agences</p>
          </div>

          <div className="sadmin-action-card">
            <div className="sadmin-action-icon" style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}>
              📋
            </div>
            <h4 className="sadmin-action-title">Factures</h4>
            <p className="sadmin-action-desc">Consulter ou émettre des factures</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
