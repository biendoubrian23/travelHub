import React, { useState, useEffect, useMemo } from 'react';
import './ProgressLoader.css';

const ProgressLoader = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = useMemo(() => [
    { label: "Connexion sécurisée...", duration: 1200 },
    { label: "Vérification des permissions...", duration: 1000 },
    { label: "Chargement du profil...", duration: 1100 },
    { label: "Synchronisation des données...", duration: 800 },
    { label: "Finalisation...", duration: 600 }
  ], []);

  useEffect(() => {
    let currentProgress = 0;
    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    
    const interval = setInterval(() => {
      // Ralentir la progression (0.8 au lieu de 3)
      currentProgress += 0.8;
      
      // S'assurer que le progrès ne dépasse jamais 100%
      const clampedProgress = Math.min(currentProgress, 100);
      setProgress(clampedProgress);
      
      // Calculer l'étape actuelle basée sur le progrès
      let accumulatedDuration = 0;
      for (let i = 0; i < steps.length; i++) {
        accumulatedDuration += steps[i].duration;
        const stepProgress = (accumulatedDuration / totalDuration) * 100;
        if (clampedProgress <= stepProgress) {
          setCurrentStep(i);
          break;
        }
      }
      
      if (clampedProgress >= 100) {
        clearInterval(interval);
      }
    }, 80); // Augmenter l'intervalle de 40ms à 80ms pour ralentir

    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="progress-loader">
      <div className="progress-loader-content">
        {/* Logo ou icône */}
        <div className="progress-logo">
          <div className="logo-bus">🚌</div>
          <div className="logo-text">TravelHub</div>
        </div>

        {/* Barre de progression principale */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="progress-shine"></div>
            </div>
          </div>
          <div className="progress-percentage">{Math.round(progress)}%</div>
        </div>

        {/* Étapes de chargement */}
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`progress-step ${index <= currentStep ? 'active' : ''} ${index === currentStep ? 'current' : ''}`}
            >
              <div className="step-indicator">
                {index < currentStep ? (
                  <svg className="step-check" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <div className="step-number">{index + 1}</div>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Animation de particules */}
        <div className="progress-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressLoader;
