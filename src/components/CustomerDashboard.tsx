import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { getCustomersFB, getLedgerByCustomerFB, getProductsFB, getSalesFB } from '../firebaseStore';
import { Customer, SaleEntry, LedgerEntry, Product } from '../types';

interface CustomerDashboardProps { customerId: string; onLogout: () => void; }

export default function CustomerDashboard({ customerId, onLogout }: CustomerDashboardProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [firebaseOrders, setFirebaseOrders] = useState<any[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [orderAddress, setOrderAddress] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
  const loadCustomerData = async () => {
    try {
      const allCustomers = await getCustomersFB();
      const c = allCustomers.find(cust => cust.id === customerId);
      
      if (c) {
        setCustomer(c);
        
        const ledgerData = await getLedgerByCustomerFB(customerId);
        setLedger(ledgerData);
        
        const allSales = await getSalesFB();
        const customerSales = allSales.filter(s => s.customerId === customerId);
        setSales(customerSales);
                    
        const productsData = await getProductsFB();
        setProducts(productsData);
        setOrderAddress(c.address || '');
      }
    } catch (error) {
      console.error("Customer data load karne mein error:", error);
    }
  };
  
  loadCustomerData();
}, [customerId]);

  const loadFirebaseOrders = async (phone: string) => {
    try {
      const q = query(collection(db, "orders"), where("customerPhone", "==", phone));
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      orders.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setFirebaseOrders(orders);
    } catch (error) {
      console.error("Firebase orders error:", error);
    }
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) { alert('Stock khatam hai!'); return; }
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      if (existing.qty + 1 > product.stock) { alert(`Sirf ${product.stock} available hain!`); return; }
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, qty: 1 }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(cart.filter(i => i.id !== id));
    else setCart(cart.map(i => i.id === id ? { ...i, qty } : i));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const placeOrder = async () => {
    if (!customer) return;
    if (cart.length === 0) { alert('Cart khali hai!'); return; }
    if (!orderAddress) { alert('Address likhein!'); return; }
    
    setOrderLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: orderAddress,
        customerId: customerId,
        items: cart,
        totalAmount: cartTotal,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setOrderSuccess(true);
      setCart([]);
      setOrderAddress('');
      if (customer.phone) loadFirebaseOrders(customer.phone);
    } catch (error) {
      alert('Order bhejne mein masla!');
    }
    setOrderLoading(false);
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Place Ho Gaya!</h2>
          <p className="text-gray-600 mb-6">Aapka order humein mil gaya hai. Jald hi rabta karenge.</p>
          <button onClick={() => { setOrderSuccess(false); setActiveTab('bills'); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg">My Bills Dekhein</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-new.png" alt="ICD" className="h-10 w-10 object-contain" style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.6))' }} />
            <div>
              <h1 className="text-xl font-bold">ICD - Customer Portal</h1>
              <p className="text-blue-100 text-xs">Welcome, {customer.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium">🚪 Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        <div className={`rounded-xl p-6 shadow-lg ${balance > 0 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-500 to-green-600'} text-white`}>
          <p className="text-sm opacity-80">Your Outstanding Balance</p>
          <p className="text-4xl font-bold mt-1">Rs. {balance}</p>
        </div>
      </div>

      <nav className="max-w-5xl mx-auto px-4 mt-6 no-print">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'order', label: '🛒 New Order' },
            { id: 'ledger', label: '📒 My Ledger' },
            { id: 'bills', label: '🧾 My Bills' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Active Orders */}
      <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
        <p className="text-2xl font-bold text-blue-600">
          {sales.length + firebaseOrders.filter((o: any) => o.status !== 'Cancelled').length}
        </p>
        <p className="text-xs text-gray-500">Active Orders</p>
      </div>
      
      {/* Total Purchases - Number() force kar diya hai */}
      <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
        <p className="text-2xl font-bold text-purple-600">
          Rs. {ledger.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0)}
        </p>
        <p className="text-xs text-gray-500">Total Purchases</p>
      </div>
      
      {/* Total Paid - Number() force kar diya hai */}
      <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
        <p className="text-2xl font-bold text-green-600">
          Rs. {ledger.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0)}
        </p>
        <p className="text-xs text-gray-500">Total Paid</p>
      </div>
      
      {/* Balance */}
      <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
        <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
          Rs. {Number(balance) || 0}
        </p>
        <p className="text-xs text-gray-500">Balance</p>
      </div>
    </div>

    {/* Rejected Orders Alert */}
    {firebaseOrders.filter((o: any) => o.status === 'Cancelled').length > 0 && (
      <div className="bg-red-50 rounded-xl p-4 shadow-sm border-2 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            <div className="text-left">
              <p className="text-lg font-bold text-red-700">
                {firebaseOrders.filter((o: any) => o.status === 'Cancelled').length} Rejected Order{firebaseOrders.filter((o: any) => o.status === 'Cancelled').length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-red-600">
                Aapke kuch orders admin ne cancel kar diye hain. Details ke liye "My Bills" tab dekhein.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('bills')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700">
            View Details →
          </button>
        </div>
      </div>
    )}
  </div>
)}

        {activeTab === 'order' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h2 className="text-xl font-bold mb-4">📦 Products</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Rs. {product.price} | Stock: {product.stock}</p>
                    </div>
                    <button onClick={() => addToCart(product)} disabled={product.stock <= 0} className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm disabled:bg-gray-300">+ Add</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h2 className="text-xl font-bold mb-4">🛍️ Your Cart</h2>
                {cart.length === 0 ? <p className="text-gray-400 text-center py-4">Cart khali hai</p> : (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">Rs. {item.price} x {item.qty} = <b>Rs. {item.price * item.qty}</b></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 bg-red-100 text-red-600 rounded-full font-bold">-</button>
                          <span className="font-bold w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 bg-green-100 text-green-600 rounded-full font-bold">+</button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                      <span>Total:</span>
                      <span className="text-blue-600">Rs. {cartTotal}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl shadow-sm border p-4">
                <h2 className="text-xl font-bold mb-4">📍 Delivery Address</h2>
                <textarea value={orderAddress} onChange={(e) => setOrderAddress(e.target.value)} placeholder="Apna address likhein" className="w-full px-3 py-2 border rounded-lg" rows={3}></textarea>
                <button onClick={placeOrder} disabled={orderLoading} className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400">
                  {orderLoading ? 'Bhej Rahe Hain...' : '✅ Place Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div id="customer-ledger-print" className="relative">
            <div className="watermark"><div className="watermark-text">PRINTED BY CUSTOMER</div></div>
            <div className="flex justify-between items-center mb-4 no-print">
              <h2 className="text-xl font-bold text-gray-800">📒 My Ledger</h2>
              <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-lg">️ Print Ledger</button>
            </div>
            <div className="text-center border-b pb-4 mb-4">
              <img src="/logo-new.png" alt="ICD Logo" className="h-20 w-20 object-contain mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-blue-600">ICD - Ismail Cold Drinks</h2>
              <p className="text-sm text-gray-500">Wholesale</p>
              <p className="text-sm text-gray-600 mt-2">Customer: <b>{customer.name}</b> | Phone: {customer.phone}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
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
                  {ledger.map((entry, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-3 text-sm">{entry.date}</td>
                      <td className="px-4 py-3 text-sm">{entry.description}</td>
                      <td className="px-4 py-3 text-right text-sm text-red-600">{entry.debit > 0 ? `Rs. ${entry.debit}` : '-'}</td>
                      <td className="px-4 py-3 text-right text-sm text-green-600">{entry.credit > 0 ? `Rs. ${entry.credit}` : '-'}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold">Rs. {entry.balance}</td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Koi ledger entry nahi</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500 font-medium">Powered by NomiTec</p>
              <p className="text-xs text-gray-400 mt-1 italic">⚠️ This ledger was printed by the customer, not by admin.</p>
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
  <div className="space-y-3">
    <h2 className="text-xl font-bold text-gray-800 mb-4">🧾 My Bills & Orders</h2>
    
    {/* 🔴 Cancelled Orders ka Alert Banner */}
    {firebaseOrders.filter((o: any) => o.status === 'Cancelled').length > 0 && (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="font-bold text-red-700 text-lg">Aapke Kuch Orders Reject Ho Gaye Hain!</h3>
            <p className="text-red-600 text-sm mt-1">
              Neeche red color mein marked orders admin ne cancel kar diye hain. 
              Inki delivery nahi hogi. Mazeed maloomat ke liye rabta karein.
            </p>
          </div>
        </div>
      </div>
    )}
    
    {/* Admin ke banaye hue bills */}
    {[...sales].reverse().map(sale => (
      <div key={sale.id} className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold">Bill #{sale.billNumber}</p>
            <p className="text-sm text-gray-500">📅 {sale.date}</p>
            {sale.items.map((item, idx) => <p key={idx} className="text-xs text-gray-600">{item.productName} × {item.quantity} = Rs. {item.total}</p>)}
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Rs. {sale.totalAmount}</p>
            <p className="text-xs text-green-600">Paid: Rs. {sale.cashReceived}</p>
            <button onClick={() => setSelectedBill({ ...sale, source: 'admin' })} className="mt-2 text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">🖨️ Print Bill</button>
          </div>
        </div>
      </div>
    ))}

    {/* Online Orders - Ab sab dikhenge (Pending, Completed, Cancelled) */}
    {firebaseOrders.map((order: any) => {
      // Status ke hisaab se styling
      const statusConfig = {
        'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: ' Pending - Admin dekh raha hai' },
        'Completed': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: '✅ Completed - Delivery ho gayi' },
        'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: '❌ Rejected - Order cancel ho gaya' }
      };
      const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig['Pending'];
      
      return (
        <div key={order.id} className={`bg-white rounded-xl p-4 shadow-sm border-2 ${config.border}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-bold">Online Order #{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-gray-500">
                📅 {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Pending'}
              </p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                {config.label}
              </span>
              
              {/* 🔴 Cancelled Order ka Special Message */}
              {order.status === 'Cancelled' && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700 text-sm font-medium">
                    ️ Yeh order admin ne reject kar diya hai. Iski delivery nahi hogi. 
                    Agar aapko koi masla hai toh hum se rabta karein.
                  </p>
                </div>
              )}
              
              {order.items && order.items.map((item: any, idx: number) => (
                <p key={idx} className="text-xs text-gray-600 mt-1">
                  {item.name} × {item.qty} = Rs. {item.price * item.qty}
                </p>
              ))}
            </div>
            <div className="text-right ml-3">
              <p className="font-bold text-lg">Rs. {order.totalAmount}</p>
              {order.status !== 'Cancelled' && (
                <button onClick={() => setSelectedBill({
                  id: order.id,
                  billNumber: `ONL-${order.id.slice(0, 8).toUpperCase()}`,
                  date: order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : '',
                  items: order.items.map((item: any) => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.qty,
                    price: item.price,
                    total: item.price * item.qty
                  })),
                  totalAmount: order.totalAmount,
                  cashReceived: 0,
                  balance: order.totalAmount,
                  source: 'customer'
                })} className="mt-2 text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">️ Print Bill</button>
              )}
            </div>
          </div>
        </div>
      );
    })}

    {sales.length === 0 && firebaseOrders.length === 0 && (
      <p className="text-gray-500 text-center py-8">Aapka koi bill ya order nahi mila.</p>
    )}
  </div>
)}
      </main>

      {selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative" id="customer-bill-print">
            <div className="watermark"><div className="watermark-text">PRINTED BY CUSTOMER</div></div>
            <div className="text-center border-b pb-4 mb-4">
              <img src="/logo-new.png" alt="ICD Logo" className="h-20 w-20 object-contain mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-blue-600">ICD</h2>
              <p className="text-sm text-gray-500">Ismail Cold Drinks - Wholesale</p>
              <p className="text-xs text-gray-400">Bill #{selectedBill.billNumber}</p>
            </div>
            <p className="font-semibold">{customer.name}</p>
            <p className="text-sm text-gray-500 mb-4">Date: {selectedBill.date}</p>
            <table className="w-full text-sm mb-4">
              <thead><tr className="border-b"><th className="text-left py-1">Item</th><th className="text-center py-1">Qty</th><th className="text-right py-1">Amount</th></tr></thead>
              <tbody>{selectedBill.items.map((item: any, idx: number) => (<tr key={idx} className="border-b"><td className="py-1">{item.productName}</td><td className="text-center py-1">{item.quantity}</td><td className="text-right py-1">Rs. {item.total}</td></tr>))}</tbody>
            </table>
            <div className="border-t pt-3 space-y-1">
              <div className="flex justify-between font-semibold"><span>Total:</span><span>Rs. {selectedBill.totalAmount}</span></div>
              <div className="flex justify-between text-green-600"><span>Cash:</span><span>Rs. {selectedBill.cashReceived}</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Balance:</span><span>Rs. {selectedBill.balance}</span></div>
            </div>
            <div className="text-center mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 font-medium">Powered by NomiTec</p>
              <p className="text-xs text-gray-400 mt-1 italic">⚠️ This bill was printed by the customer, not by admin.</p>
            </div>
            <div className="flex gap-3 mt-4 no-print">
              <button onClick={() => window.print()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">🖨️ Print Bill</button>
              <button onClick={() => setSelectedBill(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}