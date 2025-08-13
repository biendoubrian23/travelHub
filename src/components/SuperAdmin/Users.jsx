import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Option 1: Récupérer tous les utilisateurs avec le rôle 'agence' (administrateurs d'agence)
      const { data: adminUsers, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          role,
          is_active,
          created_at,
          last_login
        `)
        .eq('role', 'agence')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      }

      let usersWithAgencies = [];

      // Si on a des utilisateurs dans la table users avec le rôle 'agence'
      if (adminUsers && adminUsers.length > 0) {
        console.log('Utilisateurs trouvés dans la table users:', adminUsers);
        
        // Pour chaque admin, récupérer le nom de son agence
        usersWithAgencies = await Promise.all(
          adminUsers.map(async (user) => {
            const { data: agency } = await supabase
              .from('agencies')
              .select('name')
              .eq('user_id', user.id)
              .single();

            return {
              id: user.id,
              name: user.full_name,
              email: user.email,
              role: 'Administrateur',
              agency: agency?.name || 'Agence non trouvée',
              lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais',
              status: user.is_active !== false ? 'active' : 'inactive',
              createdAt: user.created_at,
              source: 'users_table'
            };
          })
        );
      } else {
        console.log('Aucun utilisateur trouvé dans la table users, vérification des invitations...');
        
        // Option 2: Si pas d'utilisateurs dans users, chercher dans agency_admin_invitations
        const { data: invitations, error: invitationsError } = await supabase
          .from('agency_admin_invitations')
          .select(`
            id,
            admin_email,
            admin_first_name,
            admin_last_name,
            created_at,
            status,
            agency_id,
            agencies!inner(name)
          `)
          .order('created_at', { ascending: false });

        if (invitationsError) {
          console.error('Erreur lors de la récupération des invitations:', invitationsError);
        }

        if (invitations && invitations.length > 0) {
          console.log('Invitations trouvées:', invitations);
          
          usersWithAgencies = invitations.map((invitation) => ({
            id: invitation.id,
            name: `${invitation.admin_first_name} ${invitation.admin_last_name}`,
            email: invitation.admin_email,
            role: 'Administrateur',
            agency: invitation.agencies?.name || 'Nom d\'agence non disponible',
            lastLogin: 'Jamais',
            status: invitation.status === 'accepted' ? 'active' : 'pending',
            createdAt: invitation.created_at,
            source: 'invitations_table'
          }));
        }
      }

      console.log('Utilisateurs finaux à afficher:', usersWithAgencies);
      setUsers(usersWithAgencies);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrer les utilisateurs selon les critères de recherche
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.agency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && user.role === 'Administrateur');
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleReload = () => {
    loadUsers();
  };

  return (
    <div className="sadmin-users">
      <div className="sadmin-agencies-header">
        <div className="sadmin-search-container">
          <span className="sadmin-search-icon">🔍</span>
          <input
            type="text"
            className="sadmin-search-input"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sadmin-filters-container">
          <select 
            className="sadmin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateur</option>
          </select>
          
          <select 
            className="sadmin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
          
          <button 
            className="sadmin-reload-button"
            onClick={handleReload}
            disabled={loading}
            title="Actualiser la liste"
          >
            {loading ? '🔄' : '↻'}
          </button>
        </div>
      </div>
      
      <div className="sadmin-table-container">
        {loading ? (
          <div className="sadmin-loading">
            <p>Chargement des administrateurs...</p>
          </div>
        ) : (
          <table className="sadmin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Agence</th>
                <th>Dernière connexion</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.agency}</td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <span className={`sadmin-status-badge sadmin-status-${user.status}`}>
                        {user.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="sadmin-actions-cell">
                      <button className="sadmin-action-button sadmin-view-button">👁️</button>
                      <button className="sadmin-action-button sadmin-edit-button">✏️</button>
                      <button className="sadmin-action-button sadmin-delete-button">❗</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="sadmin-no-data">
                    {users.length === 0 ? 'Aucun administrateur trouvé' : 'Aucun résultat pour cette recherche'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {!loading && filteredUsers.length > 0 && (
        <div className="sadmin-pagination">
          <button className="sadmin-pagination-button">«</button>
          <button className="sadmin-pagination-button active">1</button>
          <button className="sadmin-pagination-button">2</button>
          <button className="sadmin-pagination-button">»</button>
        </div>
      )}
    </div>
  );
};

export default Users;
