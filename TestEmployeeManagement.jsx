import React from 'react';
import EmployeeManagementDemo from './components/EmployeeManagementDemo';
import './App.css';

// Test de la nouvelle fonctionnalité de gestion des employés
function TestEmployeeManagement() {
  return (
    <div className="App">
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px 0'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          padding: '0 20px'
        }}>
          
          <header style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            color: 'white'
          }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700',
              margin: '0 0 8px 0'
            }}>
              🚌 TravelHub - Gestion des Employés
            </h1>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9,
              margin: 0
            }}>
              Nouvelle fonctionnalité : Manager peut créer des employés
            </p>
          </header>

          <EmployeeManagementDemo />

        </div>
      </div>
    </div>
  );
}

export default TestEmployeeManagement;
