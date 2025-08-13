import React, { useEffect } from 'react';

const StatusMessage = ({ type, message, onClose }) => {
  useEffect(() => {
    if (message) {
      // Fermer automatiquement après 5 secondes
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`sadmin-status-message sadmin-status-${type}`}>
      <span className="sadmin-status-message-icon">
        {type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ️'}
      </span>
      <span className="sadmin-status-message-text">{message}</span>
      <button 
        className="sadmin-status-message-close" 
        onClick={onClose}
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  );
};

export default StatusMessage;
