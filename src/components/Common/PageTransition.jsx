import React, { useState, useEffect } from 'react';
import './PageTransition.css';

const funMessages = [
  "🚌 Démarrage du moteur...",
  "🗺️ Préparation de l'itinéraire...",
  "🎫 Vérification des billets...",
  "⭐ Nettoyage des sièges...",
  "🚦 Attente du feu vert...",
  "🌟 Presque arrivé..."
];

const emojis = ['🚌', '🚐', '🚍', '🚎'];

const PageTransition = ({ isLoading, children }) => {
  const [showLoader, setShowLoader] = useState(false);
  const [loaderType, setLoaderType] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
      setLoaderType(Math.floor(Math.random() * emojis.length));
    } else {
      // Petit délai pour l'animation de sortie
      const timer = setTimeout(() => setShowLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!showLoader) return children;

  return (
    <div className="page-transition">
      <div className="mini-loader">
        <div className="vehicle-bounce">
          <span className="vehicle">{emojis[loaderType]}</span>
        </div>
        <div className="loading-dots-mini">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="transition-text">
          {funMessages[Math.floor(Math.random() * funMessages.length)]}
        </p>
      </div>
    </div>
  );
};

export default PageTransition;
