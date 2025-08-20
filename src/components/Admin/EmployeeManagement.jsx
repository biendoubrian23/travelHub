import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRolePermissions } from '../RoleBasedComponents';
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
import './EmployeeOptimizations.css';
import './TableCompactStyles.css';
import './NewEmployeeModal.css';
import './ModalScrollFix.css';
import './FixedModalStructure.css'; // Structure de modal à priorité absolue
import './FormSpacingFix.css'; // Correction d'espacement pour les formulaires
import './ToggleStyles.css'; // Styles pour les toggles de statut
import './ResponsiveTableStyles.css'; // Styles responsive pour le tableau
import './FinalModalScrollbar.css'; // Solution ultime pour la barre de défilement
import './InvitationModalFix.css'; // Correction spécifique pour les modals d'invitation
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
  const { canManageEmployees, getCreatableRoles, getAllEmployeeRoles, currentRole } = useRolePermissions();
  const [employees, setEmployees] = useState([]);
  const [invitations, setInvitations] = useState([]); // Nouveau state pour les invitations
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isTogglingEmployee, setIsTogglingEmployee] = useState(null); // État pour le toggle en cours
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    ville: '',
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

  // Définition complète des rôles pour référence
  const allRoles = [
    { value: 'manager', label: 'Manager', description: 'Gestion équipe + réservations + finances', userRole: 'agency_manager' },
    { value: 'employee', label: 'Employé', description: 'Réservations + consultation', userRole: 'agency_employee' },
    { value: 'driver', label: 'Conducteur', description: 'Accès conducteur (lecture seule)', userRole: 'agency_driver' }
  ];
  
  // Obtenir directement les rôles disponibles depuis notre nouvelle fonction
  // qui donne les mêmes possibilités aux managers qu'aux patrons
  const availableRoles = getAllEmployeeRoles();
  
  // Garder cette variable pour compatibilité
  const creatableRoleValues = getCreatableRoles();
  
  // Debug pour le modal
  console.log('🎭 Modal Debug:');
  console.log('  - creatableRoleValues:', creatableRoleValues);
  console.log('  - availableRoles:', availableRoles);
  console.log('  - availableRoles détaillé:', availableRoles.map(r => ({value: r.value, label: r.label})));
  console.log('  - roles complets:', allRoles);

  useEffect(() => {
    if (agency) {
      loadEmployees();
      loadInvitations();
    }
  }, [agency]);

  const loadEmployees = async () => {
    try {
      setError(''); // Effacer les erreurs précédentes
      console.log('🔄 Chargement des employés pour l\'agence:', agency?.id);
      console.log('🔍 User actuel:', userProfile);
      console.log('🔍 Current role:', currentRole);
      
      // Charger les employés avec jointure sur users pour récupérer le statut d'accès réel
      let { data, error } = await supabase
        .from('agency_employees')
        .select(`
          *,
          user:user_id (
            id,
            email,
            full_name,
            phone,
            ville,
            is_active,
            updated_at
          )
        `)
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });
      
      console.log('📊 Résultat requête employés avec jointure users:', { data, error });
      
      if (error) {
        console.error('❌ Erreur lors du chargement des employés:', error);
        throw error;
      }
      
      // Assurer que les données existent et mapper le statut depuis la table users
      if (!data) {
        data = [];
      } else {
        // Synchroniser le statut is_active avec celui de la table users
        data = data.map(employee => ({
          ...employee,
          // Utiliser le statut de la table users comme référence (plus fiable pour l'accès)
          is_active: employee.user?.is_active ?? employee.is_active,
          // Enrichir avec les informations utilisateur
          full_name: employee.user ? `${employee.user.first_name} ${employee.user.last_name}` : `${employee.first_name} ${employee.last_name}`,
          email: employee.user?.email || employee.email
        }));
      }

      console.log('✅ Employés chargés avec jointure users:', data?.length || 0, data);
      setEmployees(data || []);
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
      
      // 1. Charger les invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('agency_employee_invitations')
        .select('*')
        .eq('agency_id', agency.id)
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.error('❌ Erreur lors du chargement des invitations:', invitationsError);
        setInvitations([]);
        return;
      }

      console.log('📧 Invitations chargées:', invitationsData?.length || 0);

      // 2. Si il y a des invitations, récupérer les statuts des users correspondants
      if (invitationsData && invitationsData.length > 0) {
        const emails = invitationsData.map(inv => inv.email).filter(Boolean);
        
        if (emails.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('email, is_active, full_name, ville, id')
            .in('email', emails);

          if (usersError) {
            console.warn('⚠️ Erreur lors du chargement des statuts users:', usersError);
          } else {
            console.log('👥 Users trouvés:', usersData?.length || 0);
            
            // 3. Associer les données des users aux invitations
            const enrichedInvitations = invitationsData.map(invitation => {
              const userData = usersData?.find(user => user.email === invitation.email);
              return {
                ...invitation,
                user: userData || null
              };
            });
            
            setInvitations(enrichedInvitations);
            console.log('✅ Invitations enrichies:', enrichedInvitations.length);
            return;
          }
        }
      }
      
      // 4. Si pas d'emails ou erreur, utiliser les invitations sans enrichissement
      setInvitations(invitationsData || []);
      
        // Vérifier s'il y a de nouvelles invitations acceptées
        const recentlyAccepted = invitationsData?.filter(inv => 
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
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${agency.name.toLowerCase().replace(/\s+/g, '')}.com`;
      const password = Math.random().toString(36).slice(-8);
      return { email, password };
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.ville || !newEmployee.phone || !newEmployee.role) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Générer l'email automatiquement
      const email = `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@${agency.name.toLowerCase().replace(/\s+/g, '')}.com`;
      
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
          ville: newEmployee.ville,
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
        ville: '',
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
      setIsTogglingEmployee(employeeId); // Démarrer l'état de chargement
      console.log(`🔄 Toggle statut employé ID: ${employeeId}, statut actuel: ${currentStatus}`);
      
      // Récupérer d'abord les informations de l'employé avec jointure
      const { data: employeeData, error: fetchError } = await supabase
        .from('agency_employees')
        .select(`
          *,
          user:user_id (
            id,
            email,
            full_name,
            is_active
          )
        `)
        .eq('id', employeeId)
        .single();

      if (fetchError) {
        console.error('Erreur récupération employé:', fetchError);
        throw fetchError;
      }

      if (!employeeData?.user?.id) {
        throw new Error('Impossible de trouver l\'utilisateur associé à cet employé');
      }

      const newStatus = !currentStatus;
      const userId = employeeData.user.id;
      
      console.log(`📝 Mise à jour: User ID ${userId}, nouveau statut: ${newStatus}`);

      // 1. Mettre à jour le statut dans la table users (contrôle d'accès principal)
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('Erreur mise à jour users:', userUpdateError);
        throw userUpdateError;
      }

      // 2. Mettre à jour le statut dans agency_employees pour cohérence
      const { error: employeeUpdateError } = await supabase
        .from('agency_employees')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (employeeUpdateError) {
        console.error('Erreur mise à jour agency_employees:', employeeUpdateError);
        throw employeeUpdateError;
      }

      // 3. Si il y a une invitation liée, mettre à jour aussi dans agency_employee_invitations
      const { data: invitationData } = await supabase
        .from('agency_employee_invitations')
        .select('id')
        .eq('email', employeeData.user.email)
        .eq('agency_id', agency.id)
        .single();

      if (invitationData) {
        console.log('📨 Mise à jour invitation associée');
        const { error: invitationUpdateError } = await supabase
          .from('agency_employee_invitations')
          .update({ 
            is_active: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', invitationData.id);

        if (invitationUpdateError) {
          console.warn('⚠️ Erreur mise à jour invitation (non bloquant):', invitationUpdateError);
        }
      }

      // 4. Log d'audit dans la table audit_logs existante
      try {
        await supabase.from('audit_logs').insert({
          user_id: userProfile.id,
          agency_id: agency.id,
          table_name: 'users',
          record_id: userId,
          action: 'UPDATE',
          old_values: { is_active: currentStatus },
          new_values: { is_active: newStatus },
          user_agent: navigator.userAgent.substring(0, 500),
          access_action_type: newStatus ? 'ACTIVATION' : 'DÉSACTIVATION',
          target_user_id: userId,
          target_employee_id: employeeId,
          access_change_reason: `${newStatus ? 'Activation' : 'Désactivation'} via toggle par le patron d'agence`
        });
        console.log('✅ Audit enregistré');
      } catch (auditError) {
        console.warn('⚠️ Erreur audit (non bloquant):', auditError);
      }

      // 5. Feedback utilisateur
      const actionText = newStatus ? 'activé' : 'désactivé';
      const employeeName = employeeData.user.full_name || `${employeeData.first_name} ${employeeData.last_name}` || 'Employé';
      setSuccess(`✅ ${employeeName} a été ${actionText} avec succès`);
      
      console.log(`🎉 Statut mis à jour avec succès pour ${employeeName}`);
      
      // 6. Recharger les données pour synchroniser l'interface
      await loadEmployees();
      
    } catch (error) {
      console.error('❌ Erreur toggle statut:', error);
      setError(`Erreur lors de la modification du statut: ${error.message}`);
    } finally {
      setIsTogglingEmployee(null); // Arrêter l'état de chargement
    }
  };

  const handleToggleInvitationActive = async (invitationId, currentStatus) => {
    try {
      setIsTogglingEmployee(invitationId); // Utiliser le même état de chargement
      console.log(`🔄 Toggle statut invitation ID: ${invitationId}, statut actuel: ${currentStatus}`);
      
      const newStatus = !currentStatus;
      
      // Récupérer l'invitation pour avoir l'email
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation || !invitation.email) {
        throw new Error('Invitation ou email non trouvé');
      }

      // Mettre à jour le statut dans la table users (via l'email)
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('email', invitation.email);

      if (updateError) {
        console.error('Erreur mise à jour user:', updateError);
        throw updateError;
      }

      // Mettre à jour aussi l'employé correspondant si il existe
      const { data: employeeData } = await supabase
        .from('agency_employees')
        .select('id, user_id')
        .eq('agency_id', agency.id)
        .eq('user_id', invitation.user?.id)
        .single();

      if (employeeData) {
        await supabase
          .from('agency_employees')
          .update({ is_active: newStatus })
          .eq('id', employeeData.id);
      }

      // Log d'audit
      try {
        await supabase.from('audit_logs').insert({
          user_id: userProfile.id,
          agency_id: agency.id,
          table_name: 'users',
          record_id: invitation.user?.id,
          action: 'UPDATE',
          old_values: { is_active: currentStatus },
          new_values: { is_active: newStatus },
          user_agent: navigator.userAgent.substring(0, 500),
          access_action_type: newStatus ? 'ACTIVATION' : 'DÉSACTIVATION',
          access_change_reason: `${newStatus ? 'Activation' : 'Désactivation'} via invitation par le patron d'agence`
        });
      } catch (auditError) {
        console.warn('⚠️ Erreur audit (non bloquant):', auditError);
      }

      // Feedback utilisateur
      const actionText = newStatus ? 'activée' : 'désactivée';
      const invitationName = `${invitation?.first_name} ${invitation?.last_name}`;
      setSuccess(`✅ ${invitationName} a été ${actionText} avec succès`);
      
      // Recharger les données
      await Promise.all([loadEmployees(), loadInvitations()]);
      
    } catch (error) {
      console.error('❌ Erreur toggle statut invitation:', error);
      setError(`Erreur lors de la modification du statut: ${error.message}`);
    } finally {
      setIsTogglingEmployee(null);
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
    const roleObj = allRoles.find(r => r.value === role);
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
    // Récupérer toutes les informations utilisateur nécessaires, y compris le statut is_active
    if (employee.user_id) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, email, is_active, phone, ville')
          .eq('id', employee.user_id)
          .single();
          
        if (data && !error) {
          const nameParts = (data.full_name || '').split(' ');
          // Enrichir l'employé avec toutes les données utilisateur
          employee.first_name = employee.first_name || nameParts[0] || '';
          employee.last_name = employee.last_name || nameParts.slice(1).join(' ') || '';
          employee.user = {
            full_name: data.full_name,
            email: data.email,
            is_active: data.is_active,
            phone: data.phone,
            ville: data.ville
          };
          // S'assurer que le statut is_active est correctement défini
          employee.is_active = data.is_active;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails utilisateur:', error);
      }
    }
    
    // S'assurer que hire_date est bien présent dans l'objet passé au modal
    // Correction : on force le mapping de hire_date à partir de toutes les sources possibles
    let hireDateValue = employee.hire_date || employee.hireDate || employee['hire_date'] || employee['hireDate'] || null;
    setSelectedEmployee({
      ...employee,
      hire_date: hireDateValue
    });
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

  // Vérifier les permissions d'accès - UNIQUEMENT LE PATRON
  const hasEmployeeManagementAccess = canManageEmployees();
  
  // Debug temporaire
  console.log('🔍 EmployeeManagement - Debug accès:');
  console.log('  - canManageEmployees():', canManageEmployees());
  console.log('  - currentRole:', currentRole);
  console.log('  - getCreatableRoles():', getCreatableRoles());
  console.log('  - hasEmployeeManagementAccess:', hasEmployeeManagementAccess);

  // Accès uniquement au patron d'agence
  if (!hasEmployeeManagementAccess) {
    return (
      <div className="no-access">
        <UserX size={48} />
        <h3>Accès strictement réservé</h3>
        <p>Seul le propriétaire de l'agence (patron) peut gérer les employés.</p>
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
              <p>{employees.length + invitations.length} employé(s) dans votre agence</p>
            </div>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => {
              console.log('🎯 Ouverture modal, availableRoles:', availableRoles);
              if (availableRoles && availableRoles.length > 0) {
                setShowAddModal(true);
                // Initialiser le rôle avec le premier rôle disponible si existant
                if (availableRoles.length > 0) {
                  setNewEmployee(prev => ({...prev, role: availableRoles[0].value}));
                }
              } else {
                console.error('❌ Aucun rôle disponible pour créer un employé');
                setError('Erreur: Aucun rôle disponible pour créer un employé');
              }
            }}
            disabled={!availableRoles || availableRoles.length === 0}
            title={(!availableRoles || availableRoles.length === 0) ? 'Chargement des rôles...' : 'Ajouter un employé'}
          >
            <Plus size={20} />
            {(!availableRoles || availableRoles.length === 0) ? 'Chargement...' : 'Ajouter un employé'}
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
        <div className="new-employee-overlay" onClick={e => {if (e.target === e.currentTarget) setGeneratedCredentials(null);}}>
          <div className="new-employee-modal" style={{maxWidth:'480px',padding:'0',display:'flex',flexDirection:'column',height:'90vh'}}>
            <div style={{padding:'32px 32px 0',textAlign:'center'}}>
              <div style={{marginBottom:'18px'}}>
                <div style={{width:'62px',height:'62px',borderRadius:'50%',background:'linear-gradient(135deg,#f3f3fa,#e8e8f8)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>
                  <Mail size={38} color="#b3b3b3" />
                </div>
              </div>
              <h2 style={{fontWeight:700,fontSize:'22px',margin:'0 0 8px'}}>Invitation créée</h2>
              <div style={{fontSize:'18px',fontWeight:600,color:'#FF3B30',marginBottom:'8px'}}>Invitation créée</div>
              <div style={{fontSize:'17px',fontWeight:500,color:'#222',marginBottom:'2px',textTransform:'uppercase'}}>{generatedCredentials.firstName} {generatedCredentials.lastName}</div>
              <div style={{display:'inline-block',background:'#F2F2F7',color:'#007AFF',fontWeight:600,borderRadius:'12px',padding:'4px 16px',fontSize:'15px',marginBottom:'6px'}}>{getRoleLabel(generatedCredentials.role)}</div>
              <div style={{fontStyle:'italic',color:'#222',fontSize:'15px',marginBottom:'10px'}}>{generatedCredentials.agencyName}</div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'0 32px 0'}}>
              <div style={{background:'#f7fbff',border:'2px solid #cce6ff',borderRadius:'16px',padding:'20px 18px',margin:'18px 0 0 0'}}>
                <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Email d'invitation</div>
                <div style={{display:'flex',alignItems:'center',background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',wordBreak:'break-all',overflowWrap:'break-word',marginBottom:'12px',border:'1px solid #e5e5ea'}}>
                  <span style={{flex:1}}>{generatedCredentials.email}</span>
                  <span style={{marginLeft:'8px',cursor:'pointer'}} onClick={()=>copyToClipboard(generatedCredentials.email,'email')} title="Copier l'email">
                    {copiedField==='email'?<Check size={18} color="#34C759"/>:<Copy size={18} color="#007AFF"/>}
                  </span>
                </div>
                <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Lien d'invitation</div>
                <div style={{display:'flex',alignItems:'center',background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',wordBreak:'break-all',overflowWrap:'break-word',border:'1px solid #e5e5ea'}}>
                  <span style={{flex:1}}>{generatedCredentials.invitationLink}</span>
                  <span style={{marginLeft:'8px',cursor:'pointer'}} onClick={()=>copyToClipboard(generatedCredentials.invitationLink,'link')} title="Copier le lien">
                    {copiedField==='link'?<Check size={18} color="#34C759"/>:<Copy size={18} color="#007AFF"/>}
                  </span>
                </div>
              </div>
              <button type="button" style={{margin:'22px auto 0',display:'block',background:'white',color:'#007AFF',border:'2px solid #007AFF',borderRadius:'12px',padding:'12px 32px',fontWeight:600,fontSize:'16px',cursor:'pointer',transition:'0.2s'}}
                onClick={()=>{
                  const subject = encodeURIComponent('Invitation à rejoindre Agence Transport Plus');
                  const body = encodeURIComponent(`Bonjour ${generatedCredentials.firstName},\n\nVous avez été invité à rejoindre l'agence ${generatedCredentials.agencyName} sur TravelHub.\n\nVotre email d'accès : ${generatedCredentials.email}\n\nPour activer votre compte, cliquez sur le lien suivant :\n${generatedCredentials.invitationLink}\n\nCe lien est valable 7 jours.\n\nBienvenue dans l'équipe !\n\nCordialement,\n${userProfile?.full_name || 'L’équipe TravelHub'}`);
                  window.open(`mailto:${generatedCredentials.email}?subject=${subject}&body=${body}`);
                }}
              >
                <Send size={18} style={{marginRight:'8px',verticalAlign:'middle'}}/> Envoyer par email
              </button>
              <div style={{background:'#fffbe6',border:'1px solid #ffe58f',borderRadius:'12px',padding:'12px 18px',margin:'22px 0 0 0',color:'#b26a00',fontSize:'15px',fontWeight:500}}>
                <span style={{fontWeight:700,color:'#d48806'}}>Important :</span> Partagez ce lien d'invitation avec l'employé. Il aura 7 jours pour créer son compte.
              </div>
            </div>
            <div className="new-employee-actions" style={{padding:'24px 32px 32px',borderTop:'none',display:'flex',gap:'16px'}}>
              <button type="button" className="action-button cancel-button" onClick={()=>setGeneratedCredentials(null)}>Fermer</button>
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
              {availableRoles.map(role => (
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
          <div className="employee-table-container">
            <table className="employee-table">
              <thead>
                <tr>
                  <th className="name-cell">Nom complet</th>
                  <th className="email-cell">Email</th>
                  <th className="phone-cell">Téléphone</th>
                  <th className="role-cell">Rôle</th>
                  <th className="status-cell">Statut</th>
                  <th className="date-cell">Date</th>
                  <th className="ville-cell">Ville</th>
                  <th className="actions-cell">Invitation</th>
                </tr>
              </thead>
            <tbody>
              {/* Afficher les employés filtrés */}
              {filteredEmployees.map(employee => {
                console.log('🔍 Rendu employé:', employee.id, 'is_active:', employee.is_active, employee);
                return (
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
                    <span className={`status-badge ${employee.is_active ? 'active' : 'inactive'}`}>
                      {employee.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="date-cell">
                    {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('fr-FR') : 'Non définie'}
                  </td>
                  <td className="ville-cell">
                    {employee.user?.ville || employee.ville || 'Non renseignée'}
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
                );
              })}
              
              {/* Afficher les invitations filtrées */}
              {filteredInvitations.map(invitation => {
                console.log('🔍 Rendu invitation:', invitation.id, 'is_active:', invitation.is_active, invitation);
                return (
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
                    {/* Toggle interactif pour activer/désactiver l'invitation */}
                    <button
                      className={`emp-status-toggle ${isTogglingEmployee === invitation.id ? 'emp-loading' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`🔄 Toggle statut invitation: ${invitation.first_name} ${invitation.last_name}`);
                        handleToggleInvitationActive(invitation.id, invitation.user?.is_active);
                      }}
                      disabled={isTogglingEmployee === invitation.id}
                      title={(invitation.user?.is_active) ? 
                        `Cliquer pour désactiver ${invitation.first_name} ${invitation.last_name}` : 
                        `Cliquer pour activer ${invitation.first_name} ${invitation.last_name}`
                      }
                    >
                      <div className={`emp-status-toggle-track ${(invitation.user?.is_active) ? 'emp-active' : 'emp-inactive'}`}>
                        <div className={`emp-status-toggle-thumb ${(invitation.user?.is_active) ? 'emp-active' : ''}`}></div>
                        <span className="emp-status-toggle-label emp-left">ON</span>
                        <span className="emp-status-toggle-label emp-right">OFF</span>
                      </div>
                    </button>
                  </td>
                  <td className="date-cell">
                    {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="ville-cell">
                    {invitation.user?.ville || invitation.ville || 'Non renseignée'}
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
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'ajout d'employé */}
      {showAddModal && availableRoles && availableRoles.length > 0 && (
        <div className="new-employee-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddModal(false);
        }}>
          <div className="new-employee-modal">
            {/* En-tête du modal */}
            <div className="new-employee-header">
              <h2 className="new-employee-title">Ajouter un employé</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="new-employee-close"
                type="button"
              >
                ×
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="new-employee-content">
              <form className="new-employee-form" onSubmit={handleAddEmployee}>
                
                {/* Grille des champs principaux */}
                <div className="form-grid">
                  <div className="form-field">
                    <label className="field-label field-required">Prénom</label>
                    <input
                      type="text"
                      value={newEmployee.firstName}
                      onChange={(e) => setNewEmployee({...newEmployee, firstName: e.target.value})}
                      className="field-input"
                      placeholder="Entrez le prénom"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label field-required">Nom de famille</label>
                    <input
                      type="text"
                      value={newEmployee.lastName}
                      onChange={(e) => setNewEmployee({...newEmployee, lastName: e.target.value})}
                      className="field-input"
                      placeholder="Entrez le nom de famille"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label field-required">Ville</label>
                    <input
                      type="text"
                      value={newEmployee.ville}
                      onChange={(e) => setNewEmployee({...newEmployee, ville: e.target.value})}
                      className="field-input"
                      placeholder="Entrez la ville"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label field-required">Téléphone</label>
                    <input
                      type="tel"
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      className="field-input"
                      placeholder="+237 6XX XXX XXX"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label">Date de naissance</label>
                    <input
                      type="date"
                      value={newEmployee.dateOfBirth}
                      onChange={(e) => setNewEmployee({...newEmployee, dateOfBirth: e.target.value})}
                      className="field-input"
                    />
                  </div>
                </div>

                {/* Rôle - pleine largeur */}
                <div className="form-field full-width">
                  <label className="field-label field-required">Rôle dans l'agence</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="field-select"
                    required
                  >
                    <option value="">Sélectionner un rôle...</option>
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes - pleine largeur */}
                <div className="form-field full-width">
                  <label className="field-label">Notes internes</label>
                  <textarea
                    value={newEmployee.notes}
                    onChange={(e) => setNewEmployee({...newEmployee, notes: e.target.value})}
                    className="field-textarea"
                    placeholder="Ajoutez des notes optionnelles..."
                  />
                </div>

                {/* Boîte d'information */}
                {(newEmployee.firstName || newEmployee.lastName) && (
                  <div className="employee-preview-box">
                    <div className="preview-icon">
                      <Mail size={20} />
                    </div>
                    <div className="preview-content">
                      <div className="preview-label" style={{fontWeight:600, color:'#007AFF', marginBottom:'6px'}}>Email :</div>
                      <div className="preview-details">
                        <div className="preview-item" style={{wordBreak:'break-all', overflowWrap:'break-word', fontSize:'15px'}}>
                          {newEmployee.firstName && newEmployee.lastName 
                            ? `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@${agency?.name?.toLowerCase().replace(/\s+/g, '')}.com`
                            : 'Sera généré automatiquement'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Actions */}
            <div className="new-employee-actions">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="action-button cancel-button"
              >
                Annuler
              </button>
              <button 
                onClick={handleAddEmployee}
                className="action-button create-button"
                disabled={loading || !newEmployee.firstName || !newEmployee.lastName || !newEmployee.phone || !newEmployee.role}
              >
                {loading ? (
                  <span className="button-loading">
                    <span className="loading-spinner"></span>
                    Création...
                  </span>
                ) : (
                  'Créer l\'employé'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de l'employé ou invitation */}
      {selectedEmployee && !showAddModal && !generatedCredentials && (
        <div className="new-employee-overlay" onClick={e => {if (e.target === e.currentTarget) setSelectedEmployee(null);}}>
          <div className="new-employee-modal" style={{maxWidth:'520px',padding:'0',display:'flex',flexDirection:'column',height:'90vh'}}>
            <div style={{padding:'32px 32px 0',textAlign:'center',position:'relative'}}>
              <button onClick={()=>setSelectedEmployee(null)} className="new-employee-close" style={{position:'absolute',top:'18px',right:'18px',zIndex:2}}>×</button>
              <div style={{marginBottom:'18px'}}>
                <div style={{width:'62px',height:'62px',borderRadius:'50%',background:'linear-gradient(135deg,#f3f3fa,#e8e8f8)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>
                  {selectedEmployee.user?.full_name || selectedEmployee.full_name ? <Users size={38} color="#b3b3b3" /> : <Mail size={38} color="#b3b3b3" />}
                </div>
              </div>
              <h2 style={{fontWeight:700,fontSize:'22px',margin:'0 0 8px'}}>Détails de l'employé</h2>
              <div style={{fontSize:'18px',fontWeight:600,color:'#007AFF',marginBottom:'8px'}}>{selectedEmployee.user?.full_name || selectedEmployee.full_name || `${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`.trim() || 'Nom non disponible'}</div>
              <div style={{display:'inline-block',background:'#F2F2F7',color:'#007AFF',fontWeight:600,borderRadius:'12px',padding:'4px 16px',fontSize:'15px',marginBottom:'6px'}}>{getRoleLabel(selectedEmployee.role || selectedEmployee.employee_role)}</div>
              <div style={{fontStyle:'italic',color:'#222',fontSize:'15px',marginBottom:'10px'}}>{agency?.name}</div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'0 32px 0'}}>
              <div style={{background:'#f7fbff',border:'2px solid #e5e5ea',borderRadius:'16px',padding:'20px 18px',margin:'18px 0 0 0'}}>
                <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Email</div>
                <div style={{background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',wordBreak:'break-all',overflowWrap:'break-word',marginBottom:'12px',border:'1px solid #e5e5ea'}}>{selectedEmployee.user?.email || selectedEmployee.email || selectedEmployee.generated_email || 'Email non disponible'}</div>
                <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Téléphone</div>
                <div style={{background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',marginBottom:'12px',border:'1px solid #e5e5ea'}}>{selectedEmployee.phone || 'Non renseigné'}</div>
                <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Date de naissance</div>
                <div style={{background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',marginBottom:'12px',border:'1px solid #e5e5ea'}}>{selectedEmployee.date_of_birth ? new Date(selectedEmployee.date_of_birth).toLocaleDateString('fr-FR') : 'Non renseignée'}</div>
                <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Date d'embauche</div>
                <div style={{background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',marginBottom:'12px',border:'1px solid #e5e5ea'}}>{selectedEmployee.hire_date || selectedEmployee.hireDate ? new Date(selectedEmployee.hire_date || selectedEmployee.hireDate).toLocaleDateString('fr-FR') : 'Non définie'}</div>
                <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Statut</div>
                <div style={{background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',marginBottom:'12px',border:'1px solid #e5e5ea'}}>
                  {/* Utiliser le statut depuis la table users en priorité, puis celui de l'employé */}
                  {(selectedEmployee.user?.is_active ?? selectedEmployee.is_active) ? 'Actif' : 'Inactif'}
                </div>
                {selectedEmployee.salary_fcfa && (
                  <>
                    <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Salaire</div>
                    <div style={{background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',marginBottom:'12px',border:'1px solid #e5e5ea'}}>{selectedEmployee.salary_fcfa.toLocaleString()} FCFA</div>
                  </>
                )}
                {selectedEmployee.notes && (
                  <>
                    <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Notes</div>
                    <div style={{background:'#fff',borderRadius:'8px',padding:'8px 12px',fontSize:'15px',marginBottom:'12px',border:'1px solid #e5e5ea'}}>{selectedEmployee.notes}</div>
                  </>
                )}
                {selectedEmployee.permissions && selectedEmployee.permissions.length > 0 && (
                  <>
                    <div style={{fontWeight:600,color:'#8E8E93',fontSize:'15px',marginBottom:'4px',textAlign:'left'}}>Permissions spéciales</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'12px'}}>
                      {selectedEmployee.permissions.map((permission, idx) => (
                        <span key={idx} style={{background:'#e5e5ea',color:'#007AFF',borderRadius:'8px',padding:'4px 10px',fontSize:'14px',fontWeight:600}}>{permission}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="new-employee-actions" style={{padding:'24px 32px 32px',borderTop:'none',display:'flex',gap:'16px'}}>
              <button type="button" className="action-button cancel-button" onClick={()=>setSelectedEmployee(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
