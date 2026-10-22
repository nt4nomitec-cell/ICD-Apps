import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default function OnlineOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Naye orders sab se upar dikhane ke liye sort karein
      ordersList.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(ordersList);
    } catch (error) {
      console.error("Orders load karne mein error:", error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      fetchOrders(); // List refresh karein
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Kya aap is order ko delete karna chahte hain?')) {
      try {
        await deleteDoc(doc(db, "orders", id));
        fetchOrders();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading online orders...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Online Orders (App se)</h2>
      
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-10 bg-white rounded-xl border">Abhi koi online order nahi aaya.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border p-4">
              {/* Customer Info */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{order.customerName}</h3>
                  <p className="text-sm text-gray-500">📞 {order.customerPhone}</p>
                  <p className="text-sm text-gray-500">📍 {order.customerAddress}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : ''}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {order.status}
                </span>
              </div>
              
              {/* Items List */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1 border-b last:border-0">
                    <span>{item.name} x {item.qty}</span>
                    <span className="font-medium">Rs. {item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              {/* Total & Actions */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">Rs. {order.totalAmount}</span>
              </div>

              <div className="flex gap-2">
                {order.status !== 'Completed' && (
                  <button onClick={() => handleStatusChange(order.id, 'Completed')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700">
                    ✅ Mark Completed
                  </button>
                )}
                <button onClick={() => handleDelete(order.id)} className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-200">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}