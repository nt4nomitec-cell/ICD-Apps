import { useState } from 'react';
import { getCustomers, getAdminPassword } from '../store';
import { getCustomerByPhoneFB } from '../firebaseStore'; // ✅ Yeh import upar aa gayi

interface LoginProps {
  onLogin: (type: 'admin' | 'customer', customerId?: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [tab, setTab] = useState<'admin' | 'customer'>('admin');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = () => {
    if (password === getAdminPassword()) {
      onLogin('admin');
    } else {
      setError('Galat password!');
    }
  };

  const handleCustomerLogin = async () => {
    try {
      const customer = await getCustomerByPhoneFB(phone);
      if (customer && customer.password === custPassword) {
        onLogin('customer', customer.id);
      } else {
        setError('Phone ya password galat hai!');
      }
    } catch (error) {
      setError('Login mein masla aa gaya!');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-center">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4" 
     style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' }}>
            <img src="/logo-new.png" alt="Ismail Cold Drinks" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white">ICD</h1>
          <p className="text-blue-100 mt-1">Ismail Cold Drinks - Wholesale</p>
        </div>
        <div className="flex border-b">
          <button onClick={() => { setTab('admin'); setError(''); }}
            className={`flex-1 py-3 font-semibold transition ${tab === 'admin' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            🏪 Admin Login
          </button>
          <button onClick={() => { setTab('customer'); setError(''); }}
            className={`flex-1 py-3 font-semibold transition ${tab === 'customer' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
            👤 Customer Login
          </button>
        </div>
        <div className="p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
          {tab === 'admin' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} />
              </div>
              <button onClick={handleAdminLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:opacity-90">
                Login as Admin
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">Powered by NomiTec</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={custPassword} onChange={(e) => setCustPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomerLogin()} />
              </div>
              <button onClick={handleCustomerLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:opacity-90">
                Login as Customer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}