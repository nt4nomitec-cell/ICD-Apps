import { useState } from 'react';
import CustomerManagement from './CustomerManagement';
import SalesEntry from './SalesEntry';
import LedgerView from './LedgerView';
import Inventory from './Inventory';
import CashPayment from './CashPayment';
import BackupData from './BackupData';
import VercelGuide from './VercelGuide';
import OnlineOrders from './OnlineOrders';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('sales');

  const tabs = [
    { id: 'sales', label: '📝 New Sale' },
    { id: 'online-orders', label: '📦 Online Orders' },
    { id: 'customers', label: '👥 Customers' },
    { id: 'ledger', label: '📒 Ledger' },
    { id: 'inventory', label: '📦 Inventory' },
    { id: 'cash', label: '💰 Cash Entry' },
    { id: 'backup', label: '⬇️ Backup' },
    { id: 'deploy', label: '🔺 Vercel Deploy' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-new.png" alt="Ismail Cold Drinks" className="h-10 w-10 object-contain" 
         style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))' }} />
            <div>
              <h1 className="text-xl font-bold">ICD - Admin Panel</h1>
              <p className="text-blue-100 text-xs">Ismail Cold Drinks Wholesale</p>
            </div>
          </div>
          <button onClick={onLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium">
            🚪 Logout
          </button>
        </div>
      </header>
      <nav className="bg-white shadow-sm border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'sales' && <SalesEntry />}
        {activeTab === 'online-orders' && <OnlineOrders />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'cash' && <CashPayment />}
        {activeTab === 'backup' && <BackupData />}
        {activeTab === 'deploy' && <VercelGuide />}
      </main>
    </div>
  );
}


