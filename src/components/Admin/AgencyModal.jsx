import React from 'react';
import CreateAgencyForm from './CreateAgencyForm';
import './AgencyModal.css';

const AgencyModal = ({ isOpen, onClose, onSuccess }) => {
  const handleSuccess = (result) => {
    // Ici, vous pouvez ajouter une logique supplémentaire après la création réussie
    console.log("Agence créée avec succès:", result);
    // Si onSuccess est fourni, l'appeler avec le résultat
    if (onSuccess) {
      onSuccess(result);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="agency-modal-overlay" onClick={onClose}>
      <div className="agency-modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Création d'une nouvelle agence</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          <CreateAgencyForm onSuccess={handleSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
};

export default AgencyModal;
