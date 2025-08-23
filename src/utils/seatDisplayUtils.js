/**
 * Utilitaires pour afficher et gérer les informations des sièges VIP/Standard
 */

/**
 * Récupère les détails complets des sièges d'un trajet
 * @param {string} tripId - ID du trajet
 * @returns {Object} - Détails des sièges par type
 */
export const getTripSeatsDetails = async (tripId) => {
  try {
    const { supabase } = await import('../lib/supabase');
    
    const { data: seats, error } = await supabase
      .from('seat_maps')
      .select('*')
      .eq('trip_id', tripId)
      .order('seat_number');

    if (error) throw error;

    if (!seats || seats.length === 0) {
      return {
        total: 0,
        vip: { count: 0, available: 0, price: 0 },
        standard: { count: 0, available: 0, price: 0 },
        seats: []
      };
    }

    // Séparer VIP et Standard
    const vipSeats = seats.filter(s => s.seat_type === 'vip');
    const standardSeats = seats.filter(s => s.seat_type === 'standard');

    return {
      total: seats.length,
      vip: {
        count: vipSeats.length,
        available: vipSeats.filter(s => s.is_available).length,
        occupied: vipSeats.filter(s => !s.is_available).length,
        price: vipSeats[0]?.final_price_fcfa || 0,
        basePrice: vipSeats[0]?.base_price_fcfa || 0,
        priceModifier: vipSeats[0]?.price_modifier_fcfa || 0,
        seatNumbers: vipSeats.map(s => s.seat_number).sort((a, b) => parseInt(a) - parseInt(b))
      },
      standard: {
        count: standardSeats.length,
        available: standardSeats.filter(s => s.is_available).length,
        occupied: standardSeats.filter(s => !s.is_available).length,
        price: standardSeats[0]?.final_price_fcfa || 0,
        basePrice: standardSeats[0]?.base_price_fcfa || 0,
        priceModifier: standardSeats[0]?.price_modifier_fcfa || 0,
        seatNumbers: standardSeats.map(s => s.seat_number).sort((a, b) => parseInt(a) - parseInt(b))
      },
      seats: seats.sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number))
    };

  } catch (error) {
    console.error('Erreur récupération détails sièges:', error);
    return null;
  }
};

/**
 * Formate l'affichage des informations de sièges
 * @param {Object} seatsDetails - Détails des sièges
 * @returns {string} - Texte formaté
 */
export const formatSeatsInfo = (seatsDetails) => {
  if (!seatsDetails || seatsDetails.total === 0) {
    return 'Aucun siège configuré';
  }

  const { vip, standard } = seatsDetails;
  
  let info = `📊 Total: ${seatsDetails.total} sièges\n\n`;
  
  if (vip.count > 0) {
    info += `🥇 VIP (${vip.seatNumbers.join(', ')}):\n`;
    info += `   • ${vip.available}/${vip.count} disponibles\n`;
    info += `   • ${vip.price.toLocaleString()} FCFA (+${vip.priceModifier.toLocaleString()} FCFA)\n\n`;
  }
  
  if (standard.count > 0) {
    info += `🎫 Standard (${standard.seatNumbers[0]}-${standard.seatNumbers[standard.seatNumbers.length - 1]}):\n`;
    info += `   • ${standard.available}/${standard.count} disponibles\n`;
    info += `   • ${standard.price.toLocaleString()} FCFA\n`;
  }
  
  return info;
};

/**
 * Génère un rapport de revenue par type de siège
 * @param {Object} seatsDetails - Détails des sièges
 * @returns {Object} - Rapport de revenue
 */
