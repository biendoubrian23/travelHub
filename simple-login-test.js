<<<<<<< HEAD
// Test simple de connexion Supabase
const testLogin = async () => {
  console.log('🔍 Test de connexion simple...');
  
  try {
    const response = await fetch('https://dqoncbnvyviurirsdtyu.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'
      },
      body: JSON.stringify({
        email: 'superadmin@hotmail.com',
        password: 'SuperAdmin123!'
      })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
    
    if (result.access_token) {
      console.log('✅ Connexion réussie!');
      return true;
    } else {
      console.log('❌ Connexion échouée:', result.error_description || result.message);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return false;
  }
};

testLogin();
=======
// Test simple de connexion Supabase
const testLogin = async () => {
  console.log('🔍 Test de connexion simple...');
  
  try {
    const response = await fetch('https://dqoncbnvyviurirsdtyu.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb25jYm52eXZpdXJpcnNkdHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzc4NDEsImV4cCI6MjA2OTc1Mzg0MX0.gsvrCIlp0NIaCmssExkbslbJjiZJ_A4u5lD0XG_ncY0'
      },
      body: JSON.stringify({
        email: 'superadmin@hotmail.com',
        password: 'SuperAdmin123!'
      })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
    
    if (result.access_token) {
      console.log('✅ Connexion réussie!');
      return true;
    } else {
      console.log('❌ Connexion échouée:', result.error_description || result.message);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return false;
  }
};

testLogin();
>>>>>>> master
