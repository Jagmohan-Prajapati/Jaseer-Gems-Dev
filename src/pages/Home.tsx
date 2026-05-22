import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Verified, RotateCcw, Lock, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/utils.ts';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  caratWeight: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?featured=true')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Extreme close-up of emerald" 
            className="w-full h-full object-cover opacity-60 scale-105" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA-aS2ITjSoafuWSJV0iOui5t3clqQgqVSOSh_rurKdY2-EWjWcDG7nz-KmDjwqrJ0FKKTkq_9EZTwxB6xtv5E9bW3pFlbJm83tUQTITWN0HNWfYl9GrShrz61qNC7wtRLhBABwvvtXhvBZw7gk9IsDp0WD34UaYkSN2QxWLpYiQDsDbojtCZZ0YqpODiAWWwfXV5nztqaDpF1hfuiNqOvmCDIRSJ8Ln7n2LMhd2HgfoQAUBsHhrk5UTqU5ZiwMrm5iZau7RFmg3oP" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface/40"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-headline text-6xl md:text-8xl text-primary font-light italic tracking-tight mb-6"
          >
            Where Every Gem Tells a Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-body text-on-surface-variant text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-12"
          >
            Hand-selected treasures from the heart of Jaipur, curated for those who appreciate the eternal dance of light and stone.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/shop" className="bg-primary text-on-primary px-10 py-4 font-label uppercase tracking-[0.2em] text-sm font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(230,195,100,0.2)] active:scale-95 inline-block">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-surface-container-low py-12 relative">
        <div className="max-w-6xl mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center gap-4">
            <Verified className="text-primary" size={32} />
            <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface">100% Certified</span>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <RotateCcw className="text-primary" size={32} />
            <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface">Free Returns</span>
          </div>
          <div className="flex flex-col items-center text-center gap-4">
            <Lock className="text-primary" size={32} />
            <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface">Secure Payment</span>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-surface py-24">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex flex-col items-center mb-16">
            <h2 className="font-headline text-4xl text-on-surface mb-4">Curated Collections</h2>
            <div className="gem-facet-divider"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            <CategoryCard 
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuDOyRYyu0M7jYqDfpAUVHWG7E5oMVcvab0MUcIue4HGDDsNYe0eTxKl3sETuKhsX9_S2y6eYuBR3p7RqFXftExDvLLYU3WcKGMOIIrBxgdEUWP7_rkaRWF1Sn7cRfTAC25Pq8MveItmnUlFt9SfDsPUrL_OURGyJHSTrx-QBwmRIsuN6_KTFawDWheU_Vdrj7t1ydCcFpRJxKLePlXJL2aod_teIQ4t3KIh654KzF7pvnanouHeFg73fkk4VwYGbFlBxMSpq0qJ67k0"
              title="Rings"
              link="/shop?category=Rings"
            />
            <CategoryCard 
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuB0VuieOMltOYfWaneYxrgCPSnWXwFQg79ci8PzZfHsTjQpxbjlrjrUfCzQ6R69zjt2rl6AYqtregqDWsrQtqjW3pkVwweTunD1DilmbJILhVwFMNU_a6qQQ8KcqJBQ9D__gLylhIMhv49e1ksgIiZxde6IVi60LhzGZk4AaLYW-3yEmPhwnqqVns2ixLYs5jxtDm6nZXF7oqLp0yaZF30ojVLoQa1dIMmE2qPSzRAvV19DhsP1idX6KRFjR34P_BsAgfrJYZpWYWFp"
              title="Necklaces"
              link="/shop?category=Necklaces"
            />
            <CategoryCard 
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuCiO-hHAfy-mltwHg40gsr-NnGsuinuqp6InDQ0AtQqChbYRjvThBIrtcjfUGDovkQcR5yc2b100QotooZymaVMUKebYYpHM8FfLQ5CErturRoCtvlp9CucclIQavmDGu1ZiHME-VkKeUJuMfqBHB4IJKDw2cD8JW6IUmFOkEWOQ91-70XVztBsy22KVfOWPfmKbYrFl_vUPLyU_IOr_vueFocvRBkKLmscc0O2FTQaAJt6_A-X4yh_-BNib5AgA_MK4lxxkItw9rfE"
              title="Raw Stones"
              link="/shop?category=Raw Stones"
            />
            <CategoryCard 
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuBaMY6yOVwXFUItFrAGexmBL0E6q6lBtRkiqLzDYDK8-HOeLlFCnd-XR7shGunm2Ov0hem7UH3hnyyVmjAPHxeF9u2IsULD7ws-tZtVK9dGytMvKVkr-vRXzi08iVS2zxPWf5-H3_OsE_VoMfW3aIQQDXRceLFaS82CV8Dq-GpT8AFIohKwOGKIyhrjchVX4Sggb9-JEO-GuyzotaElblHAwctZPMS_TDhxigScDM0QDk97s4Ma6VmucLCjxCTiIv9lfypBowZapGxE"
              title="Birthstones"
              link="/shop?category=Birthstones"
            />
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="bg-surface-container-low py-24">
        <div className="max-w-7xl mx-auto px-12">
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="font-label text-xs uppercase tracking-[0.3em] text-primary mb-2 block">The Seasonal Edit</span>
              <h2 className="font-headline text-5xl text-on-surface">New Arrivals</h2>
            </div>
            <Link to="/shop" className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors border-b border-outline-variant">
              View All Pieces
            </Link>
          </div>
             {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-headline text-2xl text-on-surface-variant">Coming Soon — check back shortly</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Collection Highlight */}
      <section className="bg-surface py-24">
         <div className="max-w-7xl mx-auto px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group overflow-hidden rounded-xl">
                 <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa3vnDJx5hGEcrOK-rpHPu1tT-VbiNYbgkXjotR9g22CFzUjo2_DW7wSLrbmmjIQF9tm_HIKvoND5j5Q952uicDTVzqsRBoiJAostwRCJY0b5i-k1wzRF4Rtu_MmPKPc_isse_403urdUdSgUsAELb5cae30wAeJ5byNnbxQDOqpPlvVsy0ItEeJ0Oe0mK1OiSUqbpDitDXl8NADY-tX3zwJbgE3gTb31uiGxrLDRM815-Ir7liKo1zeXP53pyvxkgEGHAkIWuej3T" 
                    alt="Ceylon Sapphire"
                    className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent flex items-end p-12">
                    <div className="w-full h-px bg-primary/20 absolute bottom-0 left-0"></div>
                 </div>
              </div>
              <div className="space-y-8">
                 <span className="font-label text-xs uppercase tracking-[0.4em] text-primary">Masterpiece Spotlight</span>
                 <h2 className="font-headline text-5xl md:text-7xl text-on-surface italic leading-tight">The Blue Sapphire Reserve</h2>
                 <p className="font-body text-on-surface-variant text-lg font-light leading-relaxed">
                    Sourced from the historic Ratnapura mines, our current collection features rare cornflower blue sapphires with exceptional internal fire. Each stone is appraised by our head curator in Jaipur.
                 </p>
                 <Link to="/shop?stoneType=Sapphire" className="flex items-center gap-4 text-primary font-label text-xs uppercase tracking-[0.2em] group">
                    Explore Collection <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
                 </Link>
              </div>
            </div>
         </div>
      </section>
    </div>
  );
}

