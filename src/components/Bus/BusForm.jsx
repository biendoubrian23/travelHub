import React, { useState } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './BusForm.css';

const BusForm = ({ bus, onSave, onCancel, currentRole }) => {
  const { hasPermission } = useRolePermissions();
  const [formData, setFormData] = useState({
    number: bus?.number || '',
    brand: bus?.brand || '',
    model: bus?.model || '',
    capacity: bus?.capacity || '',
    licensePlate: bus?.licensePlate || '',
    features: bus?.features || [],
    maintenance: bus?.maintenance || {
      lastCheck: '',
      nextCheck: '',
      status: 'good'
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const availableFeatures = [
    'AC',
    'WiFi', 
    'USB',
    'TV',
    'Toilet',
    'Musique',
    'Collation',
    'Climatisation'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('maintenance.')) {
      const maintenanceField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        maintenance: {
          ...prev.maintenance,
          [maintenanceField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number.trim()) {
      newErrors.number = 'Le numéro du bus est requis';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'La marque est requise';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Le modèle est requis';
    }

    if (!formData.capacity || formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'La capacité doit être entre 1 et 100';
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'La plaque d\'immatriculation est requise';
    }

    if (formData.maintenance.nextCheck && formData.maintenance.lastCheck) {
      const lastCheck = new Date(formData.maintenance.lastCheck);
      const nextCheck = new Date(formData.maintenance.nextCheck);
      
      if (nextCheck <= lastCheck) {
        newErrors['maintenance.nextCheck'] = 'La prochaine vérification doit être après la dernière';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const busData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        id: bus?.id
      };
      
      await onSave(busData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde du bus' });
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('buses', bus ? 'edit' : 'create')) {
    return (
      <div className="access-denied">
        <h3>🔒 Accès Restreint</h3>
        <p>Vous n'avez pas les permissions pour {bus ? 'modifier' : 'créer'} un bus.</p>
        <button className="btn-secondary" onClick={onCancel}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="bus-form">
      <div className="form-header">
        <h2>{bus ? '✏️ Modifier le Bus' : '➕ Nouveau Bus'}</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      <form onSubmit={handleSubmit} className="bus-form-content">
        {errors.submit && (
          <div className="error-message">
            ⚠️ {errors.submit}
          </div>
        )}

        {/* Informations de base */}
        <div className="form-section">
          <h3>📋 Informations de base</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="number">Numéro du bus *</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                placeholder="Ex: BUS-001"
                className={errors.number ? 'error' : ''}
                disabled={loading}
              />
              {errors.number && <span className="error-text">{errors.number}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="licensePlate">Plaque d'immatriculation *</label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="Ex: CAM-001-AA"
                className={errors.licensePlate ? 'error' : ''}
                disabled={loading}
              />
              {errors.licensePlate && <span className="error-text">{errors.licensePlate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Marque *</label>
              <select
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={errors.brand ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Sélectionner une marque</option>
                <option value="Mercedes-Benz">Mercedes-Benz</option>
                <option value="Scania">Scania</option>
                <option value="Volvo">Volvo</option>
                <option value="MAN">MAN</option>
                <option value="Iveco">Iveco</option>
                <option value="Toyota">Toyota</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.brand && <span className="error-text">{errors.brand}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="model">Modèle *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Ex: Travego, Touring, 9700"
                className={errors.model ? 'error' : ''}
                disabled={loading}
              />
              {errors.model && <span className="error-text">{errors.model}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capacity">Nombre de places *</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="1"
                max="100"
                placeholder="Ex: 45"
                className={errors.capacity ? 'error' : ''}
                disabled={loading}
              />
              {errors.capacity && <span className="error-text">{errors.capacity}</span>}
            </div>
          </div>
        </div>

        {/* Équipements */}
        <div className="form-section">
          <h3>⭐ Équipements et services</h3>
          
          <div className="features-grid">
            {availableFeatures.map(feature => (
              <label key={feature} className="feature-checkbox">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  disabled={loading}
                />
                <span className="checkbox-custom"></span>
                <span className="feature-label">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Maintenance */}
        <div className="form-section">
          <h3>🔧 Maintenance</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maintenance.lastCheck">Dernière vérification</label>
              <input
                type="date"
                id="maintenance.lastCheck"
                name="maintenance.lastCheck"
                value={formData.maintenance.lastCheck}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="maintenance.nextCheck">Prochaine vérification</label>
              <input
                type="date"
                id="maintenance.nextCheck"
                name="maintenance.nextCheck"
                value={formData.maintenance.nextCheck}
                onChange={handleInputChange}
                className={errors['maintenance.nextCheck'] ? 'error' : ''}
                disabled={loading}
              />
              {errors['maintenance.nextCheck'] && (
                <span className="error-text">{errors['maintenance.nextCheck']}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maintenance.status">État de maintenance</label>
              <select
                id="maintenance.status"
                name="maintenance.status"
                value={formData.maintenance.status}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="good">✅ Bon état</option>
                <option value="needs_attention">⚠️ Attention requise</option>
                <option value="critical">🚨 État critique</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Sauvegarde...
              </>
            ) : (
              bus ? 'Mettre à jour' : 'Créer le bus'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusForm;
