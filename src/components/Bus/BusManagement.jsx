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

      // Récupérer l'agence de l'utilisateur
      const { data: agencies, error: agencyError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyError) {
        console.error('Erreur lors de la récupération de l\'agence:', agencyError);
        return;
      }

      // Récupérer les bus de l'agence
      const { data: agencyBuses, error: busesError } = await supabase
        .from('buses')
        .select('*')
        .eq('agency_id', agencies.id)
        .order('created_at', { ascending: false });

      if (busesError) {
        console.error('Erreur lors de la récupération des bus:', busesError);
        return;
      }

      setBuses(agencyBuses || []);
    } catch (error) {
      console.error('Erreur générale:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // Fonction de filtrage
  const filteredBuses = buses.filter(bus =>
    bus.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du bus est requis';
    }

    if (!formData.licensePlate.trim()) {
      errors.licensePlate = 'La plaque d\'immatriculation est requise';
    }

    if (!formData.totalSeats || formData.totalSeats < 1) {
      errors.totalSeats = 'Le nombre de places doit être supérieur à 0';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Vous devez être connecté pour effectuer cette action');
        return;
      }

      // Récupérer l'agence de l'utilisateur
      const { data: agencies, error: agencyError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyError) {
        alert('Erreur lors de la récupération de votre agence');
        console.error('Erreur:', agencyError);
        return;
      }

      const busData = {
        name: formData.name.trim(),
        license_plate: formData.licensePlate.trim(),
        total_seats: parseInt(formData.totalSeats),
        is_vip: formData.isVip,
        notes: formData.notes.trim() || null,
        agency_id: agencies.id
      };

      let result;
      if (editingBus) {
        // Modification
        result = await supabase
          .from('buses')
          .update(busData)
          .eq('id', editingBus.id)
          .eq('agency_id', agencies.id);
      } else {
        // Ajout
        result = await supabase
          .from('buses')
          .insert([busData]);
      }

      if (result.error) {
        alert('Erreur lors de l\'enregistrement du bus');
        console.error('Erreur:', result.error);
        return;
      }

      // Succès
      await fetchBuses();
      closeModal();
      alert(editingBus ? 'Bus modifié avec succès !' : 'Bus ajouté avec succès !');
    
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du bus:', error);
      alert('Erreur lors de l\'enregistrement du bus');
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
        .delete()
        .eq('id', bus.id);

      if (deleteError) {
        alert('Erreur lors de la suppression du bus');
        console.error('Erreur:', deleteError);
        return;
      }

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
    setFormErrors({});
    setShowEditModal(true);
  };

  // Fermer les modals
  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingBus(null);
    resetForm();
  };

  // Réinitialiser le formulaire
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

  return (
    <div className="bus-mgmt-container">
      {/* En-tête */}
      <div className="bus-mgmt-header">
        <div className="bus-mgmt-header-content">
          <div className="bus-mgmt-header-info">
            <span className="bus-mgmt-icon">🚌</span>
            <div>
              <h1>Gestion des Bus</h1>
              <p>Gérez votre flotte de bus</p>
            </div>
          </div>
          
          <button 
            className="bus-mgmt-add-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Ajouter un bus
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bus-mgmt-search-container">
        <input
          type="text"
          placeholder="Rechercher par nom ou plaque..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bus-mgmt-search-input"
        />
      </div>

      {/* Tableau des bus */}
      <div className="bus-mgmt-table-container">
        {loading ? (
          <div className="bus-mgmt-loading">
            <div className="bus-mgmt-spinner"></div>
            <p>Chargement des bus...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="bus-mgmt-empty">
            <div className="bus-mgmt-empty-icon">🚌</div>
            <h3>Aucun bus trouvé</h3>
            <p>
              {searchTerm 
                ? 'Aucun bus ne correspond à votre recherche.'
                : 'Commencez par ajouter votre premier bus.'
              }
            </p>
          </div>
        ) : (
          <table className="bus-mgmt-table">
            <thead>
              <tr>
                <th>Nom du Bus</th>
                <th>Plaque</th>
                <th>Places</th>
                <th>Type</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuses.map(bus => (
                <tr key={bus.id}>
                  <td>
                    <span className="bus-mgmt-name">{bus.name}</span>
                  </td>
                  <td>
                    <span className="bus-mgmt-plate">{bus.license_plate}</span>
                  </td>
                  <td>
                    <div className="bus-mgmt-seats">
                      <span className="bus-mgmt-icon">🪑</span>
                      {bus.total_seats} places
                    </div>
                  </td>
                  <td>
                    <span className={`bus-mgmt-type ${bus.is_vip ? 'bus-mgmt-vip' : 'bus-mgmt-standard'}`}>
                      {bus.is_vip ? 'VIP' : 'Standard'}
                    </span>
                  </td>
                  <td>
                    <span className="bus-mgmt-notes">
                      {bus.notes || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="bus-mgmt-actions">
                      <button 
                        className="bus-mgmt-action-btn bus-mgmt-edit-btn"
                        onClick={() => openEditModal(bus)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        className="bus-mgmt-action-btn bus-mgmt-delete-btn"
                        onClick={() => handleDeleteBus(bus)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="bus-mgmt-modal-overlay">
          <div className="bus-mgmt-modal">
            <div className="bus-mgmt-modal-header">
              <h2>+ Ajouter un bus</h2>
              <button className="bus-mgmt-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="bus-mgmt-form">
              <div className="bus-mgmt-form-group">
                <label htmlFor="name">Nom du bus *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={formErrors.name ? 'bus-mgmt-error' : ''}
                  placeholder="Ex: Express Voyageur"
                />
                {formErrors.name && <span className="bus-mgmt-error-message">{formErrors.name}</span>}
              </div>

              <div className="bus-mgmt-form-group">
                <label htmlFor="licensePlate">Plaque d'immatriculation *</label>
                <input
                  type="text"
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  className={formErrors.licensePlate ? 'bus-mgmt-error' : ''}
                  placeholder="Ex: LT-234-CM"
                />
                {formErrors.licensePlate && <span className="bus-mgmt-error-message">{formErrors.licensePlate}</span>}
              </div>

              <div className="bus-mgmt-form-group">
                <label htmlFor="totalSeats">Nombre de places *</label>
                <input
                  type="number"
                  id="totalSeats"
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                  className={formErrors.totalSeats ? 'bus-mgmt-error' : ''}
                  placeholder="Ex: 45"
                />
                {formErrors.totalSeats && <span className="bus-mgmt-error-message">{formErrors.totalSeats}</span>}
              </div>

              <div className="bus-mgmt-checkbox-group">
                <label className="bus-mgmt-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={(e) => setFormData({...formData, isVip: e.target.checked})}
                  />
                  <span className="bus-mgmt-checkmark"></span>
                  Bus VIP
                </label>
              </div>

              <div className="bus-mgmt-form-group">
                <label htmlFor="notes">Notes (optionnel)</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Informations supplémentaires..."
                  maxLength="500"
                />
                <div className="bus-mgmt-character-count">{formData.notes.length}/500 caractères</div>
              </div>

              <div className="bus-mgmt-form-actions">
                <button type="button" className="bus-mgmt-cancel-btn" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="bus-mgmt-submit-btn" disabled={submitting}>
                  {submitting && <span className="bus-mgmt-loading-spinner"></span>}
                  Ajouter le bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <div className="bus-mgmt-modal-overlay">
          <div className="bus-mgmt-modal">
            <div className="bus-mgmt-modal-header">
              <h2>✏️ Modifier le bus</h2>
              <button className="bus-mgmt-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="bus-mgmt-form">
              <div className="bus-mgmt-form-group">
                <label htmlFor="edit-name">Nom du bus *</label>
                <input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={formErrors.name ? 'bus-mgmt-error' : ''}
                  placeholder="Ex: Express Voyageur"
                />
                {formErrors.name && <span className="bus-mgmt-error-message">{formErrors.name}</span>}
              </div>

              <div className="bus-mgmt-form-group">
                <label htmlFor="edit-licensePlate">Plaque d'immatriculation *</label>
                <input
                  type="text"
                  id="edit-licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  className={formErrors.licensePlate ? 'bus-mgmt-error' : ''}
                  placeholder="Ex: LT-234-CM"
                />
                {formErrors.licensePlate && <span className="bus-mgmt-error-message">{formErrors.licensePlate}</span>}
              </div>

              <div className="bus-mgmt-form-group">
                <label htmlFor="edit-totalSeats">Nombre de places *</label>
                <input
                  type="number"
                  id="edit-totalSeats"
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({...formData, totalSeats: e.target.value})}
                  className={formErrors.totalSeats ? 'bus-mgmt-error' : ''}
                  placeholder="Ex: 45"
                />
                {formErrors.totalSeats && <span className="bus-mgmt-error-message">{formErrors.totalSeats}</span>}
              </div>

              <div className="bus-mgmt-checkbox-group">
                <label className="bus-mgmt-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={(e) => setFormData({...formData, isVip: e.target.checked})}
                  />
                  <span className="bus-mgmt-checkmark"></span>
                  Bus VIP
                </label>
              </div>

              <div className="bus-mgmt-form-group">
                <label htmlFor="edit-notes">Notes (optionnel)</label>
                <textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Informations supplémentaires..."
                  maxLength="500"
                />
                <div className="bus-mgmt-character-count">{formData.notes.length}/500 caractères</div>
              </div>

              <div className="bus-mgmt-form-actions">
                <button type="button" className="bus-mgmt-cancel-btn" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="bus-mgmt-submit-btn" disabled={submitting}>
                  {submitting && <span className="bus-mgmt-loading-spinner"></span>}
                  Modifier le bus
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
