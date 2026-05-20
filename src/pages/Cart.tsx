import { useCartStore } from '../store/cartStore.ts';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Verified } from 'lucide-react';
import { formatPrice } from '../lib/utils.ts';
import { useAuth } from '../context/AuthContext.tsx';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, grandTotal, shipping } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-48 h-48 mb-8"
        >
          <div className="absolute inset-0 border-2 border-primary/20 rotate-45 rounded-xl"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <ShoppingBag className="text-primary/40" size={64} />
          </div>
        </motion.div>
        <h2 className="text-4xl font-headline italic text-on-surface mb-4">Your cart is empty</h2>
        <p className="text-on-surface-variant max-w-xs mx-auto mb-12 font-light">
          Experience the brilliance of our latest gemstone collections from the heart of Jaipur.
        </p>
        <Link to="/shop" className="bg-primary text-on-primary px-10 py-4 rounded-full text-[12px] font-label uppercase tracking-widest font-bold hover:opacity-90 transition-opacity">
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <header className="mb-16 text-center md:text-left">
        <h1 className="text-5xl md:text-6xl font-headline italic text-primary leading-tight tracking-tight">
          Your Cart <span className="text-on-surface-variant font-light not-italic text-3xl ml-4">({items.length} Items)</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Item List */}
        <div className="lg:col-span-8 space-y-12">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div 
                key={item.productId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col md:flex-row items-start gap-8 group"
              >
                <div className="w-full md:w-48 aspect-square overflow-hidden bg-surface-container-high rounded-lg relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    src={item.image} 
                    alt={item.name}
                  />
                </div>
                <div className="flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-headline text-on-surface">{item.name}</h3>
                      <p className="text-sm text-on-surface-variant font-light tracking-wide mt-1">Authentic Piece • Secured Shipping</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="text-on-surface-variant hover:text-error transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-end justify-between gap-6 pt-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Quantity</span>
                      <div className="flex items-center bg-surface-container rounded-full border border-outline-variant/20 px-4 py-2 space-x-6">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="text-primary hover:text-white transition-colors text-xl font-light disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQty}
                          className="text-primary hover:text-white transition-colors text-xl font-light disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-1">Price</span>
                      <div className="text-2xl font-headline text-primary">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary Panel */}
        <aside className="lg:col-span-4">
          <div className="bg-surface-container-low p-8 rounded-xl shadow-2xl shadow-surface-container-lowest/40 sticky top-32 border border-outline-variant/10">
            <h2 className="text-2xl font-headline text-on-surface mb-8 italic">Order Summary</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-on-surface font-medium">{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Shipping</span>
                {shipping() === 0 ? (
                  <span className="text-primary font-medium">FREE</span>
                ) : (
                  <span className="text-on-surface font-medium">{formatPrice(shipping())}</span>
                )}
              </div>
              
              <div className="h-[1px] bg-outline-variant/10 my-8"></div>
              
              <div className="flex justify-between items-baseline">
                <span className="text-xl font-headline italic">Total</span>
                <span className="text-3xl font-headline text-primary">{formatPrice(grandTotal())}</span>
              </div>

              <div className="pt-8 space-y-4">
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary text-on-primary font-label py-5 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all text-sm"
                >
                  Proceed to Checkout
                </button>
                <Link to="/shop" className="block w-full text-center py-3 text-[11px] font-label uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>

            <div className="mt-12 p-4 bg-surface-container rounded-lg flex items-start gap-4">
              <Verified className="text-primary flex-shrink-0" size={20} />
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Includes complimentary JaseerGems Jaipur certification and secured, insured global shipping.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
