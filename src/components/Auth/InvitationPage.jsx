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
  const [invitationType, setInvitationType] = useState(null); // 'employee' ou 'admin'
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
        // Essayer d'abord la table des invitations d'employés
        let { data, error } = await supabase
          .from('agency_employee_invitations')
          .select(`
            *,
            agencies(name)
          `)
          .eq('invitation_token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single();

        let invitationType = 'employee';

        // Si pas trouvé dans les employés, chercher dans les admins d'agence
        if (error || !data) {
          const { data: adminData, error: adminError } = await supabase
            .from('agency_admin_invitations')
            .select(`
              *,
              agencies(name)
            `)
            .eq('invitation_token', token)
            .eq('status', 'pending')
            .gt('expires_at', new Date().toISOString())
            .single();

          if (adminError || !adminData) {
            throw new Error('Invitation non trouvée ou expirée');
          }

          data = {
            ...adminData,
            email: adminData.admin_email,
            first_name: adminData.admin_first_name,
            last_name: adminData.admin_last_name,
            phone: adminData.admin_phone,
            employee_role: 'admin' // Pour les admins d'agence
          };
          invitationType = 'admin';
        }

        setInvitationType(invitationType);
        
        if (!data) {
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
      console.log('🔄 Tentative de création de compte pour:', invitation.email);
      console.log('📋 Données envoyées:', {
        email: invitation.email,
        full_name: `${invitation.first_name} ${invitation.last_name}`,
        phone: invitation.phone,
        agency_id: invitation.agency_id,
        employee_role: invitation.employee_role,
        invitation_token: token
      });

      // Calculer le rôle système basé sur employee_role et type d'invitation
      const systemRole = (() => {
        if (invitationType === 'admin') {
          return 'agence'; // Rôle correct pour les admins d'agence
        }
        
        switch(invitation.employee_role) {
          case 'admin': return 'agence';
          case 'manager': return 'agency_manager';
          case 'employee': return 'agency_employee';
          case 'driver': return 'agency_driver';
          default: return 'agency_employee';
        }
      })();

      console.log('🎭 Rôle système calculé:', systemRole);
      console.log('📋 Type d\'invitation:', invitationType);

      // 1. Créer le compte utilisateur via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${invitation.first_name} ${invitation.last_name}`,
            phone: invitation.phone,
            role: systemRole,  // ⭐ AJOUTER LE RÔLE ICI
            agency_id: invitation.agency_id,
            employee_role: invitation.employee_role,
            invitation_token: token
          }
        }
      });

      if (authError) {
        console.error('❌ Erreur Auth:', authError);
        console.error('📊 Code erreur:', authError.status);
        console.error('📝 Message:', authError.message);
        throw authError;
      }

      if (authData.user) {
        // 2. Créer l'entrée dans la table users avec le bon rôle
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: invitation.email,
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            phone: invitation.phone,
            role: systemRole, // IMPORTANT: Assurer le bon rôle
            is_verified: true,
            created_at: new Date().toISOString()
          });

        if (userError) {
          console.error('❌ Erreur création utilisateur:', userError);
          // Ne pas faire échouer complètement, l'utilisateur peut se connecter
        }

        // 3. Si c'est un admin d'agence, mettre à jour l'user_id de l'agence
        if (invitationType === 'admin') {
          const { error: agencyUpdateError } = await supabase
            .from('agencies')
            .update({ user_id: authData.user.id })
            .eq('id', invitation.agency_id);

          if (agencyUpdateError) {
            console.warn('Erreur mise à jour agence:', agencyUpdateError);
          }
        }

        // 4. Marquer l'invitation comme acceptée selon le type
        const tableName = invitationType === 'admin' ? 'agency_admin_invitations' : 'agency_employee_invitations';
        const { error: updateError } = await supabase
          .from(tableName)
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            ...(invitationType === 'employee' ? { user_id: authData.user.id } : {})
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
