import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MapPin, ShoppingBag, Lock, LogOut, Plus, Edit2, Trash2, Check, X, ChevronRight, Package, Truck, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { formatPrice, cn } from '../lib/utils.ts';

type Tab = 'profile' | 'orders' | 'addresses' | 'security';

interface Address {
  id: string; label: string; name: string; phone: string;
  line1: string; line2?: string; city: string; state: string;
  zip: string; country: string; isDefault: boolean;
}

interface Order {
  id: string; total: number; status: string; isPaid: boolean;
  createdAt: string; trackingId?: string; trackingUrl?: string;
  items: { quantity: number; price: number; product: { name: string; images: string[] } }[];
}

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const statusColor: Record<string, string> = {
  PENDING: 'text-[#C9A84C] bg-[#C9A84C]/10',
  PROCESSING: 'text-blue-400 bg-blue-400/10',
  SHIPPED: 'text-purple-400 bg-purple-400/10',
  DELIVERED: 'text-green-400 bg-green-400/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
};

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile state
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home', name: '', phone: '', line1: '', line2: '',
    city: '', state: '', zip: '', country: 'United States', isDefault: false,
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => setProfile({ name: d.name || '', email: d.email || '', phone: d.phone || '' }));
  }, []);

  useEffect(() => {
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const fetchAddresses = async () => {
    const res = await fetch('/api/user/addresses');
    const data = await res.json();
    setAddresses(data);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    const res = await fetch('/api/orders/my');
    const data = await res.json();
    setOrders(data);
    setOrdersLoading(false);
  };

  const saveProfile = async () => {
    setProfileLoading(true); setProfileMsg('');
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.name, phone: profile.phone }),
    });
    if (res.ok) setProfileMsg('Profile updated successfully');
    setProfileLoading(false);
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(''); setPasswordMsg('');
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("Passwords don't match"); return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters"); return;
    }
    setPasswordLoading(true);
    const res = await fetch('/api/user/change-password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPasswordMsg('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else setPasswordError(data.error || 'Failed to change password');
    setPasswordLoading(false);
  };

  const saveAddress = async () => {
    const method = editingAddress ? 'PUT' : 'POST';
    const url = editingAddress ? `/api/user/addresses/${editingAddress.id}` : '/api/user/addresses';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addressForm),
    });
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({ label: 'Home', name: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'United States', isDefault: false });
    fetchAddresses();
  };

  const deleteAddress = async (id: string) => {
    if (confirm('Remove this address?')) {
      await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
    }
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({ label: addr.label, name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, isDefault: addr.isDefault });
    setShowAddressForm(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const inputClass = "w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none transition-colors";
  const labelClass = "font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-1.5 block";

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'orders' as Tab, label: 'My Orders', icon: ShoppingBag },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'security' as Tab, label: 'Security', icon: Lock },
  ];

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="font-headline italic text-4xl text-primary">My Account</h1>
        <p className="text-on-surface-variant text-sm mt-1">Welcome back, <span className="text-on-surface">{user?.name}</span></p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
            {/* Avatar */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-headline text-xl">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-on-surface font-medium text-sm">{user?.name}</p>
                <p className="text-on-surface-variant text-[11px]">{user?.email}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="p-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all text-left",
                    activeTab === id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  )}
                >
                  <Icon size={16} />
                  {label}
                  {activeTab === id && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
              <div className="border-t border-outline-variant/10 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* ── PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
                <h2 className="font-headline italic text-2xl text-on-surface mb-8">Personal Details</h2>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" value={profile.email} disabled className={cn(inputClass, "opacity-50 cursor-not-allowed")} />
                    <p className="text-[10px] text-on-surface-variant mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className={inputClass} placeholder="+1 234 567 8900" />
                  </div>
                  {profileMsg && <p className="text-green-400 text-[11px] uppercase tracking-widest font-bold">{profileMsg}</p>}
                  <button onClick={saveProfile} disabled={profileLoading}
                    className="bg-primary text-on-primary font-label uppercase text-xs tracking-[0.2em] px-8 py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h2 className="font-headline italic text-2xl text-on-surface mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="text-center py-20 text-on-surface-variant text-sm">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-16 text-center">
                    <Package size={48} className="text-on-surface-variant mx-auto mb-4 opacity-30" />
                    <p className="font-headline italic text-2xl text-on-surface-variant mb-2">No orders yet</p>
                    <p className="text-on-surface-variant text-sm mb-6">Your order history will appear here</p>
                    <button onClick={() => navigate('/shop')} className="bg-primary text-on-primary font-label uppercase text-xs tracking-[0.2em] px-8 py-3 rounded-lg hover:brightness-110 transition-all">
                      Browse Gems
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-6">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Order ID</p>
                            <p className="text-on-surface font-mono text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Date</p>
                            <p className="text-on-surface text-sm">{new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Total</p>
                            <p className="text-primary font-semibold">{formatPrice(order.total)}</p>
                          </div>
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", statusColor[order.status] || statusColor.PENDING)}>
                            {order.status}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-3 border-t border-outline-variant/10 pt-4 mb-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                                {item.product.images?.[0]
                                  ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><Package size={16} /></div>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-on-surface text-sm truncate">{item.product.name}</p>
                                <p className="text-on-surface-variant text-xs">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tracking */}
                        {order.trackingUrl ? (
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary text-xs uppercase tracking-widest font-bold hover:brightness-125 transition-all border border-primary/30 px-4 py-2 rounded-lg">
                            <Truck size={14} /> Track Order — {order.trackingId}
                          </a>
                        ) : order.status !== 'DELIVERED' && order.status !== 'CANCELLED' ? (
                          <p className="text-on-surface-variant text-[11px] italic">Tracking details will be updated soon</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ADDRESSES TAB ── */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-headline italic text-2xl text-on-surface">Saved Addresses</h2>
                  <button onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                    className="flex items-center gap-2 bg-primary text-on-primary font-label uppercase text-xs tracking-[0.15em] px-5 py-2.5 rounded-lg hover:brightness-110 transition-all">
                    <Plus size={14} /> Add Address
                  </button>
                </div>

                {/* Address Form */}
                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-surface-container-low rounded-xl border border-primary/20 p-6 mb-6 overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-headline italic text-lg text-on-surface">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                        <button onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="text-on-surface-variant hover:text-on-surface"><X size={18} /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Label</label>
                          <select value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className={inputClass}>
                            <option>Home</option><option>Work</option><option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Full Name</label>
                          <input value={addressForm.name} onChange={e => setAddressForm({ ...addressForm, name: e.target.value })} className={inputClass} placeholder="Recipient name" />
                        </div>
                        <div>
                          <label className={labelClass}>Phone</label>
                          <input value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className={inputClass} placeholder="+1 234 567 8900" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>Address Line 1</label>
                          <input value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className={inputClass} placeholder="Street address" />
                        </div>
                        <div className="md:col-span-2">
                          <label className={labelClass}>Address Line 2 (Optional)</label>
                          <input value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} className={inputClass} placeholder="Apt, suite, unit, etc." />
                        </div>
                        <div>
                          <label className={labelClass}>City</label>
                          <input value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>State</label>
                          <input value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>ZIP / Postal Code</label>
                          <input value={addressForm.zip} onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Country</label>
                          <input value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} className={inputClass} />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-3">
                          <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-primary w-4 h-4" />
                          <label htmlFor="isDefault" className="text-sm text-on-surface-variant cursor-pointer">Set as default address</label>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button onClick={saveAddress} className="bg-primary text-on-primary font-label uppercase text-xs tracking-[0.2em] px-6 py-3 rounded-lg hover:brightness-110 transition-all">
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </button>
                        <button onClick={() => { setShowAddressForm(false); setEditingAddress(null); }} className="border border-outline-variant/30 text-on-surface-variant font-label uppercase text-xs tracking-[0.2em] px-6 py-3 rounded-lg hover:border-primary/40 transition-all">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Address Cards */}
                {addresses.length === 0 && !showAddressForm ? (
                  <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-16 text-center">
                    <MapPin size={48} className="text-on-surface-variant mx-auto mb-4 opacity-30" />
                    <p className="font-headline italic text-2xl text-on-surface-variant mb-2">No saved addresses</p>
                    <p className="text-on-surface-variant text-sm">Add an address for faster checkout</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={cn("bg-surface-container-low rounded-xl border p-5 relative", addr.isDefault ? "border-primary/40" : "border-outline-variant/10")}>
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 bg-primary/20 text-primary text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">Default</span>
                        )}
                        <p className="font-label uppercase text-[10px] tracking-widest text-primary mb-2">{addr.label}</p>
                        <p className="text-on-surface font-medium text-sm">{addr.name}</p>
                        <p className="text-on-surface-variant text-sm">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p className="text-on-surface-variant text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-on-surface-variant text-sm">{addr.country}</p>
                        <p className="text-on-surface-variant text-sm mt-1">{addr.phone}</p>
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => openEditAddress(addr)} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => deleteAddress(addr.id)} className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-red-400 transition-colors">
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-surface-container-low rounded-xl border border-outline-variant/10 p-8">
                <h2 className="font-headline italic text-2xl text-on-surface mb-8">Change Password</h2>
                <form onSubmit={changePassword} className="space-y-6 max-w-lg">
                  <div>
                    <label className={labelClass}>Current Password</label>
                    <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className={inputClass} placeholder="••••••••" />
                  </div>
                  <div>
                    <label className={labelClass}>New Password</label>
                    <input type="password" required value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className={inputClass} placeholder="Min. 8 characters" />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <input type="password" required value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} className={inputClass} placeholder="••••••••" />
                  </div>
                  {passwordError && <p className="text-red-400 text-[11px] uppercase tracking-widest font-bold">{passwordError}</p>}
                  {passwordMsg && <p className="text-green-400 text-[11px] uppercase tracking-widest font-bold">{passwordMsg}</p>}
                  <button type="submit" disabled={passwordLoading}
                    className="bg-primary text-on-primary font-label uppercase text-xs tracking-[0.2em] px-8 py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}