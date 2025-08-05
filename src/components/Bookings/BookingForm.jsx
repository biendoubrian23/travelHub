import React, { useState } from 'react';
import './BookingForm.css';

const BookingForm = ({ booking, trips, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    passenger_name: booking?.passenger_name || '',
    passenger_phone: booking?.passenger_phone || '',
    passenger_email: booking?.passenger_email || '',
    passenger_id: booking?.passenger_id || '',
    passenger_age: booking?.passenger_age || '',
    trip_id: booking?.trip_id || '',
    seat_number: booking?.seat_number || '',
    emergency_contact: booking?.emergency_contact || '',
    special_requests: booking?.special_requests || '',
    payment_method: booking?.payment_method || 'cash',
    notes: booking?.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);

  const paymentMethods = [
    { value: 'cash', label: 'Espèces', icon: '💵' },
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { value: 'bank_transfer', label: 'Virement bancaire', icon: '🏦' },
    { value: 'card', label: 'Carte bancaire', icon: '💳' }
  ];

  React.useEffect(() => {
    if (formData.trip_id) {
      const trip = trips.find(t => t.id === formData.trip_id);
      setSelectedTrip(trip);
      
      if (trip) {
        // Générer les sièges disponibles (simulation)
        const occupiedSeats = trip.occupiedSeats || [];
        const totalSeats = trip.total_seats || 30;
        const available = [];
        
        for (let i = 1; i <= totalSeats; i++) {
          if (!occupiedSeats.includes(i)) {
            available.push(i);
          }
        }
        setAvailableSeats(available);
      }
    }
  }, [formData.trip_id, trips]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.passenger_name.trim()) {
      newErrors.passenger_name = 'Le nom du passager est requis';
    }

    if (!formData.passenger_phone.trim()) {
      newErrors.passenger_phone = 'Le numéro de téléphone est requis';
    } else if (!/^[+]?[0-9\s\-()]{8,}$/.test(formData.passenger_phone)) {
      newErrors.passenger_phone = 'Format de téléphone invalide';
    }

    if (formData.passenger_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.passenger_email)) {
      newErrors.passenger_email = 'Format d\'email invalide';
    }

    if (!formData.trip_id) {
      newErrors.trip_id = 'Un trajet doit être sélectionné';
    }

    if (!formData.seat_number) {
      newErrors.seat_number = 'Un siège doit être sélectionné';
    }

    if (formData.passenger_age && (formData.passenger_age < 1 || formData.passenger_age > 120)) {
      newErrors.passenger_age = 'Âge invalide';
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
      const bookingData = {
        ...formData,
        price: selectedTrip?.price || 0,
        trip_route: selectedTrip ? `${selectedTrip.departure_city} → ${selectedTrip.destination_city}` : '',
        departure_time: selectedTrip?.departure_time || '',
        arrival_time: selectedTrip?.arrival_time || '',
        bus_name: selectedTrip?.bus_name || '',
        bus_plate: selectedTrip?.bus_plate || '',
        status: booking?.status || 'confirmed',
        payment_status: 'pending',
        booking_date: booking?.booking_date || new Date().toISOString(),
        id: booking?.id || Date.now().toString()
      };

      await onSave(bookingData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <form className={`booking-form ${isSubmitting ? 'form-loading' : ''}`} onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{booking ? '✏️ Modifier la réservation' : '➕ Nouvelle réservation'}</h2>
        <p>
          {booking 
            ? 'Modifiez les informations de la réservation' 
            : 'Créez une nouvelle réservation pour un passager'
          }
        </p>
      </div>

      {/* Informations du passager */}
      <div className="form-section">
        <div className="section-title">
          👤 Informations du passager
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Nom complet <span className="required">*</span>
            </label>
            <input
              type="text"
              name="passenger_name"
              value={formData.passenger_name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Nom et prénom du passager"
              required
            />
            {errors.passenger_name && (
              <div className="validation-info error">
                <p className="validation-text">{errors.passenger_name}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Téléphone <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="passenger_phone"
              value={formData.passenger_phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="+225 XX XX XX XX"
              required
            />
            {errors.passenger_phone && (
              <div className="validation-info error">
                <p className="validation-text">{errors.passenger_phone}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email (optionnel)</label>
            <input
              type="email"
              name="passenger_email"
              value={formData.passenger_email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="email@exemple.com"
            />
            {errors.passenger_email && (
              <div className="validation-info error">
                <p className="validation-text">{errors.passenger_email}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Pièce d'identité</label>
            <input
              type="text"
              name="passenger_id"
              value={formData.passenger_id}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Numéro CNI, passeport..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Âge</label>
            <input
              type="number"
              name="passenger_age"
              value={formData.passenger_age}
              onChange={handleInputChange}
              className="form-input"
              min="1"
              max="120"
              placeholder="Âge du passager"
            />
            {errors.passenger_age && (
              <div className="validation-info error">
                <p className="validation-text">{errors.passenger_age}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Contact d'urgence</label>
            <input
              type="tel"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Numéro en cas d'urgence"
            />
          </div>
        </div>
      </div>

      {/* Sélection du trajet */}
      <div className="form-section">
        <div className="section-title">
          🗺️ Sélection du trajet
        </div>
        <div className="form-group">
          <label className="form-label">
            Trajet <span className="required">*</span>
          </label>
          <select
            name="trip_id"
            value={formData.trip_id}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">Sélectionner un trajet</option>
            {trips.filter(trip => trip.status === 'scheduled' || trip.status === 'in_progress').map(trip => {
              const departure = formatDateTime(trip.departure_time);
              return (
                <option key={trip.id} value={trip.id}>
                  {trip.departure_city} → {trip.destination_city} - {departure.date} à {departure.time} - {trip.price} FCFA
                </option>
              );
            })}
          </select>
          {errors.trip_id && (
            <div className="validation-info error">
              <p className="validation-text">{errors.trip_id}</p>
            </div>
          )}
        </div>

        {selectedTrip && (
          <div className="trip-preview">
            <div className="preview-header">
              <h3>📋 Détails du trajet sélectionné</h3>
            </div>
            <div className="preview-content">
              <div className="preview-grid">
                <div className="preview-item">
                  <span className="preview-label">Itinéraire:</span>
                  <span className="preview-value">{selectedTrip.departure_city} → {selectedTrip.destination_city}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Départ:</span>
                  <span className="preview-value">
                    {formatDateTime(selectedTrip.departure_time).date} à {formatDateTime(selectedTrip.departure_time).time}
                  </span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Bus:</span>
                  <span className="preview-value">{selectedTrip.bus_name}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Prix:</span>
                  <span className="preview-value price">{selectedTrip.price} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sélection du siège */}
      {selectedTrip && (
        <div className="form-section">
          <div className="section-title">
            💺 Sélection du siège
          </div>
          <div className="form-group">
            <label className="form-label">
              Numéro de siège <span className="required">*</span>
            </label>
            <select
              name="seat_number"
              value={formData.seat_number}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Choisir un siège</option>
              {availableSeats.map(seatNum => (
                <option key={seatNum} value={seatNum}>
                  Siège {seatNum}
                </option>
              ))}
            </select>
            {errors.seat_number && (
              <div className="validation-info error">
                <p className="validation-text">{errors.seat_number}</p>
              </div>
            )}
            <div className="help-text">
              {availableSeats.length} siège(s) disponible(s) sur {selectedTrip.total_seats}
            </div>
          </div>
        </div>
      )}

      {/* Paiement */}
      <div className="form-section">
        <div className="section-title">
          💳 Méthode de paiement
        </div>
        <div className="payment-methods">
          {paymentMethods.map(method => (
            <label
              key={method.value}
              className={`payment-method ${formData.payment_method === method.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="payment_method"
                value={method.value}
                checked={formData.payment_method === method.value}
                onChange={handleInputChange}
              />
              <span className="method-icon">{method.icon}</span>
              <span className="method-label">{method.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Demandes spéciales et notes */}
      <div className="form-section">
        <div className="section-title">
          📝 Informations supplémentaires
        </div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label">Demandes spéciales</label>
            <textarea
              name="special_requests"
              value={formData.special_requests}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              placeholder="Besoins particuliers, régime alimentaire, assistance..."
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Notes internes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              placeholder="Notes pour l'équipe..."
            />
          </div>
        </div>
      </div>

      {/* Résumé de la réservation */}
      {selectedTrip && formData.seat_number && (
        <div className="form-section">
          <div className="section-title">
            📊 Résumé de la réservation
          </div>
          <div className="booking-summary">
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-label">Passager:</span>
                <span className="summary-value">{formData.passenger_name || 'Non renseigné'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Trajet:</span>
                <span className="summary-value">{selectedTrip.departure_city} → {selectedTrip.destination_city}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Siège:</span>
                <span className="summary-value">#{formData.seat_number}</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">Total à payer:</span>
                <span className="summary-value price">{selectedTrip.price} FCFA</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
            ? (booking ? 'Modification...' : 'Création...') 
            : (booking ? 'Modifier la réservation' : 'Créer la réservation')
          }
        </button>
      </div>
    </form>
  );
};

export default BookingForm;
