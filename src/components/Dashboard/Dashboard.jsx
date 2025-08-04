import React from 'react';
import './Dashboard.css';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  // Données mockées pour les graphiques
  const monthlyData = [
    { month: 'Jan', trajets: 45, revenus: 850000 },
    { month: 'Fév', trajets: 52, revenus: 1200000 },
    { month: 'Mar', trajets: 48, revenus: 980000 },
    { month: 'Avr', trajets: 61, revenus: 1450000 },
    { month: 'Mai', trajets: 55, revenus: 1300000 },
    { month: 'Jun', trajets: 67, revenus: 1680000 },
  ];

  const statusData = [
    { name: 'Confirmés', value: 78, color: '#34C759' },
    { name: 'En attente', value: 15, color: '#FF9500' },
    { name: 'Annulés', value: 7, color: '#FF3B30' },
  ];

  const stats = [
    {
      title: 'Trajets actifs',
      value: '24',
      change: '+12%',
      icon: MapPin,
      color: 'var(--primary)',
      bgColor: 'rgba(0, 122, 255, 0.1)'
    },
    {
      title: 'Réservations',
      value: '1,234',
      change: '+8%',
      icon: Users,
      color: 'var(--secondary)',
      bgColor: 'rgba(52, 199, 89, 0.1)'
    },
    {
      title: 'Revenus du mois',
      value: '1.68M FCFA',
      change: '+18%',
      icon: DollarSign,
      color: 'var(--warning)',
      bgColor: 'rgba(255, 149, 0, 0.1)'
    },
    {
      title: 'Taux occupation',
      value: '87%',
      change: '+5%',
      icon: TrendingUp,
      color: 'var(--purple)',
      bgColor: 'rgba(175, 82, 222, 0.1)'
    },
  ];

  const recentBookings = [
    {
      id: 'TH001234',
      passenger: 'Jean Dupont',
      route: 'Yaoundé → Douala',
      date: 'Aujourd\'hui 14:30',
      status: 'confirmed',
      amount: '18,000 FCFA'
    },
    {
      id: 'TH001235',
      passenger: 'Marie Kamga',
      route: 'Douala → Bafoussam',
      date: 'Demain 08:00',
      status: 'pending',
      amount: '12,000 FCFA'
    },
    {
      id: 'TH001236',
      passenger: 'Paul Mbarga',
      route: 'Yaoundé → Ngaoundéré',
      date: '5 Août 06:00',
      status: 'confirmed',
      amount: '25,000 FCFA'
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={16} className="status-success" />;
      case 'pending':
        return <Clock size={16} className="status-warning" />;
      case 'cancelled':
        return <AlertCircle size={16} className="status-danger" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="text-title">Dashboard</h1>
        <p className="text-caption">Vue d'ensemble de votre agence</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <Icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
                <span className="stat-change status-success">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="card-header">
            <h3 className="text-headline">Trajets et Revenus</h3>
            <p className="text-caption">Performance mensuelle</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'none'
                  }}
                />
                <Bar dataKey="trajets" fill="var(--primary)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3 className="text-headline">Statut des réservations</h3>
            <p className="text-caption">Répartition actuelle</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'none'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            {statusData.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-caption">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-section">
        <div className="section-header">
          <h3 className="text-headline">Réservations récentes</h3>
          <button className="btn btn-outline">Voir tout</button>
        </div>
        <div className="bookings-list">
          {recentBookings.map((booking) => (
            <div key={booking.id} className="booking-item">
              <div className="booking-info">
                <div className="booking-header">
                  <span className="booking-id">{booking.id}</span>
                  <div className="booking-status">
                    {getStatusIcon(booking.status)}
                    <span className="text-small">{getStatusText(booking.status)}</span>
                  </div>
                </div>
                <h4 className="text-body-bold">{booking.passenger}</h4>
                <p className="text-caption">{booking.route}</p>
                <p className="text-small">{booking.date}</p>
              </div>
              <div className="booking-amount">
                <span className="text-body-bold status-success">{booking.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
