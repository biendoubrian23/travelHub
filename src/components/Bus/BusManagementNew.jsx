import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './BusManagement.css';

const BusManagement = () => {
  // États
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    licensePlate: '',
    totalSeats: '',
    isVip: false,
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Récupérer les bus de l'agence
  const fetchBuses = async () => {
    setLoading(true);
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non connecté');
        return;
      }

      let agencyId = null;

      // Méthode 1: Vérifier si c'est le propriétaire de l'agence
      const { data: agencyOwner, error: ownerError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyOwner && !ownerError) {
        agencyId = agencyOwner.id;
      } else {
        // Méthode 2: Chercher l'agence via les invitations d'employés
        const { data: employeeData, error: employeeError } = await supabase
          .from('agency_employee_invitations')
          .select('agency_id')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .single();

        if (employeeData && !employeeError) {
          agencyId = employeeData.agency_id;
        }
      }

      if (!agencyId) {
        console.error('Aucune agence trouvée pour cet utilisateur');
        return;
      }

      // Récupérer les bus de l'agence
      const { data: agencyBuses, error: busesError } = await supabase
        .from('buses')
        .select('*')
        .eq('agency_id', agencyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (busesError) {
        console.error('Erreur lors de la récupération des bus:', busesError);
        return;
      }

      setBuses(agencyBuses || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des bus:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les bus au montage du composant
  useEffect(() => {
    fetchBuses();
  }, []);

  // Filtrer les bus par recherche
  const filteredBuses = buses.filter(bus =>
    !searchTerm ||
    bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      licensePlate: '',
      totalSeats: '',
      isVip: false,
      notes: ''
    });
    setFormErrors({});
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Supprimer l'erreur du champ modifié
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du bus est requis';
    }

    if (!formData.licensePlate.trim()) {
      errors.licensePlate = 'La plaque d\'immatriculation est requise';
    }

    if (!formData.totalSeats || formData.totalSeats <= 0) {
      errors.totalSeats = 'Le nombre de places doit être supérieur à 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Ajouter un nouveau bus
  const handleAddBus = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Utilisateur non connecté');
        return;
      }

      let agencyId = null;

      // Méthode 1: Vérifier si c'est le propriétaire de l'agence
      const { data: agencyOwner, error: ownerError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyOwner && !ownerError) {
        agencyId = agencyOwner.id;
      } else {
        // Méthode 2: Chercher l'agence via les invitations d'employés
        const { data: employeeData, error: employeeError } = await supabase
          .from('agency_employee_invitations')
          .select('agency_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (employeeData && !employeeError) {
          agencyId = employeeData.agency_id;
        }
      }

      if (!agencyId) {
        alert('Aucune agence trouvée pour cet utilisateur');
        return;
      }

      // Insérer le nouveau bus
      const { error: insertError } = await supabase
        .from('buses')
        .insert({
          agency_id: agencyId,
          name: formData.name.trim(),
          license_plate: formData.licensePlate.trim(),
          total_seats: parseInt(formData.totalSeats),
          is_vip: formData.isVip,
          notes: formData.notes.trim() || null,
          created_by: user.id
        });

      if (insertError) {
        if (insertError.code === '23505') {
          alert('Cette plaque d\'immatriculation existe déjà dans votre agence');
        } else {
          alert('Erreur lors de l\'ajout du bus');
          console.error('Erreur:', insertError);
        }
        return;
      }

      // Recharger la liste des bus
      await fetchBuses();
      
      // Fermer le modal et réinitialiser le formulaire
      setShowAddModal(false);
      resetForm();
      
      alert('Bus ajouté avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bus:', error);
      alert('Erreur lors de l\'ajout du bus');
    } finally {
      setSubmitting(false);
    }
  };

  // Modifier un bus
  const handleEditBus = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('buses')
        .update({
          name: formData.name.trim(),
          license_plate: formData.licensePlate.trim(),
          total_seats: parseInt(formData.totalSeats),
          is_vip: formData.isVip,
          notes: formData.notes.trim() || null
        })
        .eq('id', editingBus.id);

      if (updateError) {
        if (updateError.code === '23505') {
          alert('Cette plaque d\'immatriculation existe déjà dans votre agence');
        } else {
          alert('Erreur lors de la modification du bus');
          console.error('Erreur:', updateError);
        }
        return;
      }

      // Recharger la liste des bus
      await fetchBuses();
      
      // Fermer le modal et réinitialiser le formulaire
      setShowEditModal(false);
      setEditingBus(null);
      resetForm();
      
      alert('Bus modifié avec succès !');
    } catch (error) {
      console.error('Erreur lors de la modification du bus:', error);
      alert('Erreur lors de la modification du bus');
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un bus
  const handleDeleteBus = async (bus) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le bus "${bus.name}" ?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('buses')
        .update({ is_active: false })
        .eq('id', bus.id);

      if (deleteError) {
        alert('Erreur lors de la suppression du bus');
        console.error('Erreur:', deleteError);
        return;
      }

      // Recharger la liste des bus
      await fetchBuses();
      
      alert('Bus supprimé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du bus:', error);
      alert('Erreur lors de la suppression du bus');
    }
  };

  // Ouvrir le modal d'édition
  const openEditModal = (bus) => {
    setEditingBus(bus);
    setFormData({
      name: bus.name,
      licensePlate: bus.license_plate,
      totalSeats: bus.total_seats.toString(),
      isVip: bus.is_vip,
      notes: bus.notes || ''
    });
    setShowEditModal(true);
  };

  // Fermer les modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingBus(null);
    resetForm();
  };

  return (
    <div className="bus-management">
      {/* En-tête */}
      <div className="page-header">
        <div className="header-content">
          <h1>🚌 Gestion des Bus</h1>
          <p>Gérez votre flotte de bus</p>
        </div>
        
        <button 
          className="add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <span className="btn-icon">+</span>
          Ajouter un bus
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher par nom ou plaque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Liste des bus */}
      <div className="buses-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des bus...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚌</div>
            <h3>Aucun bus trouvé</h3>
            <p>
              {searchTerm 
                ? 'Aucun bus ne correspond à votre recherche.'
                : 'Commencez par ajouter votre premier bus.'
              }
            </p>
          </div>
        ) : (
          <div className="buses-grid">
            {filteredBuses.map(bus => (
              <div key={bus.id} className="bus-card">
                <div className="bus-header">
                  <div className="bus-info">
                    <h3 className="bus-name">{bus.name}</h3>
                    <p className="bus-plate">{bus.license_plate}</p>
                  </div>
                  <div className="bus-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => openEditModal(bus)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteBus(bus)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="bus-details">
                  <div className="detail-item">
                    <span className="detail-icon">🪑</span>
                    <span className="detail-text">{bus.total_seats} places</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-icon">⭐</span>
                    <span className="detail-text">{bus.is_vip ? 'VIP' : 'Standard'}</span>
                  </div>
                  
                  {bus.notes && (
                    <div className="bus-notes">
                      <span className="detail-icon">📝</span>
                      <span className="detail-text">{bus.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Ajouter un bus</h2>
              <button className="close-btn" onClick={closeModals}>✕</button>
            </div>
            
            <form onSubmit={handleAddBus} className="bus-form">
              <div className="form-group">
                <label htmlFor="name">Nom du bus *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Express Voyageur"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="licensePlate">Plaque d'immatriculation *</label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="Ex: LT-234-CM"
                  className={formErrors.licensePlate ? 'error' : ''}
                />
                {formErrors.licensePlate && <span className="error-message">{formErrors.licensePlate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="totalSeats">Nombre de places *</label>
                <input
                  type="number"
                  id="totalSeats"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  placeholder="Ex: 45"
                  min="1"
                  className={formErrors.totalSeats ? 'error' : ''}
                />
                {formErrors.totalSeats && <span className="error-message">{formErrors.totalSeats}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isVip"
                    checked={formData.isVip}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Bus VIP
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optionnel)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Informations supplémentaires..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModals}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Ajout...' : 'Ajouter le bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Modifier le bus</h2>
              <button className="close-btn" onClick={closeModals}>✕</button>
            </div>
            
            <form onSubmit={handleEditBus} className="bus-form">
              <div className="form-group">
                <label htmlFor="name">Nom du bus *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Express Voyageur"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="licensePlate">Plaque d'immatriculation *</label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  placeholder="Ex: LT-234-CM"
                  className={formErrors.licensePlate ? 'error' : ''}
                />
                {formErrors.licensePlate && <span className="error-message">{formErrors.licensePlate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="totalSeats">Nombre de places *</label>
                <input
                  type="number"
                  id="totalSeats"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  placeholder="Ex: 45"
                  min="1"
                  className={formErrors.totalSeats ? 'error' : ''}
                />
                {formErrors.totalSeats && <span className="error-message">{formErrors.totalSeats}</span>}
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isVip"
                    checked={formData.isVip}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Bus VIP
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes (optionnel)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Informations supplémentaires..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={closeModals}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Modification...' : 'Modifier le bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;
