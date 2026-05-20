import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Check, Truck, ShieldCheck, Mail, MapPin, ExternalLink } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils.ts';

interface Order {
  id: string;
  total: number;
  status: string;
  shippingAddress: any;
  items: any[];
  trackingId?: string;
  trackingUrl?: string;
  createdAt: string;
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-40 text-center text-primary uppercase font-label tracking-widest text-xs">Finalizing Records...</div>;
  if (!order) return <div className="pt-40 text-center font-headline text-4xl">Order not found</div>;

  const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.status);

  return (
    <main className="min-h-screen pt-32 pb-24 px-6 flex flex-col items-center max-w-4xl mx-auto">
      {/* Header & Success Animation */}
      <div className="text-center mb-16 space-y-6">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 rounded-full border-2 border-primary flex items-center justify-center relative z-10"
          >
            <Check className="text-primary" size={48} />
          </motion.div>
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-headline font-light tracking-tight text-primary">Order Placed Successfully!</h1>
          <p className="font-label text-sm uppercase tracking-[0.2em] text-on-surface-variant">Order ID: #{order.id.slice(-6).toUpperCase()}</p>
          <div className="flex items-center justify-center space-x-2 text-primary pt-2">
            <Truck size={14} />
            <span className="text-sm font-medium tracking-wide">Estimated Delivery: 5–7 Business Days</span>
          </div>
        </div>
      </div>

      {/* Delivery Timeline */}
      <div className="w-full max-w-2xl mb-16 px-4">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/30 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-[2px] bg-primary -translate-y-1/2 z-0 shadow-[0_0_10px_rgba(230,195,100,0.4)] transition-all duration-1000" 
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((s, i) => (
            <div key={s} className="relative z-10 flex flex-col items-center space-y-3">
              <div className={cn(
                "w-4 h-4 rounded-full ring-4 ring-surface",
                i <= currentStepIndex ? "bg-primary" : "bg-outline-variant"
              )}></div>
              <span className={cn(
                "text-[10px] uppercase tracking-widest font-bold",
                i <= currentStepIndex ? "text-primary" : "text-on-surface-variant"
              )}>
                {s.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Info if available */}
      {order.trackingId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 bg-primary/5 p-6 rounded-xl border border-primary/20 w-full flex justify-between items-center"
        >
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1">Live Tracking</p>
            <p className="text-on-surface font-headline italic text-xl">Courier ID: {order.trackingId}</p>
          </div>
          {order.trackingUrl && (
            <a 
              href={order.trackingUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all"
            >
              Track Package <ExternalLink size={14} />
            </a>
          )}
        </motion.div>
      )}

      {/* Order Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <div className="bg-surface-container-high rounded-xl p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-primary">Items</h4>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-6">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-lowest">
                  <img className="w-full h-full object-cover" src={item.product?.images?.[0]} alt={item.product?.name} />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-headline text-lg text-on-surface italic">{item.product?.name}</h3>
                  <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{item.product?.caratWeight} CT • {item.product?.origin}</p>
                  <p className="text-xs text-on-surface-variant mt-2">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-between items-end border-t border-outline-variant/10 pt-6">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Total Amount</span>
            <span className="text-2xl font-headline text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-primary">
              <MapPin size={18} />
              <h4 className="text-[10px] uppercase tracking-widest font-bold">Shipping Address</h4>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-headline text-on-surface">{order.shippingAddress.name}</p>
              <div className="text-sm text-on-surface-variant font-light space-y-1 leading-relaxed">
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-outline-variant/10 pt-6">
            <div className="flex items-center space-x-3 text-primary">
              <ShieldCheck size={18} />
              <h4 className="text-[10px] uppercase tracking-widest font-bold">Authenticity</h4>
            </div>
            <p className="text-xs text-on-surface-variant mt-4 font-light leading-relaxed">
              Our curators have verified the gemstone facets and origin. Your certificate will be issued within 24 hours via email.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Link to="/shop" className="flex-1 bg-primary text-on-primary py-5 px-8 rounded-lg text-center font-label text-[10px] uppercase tracking-[0.2em] font-bold gold-shimmer hover:opacity-90 transition-all active:scale-95">
          Continue Shopping
        </Link>
        <Link to="/profile" className="flex-1 border border-outline-variant/30 text-primary py-5 px-8 rounded-lg text-center font-label text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-surface-container-highest transition-all active:scale-95">
          View My Orders
        </Link>
      </div>
    </main>
  );
}