export const calculateSeatsRevenue = (seatsDetails) => {
  if (!seatsDetails) return null;

  const { vip, standard } = seatsDetails;
  
  const vipRevenue = vip.occupied * vip.price;
  const standardRevenue = standard.occupied * standard.price;
  const totalRevenue = vipRevenue + standardRevenue;
  
  const vipPotential = vip.count * vip.price;
  const standardPotential = standard.count * standard.price;
  const totalPotential = vipPotential + standardPotential;
  
  return {
    current: {
      vip: vipRevenue,
      standard: standardRevenue,
      total: totalRevenue
    },
    potential: {
      vip: vipPotential,
      standard: standardPotential,
      total: totalPotential
    },
    occupancy: {
      vip: vip.count > 0 ? (vip.occupied / vip.count * 100).toFixed(1) : 0,
      standard: standard.count > 0 ? (standard.occupied / standard.count * 100).toFixed(1) : 0,
      total: seatsDetails.total > 0 ? ((vip.occupied + standard.occupied) / seatsDetails.total * 100).toFixed(1) : 0
    }
  };
};

/**
 * Composant React pour afficher les détails des sièges
 */
import React, { useState, useEffect } from 'react';

export const SeatDetailsDisplay = ({ tripId, showRevenue = false }) => {
  const [seatsDetails, setSeatsDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSeatsDetails = async () => {
      try {
        setLoading(true);
        const details = await getTripSeatsDetails(tripId);
        setSeatsDetails(details);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      loadSeatsDetails();
    }
  }, [tripId]);

  if (loading) return <div>⏳ Chargement des sièges...</div>;
  if (error) return <div>❌ Erreur: {error}</div>;
  if (!seatsDetails) return <div>Aucun siège configuré</div>;

  const revenue = showRevenue ? calculateSeatsRevenue(seatsDetails) : null;

  return (
    <div className="seats-details">
      <div className="seats-summary">
        <h4>🪑 Configuration des sièges</h4>
        <div className="seats-grid">
          
          {/* VIP Section */}
          {seatsDetails.vip.count > 0 && (
            <div className="seat-type-card vip">
              <div className="seat-type-header">
                <span className="seat-type-icon">🥇</span>
                <span className="seat-type-name">VIP</span>
                <span className="seat-type-price">{seatsDetails.vip.price.toLocaleString()} FCFA</span>
              </div>
              <div className="seat-type-stats">
                <div className="stat">
                  <span className="stat-number">{seatsDetails.vip.available}</span>
                  <span className="stat-label">Disponibles</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{seatsDetails.vip.occupied}</span>
                  <span className="stat-label">Occupés</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{seatsDetails.vip.count}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
              <div className="seat-numbers">
                Sièges: {seatsDetails.vip.seatNumbers.join(', ')}
              </div>
              {seatsDetails.vip.priceModifier > 0 && (
                <div className="price-supplement">
                  +{seatsDetails.vip.priceModifier.toLocaleString()} FCFA
                </div>
              )}
            </div>
          )}

          {/* Standard Section */}
          {seatsDetails.standard.count > 0 && (
            <div className="seat-type-card standard">
              <div className="seat-type-header">
                <span className="seat-type-icon">🎫</span>
                <span className="seat-type-name">Standard</span>
                <span className="seat-type-price">{seatsDetails.standard.price.toLocaleString()} FCFA</span>
              </div>
              <div className="seat-type-stats">
                <div className="stat">
                  <span className="stat-number">{seatsDetails.standard.available}</span>
                  <span className="stat-label">Disponibles</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{seatsDetails.standard.occupied}</span>
                  <span className="stat-label">Occupés</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{seatsDetails.standard.count}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>
              <div className="seat-numbers">
                Sièges: {seatsDetails.standard.seatNumbers[0]}-{seatsDetails.standard.seatNumbers[seatsDetails.standard.seatNumbers.length - 1]}
              </div>
            </div>
          )}
        </div>

        {/* Revenue Section */}
        {showRevenue && revenue && (
          <div className="revenue-section">
            <h5>💰 Analyse financière</h5>
            <div className="revenue-grid">
              <div className="revenue-item">
                <span className="revenue-label">Revenue actuel</span>
                <span className="revenue-value">{revenue.current.total.toLocaleString()} FCFA</span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Potentiel max</span>
                <span className="revenue-value">{revenue.potential.total.toLocaleString()} FCFA</span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Taux d'occupation</span>
                <span className="revenue-value">{revenue.occupancy.total}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default {
  getTripSeatsDetails,
  formatSeatsInfo,
  calculateSeatsRevenue,
  SeatDetailsDisplay
};
