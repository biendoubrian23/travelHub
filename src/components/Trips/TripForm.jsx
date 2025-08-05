import React, { useState } from 'react';
import { useRolePermissions } from '../RoleBasedComponents';
import './TripForm.css';

const TripForm = ({ trip, buses, drivers, onSave, onCancel }) => {
  const { hasPermission } = useRolePermissions();
  const [formData, setFormData] = useState({
    departure_city: trip?.departure_city || '',
    destination_city: trip?.destination_city || '',
    departure_time: trip?.departure_time || '',
    arrival_time: trip?.arrival_time || '',
    bus_id: trip?.bus_id || '',
    driver_id: trip?.driver_id || '',
    price: trip?.price || '',
    distance: trip?.distance || '',
    status: trip?.status || 'scheduled',
    max_passengers: trip?.max_passengers || '',
    notes: trip?.notes || '',
    services: trip?.services || []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Villes prédéfinies pour l'Afrique de l'Ouest
  const cities = [
    'Abidjan', 'Accra', 'Bamako', 'Conakry', 'Cotonou', 'Dakar',
    'Lomé', 'Niamey', 'Ouagadougou', 'Porto-Novo', 'Yamoussoukro',
    'Bouaké', 'San-Pédro', 'Korhogo', 'Daloa', 'Man', 'Gagnoa'
  ];

  const availableServices = [
    { id: 'wifi', name: 'Wi-Fi gratuit', icon: '📶' },
    { id: 'ac', name: 'Climatisation', icon: '❄️' },
    { id: 'tv', name: 'Télévision', icon: '📺' },
    { id: 'usb', name: 'Prises USB', icon: '🔌' },
    { id: 'snacks', name: 'Collations', icon: '🍿' },
    { id: 'water', name: 'Eau gratuite', icon: '💧' },
    { id: 'toilet', name: 'Toilettes', icon: '🚽' },
    { id: 'music', name: 'Musique', icon: '🎵' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Programmé', icon: '📅' },
    { value: 'in_progress', label: 'En cours', icon: '🚌' },
    { value: 'completed', label: 'Terminé', icon: '✅' },
    { value: 'cancelled', label: 'Annulé', icon: '❌' },
    { value: 'delayed', label: 'Retardé', icon: '⏰' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const calculateDuration = () => {
    if (formData.departure_time && formData.arrival_time) {
      const departure = new Date(formData.departure_time);
      const arrival = new Date(formData.arrival_time);
      const diff = arrival - departure;
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h${minutes.toString().padStart(2, '0')}`;
      }
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.departure_city) {
      newErrors.departure_city = 'La ville de départ est requise';
    }

    if (!formData.destination_city) {
      newErrors.destination_city = 'La ville de destination est requise';
    }

    if (formData.departure_city === formData.destination_city) {
      newErrors.destination_city = 'La destination doit être différente du départ';
    }

    if (!formData.departure_time) {
      newErrors.departure_time = 'L\'heure de départ est requise';
    }

    if (!formData.arrival_time) {
      newErrors.arrival_time = 'L\'heure d\'arrivée est requise';
    }

    if (formData.departure_time && formData.arrival_time) {
      const departure = new Date(formData.departure_time);
      const arrival = new Date(formData.arrival_time);
      if (arrival <= departure) {
        newErrors.arrival_time = 'L\'arrivée doit être après le départ';
      }
    }

    if (!formData.bus_id) {
      newErrors.bus_id = 'Un bus doit être sélectionné';
    }

    if (!formData.driver_id) {
      newErrors.driver_id = 'Un conducteur doit être sélectionné';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }

    if (!formData.distance || formData.distance <= 0) {
      newErrors.distance = 'La distance doit être supérieure à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Trouver les informations du bus et du conducteur
      const selectedBus = buses.find(bus => bus.id === formData.bus_id);
      const selectedDriver = drivers.find(driver => driver.id === formData.driver_id);

      const tripData = {
        ...formData,
        bus_name: selectedBus?.name || '',
        bus_plate: selectedBus?.license_plate || '',
        driver_name: selectedDriver?.name || '',
        driver_phone: selectedDriver?.phone || '',
        total_seats: selectedBus?.capacity || 0,
        seats_occupied: trip?.seats_occupied || 0,
        id: trip?.id || Date.now().toString()
      };

      await onSave(tripData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const duration = calculateDuration();
  const selectedBus = buses.find(bus => bus.id === formData.bus_id);

  return (
    <form className={`trip-form ${isSubmitting ? 'form-loading' : ''}`} onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{trip ? '✏️ Modifier le trajet' : '➕ Nouveau trajet'}</h2>
        <p>
          {trip 
            ? 'Modifiez les informations du trajet' 
            : 'Créez un nouveau trajet pour vos passagers'
          }
        </p>
      </div>

      {/* Itinéraire */}
      <div className="form-section">
        <div className="section-title">
          🗺️ Itinéraire
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Ville de départ <span className="required">*</span>
            </label>
            <select
              name="departure_city"
              value={formData.departure_city}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Sélectionner la ville de départ</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.departure_city && (
              <div className="validation-info error">
                <p className="validation-text">{errors.departure_city}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Ville de destination <span className="required">*</span>
            </label>
            <select
              name="destination_city"
              value={formData.destination_city}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Sélectionner la destination</option>
              {cities.filter(city => city !== formData.departure_city).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {errors.destination_city && (
              <div className="validation-info error">
                <p className="validation-text">{errors.destination_city}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Distance (km) <span className="required">*</span>
            </label>
            <input
              type="number"
              name="distance"
              value={formData.distance}
              onChange={handleInputChange}
              className="form-input"
              min="1"
              required
            />
            {errors.distance && (
              <div className="validation-info error">
                <p className="validation-text">{errors.distance}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horaires */}
      <div className="form-section">
        <div className="section-title">
          ⏰ Horaires
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Départ <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              name="departure_time"
              value={formData.departure_time}
              onChange={handleInputChange}
              className="form-input"
              required
            />
            {errors.departure_time && (
              <div className="validation-info error">
                <p className="validation-text">{errors.departure_time}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Arrivée <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              name="arrival_time"
              value={formData.arrival_time}
              onChange={handleInputChange}
              className="form-input"
              required
            />
            {errors.arrival_time && (
              <div className="validation-info error">
                <p className="validation-text">{errors.arrival_time}</p>
              </div>
            )}
          </div>

          {duration && (
            <div className="form-group">
              <label className="form-label">Durée estimée</label>
              <div className="duration-display">
                <span className="duration-value">{duration}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bus et conducteur */}
      <div className="form-section">
        <div className="section-title">
          🚌 Bus et équipe
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Bus <span className="required">*</span>
            </label>
            <select
              name="bus_id"
              value={formData.bus_id}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Sélectionner un bus</option>
              {buses.filter(bus => bus.status === 'available').map(bus => (
                <option key={bus.id} value={bus.id}>
                  {bus.name} - {bus.license_plate} ({bus.capacity} places)
                </option>
              ))}
            </select>
            {errors.bus_id && (
              <div className="validation-info error">
                <p className="validation-text">{errors.bus_id}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Conducteur <span className="required">*</span>
            </label>
            <select
              name="driver_id"
              value={formData.driver_id}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Sélectionner un conducteur</option>
              {drivers.filter(driver => driver.available).map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} - {driver.phone}
                </option>
              ))}
            </select>
            {errors.driver_id && (
              <div className="validation-info error">
                <p className="validation-text">{errors.driver_id}</p>
              </div>
            )}
          </div>

          {selectedBus && (
            <div className="form-group">
              <label className="form-label">Capacité maximale</label>
              <div className="capacity-display">
                <div className="capacity-number">{selectedBus.capacity}</div>
                <div className="capacity-label">places disponibles</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prix et statut */}
      <div className="form-section">
        <div className="section-title">
          💰 Prix et statut
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Prix par place (FCFA) <span className="required">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              required
              disabled={!hasPermission('trips', 'editPrices')}
            />
            {errors.price && (
              <div className="validation-info error">
                <p className="validation-text">{errors.price}</p>
              </div>
            )}
            {!hasPermission('trips', 'editPrices') && (
              <div className="validation-info">
                <p className="validation-text">
                  Vous n'avez pas l'autorisation de modifier les prix
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Statut</label>
            <div className="status-options">
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className={`status-option ${formData.status === option.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={handleInputChange}
                  />
                  <span className="status-icon">{option.icon}</span>
                  <span className="status-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="form-section">
        <div className="section-title">
          🎯 Services inclus
        </div>
        <div className="services-grid">
          {availableServices.map(service => (
            <label
              key={service.id}
              className={`service-checkbox ${formData.services.includes(service.id) ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={formData.services.includes(service.id)}
                onChange={() => handleServiceToggle(service.id)}
              />
              <span className="service-icon">{service.icon}</span>
              <span className="service-label">{service.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="form-section">
        <div className="section-title">
          📝 Notes et observations
        </div>
        <div className="form-group full-width">
          <label className="form-label">Notes additionnelles</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="form-textarea"
            rows="4"
            placeholder="Ajoutez des notes sur ce trajet..."
          />
          <div className="help-text">
            Ces notes seront visibles par l'équipe et peuvent inclure des informations sur les arrêts, consignes spéciales, etc.
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn-submit"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? (trip ? 'Modification...' : 'Création...') 
            : (trip ? 'Modifier le trajet' : 'Créer le trajet')
          }
        </button>
      </div>
    </form>
  );
};

export default TripForm;
