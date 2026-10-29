import { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, writeBatch, setDoc } from 'firebase/firestore';
import {
  getCustomersFB, getProductsFB, getSalesFB, getLedgerFB,
  addCustomerFB, addProductFB, addSaleFB, addLedgerEntryFB
} from '../firebaseStore';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function BackupData() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState('');

  // ============ BACKUP: Firebase → JSON File ============
  const handleBackup = async () => {
    try {
      setStatus('loading');
      setMessage('');
      setProgress('🔄 Firebase se data load ho raha hai...');

      // 1. Saara data Firebase se laayein
      const [customers, products, sales, ledger] = await Promise.all([
        getCustomersFB(),
        getProductsFB(),
        getSalesFB(),
        getLedgerFB(),
      ]);

      // 2. Orders bhi laayein (direct Firebase se)
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const orders = ordersSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      setProgress('📦 Data collect ho gaya, file ban rahi hai...');

      // 3. JSON file banayein
      const backupData = {
        appName: 'ICD - Ismail Cold Drinks',
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        backupType: 'firebase',
        data: {
          customers,
          products,
          sales,
          ledger,
          orders,
        },
        stats: {
          customers: customers.length,
          products: products.length,
          sales: sales.length,
          ledger: ledger.length,
          orders: orders.length,
        },
      };

      // 4. File download karein
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ICD_Backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('success');
      setMessage(`✅ Backup complete! ${customers.length} customers, ${products.length} products, ${sales.length} sales, ${ledger.length} ledger, ${orders.length} orders.`);
      setProgress('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Backup error:', error);
      setStatus('error');
      setMessage('❌ Backup fail ho gaya: ' + (error as Error).message);
      setProgress('');
    }
  };

  // ============ RESTORE: JSON File → Firebase ============
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const confirmMsg = `⚠️ WARNING: Yeh action aapke Firebase ka PURANA DATA DELETE kar dega aur backup file se naya data upload karega.\n\nKya aap waqai restore karna chahte hain?`;
  if (!window.confirm(confirmMsg)) {
    e.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      setStatus('loading');
      setMessage('');
      const data = JSON.parse(event.target?.result as string);

      // Validation - dono formats support karein
      let backup: any;
      if (data.data) {
        backup = data.data;
      } else {
        backup = data;
      }

      if (!backup.customers && !backup.products) {
        throw new Error('Invalid backup file format');
      }

      const stats = data.stats || {
        customers: backup.customers?.length || 0,
        products: backup.products?.length || 0,
        sales: backup.sales?.length || 0,
        ledger: backup.ledger?.length || 0,
        orders: backup.orders?.length || 0,
      };

      setProgress('️ Purana data delete ho raha hai...');

      // 1. Purana data Firebase se delete karein
      const collectionsToClear = ['customers', 'products', 'sales', 'ledger', 'orders'];
      for (const colName of collectionsToClear) {
        const snapshot = await getDocs(collection(db, colName));
        if (snapshot.size > 0) {
          const batch = writeBatch(db);
          snapshot.docs.forEach(d => batch.delete(doc(db, colName, d.id)));
          await batch.commit();
        }
      }

      // 2. Customers restore karein (PURANI IDs PRESERVE karein)
      setProgress(`📥 Customers restore ho rahe hain (${stats.customers})...`);
      if (backup.customers?.length) {
        for (const c of backup.customers) {
          const { id, ...rest } = c;
          // setDoc use karein taake purani ID preserve ho
          await setDoc(doc(db, 'customers', id), rest);
        }
      }

      // 3. Products restore karein (PURANI IDs PRESERVE karein)
      setProgress(`📥 Products restore ho rahe hain (${stats.products})...`);
      if (backup.products?.length) {
        for (const p of backup.products) {
          const { id, ...rest } = p;
          await setDoc(doc(db, 'products', id), rest);
        }
      }

      // 4. Sales restore karein (PURANI IDs PRESERVE karein)
      setProgress(`📥 Sales restore ho rahe hain (${stats.sales})...`);
      if (backup.sales?.length) {
        for (const s of backup.sales) {
          const { id, ...rest } = s;
          await setDoc(doc(db, 'sales', id), rest);
        }
      }

      // 5. Ledger restore karein (PURANI IDs PRESERVE karein)
      setProgress(`📥 Ledger restore ho raha hai (${stats.ledger})...`);
      if (backup.ledger?.length) {
        for (const l of backup.ledger) {
          const { id, ...rest } = l;
          await setDoc(doc(db, 'ledger', id), rest);
        }
      }

      // 6. Orders restore karein (PURANI IDs PRESERVE karein)
      setProgress(` Orders restore ho rahe hain (${stats.orders})...`);
      if (backup.orders?.length) {
        for (const o of backup.orders) {
          const { id, ...rest } = o;
          await setDoc(doc(db, 'orders', id), rest);
        }
      }

      setStatus('success');
      setMessage(`✅ Restore complete! ${stats.customers} customers, ${stats.products} products, ${stats.sales} sales, ${stats.ledger} ledger, ${stats.orders} orders.`);
      setProgress('');
      setTimeout(() => setStatus('idle'), 6000);
    } catch (error) {
      console.error('Restore error:', error);
      setStatus('error');
      setMessage('❌ Restore fail: ' + (error as Error).message);
      setProgress('');
    }
  };
  reader.readAsText(file);
};

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">⬇️ Backup & Restore (Firebase)</h2>

      {status !== 'idle' && (
        <div className={`px-4 py-3 rounded-lg mb-4 ${
          status === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
          status === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
          'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          {status === 'loading' && <p className="font-medium">⏳ Processing...</p>}
          {message && <p className="mt-1">{message}</p>}
          {progress && <p className="text-sm mt-2 opacity-80">{progress}</p>}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Zaroori:</strong> Backup aur Restore ab Firebase se kaam karta hai. 
          Backup lene se aapka saara Firebase data JSON file mein save hoga. 
          Restore karne se purana Firebase data delete hoga aur backup file se naya data aayega.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⬇️</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Download Backup</h3>
          <p className="text-gray-500 text-sm mb-4">
            Firebase ka saara data (customers, products, sales, ledger, orders) JSON file mein download karein
          </p>
          <button
            onClick={handleBackup}
            disabled={status === 'loading'}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {status === 'loading' ? '⏳ Backup ho raha hai...' : '️ Download Backup'}
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⬆️</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Restore Data</h3>
          <p className="text-gray-500 text-sm mb-4">
            Backup file se Firebase mein data restore karein (purana data delete hoga)
          </p>
          <label className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50">
            📂 Select Backup File
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
              disabled={status === 'loading'}
            />
          </label>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 border">
        <h3 className="font-bold text-gray-800 mb-3">📋 Backup/Restore Guide:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li><strong>Backup:</strong> "Download Backup" par click karein. JSON file aapke computer mein save hogi.</li>
          <li><strong>Restore:</strong> "Select Backup File" par click karein aur pehle wali JSON file select karein.</li>
          <li><strong>Warning:</strong> Restore karne se pehle purana Firebase data delete ho jayega. Is liye pehle backup zaroor lein.</li>
          <li><strong>Format:</strong> Sirf ICD app se li gayi JSON files restore hon gi.</li>
        </ol>
      </div>
    </div>
  );
}