import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getCustomers, addCashPayment, calculateCustomerBalance } from '../store';

export default function CashPayment() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState(0);
  const [success, setSuccess] = useState(false);

  useEffect(() => { setCustomers(getCustomers()); }, []);

  const handleSubmit = () => {
    if (!selectedCustomer) { alert('Customer select karein!'); return; }
    if (amount <= 0) { alert('Amount zaroori hai!'); return; }
    addCashPayment(selectedCustomer, amount);
    setSuccess(true); setAmount(0); setSelectedCustomer('');
    setTimeout(() => setSuccess(false), 3000);
    setCustomers(getCustomers());
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Cash Payment Entry</h2>
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">✅ Cash payment record ho gaya!</div>}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer *</label>
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="w-full px-3 py-3 border rounded-lg">
                <option value="">-- Customer Select Karein --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} (Balance: Rs. {calculateCustomerBalance(c.id)})</option>)}
              </select>
            </div>
            {selectedCustomer && (
              <div className={`p-3 rounded-lg ${calculateCustomerBalance(selectedCustomer) > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className="text-sm text-gray-600">Current Balance:</p>
                <p className={`text-xl font-bold ${calculateCustomerBalance(selectedCustomer) > 0 ? 'text-red-600' : 'text-green-600'}`}>Rs. {calculateCustomerBalance(selectedCustomer)}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cash Amount (Rs.) *</label>
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-3 border rounded-lg text-lg" placeholder="Enter cash amount" />
            </div>
            <button onClick={handleSubmit} className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 text-lg">
              💰 Record Cash Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


