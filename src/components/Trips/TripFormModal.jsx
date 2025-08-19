import React, { useState, useEffect } from 'react';
import './TripFormModal.css';

const TripFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  editingTrip = null,
  selectedDate 
}) => {
  const [formData, setFormData] = useState({
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    departureCity: '',
    arrivalCity: '',
    departureTime: '',
    arrivalTime: '',
    isOvernight: false, // Ajout du champ trajet de nuit
    distance: '',
    duration: '',
    price: '',
    busId: '',
    driverId: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Données mockées pour les bus et conducteurs
  const mockBuses = [
    { id: 'BUS-001', name: 'Express Voyageur', plate: 'LT-234-CM', totalSeats: 45 },
    { id: 'BUS-002', name: 'Confort Plus', plate: 'LT-567-CM', totalSeats: 52 },
    { id: 'BUS-003', name: 'Grand Voyageur', plate: 'LT-890-CM', totalSeats: 55 },
    { id: 'BUS-004', name: 'Rapide Service', plate: 'LT-456-CM', totalSeats: 48 },
    { id: 'BUS-005', name: 'Nuit Express', plate: 'LT-789-CM', totalSeats: 42 }
  ];

  const mockDrivers = [
    { id: 1, name: 'Jean-Paul Mbarga', phone: '+237670123456' },
    { id: 2, name: 'Marie Essono', phone: '+237670123457' },
    { id: 3, name: 'Paul Nkomo', phone: '+237670123458' },
    { id: 4, name: 'Alice Mbouda', phone: '+237670123459' },
    { id: 5, name: 'Michel Fouda', phone: '+237670123460' }
  ];

  const cities = [
    'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua', 
    'Maroua', 'Ngaoundéré', 'Bertoua', 'Buea', 'Limbé'
  ];

  // Initialiser le formulaire avec les données d'édition
  useEffect(() => {
    if (editingTrip) {
      setFormData({
        date: editingTrip.date,
        departureCity: editingTrip.departureCity,
        arrivalCity: editingTrip.arrivalCity,
        departureTime: editingTrip.departureTime,
        arrivalTime: editingTrip.arrivalTime,
        duration: editingTrip.duration,
        price: editingTrip.price.toString(),
        busId: editingTrip.bus.id,
        driverId: editingTrip.driver.id.toString(),
        notes: editingTrip.notes || ''
      });
    } else {
      setFormData({
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        departureCity: '',
        arrivalCity: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        price: '',
        busId: '',
        driverId: '',
        notes: ''
      });
    }
    setErrors({});
  }, [editingTrip, selectedDate, isOpen]);

  // Fonction pour calculer la durée automatiquement
  const calculateDuration = (departureTime, arrivalTime, isOvernight = false) => {
    if (!departureTime || !arrivalTime) return '';
    
    const depTime = new Date(`1970-01-01T${departureTime}`);
    let arrTime = new Date(`1970-01-01T${arrivalTime}`);
    
    // Si trajet de nuit ou si arrivée semble avant départ, ajouter un jour
    if (isOvernight || arrTime <= depTime) {
      arrTime.setDate(arrTime.getDate() + 1);
    }
    
    const diffMs = arrTime - depTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Auto-détection des trajets de nuit
    if (name === 'departureTime' || name === 'arrivalTime') {
      const departureTime = name === 'departureTime' ? value : formData.departureTime;
      const arrivalTime = name === 'arrivalTime' ? value : formData.arrivalTime;
      
      if (departureTime && arrivalTime) {
        updatedFormData.duration = calculateDuration(departureTime, arrivalTime, updatedFormData.isOvernight);
        
        // Détection automatique trajet de nuit
        const depTime = new Date(`1970-01-01T${departureTime}`);
        const arrTime = new Date(`1970-01-01T${arrivalTime}`);
        
        if (arrTime <= depTime && !updatedFormData.isOvernight) {
          updatedFormData.isOvernight = true;
          // Recalculer la durée avec le flag trajet de nuit
          updatedFormData.duration = calculateDuration(departureTime, arrivalTime, true);
        } else if (arrTime > depTime && updatedFormData.isOvernight) {
          updatedFormData.isOvernight = false;
          // Recalculer la durée sans le flag trajet de nuit
          updatedFormData.duration = calculateDuration(departureTime, arrivalTime, false);
        }
      }
    }
    
    setFormData(updatedFormData);
    
    // Supprimer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = 'La date est requise';
    if (!formData.departureCity) newErrors.departureCity = 'La ville de départ est requise';
    if (!formData.arrivalCity) newErrors.arrivalCity = 'La ville d\'arrivée est requise';
    if (!formData.departureTime) newErrors.departureTime = 'L\'heure de départ est requise';
    if (!formData.arrivalTime) newErrors.arrivalTime = 'L\'heure d\'arrivée est requise';
    if (!formData.duration) newErrors.duration = 'La durée est requise';
    if (!formData.price) newErrors.price = 'Le prix est requis';
    if (!formData.busId) newErrors.busId = 'Le bus est requis';
    if (!formData.driverId) newErrors.driverId = 'Le conducteur est requis';

    if (formData.departureCity === formData.arrivalCity) {
      newErrors.arrivalCity = 'La ville d\'arrivée doit être différente de la ville de départ';
    }

    if (formData.departureTime && formData.arrivalTime) {
      const depTime = new Date(`1970-01-01T${formData.departureTime}`);
      const arrTime = new Date(`1970-01-01T${formData.arrivalTime}`);
      
      // Validation intelligente pour les trajets de nuit
      if (arrTime <= depTime && !formData.isOvernight) {
        newErrors.arrivalTime = 'L\'heure d\'arrivée semble être le lendemain. Cochez "Trajet de nuit".';
      }
    }

    if (formData.price && isNaN(formData.price)) {
      newErrors.price = 'Le prix doit être un nombre valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedBus = mockBuses.find(bus => bus.id === formData.busId);
    const selectedDriver = mockDrivers.find(driver => driver.id.toString() === formData.driverId);

    const tripData = {
      date: formData.date,
      departureCity: formData.departureCity,
      arrivalCity: formData.arrivalCity,
      departureTime: formData.departureTime,
      arrivalTime: formData.arrivalTime,
      duration: formData.duration,
      price: parseInt(formData.price),
      bus: {
        ...selectedBus,
        occupiedSeats: 0,
        availableSeats: selectedBus.totalSeats
      },
      driver: selectedDriver,
      notes: formData.notes,
      route: {
        waypoints: [
          { city: formData.departureCity, lat: 0, lng: 0 },
          { city: formData.arrivalCity, lat: 0, lng: 0 }
        ]
      },
      revenue: {
        current: 0,
        potential: selectedBus.totalSeats * parseInt(formData.price)
      }
    };

    onSubmit(tripData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trip-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {editingTrip ? '✏️ Modifier le trajet' : '➕ Ajouter un nouveau trajet'}
          </h2>
          <button className="close-btn" onClick={onClose}>❌</button>
        </div>

        <form onSubmit={handleSubmit} className="trip-form">
          <div className="form-grid">
            {/* Date */}
            <div className="form-group">
              <label htmlFor="date">📅 Date du trajet *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            {/* Villes */}
            <div className="form-group">
              <label htmlFor="departureCity">🏠 Ville de départ *</label>
              <select
                id="departureCity"
                name="departureCity"
                value={formData.departureCity}
                onChange={handleInputChange}
                className={errors.departureCity ? 'error' : ''}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.departureCity && <span className="error-message">{errors.departureCity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="arrivalCity">🎯 Ville d'arrivée *</label>
              <select
                id="arrivalCity"
                name="arrivalCity"
                value={formData.arrivalCity}
                onChange={handleInputChange}
                className={errors.arrivalCity ? 'error' : ''}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.arrivalCity && <span className="error-message">{errors.arrivalCity}</span>}
            </div>

            {/* Heures */}
            <div className="form-group">
              <label htmlFor="departureTime">🕐 Heure de départ *</label>
              <input
                type="time"
                id="departureTime"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleInputChange}
                className={errors.departureTime ? 'error' : ''}
              />
              {errors.departureTime && <span className="error-message">{errors.departureTime}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="arrivalTime">🕐 Heure d'arrivée *</label>
              <input
                type="time"
                id="arrivalTime"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleInputChange}
                className={errors.arrivalTime ? 'error' : ''}
              />
              {errors.arrivalTime && <span className="error-message">{errors.arrivalTime}</span>}
              
              {/* Checkbox trajet de nuit */}
              <div className="overnight-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isOvernight"
                    checked={formData.isOvernight}
                    onChange={handleInputChange}
                    className="overnight-checkbox"
                  />
                  <span className="checkbox-text">🌙 Trajet de nuit (arrivée le lendemain)</span>
                </label>
                <small className="help-text">
                  Cochez si le bus arrive le jour suivant (ex: départ 23h, arrivée 6h)
                </small>
              </div>
            </div>

            {/* Durée */}
            <div className="form-group">
              <label htmlFor="duration">⏱️ Durée estimée (calculée automatiquement)</label>
              <input
                type="text"
                id="duration"
                name="duration"
                placeholder="Sélectionnez les heures de départ et d'arrivée"
                value={formData.duration}
                readOnly
                className={`duration-readonly ${errors.duration ? 'error' : ''}`}
              />
              {errors.duration && <span className="error-message">{errors.duration}</span>}
              {formData.duration && (
                <small className="duration-note">✅ Durée calculée automatiquement</small>
              )}
            </div>

            {/* Prix */}
            <div className="form-group">
              <label htmlFor="price">💰 Prix du ticket (FCFA) *</label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="ex: 3500"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? 'error' : ''}
                min="0"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            {/* Bus */}
            <div className="form-group">
              <label htmlFor="busId">🚌 Bus assigné *</label>
              <select
                id="busId"
                name="busId"
                value={formData.busId}
                onChange={handleInputChange}
                className={errors.busId ? 'error' : ''}
              >
                <option value="">Sélectionnez un bus</option>
                {mockBuses.map(bus => (
                  <option key={bus.id} value={bus.id}>
                    {bus.name} ({bus.plate}) - {bus.totalSeats} places
                  </option>
                ))}
              </select>
              {errors.busId && <span className="error-message">{errors.busId}</span>}
            </div>

            {/* Conducteur */}
            <div className="form-group">
              <label htmlFor="driverId">👤 Conducteur assigné *</label>
              <select
                id="driverId"
                name="driverId"
                value={formData.driverId}
                onChange={handleInputChange}
                className={errors.driverId ? 'error' : ''}
              >
                <option value="">Sélectionnez un conducteur</option>
                {mockDrivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.phone})
                  </option>
                ))}
              </select>
              {errors.driverId && <span className="error-message">{errors.driverId}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group full-width">
            <label htmlFor="notes">📝 Notes additionnelles</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Informations supplémentaires sur le trajet..."
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="submit-btn">
              {editingTrip ? 'Modifier le trajet' : 'Créer le trajet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripFormModal;
