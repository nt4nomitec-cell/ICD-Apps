import { useState } from 'react';
import { getCustomers, getProducts, getSales, getLedger } from '../store';

export default function BackupData() {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleDownload = () => {
    const data = { appName: 'ICD', version: '1.0', exportDate: new Date().toISOString(),
      customers: getCustomers(), products: getProducts(), sales: getSales(), ledger: getLedger() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ICD_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    setImportStatus('success'); setMessage('✅ Data download ho gaya!');
    setTimeout(() => setImportStatus('idle'), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.customers) localStorage.setItem('icd_customers', JSON.stringify(data.customers));
        if (data.products) localStorage.setItem('icd_products', JSON.stringify(data.products));
        if (data.sales) localStorage.setItem('icd_sales', JSON.stringify(data.sales));
        if (data.ledger) localStorage.setItem('icd_ledger', JSON.stringify(data.ledger));
        setImportStatus('success'); setMessage('✅ Data import ho gaya!');
      } catch { setImportStatus('error'); setMessage('❌ File mein error hai!'); }
    };
    reader.readAsText(file);
    setTimeout(() => setImportStatus('idle'), 4000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">⬇️ Backup & Download</h2>
      {importStatus !== 'idle' && (
        <div className={`px-4 py-3 rounded-lg mb-4 ${importStatus === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{message}</div>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">⬇️</span></div>
          <h3 className="text-xl font-bold mb-2">Download Data</h3>
          <p className="text-gray-500 text-sm mb-4">Sara data JSON file mein download karein</p>
          <button onClick={handleDownload} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold">⬇️ Download Backup</button>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">⬆️</span></div>
          <h3 className="text-xl font-bold mb-2">Restore Data</h3>
          <p className="text-gray-500 text-sm mb-4">Backup file se data restore karein</p>
          <label className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold cursor-pointer">
            📂 Select Backup File<input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}


