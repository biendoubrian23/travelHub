import React from 'react';
import CreateAgencyWizard from './CreateAgencyWizard';
import './AgencyModal.css';

const AgencyModal = ({ isOpen, onClose, onSuccess }) => {
  const handleSuccess = (result) => {
    // Ici, vous pouvez ajouter une logique supplémentaire après la création réussie
    console.log("Agence créée avec succès:", result);
    // Si onSuccess est fourni, l'appeler avec le résultat
    if (onSuccess) {
      onSuccess(result);
    }
    // Note: onClose sera appelé depuis le CreateAgencyWizard après fermeture de l'invitation modal
  };

  if (!isOpen) return null;

  return (
    <div className="agency-modal-overlay" onClick={onClose}>
      <div className="agency-modal-container modern" onClick={e => e.stopPropagation()}>
        <CreateAgencyWizard onSuccess={handleSuccess} onCancel={onClose} />
      </div>
    </div>
  );
};

export default AgencyModal;
