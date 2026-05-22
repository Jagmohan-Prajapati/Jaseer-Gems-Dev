import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Gem, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, cn } from '../lib/utils.ts';

interface SearchResult {
  id: string; name: string; price: number; images: string[];
  stoneType: string; stoneColor: string; caratWeight: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const POPULAR = ['Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Amethyst', 'Pearl'];

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery(''); setResults([]); setSearched(false);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); setSearched(false); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products || []);
        setSearched(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const goToProduct = (id: string) => {
    navigate(`/shop/${id}`);
    onClose();
  };

  const goToShop = (term: string) => {
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) goToShop(query.trim());
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
          >
            <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-2xl shadow-black/50 overflow-hidden">

              {/* Search Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-4 px-6 py-5 border-b border-outline-variant/10">
                <Search size={20} className="text-primary shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search for gems, stones, jewelry..."
                  className="flex-1 bg-transparent text-on-surface text-base placeholder:text-on-surface-variant focus:outline-none"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
                    className="text-on-surface-variant hover:text-on-surface transition-colors">
                    <X size={18} />
                  </button>
                )}
                <button type="button" onClick={onClose}
                  className="text-on-surface-variant hover:text-on-surface transition-colors ml-1 pl-4 border-l border-outline-variant/20">
                  <X size={18} />
                </button>
              </form>

              <div className="max-h-[60vh] overflow-y-auto">

                {/* Loading */}
                {loading && (
                  <div className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                  <div className="p-3">
                    {results.map(product => (
                      <button key={product.id} onClick={() => goToProduct(product.id)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors group text-left">
                        <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><Gem size={16} /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-on-surface text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</p>
                          <p className="text-on-surface-variant text-xs">{product.stoneType} • {product.caratWeight}ct • {product.stoneColor}</p>
                        </div>
                        <p className="text-primary font-semibold text-sm shrink-0">{formatPrice(product.price)}</p>
                        <ArrowRight size={14} className="text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                      </button>
                    ))}

                    {/* View all results link */}
                    <button onClick={() => goToShop(query)}
                      className="w-full flex items-center justify-center gap-2 p-3 mt-1 rounded-xl border border-primary/20 text-primary text-xs uppercase tracking-widest font-bold hover:bg-primary/10 transition-colors">
                      View all results for "{query}" <ArrowRight size={12} />
                    </button>
                  </div>
                )}

                {/* No results */}
                {!loading && searched && results.length === 0 && (
                  <div className="p-10 text-center">
                    <Gem size={36} className="text-on-surface-variant mx-auto mb-3 opacity-30" />
                    <p className="text-on-surface-variant text-sm">No gems found for <span className="text-on-surface">"{query}"</span></p>
                    <p className="text-on-surface-variant text-xs mt-1">Try a different stone name or color</p>
                  </div>
                )}

                {/* Popular searches (default state) */}
                {!loading && !searched && (
                  <div className="p-6">
                    <p className="font-label uppercase text-[10px] tracking-[0.2em] text-on-surface-variant mb-4">Popular Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR.map(term => (
                        <button key={term} onClick={() => { setQuery(term); }}
                          className="px-4 py-2 rounded-full bg-surface-container border border-outline-variant/20 text-on-surface-variant text-xs hover:border-primary/40 hover:text-primary transition-all">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}