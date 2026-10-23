import { useState, useEffect } from 'react';
import { getLedgerFB, getCustomersFB, calculateCustomerBalanceFB } from '../firebaseStore';
import { LedgerEntry, Customer } from '../types';

export default function LedgerView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadLedger = async () => {
      try {
        const ledgerData = await getLedgerFB();
        setLedger(ledgerData);
        const customersData = await getCustomersFB();
        setCustomers(customersData);
      } catch (error) {
        console.error("Ledger load karne mein error:", error);
      }
    };
    loadLedger();
  }, []);

  // Jab bhi selected customer change ho, uska balance calculate karein
  useEffect(() => {
    if (selectedCustomer) {
      calculateCustomerBalanceFB(selectedCustomer).then(setBalance);
    } else {
      setBalance(0);
    }
  }, [selectedCustomer, ledger]);

  const customer = customers.find(c => c.id === selectedCustomer);
  const filteredLedger = selectedCustomer ? ledger.filter(entry => entry.customerId === selectedCustomer) : [];

  if (!selectedCustomer) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📒 Customer Ledger</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold">Customer</th>
                <th className="text-left px-4 py-3 text-sm font-semibold">Phone</th>
                <th className="text-right px-4 py-3 text-sm font-semibold">Balance</th>
                <th className="text-center px-4 py-3 text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                // Yahan hum temporary balance calculate kar rahe hain list dikhane ke liye
                const bal = ledger.filter(l => l.customerId === c.id).reduce((acc, curr) => acc + (curr.debit || 0) - (curr.credit || 0), 0);
                return (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500">{c.phone}</td>
                    <td className={`px-4 py-3 text-right font-bold ${bal > 0 ? 'text-red-600' : 'text-green-600'}`}>Rs. {bal}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedCustomer(c.id)} className="text-blue-600 hover:underline text-sm">View Detail →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div id="ledger-print">
      <div className="text-center mb-6 print:block hidden">
        <img src="/logo-new.png" alt="Ismail Cold Drinks" className="h-20 w-20 object-contain mx-auto mb-2" />
        <h2 className="text-xl font-bold text-blue-600">ICD - Ismail Cold Drinks</h2>
        <p className="text-sm text-gray-500">Wholesale</p>
      </div>

      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <button onClick={() => setSelectedCustomer('')} className="text-blue-600 hover:underline text-sm mb-1">← Back</button>
          <h2 className="text-2xl font-bold text-gray-800">📒 Ledger - {customer?.name}</h2>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">🖨️ Print</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{customer?.name}</h3>
            <p className="text-sm text-gray-500">Phone: {customer?.phone}</p>
          </div>
          <div className={`rounded-xl p-4 ${balance > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <p className="text-sm text-gray-600">Outstanding Balance</p>
            <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>Rs. {balance}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold">Description</th>
              <th className="text-right px-4 py-3 text-xs font-semibold">Debit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold">Credit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filteredLedger.map((entry, idx) => (
              <tr key={idx} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{entry.date}</td>
                <td className="px-4 py-3 text-sm">{entry.description}</td>
                <td className="px-4 py-3 text-right text-sm text-red-600">{entry.debit > 0 ? `Rs. ${entry.debit}` : '-'}</td>
                <td className="px-4 py-3 text-right text-sm text-green-600">{entry.credit > 0 ? `Rs. ${entry.credit}` : '-'}</td>
                <td className="px-4 py-3 text-right text-sm font-bold">Rs. {entry.balance}</td>
              </tr>
            ))}
            {filteredLedger.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Is customer ki koi ledger entry nahi hai.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center text-gray-500 text-sm mt-6 print:block hidden">
        <p className="border-t pt-4">Powered by NomiTec</p>
      </div>
    </div>
  );
}