function CategoryCard({ image, title, link }: { image: string, title: string, link: string }) {
  return (
    <Link to={link} className="group flex flex-col items-center gap-6">
      <div className="relative w-48 h-48 rounded-full overflow-hidden border border-outline-variant/20 p-2 group-hover:border-primary transition-colors">
        <img alt={title} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-700" src={image} />
      </div>
      <div className="text-center">
        <h3 className="font-headline text-2xl text-on-surface group-hover:text-primary transition-colors">{title}</h3>
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary underline underline-offset-8">Browse</span>
      </div>
    </Link>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group bg-surface-container-high rounded-lg overflow-hidden transition-all duration-500"
    >
      <Link to={`/shop/${product.id}`} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-surface-container-low">
          {product.images?.[0] ? (
            <img 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              src={product.images[0]} 
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-primary/20">
               <span className="material-symbols-outlined text-6xl">diamond</span>
             </div>
          )}
        </div>
      </Link>
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-2">
          <Link to={`/shop/${product.id}`}>
            <h3 className="font-headline text-xl text-on-surface hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <div className="flex justify-between items-center">
            <p className="font-body text-primary text-sm tracking-widest font-semibold">{formatPrice(product.price)}</p>
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">{product.caratWeight} CT</span>
          </div>
        </div>
        <Link 
          to={`/shop/${product.id}`}
          className="w-full py-3 bg-transparent border border-outline-variant text-on-surface font-label text-[10px] uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all text-center block"
        >
          View Piece
        </Link>
      </div>
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-surface-container-high rounded-lg overflow-hidden animate-pulse border border-outline-variant/10">
      <div className="aspect-[4/5] bg-surface-container-highest"></div>
      <div className="p-5 space-y-4">
        <div className="h-3 w-20 bg-surface-container-highest rounded"></div>
        <div className="h-5 w-3/4 bg-surface-container-highest rounded"></div>
        <div className="h-3 w-2/3 bg-surface-container-highest rounded"></div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-20 bg-surface-container-highest rounded"></div>
          <div className="h-4 w-24 bg-surface-container-highest rounded"></div>
        </div>
      </div>
    </div>
  );
}