import { useState, useEffect } from 'react';
import { Customer } from '../types';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../store';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', password: '' });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = () => { setCustomers(getCustomers()); };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.password) {
      alert('Name, Phone aur Password zaroori hai!');
      return;
    }
    if (editingCustomer) {
      updateCustomer({ ...editingCustomer, ...form });
    } else {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: form.name, phone: form.phone,
        address: form.address, password: form.password,
        createdAt: new Date().toISOString(),
      };
      addCustomer(newCustomer);
    }
    setForm({ name: '', phone: '', address: '', password: '' });
    setShowForm(false);
    setEditingCustomer(null);
    loadCustomers();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({ name: customer.name, phone: customer.phone, address: customer.address, password: customer.password });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Kya aap waqai is customer ko delete karna chahte hain?')) {
      deleteCustomer(id);
      loadCustomers();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">👥 Customer Management</h2>
        <button onClick={() => { setShowForm(true); setEditingCustomer(null); setForm({ name: '', phone: '', address: '', password: '' }); }}
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
                  {customer.address && <p className="text-gray-500 text-sm">📍 {customer.address}</p>}
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

