import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './InvitationPage.css';

const InvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyInvitation(token);
    } else {
      setError('Token d\'invitation manquant');
      setIsLoading(false);
    }
  }, [token]);

  const verifyInvitation = async (invitationToken) => {
    try {
      setIsLoading(true);
      
      // Vérifier l'invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from('agency_admin_invitations')
        .select('*')
        .eq('invitation_token', invitationToken)
        .eq('status', 'pending')
        .single();

      if (invitationError || !invitationData) {
        throw new Error('Invitation non trouvée ou expirée');
      }

      // Vérifier si l'invitation n'a pas expiré
      const now = new Date();
      const expiresAt = new Date(invitationData.expires_at);
      
      if (now > expiresAt) {
        throw new Error('Cette invitation a expiré');
      }

      setInvitation(invitationData);
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'invitation:', error);
      setError(error.message || 'Invitation invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.admin_email,
        password: password,
        options: {
          data: {
            first_name: invitation.admin_first_name,
            last_name: invitation.admin_last_name,
            phone: invitation.admin_phone,
            role: 'agency_admin'
          }
        }
      });

      if (authError) throw authError;

      // 2. Créer l'entrée dans la table users avec le bon rôle
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: invitation.admin_email,
          first_name: invitation.admin_first_name,
          last_name: invitation.admin_last_name,
          phone: invitation.admin_phone,
          role: 'agency_admin', // IMPORTANT: s'assurer que le rôle est agency_admin
          is_verified: true,
          created_at: new Date().toISOString()
        });

      if (userError) throw userError;

      // 3. Mettre à jour l'user_id de l'agence pour pointer vers le nouveau admin
      const { error: agencyUpdateError } = await supabase
        .from('agencies')
        .update({ user_id: authData.user.id })
        .eq('id', invitation.agency_id);

      if (agencyUpdateError) throw agencyUpdateError;

      // 4. Marquer l'invitation comme acceptée
      const { error: invitationUpdateError } = await supabase
        .from('agency_admin_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (invitationUpdateError) throw invitationUpdateError;

      setSuccess('Compte créé avec succès ! Redirection vers l\'application...');
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      setError(error.message || 'Une erreur est survenue lors de la création du compte');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="invitation-page">
        <div className="invitation-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Vérification de l'invitation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="invitation-page">
        <div className="invitation-container">
          <div className="error-card">
            <h2>Invitation invalide</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invitation-page">
      <div className="invitation-container">
        <div className="invitation-card">
          <div className="invitation-header">
            <h1>Bienvenue !</h1>
            <p>Vous avez été invité(e) à rejoindre TravelHub en tant qu'administrateur d'agence</p>
          </div>

          {invitation && (
            <div className="invitation-details">
              <div className="agency-info">
                <h3>Informations de l'agence</h3>
                <p><strong>Nom de l'agence:</strong> {invitation.agency_name || 'Agence'}</p>
                <p><strong>Votre nom:</strong> {invitation.admin_first_name} {invitation.admin_last_name}</p>
                <p><strong>Email:</strong> {invitation.admin_email}</p>
              </div>

              <form onSubmit={handleSubmit} className="invitation-form">
                <h3>Créer votre mot de passe</h3>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength="6"
                    disabled={isProcessing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                    disabled={isProcessing}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      Création du compte...
                    </>
                  ) : (
                    'Accepter l\'invitation'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
