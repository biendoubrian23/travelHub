import React, { useState, useEffect } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import BusList from './BusList';
import BusDetail from './BusDetail';
import BusForm from './BusForm';
import BusSeatingMap from './BusSeatingMap';
import './BusManagement.css';

const BusManagement = () => {
  const { currentRole, hasPermission } = useRolePermissions();
  const [currentView, setCurrentView] = useState('list');
  const [selectedBus, setSelectedBus] = useState(null);
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // États pour les données
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Données mockées pour la démo
  useEffect(() => {
    // Simulation d'un appel API
    setTimeout(() => {
      setBuses([
        {
          id: 1,
          number: 'BUS-001',
          brand: 'Mercedes-Benz',
          model: 'Travego',
          capacity: 45,
          status: 'available',
          currentRoute: null,
          driver: null,
          seating: generateSeatingMap(45),
          maintenance: {
            lastCheck: '2024-01-15',
            nextCheck: '2024-04-15',
            status: 'good'
          },
          features: ['AC', 'WiFi', 'USB', 'TV'],
          licensePlate: 'CAM-001-AA'
        },
        {
          id: 2,
          number: 'BUS-002',
          brand: 'Scania',
          model: 'Touring',
          capacity: 52,
          status: 'in_service',
          currentRoute: {
            id: 1,
            from: 'Douala',
            to: 'Yaoundé',
            departure: '2024-01-20T08:00:00',
            arrival: '2024-01-20T12:00:00'
          },
          driver: {
            id: 1,
            name: 'Jean Mboma',
            phone: '+237670123456'
          },
          seating: generateSeatingMap(52, [1, 5, 12, 23]), // Sièges occupés
          maintenance: {
            lastCheck: '2024-01-10',
            nextCheck: '2024-04-10',
            status: 'good'
          },
          features: ['AC', 'WiFi', 'USB', 'TV', 'Toilet'],
          licensePlate: 'CAM-002-BB'
        },
        {
          id: 3,
          number: 'BUS-003',
          brand: 'Volvo',
          model: '9700',
          capacity: 48,
          status: 'maintenance',
          currentRoute: null,
          driver: null,
          seating: generateSeatingMap(48),
          maintenance: {
            lastCheck: '2024-01-18',
            nextCheck: '2024-02-01',
            status: 'needs_attention'
          },
          features: ['AC', 'WiFi', 'USB'],
          licensePlate: 'CAM-003-CC'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Génération du plan de siège
  function generateSeatingMap(capacity, occupiedSeats = []) {
    const seats = [];
    for (let i = 1; i <= capacity; i++) {
      seats.push({
        number: i,
        status: occupiedSeats.includes(i) ? 'occupied' : 'available',
        passenger: occupiedSeats.includes(i) ? {
          name: `Passager ${i}`,
          phone: '+237670000000'
        } : null
      });
    }
    return seats;
  }

  // Gestion des vues
  const handleViewChange = (view, bus = null) => {
    setCurrentView(view);
    setSelectedBus(bus);
  };

  // Filtrage des bus
  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bus.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || bus.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Actions sur les bus
  const handleBusAction = async (action, busData) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'create': {
          // Simulation création
          const newBus = {
            ...busData,
            id: Date.now(),
            seating: generateSeatingMap(busData.capacity),
            status: 'available'
          };
          setBuses(prev => [...prev, newBus]);
          setCurrentView('list');
          break;
        }
          
        case 'update': {
          setBuses(prev => prev.map(bus => 
            bus.id === busData.id ? { ...bus, ...busData } : bus
          ));
          setCurrentView('list');
          break;
        }
          
        case 'delete': {
          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bus ?')) {
            setBuses(prev => prev.filter(bus => bus.id !== busData.id));
            setCurrentView('list');
          }
          break;
        }
          
        default:
          console.log('Action non reconnue:', action);
      }
    } catch (error) {
      setError('Erreur lors de l\'opération: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && buses.length === 0) {
    return (
      <div className="bus-management loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des bus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bus-management">
      {/* Header avec actions globales */}
      <div className="bus-management-header">
        <div className="header-title">
          <h1>🚌 Gestion des Bus</h1>
          <div className="bus-stats">
            <span className="stat">
              <strong>{buses.length}</strong> Bus total
            </span>
            <span className="stat available">
              <strong>{buses.filter(b => b.status === 'available').length}</strong> Disponibles
            </span>
            <span className="stat in-service">
              <strong>{buses.filter(b => b.status === 'in_service').length}</strong> En service
            </span>
            <span className="stat maintenance">
              <strong>{buses.filter(b => b.status === 'maintenance').length}</strong> Maintenance
            </span>
          </div>
        </div>

        <div className="header-actions">
          {hasPermission('buses', 'create') && (
            <button 
              className="btn-primary"
              onClick={() => handleViewChange('create')}
            >
              ➕ Nouveau Bus
            </button>
          )}
          
          <div className="view-toggle">
            <button 
              className={currentView === 'list' ? 'active' : ''}
              onClick={() => handleViewChange('list')}
            >
              📋 Liste
            </button>
            <button 
              className={currentView === 'grid' ? 'active' : ''}
              onClick={() => handleViewChange('grid')}
            >
              🔲 Grille
            </button>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bus-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Rechercher un bus (numéro, marque, modèle...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="in_service">En service</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bus-content">
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {currentView === 'list' && (
          <BusList 
            buses={filteredBuses}
            onViewBus={(bus) => handleViewChange('detail', bus)}
            onEditBus={(bus) => handleViewChange('edit', bus)}
            onDeleteBus={(bus) => handleBusAction('delete', bus)}
            onViewSeating={(bus) => handleViewChange('seating', bus)}
            currentRole={currentRole}
          />
        )}

        {currentView === 'detail' && selectedBus && (
          <BusDetail 
            bus={selectedBus}
            onBack={() => handleViewChange('list')}
            onEdit={() => handleViewChange('edit', selectedBus)}
            onViewSeating={() => handleViewChange('seating', selectedBus)}
            currentRole={currentRole}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <BusForm 
            bus={currentView === 'edit' ? selectedBus : null}
            onSave={(busData) => handleBusAction(currentView === 'edit' ? 'update' : 'create', busData)}
            onCancel={() => handleViewChange('list')}
            currentRole={currentRole}
          />
        )}

        {currentView === 'seating' && selectedBus && (
          <BusSeatingMap 
            bus={selectedBus}
            onBack={() => handleViewChange('detail', selectedBus)}
            currentRole={currentRole}
          />
        )}
      </div>
    </div>
  );
};

export default BusManagement;
