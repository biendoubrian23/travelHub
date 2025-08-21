import React, { useState } from 'react';
import './RefreshButton.css';

const RefreshButton = ({ onRefresh, className = '', tooltip = 'Actualiser les données' }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Erreur lors de l\'actualisation:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      className={`refresh-button ${className} ${isRefreshing ? 'refreshing' : ''}`}
      onClick={handleRefresh}
      disabled={isRefreshing}
      title={tooltip}
      type="button"
    >
      <svg
        className="refresh-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
      </svg>
      {isRefreshing && <span className="refresh-text">Actualisation...</span>}
    </button>
  );
};

export default RefreshButton;
