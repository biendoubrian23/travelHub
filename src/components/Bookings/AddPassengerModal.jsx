import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { createBookingWithSeatSync } from '../../utils/seatMapUtils';
import TripSeatMap from '../Bus/TripSeatMap';
import SeatSelector from './SeatSelector';
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
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  // Récupérer les sièges occupés pour ce voyage depuis seat_maps
  React.useEffect(() => {
    const getOccupiedSeats = async () => {
      if (!selectedTrip?.id) return;
      
      try {
        // 🎯 NOUVEAU : Récupérer depuis seat_maps en priorité
        const { data: seatMaps, error: seatMapsError } = await supabase
          .from('seat_maps')
          .select('seat_number, is_available')
          .eq('trip_id', selectedTrip.id);

        if (seatMapsError) {
          console.error('Erreur lors de la récupération des seat_maps:', seatMapsError);
          // Fallback sur bookings si seat_maps n'est pas disponible
          return getOccupiedSeatsFromBookings();
        }

        if (seatMaps && seatMaps.length > 0) {
          // Utiliser les données de seat_maps
          const occupiedFromSeatMaps = seatMaps
            .filter(seat => !seat.is_available)
            .map(seat => parseInt(seat.seat_number))
            .filter(seat => !isNaN(seat));
          
          setOccupiedSeats(occupiedFromSeatMaps);
          console.log('🪑 Sièges occupés depuis seat_maps:', occupiedFromSeatMaps);
        } else {
          // Si seat_maps est vide, initialiser avec les données de bookings
          console.log('📝 seat_maps vide, fallback sur bookings...');
          await getOccupiedSeatsFromBookings();
        }
      } catch (error) {
        console.error('Erreur:', error);
        await getOccupiedSeatsFromBookings();
      }
    };

    // Fonction fallback pour récupérer depuis bookings
    const getOccupiedSeatsFromBookings = async () => {
      try {
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('seat_number')
          .eq('trip_id', selectedTrip.id)
          .not('seat_number', 'is', null);

        if (error) {
          console.error('Erreur lors de la récupération des sièges occupés:', error);
          return;
        }

        const occupied = bookings
          .map(booking => parseInt(booking.seat_number))
          .filter(seat => !isNaN(seat));
        
        setOccupiedSeats(occupied);
        console.log('🪑 Sièges occupés depuis bookings (fallback):', occupied);
      } catch (error) {
        console.error('Erreur fallback:', error);
      }
    };

    if (isOpen && selectedTrip) {
      getOccupiedSeats();
    }
  }, [isOpen, selectedTrip]);

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

    if (formData.seatNumber) {
      const seatNum = parseInt(formData.seatNumber);
      if (isNaN(seatNum) || seatNum < 1) {
        newErrors.seatNumber = 'Le numéro de siège doit être un nombre positif';
      } else if (seatNum > selectedTrip?.bus?.totalSeats) {
        newErrors.seatNumber = `Le siège ${seatNum} n'existe pas (maximum: ${selectedTrip?.bus?.totalSeats})`;
      } else if (occupiedSeats.includes(seatNum)) {
        newErrors.seatNumber = `Le siège ${seatNum} est déjà occupé pour ce voyage`;
      }
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
      // Double vérification côté serveur pour éviter les conflits de sièges
      if (formData.seatNumber) {
        const { data: existingSeat, error: checkError } = await supabase
          .from('bookings')
          .select('id, passenger_name')
          .eq('trip_id', selectedTrip.id)
          .eq('seat_number', formData.seatNumber)
          .limit(1);

        if (checkError) {
          console.error('Erreur lors de la vérification du siège:', checkError);
        } else if (existingSeat && existingSeat.length > 0) {
          setErrors({ 
            seatNumber: `Le siège ${formData.seatNumber} est déjà réservé par ${existingSeat[0].passenger_name}` 
          });
          setIsSubmitting(false);
          return;
        }
      }

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

      // Utiliser la fonction avec synchronisation seat_maps
      const data = await createBookingWithSeatSync(bookingData);

      console.log('✅ Réservation créée avec succès et siège synchronisé:', data);

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

          {/* Plan de sièges interactif avec table seat_maps */}
          <div className="bookings-seat-map-section">
            <h4>🚌 Plan des sièges</h4>
            <TripSeatMap 
              tripId={selectedTrip.id}
              busCapacity={selectedTrip?.bus?.totalSeats || 50}
              onSeatSelect={(selectedSeats) => {
                if (selectedSeats.length > 0) {
                  setFormData(prev => ({
                    ...prev,
                    seatNumber: selectedSeats[0].toString()
                  }));
                  // Effacer l'erreur si un siège valide est sélectionné
                  if (errors.seatNumber) {
                    setErrors(prev => ({ ...prev, seatNumber: '' }));
                  }
                } else {
                  setFormData(prev => ({
                    ...prev,
                    seatNumber: ''
                  }));
                }
              }}
              readOnly={false}
              showLegend={true}
            />
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
                {occupiedSeats.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <strong>🚫 Sièges occupés:</strong> {occupiedSeats.sort((a, b) => a - b).join(', ')}
                  </div>
                )}
                {occupiedSeats.length > 0 && (
                  <div style={{ marginTop: '4px', color: '#28a745' }}>
                    <strong>✅ Sièges libres:</strong> {
                      Array.from({ length: selectedTrip.bus.totalSeats }, (_, i) => i + 1)
                        .filter(seat => !occupiedSeats.includes(seat))
                        .slice(0, 10) // Afficher seulement les 10 premiers sièges libres
                        .join(', ')
                    }{Array.from({ length: selectedTrip.bus.totalSeats }, (_, i) => i + 1)
                        .filter(seat => !occupiedSeats.includes(seat)).length > 10 ? '...' : ''}
                  </div>
                )}
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
