import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Diamond, ShoppingBag, Settings, LogOut, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useAuth } from '../context/AuthContext.tsx';

export default function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Inventory', icon: <Diamond size={20} />, path: '/admin/products' },
    { name: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
  ];

  return (
    <aside className="w-64 h-screen bg-surface-container-low border-r border-outline-variant/10 fixed left-0 top-0 z-40 hidden md:flex flex-col p-8">
      <div className="mb-12">
        <Link to="/" className="font-headline text-2xl text-primary flex items-center gap-2">
          JaseerGems Admin
        </Link>
      </div>

      <nav className="flex-grow space-y-4">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-lg font-label text-[10px] uppercase tracking-[0.2em] transition-all",
              location.pathname === item.path 
                ? "bg-primary text-on-primary shadow-lg shadow-primary/10" 
                : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
            )}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="pt-8 border-t border-outline-variant/10 space-y-4">
        <Link to="/" className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:text-primary transition-colors font-label text-[10px] uppercase tracking-widest">
          <ExternalLink size={20} />
          Storefront
        </Link>
        <button onClick={() => logout()} className="flex items-center gap-4 px-4 py-3 text-on-surface-variant hover:text-error transition-colors w-full font-label text-[10px] uppercase tracking-widest">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
