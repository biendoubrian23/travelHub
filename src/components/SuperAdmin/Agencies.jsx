import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import CreateAgencyWizard from './CreateAgencyWizard';
import StatusMessage from './components/StatusMessage';
import AgencyDetails from './Agencies/AgencyDetails';

const Agencies = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [selectedAgency, setSelectedAgency] = useState(null);

  // Fonction pour charger les agences depuis Supabase
  // Fonction pour déterminer le statut d'une agence
  const determineAgencyStatus = (agency) => {
    if (agency.is_active) {
      return 'active';
    } else if (agency.is_verified) {
      return 'inactive';
    } else {
      return 'pending';
    }
  };

  // Fonction pour activer ou désactiver une agence
  const toggleAgencyStatus = async (agencyId, activate, agencyName) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('agencies')
        .update({ 
          is_active: activate,
          // Si on active, on s'assure que l'agence est vérifiée
          ...(activate ? { is_verified: true } : {})
        })
        .eq('id', agencyId);
      
      if (error) throw error;
      
      // Rafraîchir la liste des agences
      await fetchAgencies();
      
      // Message de succès
      setStatusMessage({
        type: 'success',
        message: `L'agence "${agencyName}" a été ${activate ? 'activée' : 'désactivée'} avec succès.`
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setStatusMessage({
        type: 'error',
        message: `Impossible de modifier le statut de l'agence: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construire la requête de base
      let query = supabase
        .from('agencies')
        .select('*');
      
      // Appliquer les filtres
      if (statusFilter !== 'all') {
        switch(statusFilter) {
          case 'active':
            query = query.eq('is_active', true);
            break;
          case 'pending':
            query = query.eq('is_verified', false);
            break;
          case 'inactive':
            query = query.eq('is_active', false).eq('is_verified', true);
            break;
        }
      }
      
      // Appliquer le tri
      switch(sortOrder) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
      }
      
      // Exécuter la requête
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Formater les résultats
      const formattedAgencies = data.map(agency => {
        // Essayer de récupérer le nombre de réservations
        // On simplifie cette partie pour éviter les erreurs si la relation n'existe pas
        let reservations = 0;
        try {
          if (agency.reservation_count !== undefined) {
            reservations = agency.reservation_count;
          }
        } catch (err) {
          console.warn('Impossible de récupérer le nombre de réservations', err);
        }
        
        return {
          id: agency.id,
          name: agency.name,
          email: agency.email,
          phone: agency.phone,
          status: determineAgencyStatus(agency),
          is_active: agency.is_active,
          is_verified: agency.is_verified,
          reservations: reservations,
          lastActivity: new Date(agency.last_activity || agency.created_at).toLocaleDateString('fr-FR')
        };
      });
      
      // Appliquer la recherche côté client
      let filteredAgencies = formattedAgencies;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredAgencies = formattedAgencies.filter(agency => 
          agency.name.toLowerCase().includes(searchLower) ||
          agency.email.toLowerCase().includes(searchLower)
        );
      }
      
      setAgencies(filteredAgencies);
    } catch (error) {
      console.error('Erreur lors du chargement des agences:', error);
      setError('Impossible de charger les agences. Veuillez réessayer plus tard.');
      
      // Données de secours en cas d'échec
      setAgencies([
        {
          id: 1,
          name: 'test',
          email: 'clardsgbdfgbkybriant@outlook.fr',
          phone: '+33644814218',
          status: 'active',
          reservations: 0,
          lastActivity: '09/08/2025'
        },
        {
          id: 2,
          name: 'BRIAN BIENDOU',
          email: 'clarkybrian@outlook.fr',
          phone: '+33644814218',
          status: 'active',
          reservations: 0,
          lastActivity: '09/08/2025'
        },
        {
          id: 3,
          name: 'Agence Transport Plus',
          email: 'patron@agence.com',
          phone: '+23769123456',
          status: 'active',
          reservations: 0,
          lastActivity: '04/08/2025'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortOrder]);
  
  // Charger les agences au chargement et quand les filtres changent
  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies, refreshTrigger]);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateAgency = (agencyData) => {
    // L'agence est déjà créée dans le composant CreateAgencyWizard
    // Nous actualisons la liste complète pour obtenir toutes les agences à jour
    setRefreshTrigger(prev => prev + 1);
    // Afficher un message de succès
    setStatusMessage({
      type: 'success',
      message: `L'agence "${agencyData.name}" a été créée avec succès.`
    });
  };
  
  // Handlers pour les filtres et la recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };
  
  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="sadmin-agencies">
      <div className="sadmin-agencies-header">
        <div className="sadmin-search-container">
          <span className="sadmin-search-icon">🔍</span>
          <input
            type="text"
            className="sadmin-search-input"
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="sadmin-filters-container">
          <select 
            className="sadmin-filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="inactive">Inactif</option>
          </select>
          
          <select 
            className="sadmin-filter-select"
            value={sortOrder}
            onChange={handleSortOrderChange}
          >
            <option value="recent">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
          </select>
          
          <button
            className="sadmin-button sadmin-button-secondary"
            onClick={handleRefresh}
            title="Actualiser la liste"
          >
            🔄
          </button>
          
          <button 
            className="sadmin-button sadmin-button-primary"
            onClick={handleOpenCreateModal}
          >
            + Nouvelle agence
          </button>
        </div>
      </div>
      
      <StatusMessage 
        type={statusMessage.type}
        message={statusMessage.message}
        onClose={() => setStatusMessage({ type: '', message: '' })}
      />
      
      {loading ? (
        <div className="sadmin-loading">Chargement des agences...</div>
      ) : (
        <>
          <div className="sadmin-table-container">
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Nom de l'agence</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Réservations</th>
                  <th>Dernière activité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {agencies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="sadmin-no-data">
                      Aucune agence trouvée. Créez votre première agence !
                    </td>
                  </tr>
                ) : (
                  agencies.map((agency) => (
                    <tr key={agency.id}>
                      <td>{agency.name}</td>
                      <td>{agency.email}</td>
                      <td>{agency.phone}</td>
                      <td>
                        <span className={`sadmin-status-badge sadmin-status-${agency.status}`}>
                          {agency.status === 'active' ? 'Actif' : 
                          agency.status === 'pending' ? 'En attente' : 'Inactif'}
                        </span>
                      </td>
                      <td>{agency.reservations}</td>
                      <td>{agency.lastActivity}</td>
                      <td className="sadmin-actions-cell">
                        <button 
                          className="sadmin-action-button sadmin-view-button" 
                          title="Voir les détails"
                          onClick={() => setSelectedAgency(agency.id)}
                        >
                          👁️
                        </button>
                        <button 
                          className="sadmin-action-button sadmin-edit-button" 
                          title="Modifier"
                          onClick={() => alert('Fonction de modification en cours de développement')}
                        >
                          ✏️
                        </button>
                        {agency.status === 'active' ? (
                          <button 
                            className="sadmin-action-button sadmin-delete-button" 
                            title="Désactiver l'agence"
                            onClick={() => {
                              if (window.confirm(`Êtes-vous sûr de vouloir désactiver l'agence "${agency.name}" ?`)) {
                                toggleAgencyStatus(agency.id, false, agency.name);
                              }
                            }}
                          >
                            🚫
                          </button>
                        ) : (
                          <button 
                            className="sadmin-action-button sadmin-success-button" 
                            title="Activer l'agence"
                            onClick={() => {
                              toggleAgencyStatus(agency.id, true, agency.name);
                            }}
                          >
                            ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {agencies.length > 0 && (
            <div className="sadmin-pagination">
              <button className="sadmin-pagination-button">«</button>
              <button className="sadmin-pagination-button active">1</button>
              <button className="sadmin-pagination-button">2</button>
              <button className="sadmin-pagination-button">3</button>
              <button className="sadmin-pagination-button">»</button>
            </div>
          )}
        </>
      )}
      
      {showCreateModal && (
        <CreateAgencyWizard 
          onClose={handleCloseCreateModal}
          onCreate={handleCreateAgency}
        />
      )}
      
      {selectedAgency && (
        <AgencyDetails
          agencyId={selectedAgency}
          onClose={() => setSelectedAgency(null)}
        />
      )}
    </div>
  );
};

export default Agencies;
