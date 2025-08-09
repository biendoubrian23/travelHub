import React from 'react';
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, 
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import './SuperAdminComponents.css';

// Données factices pour les statistiques
const statData = [
  { label: "Réservations", value: 8521, change: "+12%", icon: "📈" },
  { label: "Agences actives", value: 24, change: "+3", icon: "🏢" },
  { label: "Utilisateurs", value: 1284, change: "+156", icon: "👥" },
  { label: "Revenus", value: "€132,580", change: "+18%", icon: "💶" },
];

const monthlyData = [
  { name: 'Jan', reservations: 400, revenue: 4000 },
  { name: 'Fév', reservations: 300, revenue: 3000 },
  { name: 'Mar', reservations: 520, revenue: 2000 },
  { name: 'Avr', reservations: 580, revenue: 2780 },
  { name: 'Mai', reservations: 400, revenue: 1890 },
  { name: 'Juin', reservations: 380, revenue: 2390 },
  { name: 'Juil', reservations: 450, revenue: 3490 },
];

const agencyData = [
  { name: 'Voyage Express', value: 240 },
  { name: 'Africa Tours', value: 180 },
  { name: 'Sun Travel', value: 120 },
  { name: 'Global Journey', value: 95 },
  { name: 'Dream Voyages', value: 85 },
];

const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#5856D6'];

// Composants pour le tableau de bord
export const DashboardStats = () => {
  return (
    <div className="dashboard-stats">
      {statData.map((stat, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <h3>{stat.label}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DashboardCharts = () => {
  return (
    <div className="dashboard-charts">
      <div className="chart-container">
        <h3>Réservations mensuelles</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Area type="monotone" dataKey="reservations" stroke="#007AFF" fillOpacity={1} fill="url(#colorReservations)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-container">
        <h3>Répartition des agences</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={agencyData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {agencyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TopAgenciesTable = () => {
  const topAgencies = [
    { id: 1, name: 'Voyage Express', reservations: 240, revenue: '€12,400', status: 'Actif' },
    { id: 2, name: 'Africa Tours', reservations: 180, revenue: '€9,200', status: 'Actif' },
    { id: 3, name: 'Sun Travel', reservations: 120, revenue: '€6,800', status: 'Actif' },
    { id: 4, name: 'Global Journey', reservations: 95, revenue: '€5,100', status: 'Actif' },
    { id: 5, name: 'Dream Voyages', reservations: 85, revenue: '€4,300', status: 'Suspendu' },
  ];

  return (
    <div className="data-table-container">
      <h3>Meilleures agences</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Agence</th>
            <th>Réservations</th>
            <th>Revenus</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {topAgencies.map((agency) => (
            <tr key={agency.id}>
              <td>{agency.name}</td>
              <td>{agency.reservations}</td>
              <td>{agency.revenue}</td>
              <td>
                <span className={`status-badge ${agency.status === 'Actif' ? 'active' : 'suspended'}`}>
                  {agency.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-footer">
        <button className="view-all-button">Voir toutes les agences</button>
      </div>
    </div>
  );
};

export const QuickActions = ({ onAction }) => {
  const actions = [
    { id: 'add-agency', label: 'Ajouter une agence', icon: '🏢' },
    { id: 'view-reports', label: 'Rapports financiers', icon: '📊' },
    { id: 'manage-users', label: 'Gérer les utilisateurs', icon: '👥' },
    { id: 'system-settings', label: 'Paramètres système', icon: '⚙️' },
  ];

  return (
    <div className="quick-actions-card">
      <h3>Actions rapides</h3>
      <div className="actions-list">
        {actions.map((action) => (
          <button 
            key={action.id}
            className="action-button"
            onClick={() => onAction && onAction(action.id)}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Autres composants réutilisables pour le SuperAdmin

export const SectionTitle = ({ title, actionButton }) => {
  return (
    <div className="section-title-container">
      <h2 className="section-title">{title}</h2>
      {actionButton && (
        <div className="section-action">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export const EmptyState = ({ title, description, actionLabel, onAction }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📭</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && (
        <button className="primary-button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
