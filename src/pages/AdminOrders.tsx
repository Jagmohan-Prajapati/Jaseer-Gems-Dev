import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, Filter, CheckCircle2, Truck, Package, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar.tsx';
import { formatPrice, cn } from '../lib/utils.ts';

interface Order {
  id: string;
  total: number;
  status: string;
  isPaid: boolean;
  trackingId?: string;
  trackingUrl?: string;
  createdAt: string;
  user: { email: string };
  shippingAddress: any;
  items: any[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = await res.json();
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const updateOrderStatus = async (id: string, updates: any) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    fetchOrders();
    if (selectedOrder?.id === id) {
       setSelectedOrder({ ...selectedOrder, ...updates });
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-surface min-h-screen">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 md:p-12 relative">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="font-headline text-5xl text-on-surface italic">Acquisitions</h1>
            <p className="text-on-surface-variant font-light mt-2 uppercase tracking-widest text-[10px]">Processing global heritage orders</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="ID or Email..." 
                  className="bg-surface-container-low border border-outline-variant/10 rounded-full py-3 pl-12 pr-6 text-sm text-on-surface outline-none focus:border-primary transition-all w-full md:w-64"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
             <div className="bg-surface-container-low border border-outline-variant/10 rounded-full p-1 flex">
               {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map(s => (
                 <button 
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[9px] uppercase tracking-widest font-bold transition-all",
                    statusFilter === s ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"
                  )}
                 >
                   {s === 'ALL' ? 'All' : s.toLowerCase()}
                 </button>
               ))}
             </div>
          </div>
        </header>

        <section className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-surface-container-high/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Acquisition ID</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Patron</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Date</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold text-center">Payment</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Status</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold text-right">Value</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/5">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-container-highest/20 transition-colors">
                      <td className="px-8 py-6 font-mono text-primary text-sm">#{o.id.slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-6 text-sm text-on-surface">{o.user.email}</td>
                      <td className="px-8 py-6 text-sm text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-center">
                         {o.isPaid ? (
                           <span className="text-primary"><CheckCircle2 size={16} className="inline" /></span>
                         ) : (
                           <span className="text-on-surface-variant opacity-40 italic text-[10px] uppercase">Unpaid</span>
                         )}
                      </td>
                      <td className="px-8 py-6">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                           o.status === 'DELIVERED' ? "bg-primary/20 text-primary" : "bg-outline-variant/20 text-on-surface-variant"
                         )}>
                           {o.status}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right font-medium text-on-surface">{formatPrice(o.total)}</td>
                      <td className="px-8 py-6 text-right">
                         <button onClick={() => setSelectedOrder(o)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"><Eye size={18} /></button>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        </section>

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
               <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="absolute inset-0 bg-surface/80 backdrop-blur-md"
               ></motion.div>
               <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-4xl bg-surface-container-low rounded-2xl shadow-3xl overflow-hidden border border-outline-variant/10"
               >
                 <div className="p-12 max-h-[90vh] overflow-y-auto">
                    <header className="flex justify-between items-start mb-12">
                       <div>
                          <h2 className="font-headline text-4xl text-on-surface italic">Acquisition Dossier</h2>
                          <p className="text-primary font-mono text-xs mt-2 uppercase tracking-widest">ID: #{selectedOrder.id}</p>
                       </div>
                       <div className="flex gap-4">
                          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
                            <button 
                              key={s}
                              onClick={() => updateOrderStatus(selectedOrder.id, { status: s })}
                              className={cn(
                                "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all",
                                selectedOrder.status === s ? "bg-primary text-on-primary border-primary" : "border-outline-variant/30 text-on-surface-variant hover:border-primary"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                       </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-outline-variant/10 pb-12 mb-12">
                       <section className="space-y-6">
                          <div className="flex items-center gap-3 text-primary">
                             <Package size={20} />
                             <h4 className="text-[10px] uppercase tracking-widest font-bold">Content</h4>
                          </div>
                          <div className="space-y-4">
                             {selectedOrder.shippingAddress.name}
                             <div className="text-xs text-on-surface-variant">
                                {selectedOrder.shippingAddress.address1}<br />
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                                {selectedOrder.shippingAddress.country}
                             </div>
                          </div>
                       </section>
                       <section className="space-y-6">
                          <div className="flex items-center gap-3 text-primary">
                             <Truck size={20} />
                             <h4 className="text-[10px] uppercase tracking-widest font-bold">Tracking Orchestration</h4>
                          </div>
                          <div className="space-y-4">
                             <input 
                              type="text" 
                              placeholder="Tracking ID" 
                              value={selectedOrder.trackingId || ''}
                              onChange={e => updateOrderStatus(selectedOrder.id, { trackingId: e.target.value })}
                              className="w-full bg-surface-container-high border-b border-outline-variant/20 p-3 text-xs text-on-surface outline-none focus:border-primary"
                             />
                             <input 
                              type="text" 
                              placeholder="Tracking URL" 
                              value={selectedOrder.trackingUrl || ''}
                              onChange={e => updateOrderStatus(selectedOrder.id, { trackingUrl: e.target.value })}
                              className="w-full bg-surface-container-high border-b border-outline-variant/20 p-3 text-xs text-on-surface outline-none focus:border-primary"
                             />
                          </div>
                       </section>
                    </div>

                    <footer className="flex justify-between items-end">
                       <button onClick={() => setSelectedOrder(null)} className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-bold">
                          <X size={14} /> Close Dossier
                       </button>
                       <div className="text-right">
                          <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Total Acquisition Value</p>
                          <p className="text-4xl font-headline text-primary">{formatPrice(selectedOrder.total)}</p>
                       </div>
                    </footer>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
