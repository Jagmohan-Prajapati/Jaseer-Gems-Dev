import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, cn } from '../lib/utils.ts';
import { useCartStore } from '../store/cartStore.ts';
import { Minus, Plus, ChevronLeft, ChevronRight, Verified, Box, Truck, ShieldCheck, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stoneType: string;
  stoneColor: string;
  caratWeight: number;
  origin: string;
  certification: string;
  stockQty: number;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
        // Fetch related products
        fetch(`/api/products?stoneType=${data.stoneType}&limit=5`)
          .then(res => res.json())
          .then(relatedData => {
            setRelated(relatedData.products?.filter((p: Product) => p.id !== id).slice(0, 4) || []);
          });
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="pt-40 pb-20 flex flex-col items-center justify-center text-primary gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="font-label text-xs uppercase tracking-widest">Searching the archive...</p>
    </div>
  );

  if (!product) return (
    <div className="pt-40 pb-20 text-center">
      <h2 className="font-headline text-4xl text-on-surface">Piece not found</h2>
      <Link to="/shop" className="text-primary underline underline-offset-8 font-label text-xs uppercase tracking-widest mt-8 inline-block">Return to shop</Link>
    </div>
  );

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      quantity,
      maxQty: product.stockQty,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <main className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
      <nav className="flex items-center space-x-3 mb-12 font-label text-xs uppercase tracking-[0.15em] text-on-surface-variant">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="text-[8px] opacity-40">/</span>
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span className="text-[8px] opacity-40">/</span>
        <span className="text-primary">{product.name}</span>
      </nav>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/5] bg-surface-container-low overflow-hidden rounded-lg">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                alt={product.name} 
                className="w-full h-full object-cover" 
                src={product.images[activeImage] || 'https://via.placeholder.com/800x1000?text=No+Image'} 
              />
            </AnimatePresence>
            <div className="absolute top-6 right-6 flex flex-col gap-4">
              <span className="bg-surface-container-highest/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] uppercase tracking-widest text-primary border border-primary/20">
                Unique Piece
              </span>
              <button className="bg-surface-container-highest/80 backdrop-blur-md p-2 rounded-full text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20">
                <Heart size={18} />
              </button>
            </div>
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "aspect-square bg-surface-container-high rounded-lg overflow-hidden border transition-all",
                    activeImage === i ? "border-primary ring-1 ring-primary" : "border-outline-variant/20 hover:border-primary/50"
                  )}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details */}
        <div className="lg:col-span-5 space-y-10">
          <header className="space-y-4">
            <div className="flex items-center space-x-3 text-primary">
              <Verified size={18} />
              <span className="font-label text-[10px] uppercase tracking-[0.2em] font-semibold">
                {product.certification !== 'None' ? `${product.certification} Certified Natural ${product.stoneType}` : `Natural ${product.stoneType}`}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-light tracking-tight text-on-surface leading-[1.1]">
              {product.name}
            </h1>
            <div className="flex items-baseline space-x-6 pt-2">
              <span className="text-3xl font-headline font-medium text-primary">{formatPrice(product.price)}</span>
              {product.stockQty === 0 && (
                 <span className="bg-error/10 text-error text-[10px] uppercase tracking-widest px-3 py-1 rounded">Out of Stock</span>
              )}
            </div>
          </header>

          <div className="grid grid-cols-2 gap-px bg-outline-variant/10 rounded-lg overflow-hidden border border-outline-variant/10">
            <DetailItem label="Carat Weight" value={`${product.caratWeight}ct`} />
            <DetailItem label="Origin" value={product.origin} />
            <DetailItem label="Cut" value={product.stoneType} />
            <DetailItem label="Color" value={product.stoneColor} />
          </div>

          <div className="space-y-8">
            {product.stockQty > 0 && (
              <div className="flex flex-col md:flex-row gap-8">
                <div className="space-y-3 w-32">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block">Quantity</label>
                  <div className="flex items-center justify-between bg-surface-container-high px-3 py-2 border-b border-outline-variant/20">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="text-primary hover:opacity-60"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-on-surface font-medium">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stockQty, q + 1))}
                      className="text-primary hover:opacity-60"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-4 pt-4">
              <button 
                disabled={product.stockQty === 0}
                onClick={handleAddToCart}
                className="w-full py-5 bg-primary text-on-primary font-label text-xs uppercase tracking-[0.2em] font-bold shadow-2xl shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                Add to Cart
              </button>
              <button 
                disabled={product.stockQty === 0}
                onClick={handleBuyNow}
                className="w-full py-5 border border-primary/30 text-primary font-label text-xs uppercase tracking-[0.2em] font-bold hover:bg-primary/5 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>

          <div className="pt-8 flex items-center justify-center space-x-6">
            <div className="gem-facet-divider"></div>
            <p className="font-label text-[9px] uppercase tracking-[0.3em] text-on-surface-variant">Handcrafted in Jaipur</p>
            <div className="gem-facet-divider"></div>
          </div>
        </div>
      </section>

      {/* Description & Tabs */}
      <section className="mt-32">
        <div className="flex border-b border-outline-variant/20 space-x-12 mb-12 overflow-x-auto scrollbar-hide">
          <button className="pb-6 text-primary border-b-2 border-primary font-label text-[11px] uppercase tracking-[0.2em] whitespace-nowrap">Description</button>
          <button className="pb-6 text-on-surface-variant hover:text-on-surface font-label text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors">Specifications</button>
          <button className="pb-6 text-on-surface-variant hover:text-on-surface font-label text-[11px] uppercase tracking-[0.2em] whitespace-nowrap transition-colors">Shipping Info</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-headline text-on-surface italic">The Majesty of the Jaipur Mines</h3>
            <p className="text-on-surface-variant leading-relaxed font-light">
              {product.description}
            </p>
            <p className="text-on-surface-variant leading-relaxed font-light">
              Sourced through sustainable artisanal mining channels in {product.origin}, this {product.stoneType} represents the pinnacle of its class. The {product.caratWeight} carat weight is balanced with a cut that ensures maximum internal fire and brilliance.
            </p>
          </div>
          <div className="bg-surface-container-low p-8 rounded-lg space-y-4">
            <SpecRow label="Stone Type" value={product.stoneType} />
            <SpecRow label="Origin" value={product.origin} />
            <SpecRow label="Certification" value={product.certification} />
            <SpecRow label="Stock Status" value={product.stockQty > 0 ? "In Stock" : "Out of Stock"} />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mt-24 bg-surface-container-low p-12 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <TrustItem icon={<Box size={24} />} title="Insured Shipping" text="Every piece is shipped with full insurance coverage globally." />
           <TrustItem icon={<Truck size={24} />} title="Jaipur Origin" text="Directly sourced from our atelier in the heart of the Pink City." />
           <TrustItem icon={<ShieldCheck size={24} />} title="Secure Checkout" text="Industry-standard encryption for all transactions." />
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-40">
          <div className="flex flex-col items-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-headline text-center text-on-surface">You May Also Like</h2>
            <div className="gem-facet-divider"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map(p => (
              <ProductCardSmall key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-surface-container-low p-5 space-y-1">
      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">{label}</span>
      <p className="text-on-surface font-medium">{value}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
      <span className="text-on-surface-variant text-sm">{label}</span>
      <span className="text-on-surface text-sm">{value}</span>
    </div>
  );
}

function TrustItem({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
     <div className="text-center space-y-4">
        <div className="text-primary flex justify-center">{icon}</div>
        <h4 className="font-label text-xs uppercase tracking-widest font-bold text-on-surface">{title}</h4>
        <p className="text-on-surface-variant text-xs font-light leading-relaxed">{text}</p>
     </div>
  );
}

function ProductCardSmall({ product }: { product: Product }) {
  return (
    <Link to={`/shop/${product.id}`} className="group cursor-pointer space-y-6">
      <div className="relative aspect-[3/4] bg-surface-container-high overflow-hidden rounded-lg">
        {product.images?.[0] ? (
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            src={product.images[0]} 
            alt={product.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/10">
            <span className="material-symbols-outlined text-4xl">diamond</span>
          </div>
        )}
      </div>
      <div className="space-y-2 text-center">
        <h4 className="font-headline text-xl text-on-surface group-hover:text-primary transition-colors">{product.name}</h4>
        <p className="font-label text-[10px] uppercase tracking-widest text-primary">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
