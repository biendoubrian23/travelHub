import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { signIn } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Tentative de connexion avec:', credentials.email);
    
    if (!credentials.email || !credentials.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📝 Appel de signIn...');
      const { error } = await signIn(credentials.email, credentials.password);
      
      console.log('📋 Résultat signIn:', error ? 'ERREUR' : 'SUCCÈS');
      
      if (error) {
        console.error('❌ Erreur de signIn:', error);
        throw error;
      }

      console.log('✅ Connexion réussie!');
      // La redirection se fera automatiquement via le contexte d'authentification
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      
      // Messages d'erreur localisés
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">TravelHub</h1>
          <p className="login-subtitle">Espace Agence</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-container">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="form-input"
                placeholder="votre.email@agence.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-container">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="login-footer">
          <a href="#" className="forgot-password">
            Mot de passe oublié ?
          </a>
          
          <div className="info-message">
            <p>
              💡 Seuls les employés avec des comptes d'agence peuvent se connecter.
              Pour créer une nouvelle agence, contactez l'administrateur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
