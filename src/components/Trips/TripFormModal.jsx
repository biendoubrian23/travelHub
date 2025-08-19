import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [buses, setBuses] = useState([]);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cities = [
    'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua', 
    'Maroua', 'Ngaoundéré', 'Bertoua', 'Buea', 'Limbé'
  ];

  // Fonction pour récupérer les bus de l'agence
  const fetchAgencyBuses = async () => {
    setLoadingBuses(true);
    try {
      // Récupérer l'ID de l'agence de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non connecté');
        return;
      }

      // D'abord récupérer l'agence de l'utilisateur
      const { data: agencies, error: agencyError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyError) {
        console.error('Erreur lors de la récupération de l\'agence:', agencyError);
        return;
      }

      // Ensuite récupérer les bus de cette agence
      const { data: agencyBuses, error: busesError } = await supabase
        .from('buses')
        .select('id, name, license_plate, total_seats, is_vip')
        .eq('agency_id', agencies.id)
        .order('name', { ascending: true });

      if (busesError) {
        console.error('Erreur lors de la récupération des bus:', busesError);
        return;
      }

      setBuses(agencyBuses || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des bus:', error);
    } finally {
      setLoadingBuses(false);
    }
  };

  // Fonction pour récupérer les conducteurs de l'agence
  const fetchAgencyDrivers = async () => {
    setLoadingDrivers(true);
    try {
      // Récupérer l'ID de l'agence de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non connecté');
        return;
      }

      // D'abord récupérer l'agence de l'utilisateur
      const { data: agencies, error: agencyError } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyError) {
        console.error('Erreur lors de la récupération de l\'agence:', agencyError);
        return;
      }

      // Ensuite récupérer les conducteurs de cette agence
      const { data: agencyDrivers, error: driversError } = await supabase
        .from('agency_employee_invitations')
        .select('id, first_name, last_name, phone, employee_role, status')
        .eq('agency_id', agencies.id)
        .eq('status', 'accepted')
        .in('employee_role', ['driver', 'conducteur', 'chauffeur']);

      if (driversError) {
        console.error('Erreur lors de la récupération des conducteurs:', driversError);
        return;
      }

      // Formatter les données pour l'affichage
      const formattedDrivers = agencyDrivers.map(driver => ({
        id: driver.id,
        name: `${driver.first_name} ${driver.last_name}`,
        phone: driver.phone || 'Non renseigné',
        role: driver.employee_role
      }));

      setDrivers(formattedDrivers);
    } catch (error) {
      console.error('Erreur lors de la récupération des conducteurs:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

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
        driverId: editingTrip.driver.id || editingTrip.driver.id.toString(),
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

  // Récupérer les conducteurs et bus quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchAgencyDrivers();
      fetchAgencyBuses();
    }
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.date || !formData.departureCity || !formData.arrivalCity) {
      alert('Veuillez remplir tous les champs obligatoires');
      setIsSubmitting(false);
      return;
    }

    if (!formData.departureTime || !formData.arrivalTime) {
      alert('Veuillez spécifier les heures de départ et d\'arrivée');
      setIsSubmitting(false);
      return;
    }

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Vous devez être connecté pour créer/modifier un trajet');
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

      // Préparer les données pour la base de données
      const selectedBus = buses.find(bus => bus.id === formData.busId);

      // Calculer les timestamps pour departure_time et arrival_time
      const departureDateTime = new Date(`${formData.date}T${formData.departureTime}`);
      let arrivalDateTime = new Date(`${formData.date}T${formData.arrivalTime}`);
      
      // Si c'est un trajet de nuit, ajouter un jour à l'arrivée
      if (formData.isOvernight) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }

      const tripData = {
        agency_id: agencies.id,
        departure_city: formData.departureCity,
        arrival_city: formData.arrivalCity,
        departure_time: departureDateTime.toISOString(),
        arrival_time: arrivalDateTime.toISOString(),
        total_seats: selectedBus?.total_seats || 40,
        available_seats: selectedBus?.total_seats || 40,
        price_fcfa: parseInt(formData.price),
        bus_type: selectedBus?.is_vip ? 'vip' : 'standard',
        bus_id: formData.busId || null,
        driver_id: formData.driverId || null,
        description: formData.notes || null,
        amenities: [],
        is_active: true,
        created_by: user.id
      };

      if (editingTrip) {
        // Mode modification : UPDATE
        console.log('Modification du trajet:', editingTrip.id);
        console.log('Nouvelles données:', tripData);
        
        const { error: updateError } = await supabase
          .from('trips')
          .update(tripData)
          .eq('id', editingTrip.id);

        if (updateError) {
          console.error('Erreur lors de la modification du trajet:', updateError);
          alert('Erreur lors de la modification du trajet: ' + updateError.message);
          return;
        }

        console.log('Trajet modifié avec succès');
        alert('Trajet modifié avec succès !');
      } else {
        // Mode création : INSERT
        console.log('Création du trajet avec les données:', tripData);
        
        const { error: insertError } = await supabase
          .from('trips')
          .insert([tripData]);

        if (insertError) {
          console.error('Erreur lors de la création du trajet:', insertError);
          alert('Erreur lors de la création du trajet: ' + insertError.message);
          return;
        }

        console.log('Trajet créé avec succès');
        alert('Trajet créé avec succès !');
      }
      
      // Réinitialiser le formulaire et fermer le modal
      setFormData({
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        departureCity: '',
        arrivalCity: '',
        departureTime: '',
        arrivalTime: '',
        isOvernight: false,
        distance: '',
        duration: '',
        price: '',
        busId: '',
        driverId: '',
        notes: ''
      });
      setErrors({});
      
      // Appeler onSubmit pour rafraîchir la liste des trajets si nécessaire
      if (onSubmit) {
        onSubmit();
      }
      
      onClose();

    } catch (error) {
      console.error('Erreur lors de la création du trajet:', error);
      alert('Erreur inattendue lors de la création du trajet');
    } finally {
      setIsSubmitting(false);
    }
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
                disabled={loadingBuses}
              >
                <option value="">
                  {loadingBuses ? 'Chargement des bus...' : 'Sélectionnez un bus'}
                </option>
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>
                    {bus.name} ({bus.license_plate}) - {bus.total_seats} places{bus.is_vip ? ' - VIP' : ''}
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
                disabled={loadingDrivers}
              >
                <option value="">
                  {loadingDrivers ? 'Chargement des conducteurs...' : 'Sélectionnez un conducteur'}
                </option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.phone})
                  </option>
                ))}
              </select>
              {errors.driverId && <span className="error-message">{errors.driverId}</span>}
              {drivers.length === 0 && !loadingDrivers && (
                <small className="help-text">
                  ⚠️ Aucun conducteur trouvé. Assurez-vous d'avoir des employés avec le rôle "conducteur" acceptés dans votre agence.
                </small>
              )}
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
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Création en cours...' : (editingTrip ? 'Modifier le trajet' : 'Créer le trajet')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripFormModal;
