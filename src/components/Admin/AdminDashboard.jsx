import React, { useState, useEffect } from 'react';
import { 
  Package, Printer, Layers, Database, LogOut, Lock, 
  Mail, Shield, RefreshCw, TrendingUp, CheckCircle, Clock,
  FolderTree, BarChart2
} from 'lucide-react';
import { 
  adminSignIn, adminSignOut, getAdminSession, 
  fetchOrdersAdmin, fetchAllProductsAdmin, fetchCategories, isSupabaseConfigured 
} from '../../lib/supabaseClient';
import AdminOrdersTab from './AdminOrdersTab';
import AdminPrintQueueTab from './AdminPrintQueueTab';
import AdminProductsTab from './AdminProductsTab';
import AdminCategoriesTab from './AdminCategoriesTab';
import AdminSupabaseGuideTab from './AdminSupabaseGuideTab';
import AdminAnalyticsTab from './AdminAnalyticsTab';

export default function AdminDashboard({ onOpenImageViewer, onAdminAuthChange }) {
  const [session, setSession] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'print_queue' | 'products' | 'categories' | 'analytics' | 'supabase'

  // Date
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Formular Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Verificare sesiune la încărcare
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentSession = await getAdminSession();
        setSession(currentSession);
        if (currentSession?.user) {
          onAdminAuthChange?.({
            name: 'Administrator',
            email: currentSession.user.email,
            role: 'admin',
            isAdmin: true
          });
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Încărcare date admin când este autentificat
  const loadAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [ordList, prodList, catList] = await Promise.all([
        fetchOrdersAdmin('toate'),
        fetchAllProductsAdmin(),
        fetchCategories()
      ]);
      setOrders(ordList || []);
      setProducts(prodList || []);
      setCategories(catList || []);
    } catch (err) {
      console.error('Eroare la încărcare date admin:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadAdminData();
    }
  }, [session]);

  // Login handler
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const newSession = await adminSignIn(loginEmail.trim(), loginPassword);
      setSession(newSession);
      onAdminAuthChange?.({
        name: 'Administrator',
        email: loginEmail.trim(),
        role: 'admin',
        isAdmin: true
      });
    } catch (err) {
      setLoginError(err.message || 'Email sau parolă incorectă.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await adminSignOut();
    setSession(null);
    onAdminAuthChange?.(null);
  };

  if (isLoadingAuth) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <p>Se verifică autentificarea...</p>
      </div>
    );
  }

  // ============================================================================
  // ECRAN AUTENTIFICARE DACĂ NU ESTE LOGAT
  // ============================================================================
  if (!session) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={30} />
          </div>

          <span className="badge badge-terracotta" style={{ marginBottom: '8px' }}>
            Zonă Protejată
          </span>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Autentificare Administrator</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Conectează-te cu email-ul și parola create în Supabase Auth pentru a gestiona comenzile și catalogul 3D.
          </p>

          {loginError && (
            <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label-custom">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Email Admin
                </span>
              </label>
              <input
                type="email"
                className="custom-input"
                placeholder="admin@scoatem3d.ro"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label-custom">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> Parolă
                </span>
              </label>
              <input
                type="password"
                className="custom-input"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Se autentifică...' : 'Intră în Dashboard'}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ============================================================================
  // DASHBOARD PRINCIPAL DUPĂ AUTENTIFICARE
  // ============================================================================
  const newOrdersCount = orders.filter(o => o.status === 'noua').length;
  const inProdOrdersCount = orders.filter(o => o.status === 'in_productie').length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div className="admin-container">
      {/* Header Dashboard cu Statistici */}
      <div className="admin-header-box">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.45rem' }}>Panou Administrare Scoatem3D</h2>
            <span className={`badge ${isSupabaseConfigured() ? 'badge-sage' : 'badge-gold'}`}>
              {isSupabaseConfigured() ? 'Supabase Conectat' : 'Mod Test Local'}
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Autentificat ca: <strong>{session?.user?.email || 'admin@scoatem3d.ro'}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={loadAdminData}
            disabled={isRefreshing}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Reîmprospătează datele"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Actualizează</span>
          </button>

          <button
            className="btn-secondary"
            onClick={handleLogout}
            style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#DC2626' }}
            title="Deconectare cont admin"
          >
            <LogOut size={15} />
            <span>Deconectare</span>
          </button>
        </div>
      </div>

      {/* Carduri Statistici Rapide */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Comenzi
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>
            {orders.length}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.78rem', color: '#B45309', textTransform: 'uppercase', fontWeight: '700' }}>
            Comenzi Noi (De Printat)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: '#D97706' }}>
            {newOrdersCount}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.78rem', color: '#1D4ED8', textTransform: 'uppercase', fontWeight: '700' }}>
            În Producție / Slicing
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: '#2563EB' }}>
            {inProdOrdersCount}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent-sage)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Încasări
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '4px', color: 'var(--accent-sage)' }}>
            {totalRevenue.toFixed(2).replace('.', ',')} Lei
          </div>
        </div>
      </div>

      {/* Bara de Navigare între Tab-uri */}
      <div className="admin-nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={17} />
          <span>Comenzi ({orders.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'print_queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('print_queue')}
        >
          <Printer size={17} />
          <span>Comenzi de printat azi ({newOrdersCount + inProdOrdersCount})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Layers size={17} />
          <span>Produse Catalog ({products.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={17} />
          <span>Categorii ({categories.length})</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart2 size={17} />
          <span>Statistici Vizite</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'supabase' ? 'active' : ''}`}
          onClick={() => setActiveTab('supabase')}
        >
          <Database size={17} />
          <span>Ghid Supabase &amp; RLS</span>
        </button>
      </div>

      {/* Conținut Tab Selectat */}
      <div>
        {activeTab === 'orders' && (
          <AdminOrdersTab 
            orders={orders} 
            onRefresh={loadAdminData} 
            onOpenImageViewer={onOpenImageViewer} 
          />
        )}

        {activeTab === 'print_queue' && (
          <AdminPrintQueueTab 
            orders={orders} 
            onRefresh={loadAdminData} 
            onOpenImageViewer={onOpenImageViewer} 
          />
        )}

        {activeTab === 'products' && (
          <AdminProductsTab 
            products={products} 
            categories={categories}
            onRefresh={loadAdminData} 
            onRefreshCategories={loadAdminData}
            onGoToCategories={() => setActiveTab('categories')}
          />
        )}

        {activeTab === 'categories' && (
          <AdminCategoriesTab 
            categories={categories}
            products={products}
            onRefresh={loadAdminData}
            isLoading={isRefreshing}
          />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalyticsTab />
        )}

        {activeTab === 'supabase' && (
          <AdminSupabaseGuideTab />
        )}
      </div>
    </div>
  );
}
