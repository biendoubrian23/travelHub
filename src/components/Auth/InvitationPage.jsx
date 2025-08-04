import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, User, Building, Mail, Lock } from 'lucide-react';
import './InvitationPage.css';

const InvitationPage = () => {
  // Récupérer le token depuis l'URL sans React Router
  const getTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  };
  
  const token = getTokenFromUrl();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvitation();
    } else {
      setError('Token d\'invitation manquant');
      setLoading(false);
    }
    
    // Fonction de validation directement dans useEffect pour éviter les dépendances
    async function validateInvitation() {
      try {
        // Validation simple du token directement dans la table
        const { data, error } = await supabase
          .from('agency_employee_invitations')
          .select(`
            *,
            agencies(name)
          `)
          .eq('invitation_token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !data) {
          setError('Invitation non trouvée, expirée ou déjà utilisée');
        } else {
          setInvitation({
            ...data,
            agency_name: data.agencies?.name || 'Agence inconnue'
          });
        }
      } catch (error) {
        console.error('Erreur validation invitation:', error);
        setError('Erreur lors de la validation de l\'invitation');
      } finally {
        setLoading(false);
      }
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.password || formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      // 1. Créer le compte utilisateur via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${invitation.first_name} ${invitation.last_name}`,
            phone: invitation.phone,
            agency_id: invitation.agency_id,
            employee_role: invitation.employee_role,
            invitation_token: token
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Marquer l'invitation comme acceptée
        const { error: updateError } = await supabase
          .from('agency_employee_invitations')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            user_id: authData.user.id
          })
          .eq('invitation_token', token);

        if (updateError) {
          console.warn('Erreur mise à jour invitation:', updateError);
        }

        // 3. Créer l'enregistrement employé via trigger ou fonction
        // (Ceci sera géré par un trigger Supabase automatiquement)

        setSuccess('Compte créé avec succès ! Vous allez être redirigé...');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur création compte:', error);
      setError(error.message || 'Erreur lors de la création du compte');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="invitation-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Validation de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="invitation-page">
        <div className="error-container">
          <h2>Invitation invalide</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/'} className="btn btn-primary">
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invitation-page">
      <div className="invitation-container">
        <div className="invitation-header">
          <div className="logo-section">
            <Building size={48} />
            <h1>TravelHub</h1>
          </div>
          <div className="invitation-info">
            <h2>Vous êtes invité à rejoindre</h2>
            <p className="agency-name">{invitation.agency_name}</p>
          </div>
        </div>

        <div className="invitation-details">
          <div className="user-info">
            <User size={20} />
            <div>
              <p><strong>{invitation.first_name} {invitation.last_name}</strong></p>
              <p className="role">{getRoleLabel(invitation.employee_role)}</p>
            </div>
          </div>
          <div className="email-info">
            <Mail size={20} />
            <p>{invitation.email}</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="registration-form">
          <h3>Créer votre mot de passe</h3>
          
          <div className="form-group">
            <label>Mot de passe</label>
            <div className="password-input">
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <div className="password-input">
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Répétez votre mot de passe"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="password-requirements">
            <p>Votre mot de passe doit contenir :</p>
            <ul>
              <li className={formData.password.length >= 8 ? 'valid' : ''}>
                Au moins 8 caractères
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                Une lettre majuscule
              </li>
              <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                Un chiffre
              </li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={isRegistering || !formData.password || !formData.confirmPassword}
          >
            {isRegistering ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="invitation-footer">
          <p>En créant votre compte, vous acceptez de rejoindre l'agence <strong>{invitation.agency_name}</strong> en tant que <strong>{getRoleLabel(invitation.employee_role)}</strong>.</p>
        </div>
      </div>
    </div>
  );
};

const getRoleLabel = (role) => {
  const roles = {
    'admin': 'Administrateur',
    'manager': 'Manager',
    'employee': 'Employé',
    'driver': 'Conducteur'
  };
  return roles[role] || role;
};

export default InvitationPage;
