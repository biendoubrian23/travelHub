import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './AddPassengerModal.css';

const AddPassengerModal = ({ isOpen, onClose, selectedTrip, onPassengerAdded }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerPhone: '',
    seatNumber: '',
    specialRequests: '',
    paymentMethod: 'cash'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Générer une référence de réservation unique
  const generateBookingReference = () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BK${year}${month}${day}${random}`;
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!formData.passengerName.trim()) {
      newErrors.passengerName = 'Le nom du passager est requis';
    }

    if (!formData.passengerPhone.trim()) {
      newErrors.passengerPhone = 'Le numéro de téléphone est requis';
    } else if (!/^[+]?[0-9\s-()]{8,}$/.test(formData.passengerPhone.trim())) {
      newErrors.passengerPhone = 'Format de téléphone invalide';
    }

    if (formData.seatNumber && (isNaN(formData.seatNumber) || formData.seatNumber < 1)) {
      newErrors.seatNumber = 'Le numéro de siège doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        user_id: user.id,
        trip_id: selectedTrip.id,
        passenger_name: formData.passengerName.trim(),
        passenger_phone: formData.passengerPhone.trim(),
        seat_number: formData.seatNumber || null,
        total_price_fcfa: selectedTrip.price,
        booking_reference: generateBookingReference(),
        booking_status: 'confirmed',
        payment_status: 'pending',
        payment_method: formData.paymentMethod,
        special_requests: formData.specialRequests.trim() || null
      };

      console.log('📋 Création de la réservation:', bookingData);

      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de la réservation:', error);
        throw error;
      }

      console.log('✅ Réservation créée avec succès:', data);

      // Réinitialiser le formulaire
      setFormData({
        passengerName: '',
        passengerPhone: '',
        seatNumber: '',
        specialRequests: '',
        paymentMethod: 'cash'
      });

      // Notifier le parent pour rafraîchir les données
      if (onPassengerAdded) {
        onPassengerAdded(data);
      }

      // Fermer le modal
      onClose();

    } catch (error) {
      console.error('💥 Erreur lors de la création de la réservation:', error);
      setErrors({ submit: 'Erreur lors de la création de la réservation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Supprimer l'erreur du champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bookings-add-passenger-modal-overlay" onClick={onClose}>
      <div className="bookings-add-passenger-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bookings-modal-header">
          <h2>➕ Ajouter un Passager</h2>
          <button className="bookings-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="bookings-modal-trip-info">
          <div className="bookings-trip-details">
            <span className="bookings-bus-name">🚌 {selectedTrip.bus.name}</span>
            <span className="bookings-route">📍 {selectedTrip.route}</span>
            <span className="bookings-time">🕐 {selectedTrip.departureTime}</span>
            <span className="bookings-price">💰 {selectedTrip.price.toLocaleString()} FCFA</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bookings-modal-form">
          <div className="bookings-form-row">
            <div className="bookings-form-group">
              <label htmlFor="passengerName">
                👤 Nom complet du passager *
              </label>
              <input
                type="text"
                id="passengerName"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleInputChange}
                className={errors.passengerName ? 'error' : ''}
                placeholder="Ex: Jean Dupont"
                required
              />
              {errors.passengerName && (
                <span className="bookings-error-message">{errors.passengerName}</span>
              )}
            </div>

            <div className="bookings-form-group">
              <label htmlFor="passengerPhone">
                📱 Numéro de téléphone *
              </label>
              <input
                type="tel"
                id="passengerPhone"
                name="passengerPhone"
                value={formData.passengerPhone}
                onChange={handleInputChange}
                className={errors.passengerPhone ? 'error' : ''}
                placeholder="Ex: +237 670 123 456"
                required
              />
              {errors.passengerPhone && (
                <span className="bookings-error-message">{errors.passengerPhone}</span>
              )}
            </div>
          </div>

          <div className="bookings-form-row">
            <div className="bookings-form-group">
              <label htmlFor="seatNumber">
                💺 Numéro de siège (optionnel)
              </label>
              <input
                type="number"
                id="seatNumber"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleInputChange}
                className={errors.seatNumber ? 'error' : ''}
                placeholder="Ex: 15"
                min="1"
                max={selectedTrip.bus.totalSeats}
              />
              {errors.seatNumber && (
                <span className="bookings-error-message">{errors.seatNumber}</span>
              )}
              <small className="bookings-field-hint">
                Sièges disponibles: 1 à {selectedTrip.bus.totalSeats}
              </small>
            </div>

            <div className="bookings-form-group">
              <label htmlFor="paymentMethod">
                💳 Méthode de paiement
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <option value="cash">💵 Espèces</option>
                <option value="mobile">📱 Mobile Money</option>
                <option value="card">💳 Carte bancaire</option>
                <option value="transfer">🏦 Virement</option>
              </select>
            </div>
          </div>

          <div className="bookings-form-group">
            <label htmlFor="specialRequests">
              📝 Demandes spéciales (optionnel)
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              placeholder="Ex: Siège près de la fenêtre, assistance pour bagages..."
              rows="3"
            ></textarea>
          </div>

          {errors.submit && (
            <div className="bookings-error-message-global">
              ❌ {errors.submit}
            </div>
          )}

          <div className="bookings-modal-actions">
            <button 
              type="button" 
              className="bookings-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="bookings-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="bookings-spinner"></span>
                  Création...
                </>
              ) : (
                '✅ Ajouter le passager'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPassengerModal;
