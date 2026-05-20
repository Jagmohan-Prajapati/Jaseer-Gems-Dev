import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Trash2, Filter, Image as ImageIcon, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar.tsx';
import { formatPrice, cn } from '../lib/utils.ts';

interface Product {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  images: string[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch('/api/products?limit=100');
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    fetchProducts();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !current }),
    });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this piece from inventory?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-surface min-h-screen">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 p-8 md:p-12 relative">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="font-headline text-5xl text-on-surface italic">Inventory</h1>
            <p className="text-on-surface-variant font-light mt-2 uppercase tracking-widest text-[10px]">Managing {products.length} unique treasures</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Search collection..." 
                className="bg-surface-container-low border border-outline-variant/10 rounded-full py-3 pl-12 pr-6 text-sm text-on-surface outline-none focus:border-primary transition-all w-full md:w-64"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setEditingProduct(null); setIsDrawerOpen(true); }}
              className="bg-primary text-on-primary p-4 rounded-full shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </header>

        <section className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-surface-container-high/50">
                  <tr>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Piece</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Category</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Value</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Stock</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Status</th>
                    <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-outline-variant/5">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-highest/20 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded bg-surface-container-high overflow-hidden shrink-0">
                             {p.images[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-primary/20"><ImageIcon size={20} /></div>}
                           </div>
                           <span className="font-headline text-lg text-on-surface">{p.name} {p.isFeatured && "✨"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm text-on-surface-variant">{p.category}</td>
                      <td className="px-8 py-6 text-sm font-medium text-primary">{formatPrice(p.price)}</td>
                      <td className="px-8 py-6 text-sm text-on-surface">{p.stockQty}</td>
                      <td className="px-8 py-6">
                         <button 
                          onClick={() => toggleActive(p.id, p.isActive)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                            p.isActive ? "bg-primary/20 text-primary" : "bg-outline-variant/20 text-on-surface-variant"
                          )}
                         >
                           {p.isActive ? 'Active' : 'Inactive'}
                         </button>
                         <button 
                          onClick={() => toggleFeatured(p.id, p.isFeatured)}
                          className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                            p.isFeatured ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-outline-variant/20 text-on-surface-variant"
                          )}
                        >
                          {p.isFeatured ? 'Featured' : 'Not Featured'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => { setEditingProduct(p); setIsDrawerOpen(true); }} className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-highest rounded-lg"><Edit2 size={18} /></button>
                           <button onClick={() => deleteProduct(p.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors hover:bg-surface-container-highest rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
             </table>
          </div>
        </section>

        {/* Product Drawer */}
        <AnimatePresence>
          {isDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
               <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="absolute inset-0 bg-surface/80 backdrop-blur-md"
               ></motion.div>
               <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 40, stiffness: 400 }}
                className="relative w-full max-w-2xl bg-surface-container-low h-full shadow-2xl p-12 overflow-y-auto"
               >
                 <ProductForm 
                  initialData={editingProduct} 
                  onClose={() => setIsDrawerOpen(false)} 
                  onSuccess={() => { setIsDrawerOpen(false); fetchProducts(); }} 
                 />
                 <button onClick={() => setIsDrawerOpen(false)} className="absolute top-12 right-12 text-on-surface-variant hover:text-primary"><X size={32} /></button>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ProductForm({ initialData, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    price: 0,
    images: [],
    category: 'Loose Gemstones',
    stoneType: '',
    stoneColor: '',
    caratWeight: 0,
    origin: '',
    certification: 'GIA',
    stockQty: 1,
    isFeatured: false,
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    onSuccess();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);
    
    const res = await fetch('/api/upload', { method: 'POST', body });
    const data = await res.json();
    
    setFormData((prev: any) => ({
      ...prev,
      images: [...prev.images, data.secure_url]
    }));
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-24">
       <header>
          <h2 className="font-headline text-5xl text-on-surface italic">{initialData ? 'Update Masterpiece' : 'New Collection Entry'}</h2>
       </header>

       <div className="space-y-8">
          <InputGroup label="Piece Name" value={formData.name} onChange={(v: string) => setFormData({ ...formData, name: v })} />
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Description & Provenance</label>
            <textarea 
              className="w-full bg-surface-container-high p-4 rounded-lg border border-outline-variant/10 text-on-surface min-h-[160px] outline-none focus:border-primary transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
             <InputGroup label="Price (USD)" type="number" value={formData.price} onChange={(v: string) => setFormData({ ...formData, price: parseFloat(v) })} />
             <InputGroup label="Stock Quantity" type="number" value={formData.stockQty} onChange={(v: string) => setFormData({ ...formData, stockQty: parseInt(v) })} />
          </div>

          <div className="grid grid-cols-2 gap-8">
             <SelectGroup label="Category" value={formData.category} options={['Loose Gemstones', 'Rings', 'Necklaces', 'Raw Stones', 'Birthstones']} onChange={(v: string) => setFormData({ ...formData, category: v })} />
             <InputGroup label="Carat Weight" type="number" step="0.01" value={formData.caratWeight} onChange={(v: string) => setFormData({ ...formData, caratWeight: parseFloat(v) })} />
          </div>

          <div className="grid grid-cols-2 gap-8">
             <InputGroup label="Stone Type" value={formData.stoneType} onChange={(v: string) => setFormData({ ...formData, stoneType: v })} />
             <InputGroup label="Color" value={formData.stoneColor} onChange={(v: string) => setFormData({ ...formData, stoneColor: v })} />
          </div>

          <div className="grid grid-cols-2 gap-8">
             <InputGroup label="Origin" value={formData.origin} onChange={(v: string) => setFormData({ ...formData, origin: v })} />
             <SelectGroup label="Certification" value={formData.certification} options={['GIA', 'IGI', 'GRS', 'None']} onChange={(v: string) => setFormData({ ...formData, certification: v })} />
          </div>

          <div className="flex gap-12">
             <Toggle name="Featured Piece" checked={formData.isFeatured} onChange={v => setFormData({ ...formData, isFeatured: v })} />
             <Toggle name="Published" checked={formData.isActive} onChange={v => setFormData({ ...formData, isActive: v })} />
          </div>

          <div className="space-y-4">
             <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Image Portfolio</label>
             <div className="grid grid-cols-4 gap-4">
                {formData.images.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-outline-variant/10 group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, images: formData.images.filter((_: any, idx: number) => idx !== i) })}
                      className="absolute top-1 right-1 bg-error p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </div>
                ))}
                {formData.images.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all cursor-pointer">
                    <Plus size={24} />
                    <span className="text-[9px] uppercase tracking-widest mt-2">{uploading ? 'Archiving...' : 'Add Image'}</span>
                    <input type="file" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
             </div>
          </div>
       </div>

       <div className="pt-12">
          <button type="submit" className="w-full bg-primary text-on-primary py-6 rounded-xl font-headline text-2xl italic tracking-tight hover:brightness-110 active:scale-[0.99] transition-all">
             {initialData ? 'Update Collection' : 'Register Masterpiece'}
          </button>
       </div>
    </form>
  );
}

function InputGroup({ label, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{label}</label>
      <input 
        className="w-full bg-surface-container-high border-b border-outline-variant/20 p-4 text-on-surface outline-none focus:border-primary transition-all"
        {...props}
        onChange={e => props.onChange(e.target.value)}
      />
    </div>
  );
}

function SelectGroup({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{label}</label>
      <select 
        className="w-full bg-surface-container-high border-b border-outline-variant/20 p-4 text-on-surface outline-none focus:border-primary transition-all"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function Toggle({ name, checked, onChange }: { name: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4">
       <button 
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full relative transition-colors duration-300",
          checked ? "bg-primary" : "bg-outline-variant/20"
        )}
       >
         <div className={cn(
           "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all duration-300",
           checked ? "translate-x-6" : "translate-x-0"
         )}></div>
       </button>
       <span className="text-[10px] uppercase tracking-widest text-on-surface">{name}</span>
    </div>
  );
}
