import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './CreateAgencyWizard.css';
import InvitationSummaryModal from './InvitationSummaryModal';

const CreateAgencyWizard = ({ onClose, onCreate }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInvitationSummary, setShowInvitationSummary] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [agencyData, setAgencyData] = useState({
    name: '',
    email: '',
    phone: '',
    license: '',
    address: '',
    description: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: '',
    adminEmail: ''
  });

  // Effet pour générer automatiquement l'email de l'administrateur
  useEffect(() => {
    if (agencyData.adminFirstName && agencyData.adminLastName && agencyData.name) {
      try {
        // Nettoyer et normaliser les noms
        const cleanFirst = agencyData.adminFirstName.toLowerCase().trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
          .replace(/[^a-z0-9]/g, ''); 
        const cleanLast = agencyData.adminLastName.toLowerCase().trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '');
        const cleanAgency = agencyData.name.toLowerCase().trim()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '')
          .replace(/\s+/g, ''); // Supprimer les espaces
        
        const generatedEmail = `${cleanFirst}.${cleanLast}@${cleanAgency}.com`;
        
        // Ne mettre à jour que si l'email a réellement changé
        if (generatedEmail !== agencyData.adminEmail) {
          setAgencyData(prev => ({
            ...prev,
            adminEmail: generatedEmail
          }));
        }
      } catch (error) {
        console.error('Erreur lors de la génération de l\'email:', error);
        // En cas d'erreur, ne pas bloquer l'utilisateur, juste logger l'erreur
      }
    }
  }, [agencyData.adminFirstName, agencyData.adminLastName, agencyData.name, agencyData.adminEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgencyData(prev => ({
      ...prev,
      [name]: value
    }));

    // Ne pas générer l'email automatiquement lors du handleChange pour éviter les boucles
    // La génération sera faite par le useEffect ci-dessus
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agencyData.adminFirstName || !agencyData.adminLastName || !agencyData.adminPhone) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Récupérer l'utilisateur actuel (super admin)
      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Créer l'agence dans la BD
      const { data: agencyResult, error: agencyError } = await supabase
        .from('agencies')
        .insert({
          user_id: user?.id, // Temporaire - sera mis à jour quand l'admin acceptera l'invitation
          name: agencyData.name,
          email: agencyData.email,
          phone: agencyData.phone,
          license_number: agencyData.license || null,
          address: agencyData.address,
          description: agencyData.description || null,
          is_verified: true,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (agencyError) throw agencyError;
      
      // 2. Générer un token d'invitation pour l'administrateur
      const invitationToken = crypto.randomUUID();
      const baseUrl = window.location.origin;
      const invitationUrl = `${baseUrl}/invitation?token=${invitationToken}`;
      
      // 3. Créer l'invitation dans la table agency_admin_invitations
      const { data: invitationResult, error: invitationError } = await supabase
        .from('agency_admin_invitations')
        .insert({
          agency_id: agencyResult.id,
          invited_by: user?.id,
          admin_email: agencyData.adminEmail,
          admin_first_name: agencyData.adminFirstName,
          admin_last_name: agencyData.adminLastName,
          admin_phone: agencyData.adminPhone,
          invitation_token: invitationToken,
          invitation_url: invitationUrl
        })
        .select('id, invitation_token, invitation_url, expires_at')
        .single();
      
      if (invitationError) throw invitationError;
      
      // 4. Afficher le résumé de l'invitation
      setInvitationDetails({
        ...invitationResult,
        agencyName: agencyData.name,
        adminName: `${agencyData.adminFirstName} ${agencyData.adminLastName}`,
        adminEmail: agencyData.adminEmail,
        invitationUrl: invitationResult.invitation_url,
        expiresAt: new Date(invitationResult.expires_at).toLocaleDateString('fr-FR')
      });
      
      setShowInvitationSummary(true);
      
      // 5. Notifier le composant parent
      onCreate({
        ...agencyData,
        id: agencyResult.id
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'agence:', error);
      setError('Une erreur est survenue lors de la création de l\'agence. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="sadmin-wizard-steps">
        <div className={`sadmin-wizard-step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          <div className="sadmin-step-number">1</div>
          <div className="sadmin-step-label">Agence</div>
        </div>
        <div className="sadmin-step-connector"></div>
        <div className={`sadmin-wizard-step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          <div className="sadmin-step-number">2</div>
          <div className="sadmin-step-label">Administrateur</div>
        </div>
      </div>
    );
  };

  const renderAgencyForm = () => {
    return (
      <div className="sadmin-wizard-form">
        <h3 className="sadmin-wizard-title">Informations de l'agence</h3>
        
        <div className="sadmin-form-group">
          <label className="sadmin-form-label">Nom de l'agence <span className="sadmin-required">*</span></label>
          <input
            type="text"
            className="sadmin-form-input"
            name="name"
            value={agencyData.name}
            onChange={handleChange}
            placeholder="Transport Express"
            required
          />
        </div>
        
        <div className="sadmin-form-group">
          <label className="sadmin-form-label">Email de l'agence <span className="sadmin-required">*</span></label>
          <input
            type="email"
            className="sadmin-form-input"
            name="email"
            value={agencyData.email}
            onChange={handleChange}
            placeholder="contact@agence.com"
            required
          />
        </div>
        
        <div className="sadmin-form-row">
          <div className="sadmin-form-group">
            <label className="sadmin-form-label">Téléphone <span className="sadmin-required">*</span></label>
            <input
              type="text"
              className="sadmin-form-input"
              name="phone"
              value={agencyData.phone}
              onChange={handleChange}
              placeholder="+237 6XX XXX XXX"
              required
            />
          </div>
          
          <div className="sadmin-form-group">
            <label className="sadmin-form-label">Numéro de licence</label>
            <input
              type="text"
              className="sadmin-form-input"
              name="license"
              value={agencyData.license}
              onChange={handleChange}
              placeholder="Optionnel"
            />
          </div>
        </div>
        
        <div className="sadmin-form-group">
          <label className="sadmin-form-label">Adresse <span className="sadmin-required">*</span></label>
          <input
            type="text"
            className="sadmin-form-input"
            name="address"
            value={agencyData.address}
            onChange={handleChange}
            placeholder="Quartier, Ville, Pays"
            required
          />
        </div>
        
        <div className="sadmin-form-group">
          <label className="sadmin-form-label">Description</label>
          <textarea
            className="sadmin-form-input sadmin-form-textarea"
            name="description"
            value={agencyData.description}
            onChange={handleChange}
            placeholder="Décrivez brièvement votre agence (optionnel)"
            rows="4"
          ></textarea>
        </div>
        
        <div className="sadmin-wizard-buttons">
          <button type="button" className="sadmin-button sadmin-button-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="sadmin-button sadmin-button-primary" onClick={nextStep}>
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const renderAdminForm = () => {
    return (
      <div className="sadmin-wizard-form">
        <h3 className="sadmin-wizard-title">Informations de l'administrateur</h3>
        
        <div className="sadmin-form-row">
          <div className="sadmin-form-group">
            <label className="sadmin-form-label">Prénom <span className="sadmin-required">*</span></label>
            <input
              type="text"
              className="sadmin-form-input"
              name="adminFirstName"
              value={agencyData.adminFirstName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="sadmin-form-group">
            <label className="sadmin-form-label">Nom <span className="sadmin-required">*</span></label>
            <input
              type="text"
              className="sadmin-form-input"
              name="adminLastName"
              value={agencyData.adminLastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="sadmin-form-group">
          <label className="sadmin-form-label">Téléphone <span className="sadmin-required">*</span></label>
          <input
            type="text"
            className="sadmin-form-input"
            name="adminPhone"
            value={agencyData.adminPhone}
            onChange={handleChange}
            placeholder="+237 6XX XXX XXX"
            required
          />
        </div>
        
        <div className="sadmin-form-group">
          <label className="sadmin-form-label">Email généré automatiquement</label>
          <input
            type="email"
            className="sadmin-form-input"
            value={agencyData.adminEmail}
            disabled
          />
          <small className="sadmin-form-hint">
            L'adresse email sera créée à partir du nom de l'administrateur et de l'agence
          </small>
        </div>
        
        <div className="sadmin-wizard-buttons">
          <button type="button" className="sadmin-button sadmin-button-secondary" onClick={prevStep} disabled={isLoading}>
            Retour
          </button>
          <button 
            type="submit" 
            className="sadmin-button sadmin-button-primary" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Création en cours...
              </>
            ) : (
              'Créer l\'agence'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="sadmin-modal-overlay">
        <div className="sadmin-modal-container">
          <div className="sadmin-modal-header">
            <h2 className="sadmin-modal-title">Nouvelle agence</h2>
            <button className="sadmin-modal-close" onClick={onClose} disabled={isLoading}>×</button>
          </div>
          
          <div className="sadmin-modal-body">
            {renderStepIndicator()}
            
            <form className="sadmin-wizard-container">
              {step === 1 && renderAgencyForm()}
              {step === 2 && renderAdminForm()}
            </form>
          </div>
        </div>
      </div>

      {showInvitationSummary && invitationDetails && (
        <InvitationSummaryModal 
          details={invitationDetails} 
          onClose={() => {
            setShowInvitationSummary(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default CreateAgencyWizard;
