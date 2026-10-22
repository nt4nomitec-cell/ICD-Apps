import { useState, useEffect } from 'react';
import { Customer, Product, SaleItem } from '../types';
import { getCustomers, getProducts, addSale, generateBillNumber, calculateCustomerBalance } from '../store';

export default function SalesEntry() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [cashReceived, setCashReceived] = useState(0);
  const [showBill, setShowBill] = useState(false);
  const [lastBill, setLastBill] = useState<any>(null);

  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
  }, []);

    const addItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check: Agar stock 0 hai
    if (product.stock <= 0) {
      alert('Maaf karein, is item ka stock khatam ho gaya hai!');
      return;
    }

    const existing = items.find(i => i.productId === productId);
    
    // Check: Agar user stock se zyada add karne ki koshish kare
    if (existing) {
      if (existing.quantity + 1 > product.stock) {
        alert(`Sirf ${product.stock} items available hain! Aap is se zyada add nahi kar sakte.`);
        return;
      }
      setItems(items.map(i => i.productId === productId
        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i));
    } else {
      setItems([...items, { productId: product.id, productName: product.name, quantity: 1, price: product.price, total: product.price }]);
    }
  };

    const updateQuantity = (productId: string, qty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (qty <= 0) { 
      setItems(items.filter(i => i.productId !== productId)); 
    }
    else { 
      // Check: Agar user stock se zyada quantity set karne ki koshish kare
      if (qty > product.stock) {
        alert(`Sirf ${product.stock} items available hain!`);
        return;
      }
      setItems(items.map(i => i.productId === productId ? { ...i, quantity: qty, total: qty * i.price } : i)); 
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
   // Naye lines yahan add karein (totalAmount ke baad):
  const previousBalance = selectedCustomer ? calculateCustomerBalance(selectedCustomer) : 0;
  const currentBalance = totalAmount - cashReceived;
  const finalBalance = previousBalance + currentBalance;
  const balance = totalAmount - cashReceived;

  const handleSubmit = () => {
    if (!selectedCustomer) { alert('Customer select karein!'); return; }
    if (items.length === 0) { alert('Kam az kam ek item add karein!'); return; }
    const billNumber = generateBillNumber();
        const sale = { 
      id: Date.now().toString(), 
      customerId: selectedCustomer, 
      items, 
      totalAmount, 
      cashReceived, 
      balance: currentBalance, 
      previousBalance: previousBalance, 
      finalBalance: finalBalance, 
      date: new Date().toISOString().split('T')[0], 
      billNumber 
    };
    addSale(sale);
    setLastBill({ ...sale, customerName: customers.find(c => c.id === selectedCustomer)?.name });
    setShowBill(true);
    setItems([]); setCashReceived(0); setSelectedCustomer('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 New Sale Entry</h2>
      {showBill && lastBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md" id="bill-print">
           <div className="text-center border-b pb-4 mb-4">
  <img src="/logo-new.png" alt="ICD Logo" className="h-20 w-20 object-contain mx-auto mb-2" />
  <h2 className="text-2xl font-bold text-blue-600">ICD</h2>
  <p className="text-sm text-gray-500">Ismail Cold Drinks - Wholesale</p>
  <p className="text-xs text-gray-400">Bill #{lastBill.billNumber}</p>
</div>
            <div className="mb-4">
              <p className="font-semibold">{lastBill.customerName}</p>
              <p className="text-sm text-gray-500">Date: {lastBill.date}</p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead><tr className="border-b"><th className="text-left py-1">Item</th><th className="text-center py-1">Qty</th><th className="text-right py-1">Amount</th></tr></thead>
              <tbody>
                {lastBill.items.map((item: SaleItem, idx: number) => (
                  <tr key={idx} className="border-b"><td className="py-1">{item.productName}</td><td className="text-center py-1">{item.quantity}</td><td className="text-right py-1">Rs. {item.total}</td></tr>
                ))}
              </tbody>
            </table>
                        <div className="border-t pt-3 space-y-2">
              {lastBill.previousBalance > 0 && (
                <div className="flex justify-between text-orange-600 text-sm font-medium">
                  <span>Purana Udhaar:</span>
                  <span>Rs. {lastBill.previousBalance}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold"><span>Naya Bill Total:</span><span>Rs. {lastBill.totalAmount}</span></div>
              <div className="flex justify-between text-green-600"><span>Cash Received:</span><span>Rs. {lastBill.cashReceived}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-red-700">
                <span>Kul Udhaar (Total):</span>
                <span>Rs. {lastBill.finalBalance}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">🖨️ Print Bill</button>
              <button onClick={() => setShowBill(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer *</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg">
              <option value="">-- Customer Select Karein --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">📦 Products</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div><p className="font-medium text-sm">{product.name}</p><p className="text-xs text-gray-500">Rs. {product.price} | Stock: {product.stock}</p></div>
                  <button onClick={() => addItem(product.id)} disabled={product.stock <= 0 || (items.find(i => i.productId === product.id)?.quantity || 0) >= product.stock}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 disabled:bg-gray-300">+ Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-700 mb-3">🛒 Cart</h3>
            {items.length === 0 ? <p className="text-gray-400 text-center py-8">Koi item add nahi hua</p> : (
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div><p className="font-medium text-sm">{item.productName}</p><p className="text-xs text-gray-500">Rs. {item.price} each</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 bg-red-100 text-red-600 rounded-full font-bold">-</button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 bg-green-100 text-green-600 rounded-full font-bold">+</button>
                      <span className="font-bold ml-2 text-blue-600">Rs. {item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="space-y-2">
              <div className="flex justify-between text-lg"><span className="text-gray-600">Total Amount:</span><span className="font-bold">Rs. {totalAmount}</span></div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cash Received:</label>
                <input type="number" value={cashReceived} onChange={(e) => setCashReceived(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg" placeholder="Cash amount" />
              </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-red-700">Kul Udhaar (Total):</span>
                <span className={finalBalance > 0 ? 'text-red-600' : 'text-green-600'}>Rs. {finalBalance}</span>
              </div>
            </div>
            <button onClick={handleSubmit} className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90">
              ✅ Save Sale & Generate Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}