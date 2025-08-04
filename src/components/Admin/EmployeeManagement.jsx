import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './EmployeeManagement.css';
import './EmployeeDetailsStyle.css';
import './EmployeeDetailsEnhanced.css';
import './EmployeePhoneStyles.css';
import './EmployeeDetailsEnhanced.css';
import './InvitationsTableStyles.css';
import './UnifiedTableStyles.css';
import './IOSModalStyles.css';
import './StatusBadgesHarmonization.css';
import './NoHoverTableStyles.css';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Lock, 
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Copy,
  Check,
  Clock,
  Send
} from 'lucide-react';

const EmployeeManagement = () => {
  const { userProfile, agency, isAgencyOwner } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]); // Nouveau state pour les invitations
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    role: 'employee',
    notes: ''
  });

  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null); // Pour le modal de détails
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
    view: 'employees' // 'employees' ou 'invitations'
  });

  const roles = [
    { value: 'admin', label: 'Administrateur', description: 'Accès complet à l\'agence', userRole: 'agency_admin' },
    { value: 'manager', label: 'Manager', description: 'Gestion équipe + réservations + finances', userRole: 'agency_manager' },
    { value: 'employee', label: 'Employé', description: 'Réservations + consultation', userRole: 'agency_employee' },
    { value: 'driver', label: 'Conducteur', description: 'Accès conducteur (lecture seule)', userRole: 'agency_driver' }
  ];

  useEffect(() => {
    if (agency) {
      loadEmployees();
      loadInvitations();
    }
  }, [agency]);

  const loadEmployees = async () => {
    try {
      setError(''); // Effacer les erreurs précédentes
      console.log('🔄 Chargement des employés pour l\'agence:', agency.id);
      
      // Effectuer une jointure avec la table users pour récupérer les informations complètes
      let { data, error } = await supabase
        .from('agency_employees')
        .select(`
          *,
          user:users(id, full_name, email)
        `)
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });
      
      // Assurer que les données sont bien formatées
      if (data) {
        data = data.map(employee => {
          // S'assurer que les propriétés first_name et last_name sont définies
          if (employee.user && employee.user.full_name) {
            const nameParts = employee.user.full_name.split(' ');
            employee.first_name = nameParts[0] || '';
            employee.last_name = nameParts.slice(1).join(' ') || '';
          }
          return employee;
        });
      }

      // Si toujours pas de données, chercher tous les employés de l'agence
      if (error || !data || data.length === 0) {
        console.log('🔄 Tentative sans jointure...');
        const result = await supabase
          .from('agency_employees')
          .select('*')
          .eq('agency_id', agency.id)
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('❌ Erreur lors du chargement des employés:', error);
        setError('Erreur lors du chargement des employés: ' + error.message);
        setEmployees([]);
      } else {
        console.log('✅ Employés chargés:', data?.length || 0, data);
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('❌ Erreur générale lors du chargement des employés:', error);
      setError('Erreur lors du chargement des employés: ' + error.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      console.log('🔄 Chargement des invitations pour l\'agence:', agency.id);
      
      const { data, error } = await supabase
        .from('agency_employee_invitations')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des invitations:', error);
        setInvitations([]);
      } else {
        console.log('✅ Invitations chargées:', data?.length || 0, data);
        setInvitations(data || []);
        
        // Vérifier s'il y a de nouvelles invitations acceptées
        const recentlyAccepted = data?.filter(inv => 
          inv.status === 'accepted' && 
          new Date(inv.accepted_at) > new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
        );
        
        if (recentlyAccepted?.length > 0) {
          console.log('🎉 Nouvelles invitations acceptées détectées, rechargement des employés...');
          // Recharger les employés après un court délai pour laisser le temps aux triggers
          setTimeout(() => {
            loadEmployees();
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Erreur générale lors du chargement des invitations:', error);
      setInvitations([]);
    }
  };

  // Fonction pour rafraîchir automatiquement les données
  const refreshData = useCallback(async () => {
    await Promise.all([loadEmployees(), loadInvitations()]);
  }, [agency]);

  // Polling pour détecter les nouveaux employés créés via invitation
  useEffect(() => {
    if (!agency) return;
    
    const interval = setInterval(() => {
      // Recharger discrètement toutes les 30 secondes
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [agency, refreshData]);

  const generateEmployeeCredentials = async (firstName, lastName) => {
    try {
      // Générer l'email via la fonction SQL
      const { data: emailData, error: emailError } = await supabase
        .rpc('generate_employee_email', {
          first_name: firstName,
          last_name: lastName,
          agency_name: agency.name
        });

      if (emailError) throw emailError;

      // Générer le mot de passe temporaire via la fonction SQL
      const { data: passwordData, error: passwordError } = await supabase
        .rpc('generate_temp_password');

      if (passwordError) throw passwordError;

      return {
        email: emailData,
        password: passwordData
      };
    } catch (error) {
      console.error('Erreur génération identifiants:', error);
      // Fallback en cas d'erreur
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${agency.name.toLowerCase().replace(/\s+/g, '')}.travelhub.cm`;
      const password = Math.random().toString(36).slice(-8);
      return { email, password };
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.phone || !newEmployee.role) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Générer l'email automatiquement
      const email = `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@${agency.name.toLowerCase().replace(/\s+/g, '')}.travelhub.cm`;
      
      console.log('📧 Email généré:', email);
      console.log('� Création de l\'invitation...');

      // Créer l'invitation directement dans la table
      const { data: invitationData, error: invitationError } = await supabase
        .from('agency_employee_invitations')
        .insert({
          agency_id: agency.id,
          email: email,
          first_name: newEmployee.firstName,
          last_name: newEmployee.lastName,
          phone: newEmployee.phone,
          date_of_birth: newEmployee.dateOfBirth || null,
          employee_role: newEmployee.role,
          notes: newEmployee.notes,
          invited_by: userProfile.id
        })
        .select()
        .single();

      if (invitationError) {
        console.error('❌ Erreur création invitation:', invitationError);
        
        // Gestion spécifique des erreurs
        if (invitationError.message.includes('duplicate') || invitationError.code === '23505') {
          throw new Error(`Une invitation existe déjà pour l'email ${email}`);
        }
        if (invitationError.message.includes('foreign key') || invitationError.code === '23503') {
          throw new Error('Erreur de référence - vérifiez les données de l\'agence');
        }
        
        throw new Error(invitationError.message);
      }

      console.log('✅ Invitation créée:', invitationData);

      // Construire le lien d'invitation
      const invitationLink = `${window.location.origin}/invitation?token=${invitationData.invitation_token}`;
      
      // Afficher les détails de l'invitation
      setGeneratedCredentials({
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: email,
        role: newEmployee.role,
        phone: newEmployee.phone,
        invitationLink: invitationLink,
        agencyName: agency.name, // Utiliser directement agency.name
        isInvitation: true // Flag pour identifier que c'est une invitation
      });

      // Fermer le modal et réinitialiser
      setShowAddModal(false);
      setNewEmployee({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        role: 'employee',
        notes: ''
      });

      setSuccess('Invitation envoyée avec succès !');
      await loadInvitations(); // Recharger les invitations

    } catch (error) {
      console.error('💥 Erreur complète:', error);
      setError(error.message || 'Erreur lors de la création de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (employeeId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('agency_employees')
        .update({ is_active: !currentStatus })
        .eq('id', employeeId);

      if (error) throw error;

      setSuccess('Statut employé mis à jour');
      await loadEmployees();
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      setError('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;

    try {
      // Supprimer l'employé (cascade supprimera l'utilisateur)
      const { error } = await supabase
        .from('agency_employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      // Note: Nous ne supprimons pas le compte auth pour éviter les problèmes de permissions
      // L'employé sera juste retiré de l'agence

      setSuccess('Employé supprimé avec succès');
      await loadEmployees();
    } catch (error) {
      console.error('Erreur suppression employé:', error);
      setError('Erreur lors de la suppression de l\'employé');
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#FF3B30';
      case 'manager': return '#FF9500';
      case 'employee': return '#007AFF';
      case 'driver': return '#34C759';
      default: return '#8E8E93';
    }
  };

  // Fonction de filtrage pour employés
  const filteredEmployees = employees.filter(employee => {
    const matchesRole = filters.role === 'all' || employee.employee_role === filters.role;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && employee.is_active) ||
      (filters.status === 'inactive' && !employee.is_active);
    
    const name = `${employee.users?.full_name || employee.user?.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim()}`.toLowerCase();
    const email = (employee.users?.email || employee.user?.email || employee.generated_email || '').toLowerCase();
    const phone = (employee.phone || '').toLowerCase();
    const matchesSearch = filters.search === '' || 
      name.includes(filters.search.toLowerCase()) ||
      email.includes(filters.search.toLowerCase()) ||
      phone.includes(filters.search.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  // Fonction de filtrage pour invitations
  const filteredInvitations = invitations.filter(invitation => {
    const matchesRole = filters.role === 'all' || invitation.employee_role === filters.role;
    
    // Pour les invitations, on considère "active" = "accepted", "inactive" = "pending/expired"
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && invitation.status === 'accepted') ||
      (filters.status === 'inactive' && (invitation.status === 'pending' || invitation.status === 'expired'));
    
    const name = `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim().toLowerCase();
    const email = (invitation.email || '').toLowerCase();
    const phone = (invitation.phone || '').toLowerCase();
    const matchesSearch = filters.search === '' || 
      name.includes(filters.search.toLowerCase()) ||
      email.includes(filters.search.toLowerCase()) ||
      phone.includes(filters.search.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  // Fonction pour ouvrir le modal de détails
  const openEmployeeDetails = async (employee) => {
    // Si l'employé n'a pas de nom complet, essayons de le récupérer depuis la base de données
    if ((!employee.first_name || !employee.last_name) && employee.user_id) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', employee.user_id)
          .single();
          
        if (data && !error) {
          const nameParts = data.full_name.split(' ');
          employee.first_name = nameParts[0] || '';
          employee.last_name = nameParts.slice(1).join(' ') || '';
          employee.user = {
            full_name: data.full_name,
            email: data.email
          };
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails utilisateur:', error);
      }
    }
    
    setSelectedEmployee(employee);
  };

  // Fonction pour ouvrir le modal de détails d'une invitation
  const openInvitationDetails = (invitation) => {
    setSelectedEmployee({
      ...invitation,
      isInvitation: true,
      full_name: `${invitation.first_name || ''} ${invitation.last_name || ''}`.trim(),
      email: invitation.email,
      role: invitation.employee_role,
      created_at: invitation.created_at,
      status: invitation.status,
      phone: invitation.phone,
      date_of_birth: invitation.date_of_birth,
      notes: invitation.notes,
      invited_by: invitation.invited_by,
      accepted_at: invitation.accepted_at,
      expires_at: invitation.expires_at
    });
  };

  if (!isAgencyOwner()) {
    return (
      <div className="no-access">
        <UserX size={48} />
        <h3>Accès non autorisé</h3>
        <p>Seul le propriétaire de l'agence peut gérer les employés.</p>
      </div>
    );
  }

  return (
    <div className="employee-management">
      <div className="page-header">
        <div className="header-content">
          <div className="header-info">
            <Users size={28} />
            <div>
              <h1>Gestion des Employés</h1>
              <p>{employees.length} employé(s) dans votre agence</p>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            Ajouter un employé
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}



      {/* Popup d'invitation envoyée - Version améliorée */}
      {generatedCredentials && generatedCredentials.isInvitation && (
        <div className="modal-overlay">
          <div className="modal credentials-modal">
            <div className="modal-header">
              <h2>Invitation envoyée avec succès!</h2>
              <button 
                onClick={() => setGeneratedCredentials(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="employee-success-icon">✉️</div>
              
              <div className="employee-info-summary">
                <h3>{generatedCredentials.firstName} {generatedCredentials.lastName}</h3>
                <p className="employee-role">{getRoleLabel(generatedCredentials.role)}</p>
                <p className="agency-name">{generatedCredentials.agencyName}</p>
              </div>
              
              <div className="credentials-card">
                <h4>Invitation créée</h4>
                <div className="credential-group">
                  <div className="credential-item">
                    <label>Email d'invitation</label>
                    <div className="credential-value">
                      <span>{generatedCredentials.email}</span>
                      <button 
                        onClick={() => copyToClipboard(generatedCredentials.email, 'email')}
                        className="copy-btn"
                        title="Copier l'email"
                      >
                        {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="credential-item">
                    <label>Lien d'invitation</label>
                    <div className="credential-value">
                      <span className="invitation-link">{generatedCredentials.invitationLink}</span>
                      <button 
                        onClick={() => copyToClipboard(generatedCredentials.invitationLink, 'link')}
                        className="copy-btn"
                        title="Copier le lien"
                      >
                        {copiedField === 'link' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="invitation-actions">
                <button 
                  onClick={() => window.open(`mailto:${generatedCredentials.email}?subject=Invitation à rejoindre ${generatedCredentials.agencyName}&body=Bonjour ${generatedCredentials.firstName},\n\nVous êtes invité à rejoindre l'agence ${generatedCredentials.agencyName} en tant que ${getRoleLabel(generatedCredentials.role)}.\n\nCliquez sur ce lien pour créer votre compte :\n${generatedCredentials.invitationLink}\n\nCordialement`)}
                  className="btn btn-outline"
                >
                  <Send size={16} />
                  Envoyer par email
                </button>
              </div>
              
              <div className="credentials-note">
                <strong>Important :</strong> Partagez ce lien d'invitation avec l'employé. 
                Il aura 7 jours pour créer son compte.
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => setGeneratedCredentials(null)}
                  className="btn btn-primary"
                >
                  Fermer et continuer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup des identifiants générés - Version originale pour les comptes directs */}
      {generatedCredentials && !generatedCredentials.isInvitation && (
        <div className="modal-overlay">
          <div className="modal credentials-modal">
            <div className="modal-header">
              <h2>Employé créé avec succès!</h2>
              <button 
                onClick={() => setGeneratedCredentials(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="employee-success-icon">✅</div>
              
              <div className="employee-info-summary">
                <h3>{generatedCredentials.firstName} {generatedCredentials.lastName}</h3>
                <p className="employee-role">{generatedCredentials.role}</p>
              </div>
              
              <div className="credentials-card">
                <h4>Identifiants de connexion</h4>
                <div className="credential-group">
                  <div className="credential-item">
                    <label>Email de connexion</label>
                    <div className="credential-value">
                      <span>{generatedCredentials.email}</span>
                      <button 
                        onClick={() => copyToClipboard(generatedCredentials.email, 'email')}
                        className="copy-btn"
                        title="Copier l'email"
                      >
                        {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="credential-item">
                    <label>Mot de passe temporaire</label>
                    <div className="credential-value">
                      <span>{showPassword ? generatedCredentials.password : '••••••••'}</span>
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="toggle-btn"
                        title={showPassword ? "Masquer" : "Afficher"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(generatedCredentials.password, 'password')}
                        className="copy-btn"
                        title="Copier le mot de passe"
                      >
                        {copiedField === 'password' ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="credentials-note">
                <strong>Important :</strong> Communiquez ces identifiants à l'employé. 
                Il devra changer son mot de passe lors de sa première connexion.
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => setGeneratedCredentials(null)}
                  className="btn btn-primary"
                >
                  Fermer et continuer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="filters-section">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="filter-select"
            >
              <option value="all">Tous les rôles</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
        
        <div className="results-count">
          {filteredEmployees.length + filteredInvitations.length} personne(s) {filters.search || filters.role !== 'all' || filters.status !== 'all' ? 'trouvée(s)' : 'au total'}
        </div>
      </div>

      {/* Tableau unifié des employés et invitations */}
      <div className="employees-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des employés...</p>
          </div>
        ) : (filteredEmployees.length === 0 && filteredInvitations.length === 0) ? (
          (employees.length === 0 && invitations.length === 0) ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>Aucun employé</h3>
              <p>Commencez par ajouter des employés à votre agence.</p>
            </div>
          ) : (
            <div className="empty-state">
              <Users size={48} />
              <h3>Aucun résultat</h3>
              <p>Aucune personne ne correspond aux critères de recherche.</p>
            </div>
          )
        ) : (
          <table className="unified-table">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Invitation</th>
              </tr>
            </thead>
            <tbody>
              {/* Afficher les employés filtrés */}
              {filteredEmployees.map(employee => (
                <tr 
                  key={`employee-${employee.id}`} 
                  className="table-row employee-row"
                  onClick={() => openEmployeeDetails(employee)}
                >
                  <td className="name-cell">
                    <div className="user-info">
                      <div className="user-avatar">
                        <Users size={20} />
                      </div>
                      <div className="user-details">
                        <span className="user-name">
                          {employee.user?.full_name || 
                           `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
                           'Nom non disponible'}
                        </span>
                        <span className="user-type">Employé</span>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">
                    {employee.user?.email || employee.generated_email || 'Email non disponible'}
                  </td>
                  <td className="phone-cell">
                    <span className="phone-number">
                      {employee.phone || 'Non renseigné'}
                    </span>
                  </td>
                  <td className="role-cell">
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleColor(employee.employee_role) }}
                    >
                      {getRoleLabel(employee.employee_role)}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span 
                      className={`status-badge ${employee.is_active ? 'active' : 'inactive'}`}
                    >
                      {employee.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR') : 'Non définie'}
                  </td>
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleToggleActive(employee.id, employee.is_active)}
                        className={`action-btn ${employee.is_active ? 'warning' : 'success'}`}
                        title={employee.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {employee.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      
                      <button 
                        onClick={() => setEditingEmployee(employee)}
                        className="action-btn primary"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="action-btn danger"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Afficher les invitations filtrées */}
              {filteredInvitations.map(invitation => (
                <tr 
                  key={`invitation-${invitation.id}`} 
                  className={`table-row invitation-row ${invitation.status}`}
                  onClick={() => openInvitationDetails(invitation)}
                >
                  <td className="name-cell">
                    <div className="user-info">
                      <div className="user-avatar invitation">
                        <Mail size={20} />
                      </div>
                      <div className="user-details">
                        <span className="user-name">
                          {`${invitation.first_name || ''} ${invitation.last_name || ''}`.trim() || 'Nom non renseigné'}
                        </span>
                        <span className="user-type">Invitation</span>
                      </div>
                    </div>
                  </td>
                  <td className="email-cell">
                    {invitation.email}
                  </td>
                  <td className="phone-cell">
                    <span className="phone-number">
                      {invitation.phone || 'Non renseigné'}
                    </span>
                  </td>
                  <td className="role-cell">
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleColor(invitation.employee_role) }}
                    >
                      {getRoleLabel(invitation.employee_role)}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span className="status-badge invitation-badge">
                      <Mail size={14} />
                      {invitation.is_active ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="date-cell">
                    {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      {invitation.status === 'pending' && (
                        <span className="status-badge inactive">
                          <Clock size={14} />
                          En attente
                        </span>
                      )}
                      {invitation.status === 'accepted' && (
                        <span className="status-badge active">
                          <UserCheck size={14} />
                          Acceptée
                        </span>
                      )}
                      {invitation.status === 'expired' && (
                        <span className="status-badge inactive">
                          <UserX size={14} />
                          Expirée
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal d'ajout d'employé */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Ajouter un nouvel employé</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="form-input"
                    placeholder="+237 6XX XXX XXX"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input
                    type="date"
                    value={newEmployee.dateOfBirth}
                    onChange={(e) => setNewEmployee({...newEmployee, dateOfBirth: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rôle *</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  className="form-select"
                  required
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newEmployee.notes}
                  onChange={(e) => setNewEmployee({...newEmployee, notes: e.target.value})}
                  className="form-textarea"
                  placeholder="Notes internes optionnelles"
                  rows="3"
                />
              </div>

              <div className="info-box">
                <Mail size={20} />
                <div>
                  <p><strong>Email automatique :</strong> {newEmployee.firstName && newEmployee.lastName 
                    ? `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@${agency?.name?.toLowerCase().replace(/\s+/g, '')}.travelhub.cm`
                    : 'Sera généré automatiquement'
                  }</p>
                  <p><strong>Mot de passe :</strong> Généré automatiquement (8 caractères)</p>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer l\'employé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de détails de l'employé ou invitation */}
      {selectedEmployee && !showAddModal && !generatedCredentials && (
        <div className="modal-overlay details-modal-overlay">
          <div className="modal employee-details-modal">
            <div className="modal-header">
              <h2>
                {selectedEmployee.isInvitation ? 'Détails de l\'invitation' : 'Détails de l\'employé'}
              </h2>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="employee-details-header">
                <div className="employee-avatar">
                  {selectedEmployee.isInvitation ? <Mail size={52} /> : <Users size={52} />}
                </div>
                <div className="employee-main-info">
                  <h3>
                    {selectedEmployee.isInvitation 
                      ? selectedEmployee.full_name || 'Nom non disponible'
                      : (selectedEmployee.user?.full_name || 
                         `${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`.trim() || 
                         'Nom non disponible')
                    }
                  </h3>
                  <p className="employee-email-detail">
                    {selectedEmployee.email || 'Email non disponible'}
                  </p>
                  <div className="status-role-badges">
                    {selectedEmployee.isInvitation ? (
                      <>
                        {selectedEmployee.status === 'pending' && (
                          <span className="status-badge pending">
                            <Clock size={14} />
                            En attente
                          </span>
                        )}
                        {selectedEmployee.status === 'accepted' && (
                          <span className="status-badge accepted">
                            <UserCheck size={14} />
                            Acceptée
                          </span>
                        )}
                        {selectedEmployee.status === 'expired' && (
                          <span className="status-badge expired">
                            <UserX size={14} />
                            Expirée
                          </span>
                        )}
                      </>
                    ) : (
                      <span 
                        className={`status-badge ${selectedEmployee.is_active ? 'active' : 'inactive'}`}
                      >
                        {selectedEmployee.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    )}
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleColor(selectedEmployee.role || selectedEmployee.employee_role) }}
                    >
                      {getRoleLabel(selectedEmployee.role || selectedEmployee.employee_role)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="employee-details-grid">
                <div className="detail-section">
                  <h4>📋 Informations générales</h4>
                  {selectedEmployee.isInvitation ? (
                    <>
                      <div className="detail-row">
                        <span className="label">Prénom</span>
                        <span>{selectedEmployee.first_name || 'Non renseigné'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Nom</span>
                        <span>{selectedEmployee.last_name || 'Non renseigné'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Email d'invitation</span>
                        <span>{selectedEmployee.email}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Statut de l'invitation</span>
                        <span>
                          {selectedEmployee.status === 'pending' && 'En attente'}
                          {selectedEmployee.status === 'accepted' && 'Acceptée'}
                          {selectedEmployee.status === 'expired' && 'Expirée'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Date d'invitation</span>
                        <span>{new Date(selectedEmployee.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {selectedEmployee.accepted_at && (
                        <div className="detail-row">
                          <span className="label">Date d'acceptation</span>
                          <span>{new Date(selectedEmployee.accepted_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                      {selectedEmployee.expires_at && (
                        <div className="detail-row">
                          <span className="label">Date d'expiration</span>
                          <span>{new Date(selectedEmployee.expires_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="detail-row">
                        <span className="label">Date d'embauche</span>
                        <span>{selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString('fr-FR') : 'Non définie'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Statut</span>
                        <span>{selectedEmployee.is_active ? 'Actif' : 'Inactif'}</span>
                      </div>
                      {selectedEmployee.created_at && (
                        <div className="detail-row">
                          <span className="label">Créé le</span>
                          <span>{new Date(selectedEmployee.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                      {selectedEmployee.updated_at && selectedEmployee.updated_at !== selectedEmployee.created_at && (
                        <div className="detail-row">
                          <span className="label">Dernière modification</span>
                          <span>{new Date(selectedEmployee.updated_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                      {selectedEmployee.salary_fcfa && (
                        <div className="detail-row">
                          <span className="label">Salaire</span>
                          <span>{selectedEmployee.salary_fcfa.toLocaleString()} FCFA</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="detail-row">
                    <span className="label">Rôle</span>
                    <span>{getRoleLabel(selectedEmployee.role || selectedEmployee.employee_role)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Téléphone</span>
                    <span>{selectedEmployee.phone || 'Non renseigné'}</span>
                  </div>
                  {selectedEmployee.date_of_birth && (
                    <div className="detail-row">
                      <span className="label">Date de naissance</span>
                      <span>{new Date(selectedEmployee.date_of_birth).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {selectedEmployee.notes && (
                  <div className="detail-section">
                    <h4>📝 Notes</h4>
                    <div className="notes-content">
                      {selectedEmployee.notes}
                    </div>
                  </div>
                )}

                {!selectedEmployee.isInvitation && selectedEmployee.permissions && selectedEmployee.permissions.length > 0 && (
                  <div className="detail-section">
                    <h4>🔐 Permissions spéciales</h4>
                    <div className="permissions-list">
                      {selectedEmployee.permissions.map((permission, index) => (
                        <span key={index} className="permission-badge">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedEmployee.notes && (!selectedEmployee.permissions || selectedEmployee.permissions.length === 0) && (
                  <div className="detail-section">
                    <div className="notes-content" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      {selectedEmployee.isInvitation 
                        ? 'Aucune note ajoutée à cette invitation.'
                        : 'Aucune note ou permission spéciale configurée pour cet employé.'
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              {!selectedEmployee.isInvitation && (
                <>
                  <button 
                    onClick={() => {
                      setSelectedEmployee(null);
                      setEditingEmployee(selectedEmployee);
                    }}
                    className="btn btn-primary"
                  >
                    <Edit size={18} />
                    Modifier
                  </button>
                  <button 
                    onClick={() => {
                      handleToggleActive(selectedEmployee.id, selectedEmployee.is_active);
                      setSelectedEmployee(null);
                    }}
                    className={`btn ${selectedEmployee.is_active ? 'btn-warning' : 'btn-success'}`}
                  >
                    {selectedEmployee.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                    {selectedEmployee.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                </>
              )}
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="btn btn-outline"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
