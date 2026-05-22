import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ShoppingCart, Search, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils.ts';

export default function Navbar() {
  const itemCount = useCartStore((state) => state.itemCount());
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl flex justify-between items-center px-12 py-6 max-w-none mx-auto tonal-transition bg-gradient-to-b from-surface to-transparent shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-headline italic tracking-tighter text-primary">
          JaseerGems
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link to="/shop" className="text-on-surface hover:text-primary transition-colors font-headline font-light tracking-tight">Shop</Link>
          <Link to="/about" className="text-on-surface-variant hover:text-primary transition-colors font-headline font-light tracking-tight">About</Link>
          <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors font-headline font-light tracking-tight">Contact</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="text-primary/80 hover:text-primary transition-colors font-headline font-semibold tracking-tight">Admin</Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-6 text-primary">
        <button className="hover:opacity-80 transition-opacity duration-300 active:scale-90 transition-transform">
          <Search size={20} />
        </button>
        <Link to="/cart" className="relative hover:opacity-80 transition-opacity duration-300 active:scale-90 transition-transform">
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/account" className="hover:opacity-80 transition-opacity" title="My Account">
              <User size={20} />
            </Link>
          </div>
        ) : (
          <Link to="/login" className="hover:opacity-80 transition-opacity">
            <User size={20} />
          </Link>
        )}
      </div>
    </nav>
  );
}
