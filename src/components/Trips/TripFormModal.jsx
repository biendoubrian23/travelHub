import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { initializeSeatMapForTrip } from '../../utils/seatMapUtils';
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
  const [conflictWarnings, setConflictWarnings] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const cities = [
    'Douala', 'Yaoundé', 'Bafoussam', 'Bamenda', 'Garoua', 
    'Maroua', 'Ngaoundéré', 'Bertoua', 'Buea', 'Limbé'
  ];

  // ========================================
  // FONCTIONS DE GESTION DES CONFLITS D'HORAIRES
  // ========================================

  // Fonction pour vérifier les conflits d'horaires pour les conducteurs (1h avant arrivée)
  const checkDriverConflicts = async (driverId, departureDateTime, arrivalDateTime, currentTripId = null) => {
    if (!driverId || !departureDateTime || !arrivalDateTime) return { hasConflict: false };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasConflict: false };

      // Récupérer l'agence ID
      let agencyId = null;
      const { data: agencyOwner } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyOwner) {
        agencyId = agencyOwner.id;
      } else {
        const { data: employeeData } = await supabase
          .from('agency_employee_invitations')
          .select('agency_id')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .single();
        if (employeeData) agencyId = employeeData.agency_id;
      }

      if (!agencyId) return { hasConflict: false };

      // Calculer la fenêtre de conflit : 1h après l'heure d'arrivée prévue
      const newDepartureTime = new Date(departureDateTime);

      // Récupérer tous les trajets existants pour ce conducteur
      const query = supabase
        .from('trips')
        .select('id, departure_time, arrival_time, departure_city, arrival_city')
        .eq('driver_id', driverId)
        .eq('agency_id', agencyId);

      // Exclure le trajet en cours de modification si c'est une édition
      if (currentTripId) {
        query.neq('id', currentTripId);
      }

      const { data: existingTrips, error } = await query;

      if (error) {
        console.error('Erreur lors de la vérification des conflits conducteur:', error);
        return { hasConflict: false };
      }

      // Vérifier les conflits
      for (const trip of existingTrips || []) {
        const tripArrival = new Date(trip.arrival_time);
        const driverFreeTime = new Date(tripArrival.getTime() + (60 * 60 * 1000)); // +1h après arrivée

        // Conflit si le nouveau trajet commence avant que le conducteur soit libre
        if (newDepartureTime < driverFreeTime) {
          return {
            hasConflict: true,
            conflictTrip: trip,
            message: `Ce conducteur ne sera disponible qu'à partir de ${driverFreeTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (1h après son arrivée de ${trip.departure_city} → ${trip.arrival_city})`
          };
        }
      }

      return { hasConflict: false };
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits conducteur:', error);
      return { hasConflict: false };
    }
  };

  // Fonction pour vérifier les conflits d'horaires pour les bus (15min avant arrivée)
  const checkBusConflicts = async (busId, departureDateTime, arrivalDateTime, currentTripId = null) => {
    if (!busId || !departureDateTime || !arrivalDateTime) return { hasConflict: false };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasConflict: false };

      // Récupérer l'agence ID
      let agencyId = null;
      const { data: agencyOwner } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (agencyOwner) {
        agencyId = agencyOwner.id;
      } else {
        const { data: employeeData } = await supabase
          .from('agency_employee_invitations')
          .select('agency_id')
          .eq('user_id', user.id)
          .eq('status', 'accepted')
          .single();
        if (employeeData) agencyId = employeeData.agency_id;
      }

      if (!agencyId) return { hasConflict: false };

      // Calculer la fenêtre de conflit : 15min après l'heure d'arrivée prévue
      const newDepartureTime = new Date(departureDateTime);

      // Récupérer tous les trajets existants pour ce bus
      const query = supabase
        .from('trips')
        .select('id, departure_time, arrival_time, departure_city, arrival_city')
        .eq('bus_id', busId)
        .eq('agency_id', agencyId);

      // Exclure le trajet en cours de modification si c'est une édition
      if (currentTripId) {
        query.neq('id', currentTripId);
      }

      const { data: existingTrips, error } = await query;

      if (error) {
        console.error('Erreur lors de la vérification des conflits bus:', error);
        return { hasConflict: false };
      }

      // Vérifier les conflits
      for (const trip of existingTrips || []) {
        const tripArrival = new Date(trip.arrival_time);
        const busFreeTime = new Date(tripArrival.getTime() + (15 * 60 * 1000)); // +15min après arrivée

        // Conflit si le nouveau trajet commence avant que le bus soit libre
        if (newDepartureTime < busFreeTime) {
          return {
            hasConflict: true,
            conflictTrip: trip,
            message: `Ce bus ne sera disponible qu'à partir de ${busFreeTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} (15min après son arrivée de ${trip.departure_city} → ${trip.arrival_city})`
          };
        }
      }

      return { hasConflict: false };
    } catch (error) {
      console.error('Erreur lors de la vérification des conflits bus:', error);
      return { hasConflict: false };
    }
  };

  // Fonction pour filtrer les conducteurs et bus disponibles (simplifiée)
  const filterAvailableResources = async () => {
    // Cette fonction ne fait plus rien car nous affichons les avertissements de conflit au lieu de filtrer
    // Les listes complètes des drivers et buses sont toujours affichées
  };

  // ========================================
  // FIN FONCTIONS DE GESTION DES CONFLITS
  // ========================================

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

      // Ensuite récupérer les bus de cette agence
      const { data: agencyBuses, error: busesError } = await supabase
        .from('buses')
        .select('id, name, license_plate, total_seats, is_vip')
        .eq('agency_id', agencyId)
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

      // Ensuite récupérer les conducteurs de cette agence
      const { data: agencyDrivers, error: driversError } = await supabase
        .from('agency_employee_invitations')
        .select('id, first_name, last_name, phone, employee_role, status')
        .eq('agency_id', agencyId)
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

  const handleInputChange = async (e) => {
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
    
    // Vérifier les conflits si les horaires ont changé
    if (name === 'departureTime' || name === 'arrivalTime' || name === 'date') {
      await filterAvailableResources();
    }
    
    // Vérifier les conflits spécifiques si un conducteur ou bus est sélectionné
    if (name === 'driverId' && value && updatedFormData.date && updatedFormData.departureTime && updatedFormData.arrivalTime) {
      await checkDriverAvailability(value, updatedFormData);
    }
    
    if (name === 'busId' && value && updatedFormData.date && updatedFormData.departureTime && updatedFormData.arrivalTime) {
      await checkBusAvailability(value, updatedFormData);
    }
  };

  // Fonction pour vérifier la disponibilité d'un conducteur spécifique
  const checkDriverAvailability = async (driverId, currentFormData) => {
    if (!driverId || !currentFormData.date || !currentFormData.departureTime || !currentFormData.arrivalTime) return;
    
    const departureDateTime = `${currentFormData.date}T${currentFormData.departureTime}`;
    const arrivalDateTime = `${currentFormData.date}T${currentFormData.arrivalTime}`;
    const currentTripId = editingTrip?.id;
    
    const conflict = await checkDriverConflicts(driverId, departureDateTime, arrivalDateTime, currentTripId);
    
    if (conflict.hasConflict) {
      setConflictWarnings(prev => ({
        ...prev,
        driver: conflict.message
      }));
    } else {
      setConflictWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings.driver;
        return newWarnings;
      });
    }
  };

  // Fonction pour vérifier la disponibilité d'un bus spécifique
  const checkBusAvailability = async (busId, currentFormData) => {
    if (!busId || !currentFormData.date || !currentFormData.departureTime || !currentFormData.arrivalTime) return;
    
    const departureDateTime = `${currentFormData.date}T${currentFormData.departureTime}`;
    const arrivalDateTime = `${currentFormData.date}T${currentFormData.arrivalTime}`;
    const currentTripId = editingTrip?.id;
    
    const conflict = await checkBusConflicts(busId, departureDateTime, arrivalDateTime, currentTripId);
    
    if (conflict.hasConflict) {
      setConflictWarnings(prev => ({
        ...prev,
        bus: conflict.message
      }));
    } else {
      setConflictWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings.bus;
        return newWarnings;
      });
    }
  };

  // Fonction pour afficher une notification centrée
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    
    // Auto-masquer après 3 secondes
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fonction pour empêcher la soumission du formulaire sur Entrée dans les champs spécifiques
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Empêcher la soumission automatique du formulaire
      e.preventDefault();
      
      // Optionnel : faire défiler vers le champ suivant
      const currentInput = e.target;
      const formElements = Array.from(currentInput.form.elements);
      const currentIndex = formElements.indexOf(currentInput);
      const nextElement = formElements[currentIndex + 1];
      
      if (nextElement && nextElement.tagName === 'INPUT') {
        nextElement.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Reset previous errors
    setErrors({});
    
    // Validation préventive complète
    const validationErrors = {};
    
    // Vérification des champs obligatoires
    if (!formData.date) {
      validationErrors.date = 'La date du trajet est obligatoire';
    }
    
    if (!formData.departureCity) {
      validationErrors.departureCity = 'La ville de départ est obligatoire';
    }
    
    if (!formData.arrivalCity) {
      validationErrors.arrivalCity = 'La ville d\'arrivée est obligatoire';
    }
    
    if (formData.departureCity === formData.arrivalCity) {
      validationErrors.arrivalCity = 'La ville d\'arrivée doit être différente de la ville de départ';
    }
    
    if (!formData.departureTime) {
      validationErrors.departureTime = 'L\'heure de départ est obligatoire';
    }
    
    if (!formData.arrivalTime) {
      validationErrors.arrivalTime = 'L\'heure d\'arrivée est obligatoire';
    }
    
    // Validation du prix (champ critique)
    if (!formData.price || formData.price === '' || formData.price === '0') {
      validationErrors.price = 'Le prix du trajet est obligatoire et doit être supérieur à 0';
    } else if (isNaN(formData.price) || parseInt(formData.price) <= 0) {
      validationErrors.price = 'Le prix doit être un nombre valide supérieur à 0';
    }
    
    // Validation des heures (cohérence temporelle)
    if (formData.departureTime && formData.arrivalTime && !formData.isOvernight) {
      const depTime = new Date(`1970-01-01T${formData.departureTime}`);
      const arrTime = new Date(`1970-01-01T${formData.arrivalTime}`);
      
      if (depTime >= arrTime) {
        validationErrors.arrivalTime = 'L\'heure d\'arrivée doit être après l\'heure de départ (ou cochez "Trajet de nuit")';
      }
    }
    
    // Validation des champs optionnels mais recommandés
    if (!formData.busId) {
      validationErrors.busId = 'Il est recommandé de sélectionner un bus';
    }
    
    if (!formData.driverId) {
      validationErrors.driverId = 'Il est recommandé de sélectionner un conducteur';
    }

    // Afficher les erreurs s'il y en a
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Trouver le premier champ avec erreur et le mettre en focus
      const firstErrorField = Object.keys(validationErrors)[0];
      setTimeout(() => {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.focus();
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Message d'erreur simplifié pour l'utilisateur
      const criticalErrors = Object.keys(validationErrors).filter(key => 
        ['date', 'departureCity', 'arrivalCity', 'departureTime', 'arrivalTime', 'price'].includes(key)
      );
      
      if (criticalErrors.length > 0) {
        alert(`❌ Veuillez remplir tous les champs obligatoires marqués d'un astérisque (*)\n\n${criticalErrors.length} champ(s) nécessite(nt) votre attention.`);
      }
      
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
        alert('Aucune agence trouvée pour cet utilisateur');
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
        agency_id: agencyId,
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
        showNotification('✅ Trajet modifié avec succès !', 'success');
      } else {
        // Mode création : INSERT
        console.log('Création du trajet avec les données:', tripData);
        
        const { data: newTrip, error: insertError } = await supabase
          .from('trips')
          .insert([tripData])
          .select()
          .single();

        if (insertError) {
          console.error('Erreur lors de la création du trajet:', insertError);
          alert('Erreur lors de la création du trajet: ' + insertError.message);
          return;
        }

        console.log('Trajet créé avec succès:', newTrip);

        // 🎯 NOUVEAU : Initialiser automatiquement les places selon le TYPE DE BUS
        try {
          console.log('🚌 Initialisation des places pour le trajet:', newTrip.id);
          console.log('🚌 Bus sélectionné:', selectedBus);
          
          // Vérifier que la fonction est importée
          if (typeof initializeSeatMapForTrip !== 'function') {
            console.error('❌ ERREUR: initializeSeatMapForTrip n\'est pas une fonction');
            throw new Error('Fonction initializeSeatMapForTrip non disponible');
          }
          
          // Passer les données du trajet ET du bus pour configuration VIP/Standard
          const tripDataForSeats = {
            price_fcfa: parseInt(formData.price), // Prix déjà validé comme obligatoire
            departure_city: formData.departureCity,
            arrival_city: formData.arrivalCity,
            created_by: user?.id,
            bus_is_vip: selectedBus?.is_vip || false, // 🎯 INFO CRUCIALE : Type de bus
            bus_name: selectedBus?.name || 'Bus inconnu'
          };
          
          console.log('📊 Données pour initialisation des sièges:', tripDataForSeats);
          console.log(`🎯 Appel initializeSeatMapForTrip(${newTrip.id}, ${selectedBus?.total_seats || 40}, tripDataForSeats)`);
          
          const seatResult = await initializeSeatMapForTrip(
            newTrip.id, 
            selectedBus?.total_seats || 40,
            tripDataForSeats
          );
          
          console.log('🎯 Résultat initialisation sièges:', seatResult);
          
          const busType = selectedBus?.is_vip ? 'VIP' : 'Standard';
          console.log(`✅ Places initialisées pour bus ${busType}: ${selectedBus?.total_seats} sièges`);
        } catch (seatError) {
          console.error('❌ Erreur lors de l\'initialisation des places:', seatError);
          console.error('❌ Stack trace:', seatError.stack);
          // Ne pas faire échouer la création du trajet pour autant
          alert('⚠️ Trajet créé mais erreur lors de l\'initialisation des sièges. Vérifiez la console.');
        }

        showNotification('✅ Trajet créé avec succès !', 'success');
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
                className={errors.price ? 'error' : ''}
                min="1"
                required
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
              {conflictWarnings.bus && (
                <div className="conflict-warning">
                  ⚠️ {conflictWarnings.bus}
                </div>
              )}
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
              {conflictWarnings.driver && (
                <div className="conflict-warning">
                  ⚠️ {conflictWarnings.driver}
                </div>
              )}
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

      {/* Notification de succès/erreur centrée */}
      {notification.show && (
        <div className={`notification-overlay ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' ? '✅' : '❌'}
            </div>
            <div className="notification-message">
              {notification.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripFormModal;
