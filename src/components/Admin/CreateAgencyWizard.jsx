import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './CreateAgencyWizard.css';

const CreateAgencyWizard = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  
  // Données du formulaire
  const [agencyData, setAgencyData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    license: '',
    description: ''
  });
  
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [generatedEmail, setGeneratedEmail] = useState('');
  const [errors, setErrors] = useState({});

  // Générer l'email admin automatiquement
  useEffect(() => {
    if (adminData.firstName && adminData.lastName && agencyData.name) {
      const email = generateAdminEmail(adminData.firstName, adminData.lastName, agencyData.name);
      setGeneratedEmail(email);
    }
  }, [adminData.firstName, adminData.lastName, agencyData.name]);

  const generateAdminEmail = (firstName, lastName, agencyName) => {
    const cleanFirst = firstName.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    const cleanAgency = agencyName.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    return `${cleanFirst}.${cleanLast}@${cleanAgency}.com`;
  };

  const validateAgencyStep = () => {
    const newErrors = {};
    
    if (!agencyData.name.trim()) newErrors.name = "Le nom de l'agence est requis";
    if (!agencyData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agencyData.email)) 
      newErrors.email = "Format d'email invalide";
    if (!agencyData.phone.trim()) newErrors.phone = "Le téléphone est requis";
    if (!agencyData.address.trim()) newErrors.address = "L'adresse est requise";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAdminStep = () => {
    const newErrors = {};
    
    if (!adminData.firstName.trim()) newErrors.firstName = "Le prénom est requis";
    if (!adminData.lastName.trim()) newErrors.lastName = "Le nom est requis";
    if (!adminData.phone.trim()) newErrors.phone = "Le téléphone est requis";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAgencyInputChange = (e) => {
    const { name, value } = e.target;
    setAgencyData(prev => ({ ...prev, [name]: value }));
    
    // Supprimer l'erreur si l'utilisateur corrige
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = () => {
    if (validateAgencyStep()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleCreateAgency = async () => {
    if (!validateAdminStep()) return;

    setIsLoading(true);
    
    try {
      // 0. Récupérer l'ID de l'utilisateur actuellement connecté (super admin)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Vous devez être connecté pour créer une agence.");
      }

      console.log("Étape 1: Création de l'agence...");
      
      // 1. Créer l'agence
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .insert([{
          name: agencyData.name,
          email: agencyData.email,
          phone: agencyData.phone,
          address: agencyData.address,
          license_number: agencyData.license || null,
          description: agencyData.description || null,
          is_verified: true,
          verified_at: new Date().toISOString(),
          user_id: user.id // Utiliser l'ID de l'utilisateur connecté comme référence temporaire
        }])
        .select()
        .single();

      if (agencyError) throw agencyError;
      console.log("Agence créée:", agency);

      console.log("Étape 2: Création de l'utilisateur admin...");
      
      // 2. Créer l'utilisateur admin dans la table users
      const { data: adminUser, error: userError } = await supabase
        .from('users')
        .insert([{
          email: generatedEmail,
          full_name: `${adminData.firstName} ${adminData.lastName}`,
          phone: adminData.phone,
          role: 'agence', // Utiliser 'agence' au lieu de 'agency_admin'
          is_generated_user: true,
          password_changed: false,
          generated_by: user.id,
          is_active: false // Sera activé après confirmation du mot de passe
        }])
        .select()
        .single();

      if (userError) {
        console.warn("Erreur lors de la création de l'utilisateur:", userError);
        // Ne pas arrêter le processus, on continue avec l'invitation
      } else {
        console.log("Utilisateur admin créé:", adminUser);
      }

      console.log("Étape 3: Création de l'invitation...");

      // 3. Créer l'invitation pour l'admin
      const { data: invitation, error: invitationError } = await supabase
        .from('agency_employee_invitations')
        .insert([{
          agency_id: agency.id,
          email: generatedEmail,
          first_name: adminData.firstName,
          last_name: adminData.lastName,
          phone: adminData.phone,
          employee_role: 'admin',
          notes: 'Administrateur principal de l\'agence',
          invited_by: user.id,
          user_id: adminUser?.id || null // Lier à l'utilisateur créé si disponible
        }])
        .select()
        .single();

      if (invitationError) throw invitationError;
      console.log("Invitation créée:", invitation);

      console.log("Étape 4: Préparation du modal...");

      // 4. Générer le lien d'invitation
      const invitationUrl = `${window.location.origin}/invitation?token=${invitation.invitation_token}`;

      // 5. Préparer les données pour le modal d'invitation
      const modalData = {
        agency: agency,
        admin: {
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          email: generatedEmail,
          phone: adminData.phone
        },
        invitationUrl: invitationUrl,
        invitationToken: invitation.invitation_token
      };

      console.log("Données du modal:", modalData);
      setInvitationData(modalData);

      // 6. Afficher le modal d'invitation
      console.log("Affichage du modal...");
      setShowInvitationModal(true);

      // 7. Notifier le parent du succès SEULEMENT après que le modal soit fermé
      // Ne pas appeler onSuccess ici pour éviter de fermer le modal prématurément

    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setErrors({ submit: `Erreur: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Texte copié:", text);
      // Vous pouvez ajouter une notification de succès ici
    });
  };

  const closeInvitationModal = () => {
    console.log("Fermeture du modal d'invitation");
    
    // Notifier le parent du succès maintenant
    if (onSuccess && invitationData) {
      onSuccess({
        agency: invitationData.agency,
        admin: invitationData.admin,
        invitationUrl: invitationData.invitationUrl
      });
    }
    
    setShowInvitationModal(false);
    // Ne pas fermer le modal principal automatiquement
    // L'utilisateur peut choisir de le fermer manuellement après avoir copié le lien
  };

  console.log("État actuel:", {
    showInvitationModal,
    invitationData,
    isLoading,
    errors
  });

  if (showInvitationModal && invitationData) {
    console.log("Rendu du modal d'invitation avec les données:", invitationData);
    return (
      <div className="invitation-modal-overlay" onClick={(e) => {
        // Empêcher la fermeture en cliquant sur l'overlay
        e.stopPropagation();
      }}>
        <div className="invitation-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="invitation-header">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Agence créée avec succès !</h2>
            <p>L'agence <strong>{invitationData.agency.name}</strong> a été créée et l'administrateur a été invité.</p>
          </div>

        <div className="invitation-content">
          <div className="admin-info">
            <h3>Administrateur</h3>
            <div className="admin-details">
              <p><strong>{invitationData.admin.firstName} {invitationData.admin.lastName}</strong></p>
              <p>{invitationData.admin.phone}</p>
            </div>
          </div>

          <div className="email-section">
            <label>Email généré automatiquement</label>
            <div className="email-field">
              <input type="text" value={invitationData.admin.email} readOnly />
              <button 
                type="button" 
                onClick={() => copyToClipboard(invitationData.admin.email)}
                className="copy-btn"
                title="Copier l'email"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V16C8 17.1 8.9 18 10 18H18C19.1 18 20 17.1 20 16V7.4L16.6 4H10C8.9 4 8 4.9 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 4V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 18V20C16 21.1 15.1 22 14 22H6C4.9 22 4 21.1 4 20V9C4 7.9 4.9 7 6 7H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="invitation-section">
            <label>Lien d'invitation</label>
            <div className="invitation-field">
              <input type="text" value={invitationData.invitationUrl} readOnly />
              <button 
                type="button" 
                onClick={() => copyToClipboard(invitationData.invitationUrl)}
                className="copy-btn"
                title="Copier le lien"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4V16C8 17.1 8.9 18 10 18H18C19.1 18 20 17.1 20 16V7.4L16.6 4H10C8.9 4 8 4.9 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 4V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 18V20C16 21.1 15.1 22 14 22H6C4.9 22 4 21.1 4 20V9C4 7.9 4.9 7 6 7H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="invitation-note">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              L'administrateur doit utiliser ce lien pour créer son mot de passe et activer son compte. Le lien expire dans 7 jours.
            </p>
          </div>
        </div>

        <div className="invitation-actions">
          <a 
            href={`mailto:${invitationData.admin.email}?subject=Invitation%20à%20rejoindre%20${encodeURIComponent(invitationData.agency.name)}%20sur%20TravelHub&body=Bonjour%20${encodeURIComponent(invitationData.admin.firstName)}%2C%0A%0AVotre%20compte%20administrateur%20pour%20l'agence%20${encodeURIComponent(invitationData.agency.name)}%20a%20été%20créé.%0A%0AEmail%20%3A%20${encodeURIComponent(invitationData.admin.email)}%0ALien%20d'activation%20%3A%20${encodeURIComponent(invitationData.invitationUrl)}%0A%0ACordialement%2C%0AL'équipe%20TravelHub`}
            className="email-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Envoyer par email
          </a>
          <button type="button" onClick={() => {
            closeInvitationModal();
            onCancel(); // Fermer le modal principal aussi
          }} className="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Fermer
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="agency-wizard-container">
      {/* Indicateur d'étapes */}
      <div className="wizard-header">
        <div className="agency-step-indicator">
          <div className={`agency-step ${currentStep === 1 ? 'active' : 'completed'}`}>
            <div className="agency-step-number">
              {currentStep > 1 ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                '1'
              )}
            </div>
            <span className="agency-step-label">Agence</span>
          </div>
          
          <div className="agency-step-connector"></div>
          
          <div className={`agency-step ${currentStep === 2 ? 'active' : ''}`}>
            <div className="agency-step-number">2</div>
            <span className="agency-step-label">Administrateur</span>
          </div>
        </div>
        
        <h2 className="wizard-title">
          {currentStep === 1 ? 'Informations de l\'agence' : 'Informations de l\'administrateur'}
        </h2>
      </div>

      {/* Contenu du formulaire */}
      <div className="wizard-content">
        {/* Étape 1: Informations de l'agence */}
        {currentStep === 1 && (
          <div className="form-step" id="agency-step">
            <div className="form-grid agency-grid">
              {/* Première ligne: Nom et Email */}
              <div className="form-group">
                <label htmlFor="agencyName">
                  Nom de l'agence <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="agencyName"
                  name="name"
                  value={agencyData.name}
                  onChange={handleAgencyInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Transport Express"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="agencyEmail">
                  Email de l'agence <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="agencyEmail"
                  name="email"
                  value={agencyData.email}
                  onChange={handleAgencyInputChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="contact@agence.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Deuxième ligne: Téléphone et Numéro de licence */}
              <div className="form-group">
                <label htmlFor="agencyPhone">
                  Téléphone <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="agencyPhone"
                  name="phone"
                  value={agencyData.phone}
                  onChange={handleAgencyInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+237 6XX XXX XXX"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="agencyLicense">Numéro de licence</label>
                <input
                  type="text"
                  id="agencyLicense"
                  name="license"
                  value={agencyData.license}
                  onChange={handleAgencyInputChange}
                  placeholder="Optionnel"
                />
              </div>

              {/* Troisième ligne: Adresse (pleine largeur) */}
              <div className="form-group full-width">
                <label htmlFor="agencyAddress">
                  Adresse <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="agencyAddress"
                  name="address"
                  value={agencyData.address}
                  onChange={handleAgencyInputChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Quartier, Ville, Pays"
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              {/* Quatrième ligne: Description (pleine largeur) */}
              <div className="form-group full-width">
                <label htmlFor="agencyDescription">Description</label>
                <textarea
                  id="agencyDescription"
                  name="description"
                  value={agencyData.description}
                  onChange={handleAgencyInputChange}
                  rows="2"
                  placeholder="Décrivez brièvement votre agence (optionnel)"
                />
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Informations de l'administrateur */}
        {currentStep === 2 && (
          <div className="form-step" id="admin-step">
            <div className="form-grid admin-grid">
              {/* Première ligne: Prénom et Nom */}
              <div className="form-group">
                <label htmlFor="adminFirstName">
                  Prénom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="adminFirstName"
                  name="firstName"
                  value={adminData.firstName}
                  onChange={handleAdminInputChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="Prénom"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adminLastName">
                  Nom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="adminLastName"
                  name="lastName"
                  value={adminData.lastName}
                  onChange={handleAdminInputChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Nom"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>

              {/* Deuxième ligne: Téléphone (pleine largeur) */}
              <div className="form-group full-width">
                <label htmlFor="adminPhone">
                  Téléphone <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="adminPhone"
                  name="phone"
                  value={adminData.phone}
                  onChange={handleAdminInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+237 6XX XXX XXX"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              {generatedEmail && (
                <div className="form-group full-width">
                  <div className="email-preview">
                    <h4>Email généré automatiquement</h4>
                    <div className="generated-email">{generatedEmail}</div>
                    <p>L'adresse email sera créée à partir du nom de l'administrateur et de l'agence</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message d'erreur global */}
        {errors.submit && (
          <div className="error-message global">
            {errors.submit}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="wizard-actions">
        {currentStep === 1 && (
          <>
            <button type="button" onClick={onCancel} className="cancel-btn">
              Annuler
            </button>
            <button type="button" onClick={handleNextStep} className="next-btn">
              Suivant
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {currentStep === 2 && (
          <>
            <button type="button" onClick={handlePreviousStep} className="back-btn">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Retour
            </button>
            <button 
              type="button" 
              onClick={handleCreateAgency} 
              className="create-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Création...
                </>
              ) : (
                <>
                  Créer l'agence
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateAgencyWizard;
