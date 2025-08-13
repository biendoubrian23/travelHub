import React from 'react';

const Dashboard = ({ onAction }) => {
  return (
    <div className="sadmin-dashboard-content">
      {/* Statistiques */}
      <div className="sadmin-stats-grid">
        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd' }}>
              📊
            </div>
            <div className="sadmin-stat-title">Réservations</div>
          </div>
          <div className="sadmin-stat-value">8521</div>
          <div className="sadmin-stat-change sadmin-positive">+12% par rapport au mois dernier</div>
        </div>

        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}>
              🏢
            </div>
            <div className="sadmin-stat-title">Agences actives</div>
          </div>
          <div className="sadmin-stat-value">24</div>
          <div className="sadmin-stat-change sadmin-positive">+3 nouvelles agences</div>
        </div>

        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}>
              👥
            </div>
            <div className="sadmin-stat-title">Utilisateurs</div>
          </div>
          <div className="sadmin-stat-value">1284</div>
          <div className="sadmin-stat-change sadmin-positive">+156 nouveaux utilisateurs</div>
        </div>

        <div className="sadmin-stat-card">
          <div className="sadmin-stat-header">
            <div className="sadmin-stat-icon" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)', color: '#0dcaf0' }}>
              💰
            </div>
            <div className="sadmin-stat-title">Revenus</div>
          </div>
          <div className="sadmin-stat-value">€132,580</div>
          <div className="sadmin-stat-change sadmin-positive">+18% par rapport au mois dernier</div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="sadmin-charts-row">
        <div className="sadmin-chart-container">
          <div className="sadmin-chart-header">
            <h3 className="sadmin-chart-title">Réservations mensuelles</h3>
          </div>
          <div className="sadmin-chart-placeholder" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            {/* Placeholder pour le graphique - à remplacer par un vrai graphique */}
            <p>Graphique de réservations mensuelles</p>
          </div>
        </div>

        <div className="sadmin-chart-container">
          <div className="sadmin-chart-header">
            <h3 className="sadmin-chart-title">Répartition des agences</h3>
          </div>
          <div className="sadmin-chart-placeholder" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            {/* Placeholder pour le graphique - à remplacer par un vrai graphique */}
            <p>Graphique de répartition des agences</p>
          </div>
        </div>
      </div>

      {/* Meilleures agences */}
      <div className="sadmin-section">
        <h3 className="sadmin-section-title">Meilleures agences</h3>
        <div className="sadmin-table-container">
          <table className="sadmin-table">
            <thead>
              <tr>
                <th>Nom de l'agence</th>
                <th>Réservations</th>
                <th>Revenus</th>
                <th>Taux de conversion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Voyage Express</td>
                <td>352</td>
                <td>€45,250</td>
                <td>24.8%</td>
                <td className="sadmin-actions-cell">
                  <button className="sadmin-action-button sadmin-view-button">👁️</button>
                  <button className="sadmin-action-button sadmin-edit-button">✏️</button>
                </td>
              </tr>
              <tr>
                <td>Africa Tours</td>
                <td>289</td>
                <td>€38,720</td>
                <td>22.5%</td>
                <td className="sadmin-actions-cell">
                  <button className="sadmin-action-button sadmin-view-button">👁️</button>
                  <button className="sadmin-action-button sadmin-edit-button">✏️</button>
                </td>
              </tr>
              <tr>
                <td>Sun Travel</td>
                <td>245</td>
                <td>€31,890</td>
                <td>20.3%</td>
                <td className="sadmin-actions-cell">
                  <button className="sadmin-action-button sadmin-view-button">👁️</button>
                  <button className="sadmin-action-button sadmin-edit-button">✏️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="sadmin-actions-section">
        <h3 className="sadmin-actions-title">Actions rapides</h3>
        <div className="sadmin-actions-grid">
          <div className="sadmin-action-card" onClick={() => onAction('add-agency')}>
            <div className="sadmin-action-icon" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd' }}>
              ➕
            </div>
            <h4 className="sadmin-action-title">Nouvelle agence</h4>
            <p className="sadmin-action-desc">Ajouter une nouvelle agence au système</p>
          </div>

          <div className="sadmin-action-card" onClick={() => onAction('manage-users')}>
            <div className="sadmin-action-icon" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754' }}>
              👤
            </div>
            <h4 className="sadmin-action-title">Gérer utilisateurs</h4>
            <p className="sadmin-action-desc">Voir et gérer les utilisateurs</p>
          </div>

          <div className="sadmin-action-card" onClick={() => onAction('view-reports')}>
            <div className="sadmin-action-icon" style={{ backgroundColor: 'rgba(111, 66, 193, 0.1)', color: '#6f42c1' }}>
              📑
            </div>
            <h4 className="sadmin-action-title">Rapports financiers</h4>
            <p className="sadmin-action-desc">Consulter les rapports financiers</p>
          </div>

          <div className="sadmin-action-card">
            <div className="sadmin-action-icon" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)', color: '#0dcaf0' }}>
              ⚙️
            </div>
            <h4 className="sadmin-action-title">Configuration</h4>
            <p className="sadmin-action-desc">Modifier les paramètres système</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
