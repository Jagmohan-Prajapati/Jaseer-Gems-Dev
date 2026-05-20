/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore.ts';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatPrice, cn } from '../lib/utils.ts';
import { ShieldCheck, Truck, ArrowRight, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

declare const Razorpay: any;

export default function Checkout() {
  const { items, grandTotal, subtotal, shipping, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startPayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on server
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
          shippingAddress: formData,
          total: grandTotal(),
        }),
      });
      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error || 'Payment initialization failed');

      // 2. Open Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100,
        currency: "INR",
        name: "JaseerGems",
        description: "Luxury Gemstones Purchase",
        order_id: orderData.razorpayOrderId,
        handler: async (response: any) => {
          // 3. Verify payment on server
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            clearCart();
            navigate(`/order-confirmation/${verifyData.orderId}`);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#e6c364",
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Checkout error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-20 max-w-3xl mx-auto">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/30 -z-10"></div>
          <StepItem num={1} active={step >= 1} label="Shipping" />
          <StepItem num={2} active={step >= 2} label="Payment" />
          <StepItem num={3} active={step >= 3} label="Confirm" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column */}
        <section className="lg:col-span-7 space-y-12">
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header>
                <h1 className="font-headline text-5xl font-light italic tracking-tight text-on-surface mb-4">Shipping Information</h1>
                <div className="w-1 bg-primary h-1 rotate-45 mb-8"></div>
              </header>
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <Input name="name" label="Full Name" value={formData.name} onChange={handleInputChange} required />
                  <Input name="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} required />
                  <Input name="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleInputChange} required className="md:col-span-2" />
                  <Input name="address1" label="Address Line 1" value={formData.address1} onChange={handleInputChange} required className="md:col-span-2" />
                  <Input name="address2" label="Address Line 2 (Optional)" value={formData.address2} onChange={handleInputChange} className="md:col-span-2" />
                  <Input name="city" label="City" value={formData.city} onChange={handleInputChange} required />
                  <Input name="state" label="State" value={formData.state} onChange={handleInputChange} required />
                  <Input name="zip" label="PIN / ZIP" value={formData.zip} onChange={handleInputChange} required />
                </div>
                <button type="submit" className="w-full md:w-auto px-12 py-5 bg-primary text-on-primary font-label text-xs uppercase tracking-[0.2em] font-bold shadow-2xl hover:bg-primary-container transition-all active:scale-95">
                  Continue to Payment
                </button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="font-headline text-5xl font-light italic tracking-tight text-on-surface mb-2">Secure Payment</h1>
                  <p className="text-on-surface-variant font-light">Complete your acquisition with encrypted security.</p>
                </div>
                <button onClick={() => setStep(1)} className="text-[10px] uppercase text-primary tracking-widest border-b border-primary/20 pb-0.5">Edit Shipping</button>
              </header>
              
              <div className="space-y-8">
                <div className="bg-surface-container-high p-8 rounded-xl border border-primary/20 shadow-lg shadow-primary/5">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-widest uppercase">Razorpay Secure Checkout</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Supports Cards, Netbanking, UPI, and Wallets</p>
                      </div>
                   </div>
                   <button 
                    onClick={startPayment}
                    disabled={loading}
                    className="w-full bg-primary text-on-primary py-5 rounded-lg font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                   >
                     {loading ? "Initializing..." : `Pay ${formatPrice(grandTotal())} with Razorpay`}
                     {!loading && <ArrowRight size={18} />}
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/10 flex items-center gap-3">
                      <ShieldCheck className="text-primary" size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-medium">Secured by SSL</span>
                   </div>
                   <div className="p-4 bg-surface-container rounded-lg border border-outline-variant/10 flex items-center gap-3">
                      <Truck className="text-primary" size={20} />
                      <span className="text-[10px] uppercase tracking-widest font-medium">Insured Delivery</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Right Column: Sticky Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-32">
          <div className="bg-surface-container-high p-8 rounded-lg shadow-2xl shadow-surface-container-lowest/40 border border-outline-variant/10">
            <h2 className="font-headline text-2xl mb-8 border-b border-outline-variant/20 pb-4">Order Summary</h2>
            <div className="space-y-6 mb-10 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.productId} className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-surface-container-highest rounded overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-body text-sm font-medium text-on-surface">{item.name}</h3>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-xs font-label uppercase text-on-surface-variant">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium text-primary">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 border-t border-outline-variant/20 pt-6">
              <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-widest text-on-surface-variant">
                <span>Shipping</span>
                <span>{shipping() === 0 ? 'FREE' : formatPrice(shipping())}</span>
              </div>
              <div className="flex justify-between text-lg font-headline text-on-surface border-t border-outline-variant/10 pt-4">
                <span>Total</span>
                <span className="text-primary font-bold">{formatPrice(grandTotal())}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function StepItem({ num, active, label }: { num: number, active: boolean, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
        active 
          ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(230,195,100,0.3)]" 
          : "bg-surface-container-high border border-outline-variant/30 text-on-surface-variant"
      )}>
        {num}
      </div>
      <span className={cn(
        "font-label text-xs uppercase tracking-[0.2em] transition-colors",
        active ? "text-primary" : "text-on-surface-variant"
      )}>
        {label}
      </span>
    </div>
  );
}

function Input({ label, className, ...props }: any) {
  return (
    <div className={cn("relative group", className)}>
      <input 
        placeholder=" "
        className="peer w-full bg-transparent border-0 border-b border-outline-variant/50 py-3 text-on-surface focus:ring-0 focus:border-primary transition-all duration-300 outline-none"
        {...props}
      />
      <label className="absolute left-0 top-3 text-on-surface-variant font-label text-[10px] uppercase tracking-[0.1em] pointer-events-none transition-all duration-300 peer-focus:-top-4 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-4">
        {label}
      </label>
    </div>
  );
}
