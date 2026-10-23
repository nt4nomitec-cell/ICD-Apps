import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getCustomersFB, addCustomerFB, updateCustomerFB, deleteCustomerFB, addLedgerEntryFB } from '../firebaseStore'; // addLedgerEntryFB add kiya hai

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form state mein openingBalance add kar diya hai
  const [form, setForm] = useState({ name: '', phone: '', address: '', password: '', openingBalance: '' });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomersFB();
      setCustomers(data);
    } catch (error) {
      console.error("Customers load karne mein error:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.password) {
      alert('Name, Phone aur Password zaroori hai!');
      return;
    }
    try {
      if (editingCustomer) {
        // Edit karte waqt sirf basic info update karein
        await updateCustomerFB(editingCustomer.id, {
          name: form.name, phone: form.phone, address: form.address, password: form.password
        });
      } else {
        // Naya Customer Add karein
        const newCustomerData = {
          name: form.name,
          phone: form.phone,
          address: form.address,
          password: form.password,
          createdAt: new Date().toISOString(),
        };
        
        // Firebase mein customer save karein aur ID lein
        const newCustomerId = await addCustomerFB(newCustomerData);
        
        // Agar Opening Balance (Purana Hisab) dala hai, toh usko Ledger mein save karein
        const openingBal = parseFloat(form.openingBalance);
        if (openingBal > 0) {
          await addLedgerEntryFB({
            customerId: newCustomerId,
            date: new Date().toISOString().split('T')[0],
            description: 'Opening Balance (Purana Hisab)',
            debit: openingBal,
            credit: 0,
            balance: openingBal
          });
          console.log('✅ Opening Balance ledger mein save ho gaya!');
        }
      }
      
      // Form reset karein
      setForm({ name: '', phone: '', address: '', password: '', openingBalance: '' });
      setShowForm(false);
      setEditingCustomer(null);
      loadCustomers(); // List refresh karein
    } catch (error) {
      console.error("Customer save karne mein error:", error);
      alert("Save karne mein masla aa gaya!");
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({ 
      name: customer.name, 
      phone: customer.phone, 
      address: customer.address, 
      password: customer.password,
      openingBalance: '' // Edit karte waqt balance field khali rakhein taake double entry na ho
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Kya aap waqai is customer ko delete karna chahte hain?')) {
      try {
        await deleteCustomerFB(id);
        loadCustomers();
      } catch (error) {
        console.error("Delete karne mein error:", error);
        alert("Delete karne mein masla aa gaya!");
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Customers load ho rahe hain...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👥 Customer Management</h2>
        <button onClick={() => { setShowForm(true); setEditingCustomer(null); setForm({ name: '', phone: '', address: '', password: '', openingBalance: '' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          ➕ Add Customer
        </button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
            <div className="space-y-3">
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" placeholder="Name *" />
              <input type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" placeholder="Phone *" />
              <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" placeholder="Address" />
              <input type="text" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg" placeholder="Password *" />
              
              {/* Yeh Naya Field Sirf Naya Customer Add Karte Waqt Dikhega */}
              {!editingCustomer && (
                <input type="number" value={form.openingBalance} onChange={(e) => setForm({...form, openingBalance: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-orange-200 rounded-lg bg-orange-50" placeholder="Opening Balance (Purana Hisab - Optional)" />
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                {editingCustomer ? 'Update' : 'Add'} Customer
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {customers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">Koi customer nahi hai. Pehla customer add karein!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map(customer => (
            <div key={customer.id} className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{customer.name}</h3>
                  <p className="text-gray-600 text-sm">📞 {customer.phone}</p>
                  {customer.address && <p className="text-gray-500 text-sm"> {customer.address}</p>}
                  <p className="text-gray-400 text-xs mt-1">🔑 Login: {customer.phone} / {customer.password}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">✏️</button>
                  <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}