import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ShoppingBag, Package, DollarSign, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar.tsx';
import { formatPrice, cn } from '../lib/utils.ts';

interface Stats {
  totalActiveProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { email: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/orders?limit=5')
        ]);
        setStats(await statsRes.json());
        setRecentOrders(await ordersRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex bg-surface min-h-screen">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 md:p-12">
        <header className="mb-12">
          <h1 className="font-headline text-5xl text-on-surface italic">Overview</h1>
          <p className="text-on-surface-variant font-light mt-2 uppercase tracking-widest text-[10px]">Real-time operational intelligence</p>
        </header>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard 
            title="Total Revenue" 
            value={stats ? formatPrice(stats.totalRevenue) : "..."} 
            icon={<DollarSign size={24} />} 
            trend="+12%" 
            up={true} 
          />
          <StatCard 
            title="Active Inventory" 
            value={stats ? stats.totalActiveProducts : "..."} 
            icon={<Package size={24} />} 
            trend="+2" 
            up={true} 
          />
          <StatCard 
            title="Total Orders" 
            value={stats ? stats.totalOrders : "..."} 
            icon={<ShoppingBag size={24} />} 
            trend="+5.4%" 
            up={true} 
          />
          <StatCard 
            title="Pending Actions" 
            value={stats ? stats.pendingOrders : "..."} 
            icon={<Clock size={24} />} 
            trend="-3" 
            up={false} 
          />
        </div>

        {/* Recent Orders Table */}
        <section className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="font-headline text-2xl text-on-surface">Recent Acquisitions</h3>
            <button className="text-[10px] uppercase tracking-widest text-primary border-b border-primary/20 pb-1">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-surface-container-high/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Order ID</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Patron</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Status</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Date</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold text-right">Value</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-container-highest/20 transition-colors">
                      <td className="px-8 py-6 text-sm font-mono text-primary">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-6 text-sm text-on-surface">{order.user.email}</td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                          order.status === 'DELIVERED' ? "bg-primary/20 text-primary" : "bg-surface-container-highest text-on-surface-variant"
                        )}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6 text-sm text-right font-medium text-on-surface">{formatPrice(order.total)}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend, up }: { title: string, value: string | number, icon: React.ReactNode, trend: string, up: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-lg"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-surface-container-high rounded-xl text-primary">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
          up ? "text-primary" : "text-error"
        )}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-1">{title}</p>
        <p className="text-3xl font-headline text-on-surface">{value}</p>
      </div>
    </motion.div>
  );
}
