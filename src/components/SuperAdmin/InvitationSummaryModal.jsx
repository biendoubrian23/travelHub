import React, { useState } from 'react';
import './InvitationSummaryModal.css';

const InvitationSummaryModal = ({ details, onClose }) => {
  const [copied, setCopied] = useState({
    email: false,
    url: false
  });

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [field]: false }));
      }, 2000);
    });
  };

  const sendEmail = () => {
    const subject = `Invitation à rejoindre ${details.agencyName} sur TravelHub`;
    const body = `
Bonjour ${details.adminName},

Vous avez été invité(e) à rejoindre l'agence ${details.agencyName} sur la plateforme TravelHub en tant qu'administrateur.

Pour activer votre compte, veuillez cliquer sur le lien ci-dessous dans les 7 jours :
${details.invitationUrl}

Ce lien expire le ${details.expiresAt}.

Cordialement,
L'équipe TravelHub
    `;
    
    window.location.href = `mailto:${details.adminEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="sadmin-modal-overlay">
      <div className="sadmin-summary-modal">
        <div className="sadmin-summary-header">
          <h2>Invitation créée avec succès</h2>
          <button className="sadmin-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="sadmin-summary-body">
          <div className="sadmin-summary-info">
            <p><strong>Agence :</strong> {details.agencyName}</p>
            <p><strong>Administrateur :</strong> {details.adminName}</p>
            
            <div className="sadmin-copy-group">
              <label><strong>Email :</strong></label>
              <div className="sadmin-copy-container">
                <input type="text" value={details.adminEmail} readOnly />
                <button 
                  className="sadmin-copy-button" 
                  onClick={() => copyToClipboard(details.adminEmail, 'email')}
                  title="Copier l'email"
                >
                  {copied.email ? '✓' : '📋'}
                </button>
              </div>
            </div>
            
            <div className="sadmin-copy-group">
              <label><strong>Lien d'invitation :</strong></label>
              <div className="sadmin-copy-container">
                <input type="text" value={details.invitationUrl} readOnly />
                <button 
                  className="sadmin-copy-button" 
                  onClick={() => copyToClipboard(details.invitationUrl, 'url')}
                  title="Copier le lien"
                >
                  {copied.url ? '✓' : '📋'}
                </button>
              </div>
            </div>
            
            <p><strong>Date d'expiration :</strong> {details.expiresAt}</p>
            
            <div className="sadmin-summary-note">
              <p>
                <strong>Note importante :</strong> L'administrateur a 7 jours pour utiliser ce lien et créer son compte.
                Après cette période, vous devrez générer une nouvelle invitation.
              </p>
            </div>
          </div>
          
          <div className="sadmin-summary-actions">
            <button 
              className="sadmin-button sadmin-button-secondary" 
              onClick={onClose}
            >
              Fermer
            </button>
            
            <button 
              className="sadmin-button sadmin-button-primary" 
              onClick={sendEmail}
            >
              Envoyer par email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationSummaryModal;
