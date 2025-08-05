import React, { useState } from 'react';
import { 
  useRolePermissions, 
  EmployeeManagementComponent, 
  RoleBasedQuickActions,
  RoleBasedHeader 
} from './RoleBasedComponents';
import './EmployeeManagement.css';

// Composant de démonstration des nouvelles fonctionnalités
const EmployeeManagementDemo = () => {
  const [selectedRole, setSelectedRole] = useState('patron');
  const { currentRole, getCreatableRoles, canManageEmployees, isPatron } = useRolePermissions();

  // Simulation du changement de rôle pour la démo
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    // En réalité, cela viendrait du contexte d'authentification
  };

  return (
    <div className="employee-management-demo">
      <div style={{ padding: '20px', background: '#f5f5f7', minHeight: '100vh' }}>
        
        {/* Sélecteur de rôle pour la démo */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h3>🧪 Démo - Changement de Rôle</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['patron', 'manager', 'employee', 'driver'].map(role => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                style={{
                  padding: '8px 16px',
                  border: selectedRole === role ? '2px solid #007AFF' : '1px solid #e5e5e7',
                  borderRadius: '8px',
                  background: selectedRole === role ? '#007AFF' : 'white',
                  color: selectedRole === role ? 'white' : '#1d1d1f',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {role === 'patron' && '👑'} 
                {role === 'manager' && '👨‍💼'} 
                {role === 'employee' && '👨‍💻'} 
                {role === 'driver' && '🚗'} 
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Header du rôle actuel */}
        <RoleBasedHeader currentModule="Gestion des Employés" />

        {/* Informations sur les permissions actuelles */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h3>📋 Permissions Actuelles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ padding: '16px', background: '#f5f5f7', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>👥 Gestion des Employés</h4>
              <p style={{ margin: 0, fontSize: '14px', color: canManageEmployees() ? '#34C759' : '#ff3b30' }}>
                {canManageEmployees() ? '✅ Autorisé' : '❌ Non autorisé'}
              </p>
            </div>

            <div style={{ padding: '16px', background: '#f5f5f7', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>🎯 Rôles Créables</h4>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {getCreatableRoles().length > 0 
                  ? getCreatableRoles().map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')
                  : 'Aucun'
                }
              </p>
            </div>

            <div style={{ padding: '16px', background: '#f5f5f7', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>👑 Statut</h4>
              <p style={{ margin: 0, fontSize: '14px', color: isPatron() ? '#6A4C93' : '#007AFF' }}>
                {isPatron() ? '👑 Propriétaire' : currentRole === 'manager' ? '👨‍💼 Manager' : '👤 Employé'}
              </p>
            </div>

          </div>
        </div>

        {/* Actions rapides basées sur le rôle */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <RoleBasedQuickActions />
        </div>

        {/* Composant de gestion des employés */}
        <EmployeeManagementComponent />

        {/* Résumé des nouvelles fonctionnalités */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          marginTop: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <h3>🆕 Nouvelles Fonctionnalités Ajoutées</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            
            <div style={{ padding: '12px', background: '#e3f2fd', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#1976d2' }}>
                👨‍💼 Manager peut créer des employés
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#424242' }}>
                Les managers peuvent maintenant créer des employés et des conducteurs (pas des managers)
              </p>
            </div>

            <div style={{ padding: '12px', background: '#f3e5f5', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#7b1fa2' }}>
                👑 Patron garde le contrôle total
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#424242' }}>
                Le patron reste le seul à pouvoir créer des managers et a tous les droits
              </p>
            </div>

            <div style={{ padding: '12px', background: '#e8f5e8', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#388e3c' }}>
                🎨 Interface adaptée par rôle
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#424242' }}>
                L'interface s'adapte automatiquement selon les permissions de chaque rôle
              </p>
            </div>

            <div style={{ padding: '12px', background: '#fff3e0', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#f57c00' }}>
                🔒 Sécurité renforcée
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#424242' }}>
                Vérifications côté frontend ET backend pour les permissions de création de rôles
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeManagementDemo;
