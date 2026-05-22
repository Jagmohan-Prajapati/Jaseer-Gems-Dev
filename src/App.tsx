import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Home from './pages/Home.tsx';
import Shop from './pages/Shop.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import Cart from './pages/Cart.tsx';
import Checkout from './pages/Checkout.tsx';
import OrderConfirmation from './pages/OrderConfirmation.tsx';
import Login from './pages/Login.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import AdminProducts from './pages/AdminProducts.tsx';
import AdminOrders from './pages/AdminOrders.tsx';
import { useAuth, AuthProvider } from './context/AuthContext.tsx';
import { AdminRoute, AuthRoute } from './components/ProtectedRoute.tsx';
import Account from './pages/Account.tsx';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center bg-surface text-primary font-headline italic text-4xl">JaseerGems</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {children}
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/shop" element={<MainLayout><Shop /></MainLayout>} />
        <Route path="/shop/:id" element={<MainLayout><ProductDetail /></MainLayout>} />
        <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
        <Route path="/login" element={<Login />} />
        
        {/* User Protected Routes */}
        <Route path="/checkout" element={<AuthRoute><Checkout /></AuthRoute>} />
        <Route path="/order-confirmation/:id" element={<AuthRoute><OrderConfirmation /></AuthRoute>} />
        <Route path="/account" element={<AuthRoute><MainLayout><Account /></MainLayout></AuthRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
      </Routes>
    </AuthProvider>
  );
}
