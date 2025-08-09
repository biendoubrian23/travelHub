import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SectionTitle, EmptyState } from './SuperAdminComponents';
import AgencyModal from './AgencyModal';

const Agencies = () => {
  const [showModal, setShowModal] = useState(false);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Charger les agences depuis la base de données
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        console.log('Chargement des agences...');
        
        // Récupérer les agences avec les données de l'utilisateur associé
        const { data, error } = await supabase
          .from('agencies')
          .select(`
            id, 
            name, 
            email, 
            phone, 
            is_verified,
            created_at,
            updated_at,
            user_id,
            description,
            address
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('Agences récupérées:', data);
        
        // Récupérer les statistiques de réservations pour chaque agence (requête fictive pour le moment)
        // Idéalement, on devrait faire une requête COUNT pour chaque agence
        const bookingStats = {
          // Exemple fictif de statistiques de réservations
          // agence_id: nombre de réservations
        };
        
        // Formater les données pour l'affichage
        const formattedAgencies = data.map(agency => ({
          id: agency.id,
          name: agency.name || 'Agence sans nom',
          email: agency.email || 'Email non défini',
          phone: agency.phone || 'Téléphone non défini',
          status: agency.is_verified ? 'Actif' : 'En attente',
          reservations: bookingStats[agency.id] || 0,
          lastActive: agency.updated_at 
            ? new Date(agency.updated_at).toLocaleDateString('fr-FR') 
            : new Date(agency.created_at).toLocaleDateString('fr-FR')
        }));
        
        console.log('Agences formatées:', formattedAgencies);
        setAgencies(formattedAgencies);
        
      } catch (err) {
        console.error("Erreur lors du chargement des agences:", err);
        setError("Une erreur est survenue lors du chargement des agences.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgencies();
  }, []);
  
  // Ajouter une nouvelle agence à la liste
  const handleAgencyCreated = (newAgency) => {
    setAgencies([newAgency, ...agencies]);
  };
  
  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="agencies-container">
      <SectionTitle 
        title="Gestion des agences" 
        actionButton={
          <button className="primary-button" onClick={() => setShowModal(true)}>
            <span style={{ marginRight: '8px' }}>+</span>Nouvelle agence
          </button>
        }
      />
      
      {/* Modal pour créer une nouvelle agence */}
      <AgencyModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={handleAgencyCreated}
      />
      
      {/* Afficher un indicateur de chargement */}
      {loading && (
        <div className="loading-indicator">
          <p>Chargement des agences...</p>
        </div>
      )}
      
      {/* Afficher les erreurs s'il y en a */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
        
        <div className="filters">
          <select className="filter-select">
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
          </select>
          
          <select className="filter-select">
            <option value="recent">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="name-asc">Nom (A-Z)</option>
            <option value="name-desc">Nom (Z-A)</option>
          </select>
        </div>
      </div>
      
      {filteredAgencies.length > 0 ? (
        <div className="agencies-list">
          <table className="data-table">
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
              {filteredAgencies.map((agency) => (
                <tr key={agency.id}>
                  <td>{agency.name}</td>
                  <td>{agency.email}</td>
                  <td>{agency.phone}</td>
                  <td>
                    <span className={`status-badge ${agency.status === 'Actif' ? 'active' : 'pending'}`}>
                      {agency.status}
                    </span>
                  </td>
                  <td>{agency.reservations}</td>
                  <td>{agency.lastActive}</td>
                  <td className="actions-cell">
                    <button className="icon-button" title="Voir les détails">📋</button>
                    <button className="icon-button" title="Modifier">✏️</button>
                    <button className="icon-button" title={agency.status === 'Actif' ? 'Suspendre' : 'Activer'}>
                      {agency.status === 'Actif' ? '⚠️' : '✅'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination">
            <button className="pagination-button">«</button>
            <button className="pagination-button active">1</button>
            <button className="pagination-button">2</button>
            <button className="pagination-button">3</button>
            <button className="pagination-button">»</button>
          </div>
        </div>
      ) : (
        <EmptyState 
          title="Aucune agence trouvée"
          description="Aucune agence ne correspond à votre recherche. Essayez de modifier vos critères de recherche ou ajoutez une nouvelle agence."
          actionLabel="Ajouter une agence"
          onAction={() => setShowModal(true)}
        />
      )}
    </div>
  );
};

export default Agencies;
