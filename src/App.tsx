import { useState, useEffect } from 'react';
import { initializeStore } from './store';
import { syncLocalStorageToFirebase, testFirebaseConnection } from './firebaseStore';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'customer' | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    // Sirf ek baar sync karein
    const syncDone = sessionStorage.getItem('sync_done');
    
    if (!syncDone) {
      initializeStore();
      
      console.log('🔄 Firebase sync shuru ho raha hai...');
      
      // Pehle connection test karein
      testFirebaseConnection().then(() => {
        console.log('✅ Test pass! Ab poora sync shuru...');
        return syncLocalStorageToFirebase();
      }).then(() => {
        console.log('✅ LocalStorage data Firebase mein sync ho gaya!');
        sessionStorage.setItem('sync_done', 'true');
      }).catch((error) => {
        console.error('❌ Firebase sync mein error:', error);
        alert('Firebase sync ka error: ' + error.message);
      });
    }

    // Purani session check karein
    const savedSession = sessionStorage.getItem('icd_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      setIsLoggedIn(true);
      setUserType(session.type);
      if (session.customerId) setCustomerId(session.customerId);
    }
  }, []);

  const handleLogin = (type: 'admin' | 'customer', cId?: string) => {
    setIsLoggedIn(true);
    setUserType(type);
    if (cId) setCustomerId(cId);
    sessionStorage.setItem('icd_session', JSON.stringify({ type, customerId: cId }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setCustomerId(null);
    sessionStorage.removeItem('icd_session');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (userType === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userType === 'customer' && customerId) {
    return <CustomerDashboard customerId={customerId} onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
}

export default App;