import { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProductsFB, addProductFB, updateProductFB, deleteProductFB } from '../firebaseStore';

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: 0, stock: 0, unit: 'bottle' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadProducts(); }, []);
  
  const loadProducts = async () => {
    try {
      const data = await getProductsFB();
      setProducts(data);
    } catch (error) {
      console.error("Products load karne mein error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || form.price <= 0) { alert('Name aur Price zaroori hai!'); return; }
    
    setLoading(true);
    try {
      if (editingProduct) {
        // Edit existing product
        await updateProductFB(editingProduct.id, {
          name: form.name,
          price: form.price,
          stock: form.stock,
          unit: form.unit
        });
      } else {
        // Add new product
        await addProductFB({
          name: form.name,
          price: form.price,
          stock: form.stock,
          unit: form.unit
        });
      }
      
      setForm({ name: '', price: 0, stock: 0, unit: 'bottle' });
      setShowForm(false);
      setEditingProduct(null);
      await loadProducts(); // Refresh list
    } catch (error) {
      console.error("Product save karne mein error:", error);
      alert('Product save karne mein masla aa gaya!');
    }
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ name: product.name, price: product.price, stock: product.stock, unit: product.unit });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Kya aap waqai is product ko delete karna chahte hain?')) {
      try {
        await deleteProductFB(id);
        await loadProducts();
      } catch (error) {
        console.error("Delete karne mein error:", error);
        alert('Delete karne mein masla aa gaya!');
      }
    }
  };

  const addStock = async (id: string, qty: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      try {
        await updateProductFB(id, { stock: product.stock + qty });
        await loadProducts();
        alert(`✅ ${qty} units add ho gaye!`);
      } catch (error) {
        console.error("Stock add karne mein error:", error);
        alert('Stock update karne mein masla aa gaya!');
      }
    }
  };

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📦 Inventory Management</h2>
        <button onClick={() => { setShowForm(true); setEditingProduct(null); setForm({ name: '', price: 0, stock: 0, unit: 'bottle' }); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">➕ Add Product</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Stock</p>
          <p className="text-2xl font-bold text-green-600">{totalStock} units</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Stock Value</p>
          <p className="text-2xl font-bold text-purple-600">Rs. {totalValue}</p>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="space-y-3">
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Product Name *" />
              <input type="number" value={form.price} onChange={(e) => setForm({...form, price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" placeholder="Price (Rs.) *" />
              <input type="number" value={form.stock} onChange={(e) => setForm({...form, stock: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg" placeholder="Initial Stock" />
              <select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="bottle">Bottle</option>
                <option value="pack">Pack</option>
                <option value="crate">Crate</option>
                <option value="box">Box</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg disabled:bg-gray-400">
                {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Add')}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold">Product</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">Price</th>
              <th className="text-center px-4 py-3 text-sm font-semibold">Stock</th>
              <th className="text-right px-4 py-3 text-sm font-semibold">Value</th>
              <th className="text-center px-4 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-gray-400">Unit: {product.unit}</p>
                </td>
                <td className="px-4 py-3 text-right font-medium">Rs. {product.price}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    product.stock <= 10 ? 'bg-red-100 text-red-600' : 
                    product.stock <= 50 ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-green-100 text-green-600'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">Rs. {product.stock * product.price}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-1">
                    <button onClick={() => { const qty = prompt('Kitne units add karna hain?'); if(qty) addStock(product.id, Number(qty)); }} 
                      className="text-green-600 hover:bg-green-50 p-1 rounded" title="Add Stock">📥</button>
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:bg-blue-50 p-1 rounded" title="Edit">✏️</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}