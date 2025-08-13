import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import StatusMessage from '../components/StatusMessage';

const AgencyDetails = ({ agencyId, onClose }) => {
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeTrips: 0,
    revenue: 0,
    lastBookingDate: null
  });

  useEffect(() => {
    const fetchAgencyDetails = async () => {
      try {
        setLoading(true);
        
        // Charger les détails de l'agence
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', agencyId)
          .single();
          
        if (agencyError) throw agencyError;
        if (!agencyData) throw new Error('Agence introuvable');
        
        setAgency(agencyData);
        
        // Charger les admins de l'agence
        const { data: adminsData, error: adminsError } = await supabase
          .from('profiles')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('role', 'admin');
          
        if (adminsError) throw adminsError;
        setAdmins(adminsData || []);
        
        // Charger les statistiques
        // Ces requêtes peuvent varier selon la structure de votre base de données
        try {
          // Nombre total de réservations
          const { count: bookingsCount } = await supabase
            .from('bookings')
            .select('id', { count: 'exact' })
            .eq('agency_id', agencyId);
            
          // Nombre de trajets actifs
          const { count: activeTripsCount } = await supabase
            .from('trips')
            .select('id', { count: 'exact' })
            .eq('agency_id', agencyId)
            .gte('departure_time', new Date().toISOString());
            
          // Dernière réservation
          const { data: lastBooking } = await supabase
            .from('bookings')
            .select('created_at')
            .eq('agency_id', agencyId)
            .order('created_at', { ascending: false })
            .limit(1);
            
          setStats({
            totalBookings: bookingsCount || 0,
            activeTrips: activeTripsCount || 0,
            revenue: 0, // Calculé à partir d'une autre source potentiellement
            lastBookingDate: lastBooking?.[0]?.created_at || null
          });
        } catch (statsError) {
          console.warn('Erreur lors du chargement des statistiques:', statsError);
        }
        
      } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgencyDetails();
  }, [agencyId]);

  if (loading) {
    return <div className="sadmin-loading">Chargement des détails de l'agence...</div>;
  }

  if (error) {
    return (
      <div className="sadmin-error-container">
        <h2>Erreur</h2>
        <p>{error}</p>
        <button className="sadmin-button" onClick={onClose}>Retour</button>
      </div>
    );
  }

  return (
    <div className="sadmin-agency-details">
      <StatusMessage
        type={statusMessage.type}
        message={statusMessage.message}
        onClose={() => setStatusMessage({ type: '', message: '' })}
      />
      
      <div className="sadmin-modal-header">
        <h2>Détails de l'agence</h2>
        <button className="sadmin-modal-close" onClick={onClose}>×</button>
      </div>
      
      <div className="sadmin-agency-info">
        <div className="sadmin-info-section">
          <h3>Informations générales</h3>
          <div className="sadmin-info-grid">
            <div className="sadmin-info-item">
              <span className="sadmin-label">Nom:</span>
              <span className="sadmin-value">{agency.name}</span>
            </div>
            <div className="sadmin-info-item">
              <span className="sadmin-label">Email:</span>
              <span className="sadmin-value">{agency.email}</span>
            </div>
            <div className="sadmin-info-item">
              <span className="sadmin-label">Téléphone:</span>
              <span className="sadmin-value">{agency.phone || 'Non renseigné'}</span>
            </div>
            <div className="sadmin-info-item">
              <span className="sadmin-label">Adresse:</span>
              <span className="sadmin-value">{agency.address || 'Non renseignée'}</span>
            </div>
            <div className="sadmin-info-item">
              <span className="sadmin-label">Statut:</span>
              <span className={`sadmin-value sadmin-status-badge sadmin-status-${agency.is_active ? 'active' : agency.is_verified ? 'inactive' : 'pending'}`}>
                {agency.is_active ? 'Actif' : agency.is_verified ? 'Inactif' : 'En attente'}
              </span>
            </div>
            <div className="sadmin-info-item">
              <span className="sadmin-label">Date de création:</span>
              <span className="sadmin-value">
                {new Date(agency.created_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="sadmin-info-section">
          <h3>Statistiques</h3>
          <div className="sadmin-stats-grid">
            <div className="sadmin-stat-card">
              <div className="sadmin-stat-value">{stats.totalBookings}</div>
              <div className="sadmin-stat-label">Réservations totales</div>
            </div>
            <div className="sadmin-stat-card">
              <div className="sadmin-stat-value">{stats.activeTrips}</div>
              <div className="sadmin-stat-label">Trajets actifs</div>
            </div>
            <div className="sadmin-stat-card">
              <div className="sadmin-stat-value">{admins.length}</div>
              <div className="sadmin-stat-label">Administrateurs</div>
            </div>
            <div className="sadmin-stat-card">
              <div className="sadmin-stat-value">
                {stats.lastBookingDate 
                  ? new Date(stats.lastBookingDate).toLocaleDateString('fr-FR') 
                  : 'Aucune'}
              </div>
              <div className="sadmin-stat-label">Dernière réservation</div>
            </div>
          </div>
        </div>
        
        <div className="sadmin-info-section">
          <h3>Administrateurs de l'agence</h3>
          {admins.length === 0 ? (
            <p className="sadmin-no-data">Aucun administrateur trouvé pour cette agence.</p>
          ) : (
            <table className="sadmin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td>{admin.first_name} {admin.last_name}</td>
                    <td>{admin.email}</td>
                    <td>
                      <span className={`sadmin-status-badge sadmin-status-${admin.is_active ? 'active' : 'inactive'}`}>
                        {admin.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>{new Date(admin.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <div className="sadmin-actions">
        <button 
          className="sadmin-button sadmin-button-secondary"
          onClick={onClose}
        >
          Fermer
        </button>
        {agency.is_active ? (
          <button 
            className="sadmin-button sadmin-button-danger"
            onClick={async () => {
              if (window.confirm(`Êtes-vous sûr de vouloir désactiver l'agence "${agency.name}" ?`)) {
                try {
                  const { error } = await supabase
                    .from('agencies')
                    .update({ is_active: false })
                    .eq('id', agency.id);
                    
                  if (error) throw error;
                  
                  setAgency(prev => ({ ...prev, is_active: false }));
                  setStatusMessage({
                    type: 'success',
                    message: `L'agence "${agency.name}" a été désactivée avec succès.`
                  });
                } catch (error) {
                  console.error('Erreur lors de la désactivation:', error);
                  setStatusMessage({
                    type: 'error',
                    message: `Erreur lors de la désactivation: ${error.message}`
                  });
                }
              }
            }}
          >
            Désactiver l'agence
          </button>
        ) : (
          <button 
            className="sadmin-button sadmin-button-success"
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from('agencies')
                  .update({ 
                    is_active: true,
                    is_verified: true
                  })
                  .eq('id', agency.id);
                  
                if (error) throw error;
                
                setAgency(prev => ({ ...prev, is_active: true, is_verified: true }));
                setStatusMessage({
                  type: 'success',
                  message: `L'agence "${agency.name}" a été activée avec succès.`
                });
              } catch (error) {
                console.error('Erreur lors de l\'activation:', error);
                setStatusMessage({
                  type: 'error',
                  message: `Erreur lors de l'activation: ${error.message}`
                });
              }
            }}
          >
            Activer l'agence
          </button>
        )}
      </div>
    </div>
  );
};

export default AgencyDetails;
