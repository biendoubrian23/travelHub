import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import './EmployeeManagement.css';
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
  Check
} from 'lucide-react';

const EmployeeManagement = () => {
  const { userProfile, agency, isAgencyOwner } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire nouvel employé
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
    search: ''
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
    }
  }, [agency]);

  const loadEmployees = async () => {
    try {
      setError(''); // Effacer les erreurs précédentes
      console.log('🔄 Chargement des employés pour l\'agence:', agency.id);
      
      // Première tentative avec jointure inner
      let { data, error } = await supabase
        .from('agency_employees')
        .select(`
          *,
          users!inner(id, full_name, email)
        `)
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });

      // Si échec avec jointure inner, essayer avec jointure left
      if (error || !data || data.length === 0) {
        console.log('🔄 Tentative avec jointure left...');
        const result = await supabase
          .from('agency_employees')
          .select(`
            *,
            users(id, full_name, email)
          `)
          .eq('agency_id', agency.id)
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
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
      // 1. Générer les identifiants SIMPLES
      const email = `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@${agency.name.toLowerCase().replace(/\s+/g, '')}.travelhub.cm`;
      const password = Math.random().toString(36).slice(-8) + 'A1!';
      
      console.log('📧 Email généré:', email);
      console.log('🔑 Mot de passe généré:', password);

      // 2. Créer d'abord un utilisateur avec l'agence associée
      console.log('🔄 Création de l\'utilisateur...');
      
      // Trouver le rôle correspondant pour définir le bon userRole
      const selectedRole = roles.find(r => r.value === newEmployee.role);
      const userRole = selectedRole ? selectedRole.userRole : 'agency_employee';
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: email,
          full_name: `${newEmployee.firstName} ${newEmployee.lastName}`,
          phone: newEmployee.phone,
          date_of_birth: newEmployee.dateOfBirth || null,
          role: userRole, // ✅ RÔLE SPÉCIFIQUE SELON LE POSTE
          is_active: true // ✅ STATUT ACTIF DÈS LA CRÉATION
        })
        .select()
        .single();

      if (userError) {
        console.error('❌ Erreur création utilisateur:', userError);
        throw new Error(`Erreur de création de l'utilisateur: ${userError.message}`);
      }

      // 3. Créer l'enregistrement employé avec référence utilisateur ET agence
      console.log('🔄 Création de l\'employé d\'agence...');
      const { error: employeeError } = await supabase
        .from('agency_employees')
        .insert({
          agency_id: agency.id, // ✅ LIEN AVEC L'AGENCE
          user_id: userData.id, // ✅ LIEN AVEC L'UTILISATEUR
          employee_role: newEmployee.role, // ✅ RÔLE DANS L'AGENCE
          notes: newEmployee.notes, // ✅ NOTES OPTIONNELLES
          created_by: userProfile.id, // ✅ QUI A CRÉÉ L'EMPLOYÉ
          generated_by: userProfile.id, // ✅ PATRON QUI A GÉNÉRÉ LE COMPTE
          generated_email: email, // ✅ EMAIL GÉNÉRÉ
          temp_password: password, // ✅ MOT DE PASSE TEMPORAIRE
          phone: newEmployee.phone, // ✅ TÉLÉPHONE (existe dans agency_employees)
          date_of_birth: newEmployee.dateOfBirth || null, // ✅ DATE DE NAISSANCE (existe dans agency_employees)
          is_active: true, // ✅ STATUT ACTIF EXPLICITE
          hire_date: new Date().toISOString().split('T')[0] // ✅ DATE D'EMBAUCHE (aujourd'hui)
        });

      if (employeeError) {
        console.error('❌ Erreur création employé:', employeeError);
        throw new Error(`Erreur de création de l'employé: ${employeeError.message}`);
      }

      console.log('✅ Employé créé avec succès');

      // 4. Afficher les identifiants dans la popup
      setGeneratedCredentials({
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        email: email,
        password: password,
        role: newEmployee.role,
        phone: newEmployee.phone
      });

      // 5. Réinitialiser le formulaire et recharger
      setNewEmployee({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        role: 'employee',
        notes: ''
      });

      setSuccess('Employé créé avec succès !');
      await loadEmployees();

    } catch (error) {
      console.error('💥 Erreur complète:', error);
      setError(error.message || 'Erreur lors de la création de l\'employé');
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

  // Fonction de filtrage
  const filteredEmployees = employees.filter(employee => {
    const matchesRole = filters.role === 'all' || employee.employee_role === filters.role;
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && employee.is_active) ||
      (filters.status === 'inactive' && !employee.is_active);
    
    const name = `${employee.users?.full_name || employee.user?.full_name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim()}`.toLowerCase();
    const email = (employee.users?.email || employee.user?.email || employee.generated_email || '').toLowerCase();
    const matchesSearch = filters.search === '' || 
      name.includes(filters.search.toLowerCase()) ||
      email.includes(filters.search.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  // Fonction pour ouvrir le modal de détails
  const openEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
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

      {/* Popup des identifiants générés - Version améliorée */}
      {generatedCredentials && (
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

      {/* Filtres et recherche */}
      <div className="filters-section">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
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
          {filteredEmployees.length} employé(s) {filters.search || filters.role !== 'all' || filters.status !== 'all' ? 'trouvé(s)' : 'au total'}
        </div>
      </div>

      {/* Tableau des employés */}
      <div className="employees-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des employés...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>{employees.length === 0 ? 'Aucun employé' : 'Aucun résultat'}</h3>
            <p>
              {employees.length === 0 
                ? 'Commencez par ajouter des employés à votre agence.'
                : 'Aucun employé ne correspond aux critères de recherche.'
              }
            </p>
          </div>
        ) : (
          <table className="employees-table">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Date d'embauche</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr 
                  key={employee.id} 
                  className="employee-row"
                  onClick={() => openEmployeeDetails(employee)}
                >
                  <td className="employee-name">
                    <div className="name-cell">
                      <strong>
                        {employee.users?.full_name || employee.user?.full_name || 
                         `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 
                         'Nom non disponible'}
                      </strong>
                    </div>
                  </td>
                  <td className="employee-email">
                    {employee.users?.email || employee.user?.email || employee.generated_email || 'Email non disponible'}
                  </td>
                  <td className="employee-role">
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleColor(employee.employee_role) }}
                    >
                      {getRoleLabel(employee.employee_role)}
                    </span>
                  </td>
                  <td className="employee-status">
                    <span 
                      className={`status-badge ${employee.is_active ? 'active' : 'inactive'}`}
                    >
                      {employee.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="employee-hire-date">
                    {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="employee-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleToggleActive(employee.id, employee.is_active)}
                        className={`btn btn-sm ${employee.is_active ? 'btn-warning' : 'btn-success'}`}
                        title={employee.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {employee.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      
                      <button 
                        onClick={() => setEditingEmployee(employee)}
                        className="btn btn-sm btn-outline"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="btn btn-sm btn-danger"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
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

      {/* Modal de détails de l'employé */}
      {selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal employee-details-modal">
            <div className="modal-header">
              <h2>Détails de l'employé</h2>
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
                  <Users size={52} />
                </div>
                <div className="employee-main-info">
                  <h3>
                    {selectedEmployee.users?.full_name || selectedEmployee.user?.full_name || 
                     `${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`.trim() || 
                     'Nom non disponible'}
                  </h3>
                  <p className="employee-email-detail">
                    {selectedEmployee.users?.email || selectedEmployee.user?.email || selectedEmployee.generated_email || 'Email non disponible'}
                  </p>
                  <div className="status-role-badges">
                    <span 
                      className={`status-badge ${selectedEmployee.is_active ? 'active' : 'inactive'}`}
                    >
                      {selectedEmployee.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span 
                      className="role-badge" 
                      style={{ backgroundColor: getRoleColor(selectedEmployee.employee_role) }}
                    >
                      {getRoleLabel(selectedEmployee.employee_role)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="employee-details-grid">
                <div className="detail-section">
                  <h4>📋 Informations générales</h4>
                  <div className="detail-row">
                    <span className="label">Date d'embauche</span>
                    <span>{new Date(selectedEmployee.hire_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Rôle</span>
                    <span>{getRoleLabel(selectedEmployee.employee_role)}</span>
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
                </div>

                {selectedEmployee.notes && (
                  <div className="detail-section">
                    <h4>📝 Notes</h4>
                    <div className="notes-content">
                      {selectedEmployee.notes}
                    </div>
                  </div>
                )}

                {selectedEmployee.permissions && selectedEmployee.permissions.length > 0 && (
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
                      Aucune note ou permission spéciale configurée pour cet employé.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
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
