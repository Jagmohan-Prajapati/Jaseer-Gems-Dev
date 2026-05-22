import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, List, ChevronLeft, ChevronRight, X, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, cn } from '../lib/utils.ts';
import { useSearchParams } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  caratWeight: number;
  origin: string;
  stoneType: string;
  stoneColor: string;
}

const COLORS = ["Red", "Blue", "Green", "Yellow", "Purple", "Pink", "White", "Black", "Orange"];

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filters
  const [stoneColor, setStoneColor] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [caratRange, setCaratRange] = useState({ min: '', max: '' });
  const [sort, setSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const [searchParams] = useSearchParams();

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      sort,
    });
    if (stoneColor.length > 0) params.append('stoneColor', stoneColor.join(','));
    if (priceRange.min) params.append('minPrice', priceRange.min);
    if (priceRange.max) params.append('maxPrice', priceRange.max);
    if (caratRange.min) params.append('minCarat', caratRange.min);
    if (caratRange.max) params.append('maxCarat', caratRange.max);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // On mount — read ?search= from URL
  useEffect(() => {
    const term = searchParams.get('search');
    if (term) setSearchQuery(term);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, stoneColor, sort, searchQuery]);

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setStoneColor([]);
    setPriceRange({ min: '', max: '' });
    setCaratRange({ min: '', max: '' });
    setPage(1);
    fetchProducts();
  };

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto">
      <header className="mb-16">
        <nav className="flex mb-4 items-center space-x-2 text-xs uppercase tracking-[0.2em] font-light text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-outline-variant">/</span>
          <span className="text-primary">Shop</span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl md:text-7xl font-light tracking-tight text-on-surface">Curated Collection</h1>
            <p className="text-on-surface-variant mt-4 font-light text-lg">A sanctuary of rare earth and light.</p>
          </div>
          <div className="text-sm font-medium tracking-widest uppercase text-on-surface-variant">
            {total} Products
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-10 shrink-0">
          <section>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs uppercase tracking-[0.15em] font-bold text-primary">Filters</h3>
               {(stoneColor.length > 0 || priceRange.min || priceRange.max) && (
                 <button onClick={clearFilters} className="text-[10px] uppercase text-on-surface-variant hover:text-primary">Clear All</button>
               )}
            </div>
            
            <div className="space-y-8">
              {/* Stone Color */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">Stone Color</h4>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setStoneColor(prev => 
                          prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                        );
                        setPage(1);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all border",
                        stoneColor.includes(color) 
                          ? "bg-primary text-on-primary border-primary" 
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:border-primary"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">Price Range (USD)</h4>
                <form onSubmit={handlePriceSubmit} className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={priceRange.min}
                      onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full bg-surface-container-low border-b border-outline-variant/30 text-xs py-2 outline-none focus:border-primary transition-colors"
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={priceRange.max}
                      onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full bg-surface-container-low border-b border-outline-variant/30 text-xs py-2 outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button type="submit" className="hidden">Apply</button>
                </form>
              </div>

              {/* Carat Weight */}
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-4">Carat Weight</h4>
                <form onSubmit={handlePriceSubmit} className="flex gap-2">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Min" 
                    value={caratRange.min}
                    onChange={e => setCaratRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 text-xs py-2 outline-none focus:border-primary transition-colors"
                  />
                  <input 
                    type="number" 
                    step="0.01"
                     placeholder="Max" 
                    value={caratRange.max}
                    onChange={e => setCaratRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full bg-surface-container-low border-b border-outline-variant/30 text-xs py-2 outline-none focus:border-primary transition-colors"
                  />
                </form>
              </div>
            </div>
          </section>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-8 border-b border-outline-variant/10">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setView('grid')}
                  className={cn("p-2 transition-colors", view === 'grid' ? "text-primary bg-surface-container-high" : "text-on-surface-variant hover:text-primary")}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={cn("p-2 transition-colors", view === 'list' ? "text-primary bg-surface-container-high" : "text-on-surface-variant hover:text-primary")}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            {/* Search input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Search gems..."
                className="bg-surface-container-low border border-outline-variant/20 rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none transition-colors w-48"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="mt-4 sm:mt-0 relative group">
              <select 
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="bg-transparent border-none text-sm font-light text-on-surface-variant focus:ring-0 cursor-pointer appearance-none pr-8 outline-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(stoneColor.length > 0 || priceRange.min || priceRange.max || caratRange.min || caratRange.max) && (
            <div className="flex flex-wrap gap-2 mb-8">
               {stoneColor.map(color => (
                 <Chip key={color} label={color} onRemove={() => setStoneColor(prev => prev.filter(c => c !== color))} />
               ))}
               {priceRange.min && <Chip label={`Min: $${priceRange.min}`} onRemove={() => setPriceRange(p => ({ ...p, min: '' }))} />}
               {priceRange.max && <Chip label={`Max: $${priceRange.max}`} onRemove={() => setPriceRange(p => ({ ...p, max: '' }))} />}
               {caratRange.min && <Chip label={`Min: ${caratRange.min} CT`} onRemove={() => setCaratRange(p => ({ ...p, min: '' }))} />}
               {caratRange.max && <Chip label={`Max: ${caratRange.max} CT`} onRemove={() => setCaratRange(p => ({ ...p, max: '' }))} />}
               {searchQuery && <Chip label={`Search: ${searchQuery}`} onRemove={() => { setSearchQuery(''); setPage(1); }} />}
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-surface-container-high rounded-lg overflow-hidden animate-pulse h-96"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={cn(
               view === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                : "flex flex-col gap-6"
            )}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <p className="font-headline text-3xl text-on-surface-variant italic">No pieces found matching your criteria.</p>
              <button onClick={clearFilters} className="mt-4 text-primary underline underline-offset-8 font-label text-xs uppercase tracking-widest">Clear all filters</button>
            </div>
          )}

          {/* Pagination */}
          {total > products.length && (
            <div className="mt-20 flex justify-center items-center gap-6">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                {[...Array(Math.ceil(total / 12))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-sm font-bold transition-all rounded",
                      page === i + 1 ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Chip({ label, onRemove }: { label: string, onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-on-surface">
      {label}
      <button onClick={onRemove} className="hover:text-primary"><X size={12} /></button>
    </div>
  );
}

function ProductCard({ product, view }: { product: Product, view: 'grid' | 'list' }) {
  return (
    <motion.article 
      layout
      className={cn(
        "group bg-surface-container-high rounded-lg overflow-hidden transition-all duration-500 hover:bg-surface-container-highest hover:shadow-[0_20px_40px_rgba(2,15,30,0.6)] border border-transparent hover:border-primary/20",
        view === 'list' && "flex flex-col md:flex-row"
      )}
    >
      <Link to={`/shop/${product.id}`} className={cn(view === 'grid' ? "block" : "w-full md:w-64")}>
        <div className={cn("relative overflow-hidden bg-surface-container-low", view === 'grid' ? "aspect-[4/5]" : "h-full md:h-64")}>
          {product.images?.[0] ? (
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              src={product.images[0]} 
              alt={product.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/10">
              <span className="material-symbols-outlined text-6xl">diamond</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <Link to={`/shop/${product.id}`}>
              <h3 className="font-headline text-xl text-on-surface tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
            </Link>
            <span className="text-[10px] tracking-widest text-on-surface-variant uppercase bg-surface-container/50 px-2 py-0.5 rounded">{product.caratWeight}ct</span>
          </div>
          <p className="text-sm font-light text-on-surface-variant mb-6 italic">{product.origin} Origin, {product.stoneType}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary font-body tracking-tight">{formatPrice(product.price)}</span>
          <Link 
            to={`/shop/${product.id}`}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary bg-primary px-4 py-2 rounded-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Explore Piece
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
