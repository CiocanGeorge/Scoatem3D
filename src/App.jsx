import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import ImageViewerModal from './components/ImageViewerModal';
import Footer from './components/Footer';
import CookieConsentBanner from './components/CookieConsentBanner';
import CatalogFilterToolbar from './components/CatalogFilterToolbar';
import { 
  fetchActiveProducts, 
  fetchCategories,
  getCustomerSession, 
  customerSignOut, 
  adminSignOut,
  getCustomerWishlist, 
  toggleCustomerWishlist,
  onAuthStateChange,
  getSupabaseUser,
  trackPageVisit
} from './lib/supabaseClient';
import { ShieldCheck, Box, RefreshCw, CheckCircle2, ArrowUpDown, Search } from 'lucide-react';

// Lazy loading pentru componente mari & modale
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const CustomerAccountPage = lazy(() => import('./components/CustomerAccountPage'));
const WishlistPage = lazy(() => import('./components/WishlistPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const ProductCustomizerModal = lazy(() => import('./components/ProductCustomizerModal'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const TermeniConditiiPage = lazy(() => import('./components/TermeniConditiiPage'));
const PoliticaConfidentialitatePage = lazy(() => import('./components/PoliticaConfidentialitatePage'));
const PoliticaCookiePage = lazy(() => import('./components/PoliticaCookiePage'));

const PageLoader = () => (
  <div style={{ textAlign: 'center', padding: '90px 20px', color: 'var(--text-secondary)' }}>
    <div style={{
      width: '38px',
      height: '38px',
      margin: '0 auto 16px',
      borderRadius: '50%',
      border: '3px solid rgba(200, 90, 50, 0.18)',
      borderTopColor: 'var(--primary)',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ fontSize: '0.92rem', fontWeight: '500' }}>Se încarcă secțiunea...</p>
  </div>
);

const CART_STORAGE_KEY = 'atelier3d_cart';

// Helper pentru parsare rută din hash URL și pathname
const parseRouteFromHash = () => {
  const hash = window.location.hash || '';
  const path = window.location.pathname || '';

  if (hash === '#/admin' || path === '/admin') {
    return { view: 'admin', productId: null };
  }
  if (hash === '#/cont' || hash === '#/account' || hash === '#/profil' || path === '/cont') {
    return { view: 'account', productId: null };
  }
  if (hash === '#/favorite' || hash === '#/wishlist' || path === '/favorite') {
    return { view: 'wishlist', productId: null };
  }
  if (hash.startsWith('#/produs/') || hash.startsWith('#/product/')) {
    const parts = hash.split('/');
    const id = parts[2];
    return { view: 'product', productId: id };
  }
  if (hash.includes('termeni') || path.includes('termeni')) return { view: 'termeni', productId: null };
  if (hash.includes('confidentialitate') || path.includes('confidentialitate')) return { view: 'confidentialitate', productId: null };
  if (hash.includes('cookie') || path.includes('cookie')) return { view: 'cookies', productId: null };
  return { view: 'shop', productId: null };
};

export default function App() {
  // Navigare: 'shop', 'product', 'account' sau 'admin'
  const [route, setRoute] = useState(() => parseRouteFromHash());
  const currentView = route.view;
  const selectedProductId = route.productId;

  // Utilizator autentificat (Client sau Administrator)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Lista favorite (Wishlist)
  const [wishlist, setWishlist] = useState([]);

  // La mount: verifica daca exista o sesiune Supabase activa (refresh de pagina)
  useEffect(() => {
    getSupabaseUser().then(user => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
  }, []);

  // Listener Supabase Auth - detecteaza login/logout si determina rolul automat
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const supaUser = await getSupabaseUser();
        setCurrentUser(supaUser);
      }
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setWishlist([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Incarcare lista favorite din Supabase cand utilizatorul se logheaza/delogheaza
  useEffect(() => {
    if (currentUser) {
      getCustomerWishlist().then(ids => setWishlist(Array.isArray(ids) ? ids : []));
    } else {
      setWishlist([]);
    }
  }, [currentUser]);

  // ---- TRACKING VIZITATORI ----
  useEffect(() => {
    // Generăm sau recuperăm un session_id unic per tab
    let sessionId = sessionStorage.getItem('_atelier3d_sid');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('_atelier3d_sid', sessionId);
    }

    // Citim ?platform= din URL
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform') || null;
    const referrer = document.referrer || null;

    // Ștergem ?platform= din URL (fără reload)
    if (platform) {
      urlParams.delete('platform');
      const newSearch = urlParams.toString();
      const cleanUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
      window.history.replaceState(null, '', cleanUrl);
    }

    // Salvăm vizita în Supabase (nu blocăm UI)
    trackPageVisit({
      platform,
      referrer,
      page: window.location.pathname || '/',
      session_id: sessionId
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Produse & Filtrare / Căutare / Sortare
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Toate');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  // Modale
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Lightbox Imagine
  const [imageViewer, setImageViewer] = useState({ isOpen: false, url: '', filename: '' });

  // Coș de cumpărături
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Notificare Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sincronizare hash url pentru navigare facilă și back/forward în browser
  useEffect(() => {
    const handleHashChange = () => {
      const newRoute = parseRouteFromHash();
      setRoute(newRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view) => {
    if (view === 'admin') {
      window.location.hash = '#/admin';
    } else if (view === 'account') {
      window.location.hash = '#/cont';
    } else if (view === 'wishlist') {
      window.location.hash = '#/favorite';
    } else if (view === 'termeni') {
      window.location.hash = '#/termeni-si-conditii';
    } else if (view === 'confidentialitate') {
      window.location.hash = '#/politica-de-confidentialitate';
    } else if (view === 'cookies') {
      window.location.hash = '#/politica-de-cookie-uri';
    } else {
      window.location.hash = '#/';
    }
    setRoute({ view, productId: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (productId) => {
    window.location.hash = `#/produs/${productId}`;
    setRoute({ view: 'product', productId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateLegal = (target) => {
    if (typeof target === 'string') {
      if (target.includes('termeni')) {
        navigateTo('termeni');
        return;
      }
      if (target.includes('confidentialitate')) {
        navigateTo('confidentialitate');
        return;
      }
      if (target.includes('cookie')) {
        navigateTo('cookies');
        return;
      }
    }
    navigateTo('shop');
  };

  // Salvare coș în localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Încărcare produse active și categorii din DB
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const [prods, cats] = await Promise.all([
        fetchActiveProducts(),
        fetchCategories()
      ]);
      setProducts(prods || []);
      setDbCategories(cats || []);
    } catch (err) {
      console.error('Eroare la preluare produse/categorii:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Categorii din baza de date + produse
  const categories = React.useMemo(() => {
    const catNames = dbCategories.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
    products.forEach(p => {
      if (p.category && !catNames.includes(p.category)) {
        catNames.push(p.category);
      }
    });
    return ['Toate', ...(catNames.length > 0 ? catNames : ['Lămpi Litofanie', 'Brelocuri', 'Diverse'])];
  }, [dbCategories, products]);

  // Contor de produse per categorie
  const categoryCounts = React.useMemo(() => {
    const counts = { 'Toate': products.length };
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filtrare și sortare produse active
  const filteredProducts = products
    .filter(p => {
      // 1. Categorie
      const matchesCategory = selectedCategory === 'Toate' || p.category === selectedCategory;
      if (!matchesCategory) return false;

      // 2. Preț
      const price = Number(p.price) || 0;
      if (priceRange === 'under50' && price >= 50) return false;
      if (priceRange === '50to100' && (price < 50 || price > 100)) return false;
      if (priceRange === 'over100' && price <= 100) return false;

      // 3. Căutare text
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const catMatch = p.category?.toLowerCase().includes(q);
      const badgeMatch = p.badge?.toLowerCase().includes(q);
      return Boolean(nameMatch || descMatch || catMatch || badgeMatch);
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
      if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
      if (sortBy === 'rating') return (b.rating || 4.9) - (a.rating || 4.9);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0; // 'featured'
    });

  const handleResetAllFilters = () => {
    setSelectedCategory('Toate');
    setSearchQuery('');
    setPriceRange('all');
    setSortBy('featured');
  };

  // Adăugare în coș
  const handleAddToCart = (newItem) => {
    setCartItems(prev => [...prev, newItem]);
    showToast(`"${newItem.product_name}" a fost adăugat în coș!`);
    setIsCartOpen(true);
  };

  // Comandă Rapidă / Cumpără Acum (Instant Checkout)
  const handleBuyNow = (newItem) => {
    setCartItems(prev => [...prev, newItem]);
    setIsCheckoutOpen(true);
  };

  // Autentificare client cu succes
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Bine ai venit, ${user.name || user.email}!`);
  };

  // Deconectare client & administrator
  const handleLogout = async () => {
    await customerSignOut();
    await adminSignOut();
    setCurrentUser(null);
    showToast('Te-ai deconectat cu succes.');
    navigateTo('shop');
  };

  // Toggle favorite (Wishlist) - async, salvat in Supabase
  const handleToggleWishlist = async (productId) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Trebuie să fii logat pentru a salva favorite.');
      return;
    }
    const res = await toggleCustomerWishlist(productId);
    setWishlist(res.wishlist);
    showToast(res.isAdded ? 'Produsul a fost adăugat la favorite ❤️' : 'Produsul a fost eliminat din favorite.');
  };

  // Actualizare cantitate articol
  const handleUpdateQuantity = (index, newQty) => {
    setCartItems(prev => {
      const copy = [...prev];
      copy[index].quantity = newQty;
      return copy;
    });
  };

  // Ștergere articol din coș
  const handleRemoveItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
    showToast('Produsul a fost eliminat din coș.');
  };

  // Finalizare comandă
  const handleOrderSuccess = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    setIsCartOpen(false);
    showToast('Comanda a fost plasată cu succes!');
  };

  // Deschidere modal imagine
  const handleOpenImageViewer = (url, filename) => {
    setImageViewer({ isOpen: true, url, filename });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Produsul selectat pentru pagina detaliată
  const activeProduct = selectedProductId 
    ? products.find(p => p.id === selectedProductId)
    : null;

  return (
    <div className="app-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--text-main)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          animation: 'slideUp 0.25s ease-out'
        }}>
          <CheckCircle2 size={18} color="var(--accent-sage)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar Comun */}
      <Navbar 
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentView={currentView}
        onNavigate={navigateTo}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        wishlistCount={wishlist.length}
      />

      {/* ======================================================================
          VEDERI PRINCIPALE (Încărcare asincronă cu Suspense)
          ====================================================================== */}
      <Suspense fallback={<PageLoader />}>
        {currentView === 'admin' ? (
          currentUser?.isAdmin ? (
            <AdminDashboard 
              onOpenImageViewer={handleOpenImageViewer}
            />
          ) : (
            <main>
              <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '48px 32px', borderRadius: 'var(--radius-xl)', maxWidth: '480px', margin: '0 auto', border: '1px solid var(--border-light)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '1.5rem' }}>🔒</div>
                  <h3 style={{ marginBottom: '8px' }}>Acces Restricționat</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
                    {currentUser 
                      ? 'Contul tău nu are permisiuni de administrator.' 
                      : 'Trebuie să te autentifici cu un cont de administrator.'}
                  </p>
                  <button className="btn-primary" onClick={() => currentUser ? navigateTo('shop') : setIsAuthModalOpen(true)}>
                    {currentUser ? 'Înapoi la Magazin' : 'Autentifică-te'}
                  </button>
                </div>
              </div>
            </main>
          )
      ) : currentView === 'account' ? (
        /* ====================================================================
           VEDERE 2: CONT CLIENT, ISTORIC COMENZI, WISHLIST & FIDELITATE
           ==================================================================== */
        <main>
          {currentUser ? (
            <CustomerAccountPage 
              user={currentUser}
              onLogout={handleLogout}
              allProducts={products}
              onSelectProduct={navigateToProduct}
              onBackToShop={() => navigateTo('shop')}
              onNavigateAdmin={() => navigateTo('admin')}
              onOpenImageViewer={handleOpenImageViewer}
            />
          ) : (
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '48px 32px', borderRadius: 'var(--radius-xl)', maxWidth: '480px', margin: '0 auto', border: '1px solid var(--border-light)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Box size={28} />
                </div>
                <h3>Intră în contul tău</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px', fontSize: '0.92rem' }}>
                  Pentru a vedea istoricul comenzilor și produsele favorite, te rugăm să te autentifici.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
                    Conectează-te sau Înregistrează-te
                  </button>
                  <button className="btn-secondary" onClick={() => navigateTo('shop')}>
                    Înapoi la Magazin
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : currentView === 'wishlist' ? (
        /* ====================================================================
           VEDERE NOUĂ: PAGINĂ DEDICATĂ PRODUSE FAVORITE (WISHLIST)
           ==================================================================== */
        <main>
          {currentUser ? (
            <WishlistPage 
              wishlistIds={wishlist}
              allProducts={products}
              onSelectProduct={navigateToProduct}
              onBackToShop={() => navigateTo('shop')}
              onToggleWishlist={handleToggleWishlist}
              onOpenCustomize={(prod) => setCustomizingProduct(prod)}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              isLoadingProducts={isLoadingProducts}
            />
          ) : (
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '48px 32px', borderRadius: 'var(--radius-xl)', maxWidth: '480px', margin: '0 auto', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❤️</div>
                <h3 style={{ marginBottom: '8px' }}>Produsele tale favorite</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px', fontSize: '0.92rem' }}>
                  Trebuie să fii autentificat pentru a salva și vedea produsele tale favorite.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
                    Conectează-te sau Înregistrează-te
                  </button>
                  <button className="btn-secondary" onClick={() => navigateTo('shop')}>
                    Înapoi la Magazin
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

      ) : currentView === 'product' ? (
        /* ====================================================================
           VEDERE 3: PAGINĂ SPECIALĂ DEDICATĂ FIECĂRUI PRODUS
           ==================================================================== */
        <main>
          {isLoadingProducts ? (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
              <p>Se încarcă produsul...</p>
            </div>
          ) : !activeProduct ? (
            <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', margin: '0 auto', border: '1px solid var(--border-light)' }}>
                <h3>Produsul solicitat nu a fost găsit.</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '20px' }}>
                  Este posibil ca link-ul să fie incorect sau produsul să nu mai fie disponibil.
                </p>
                <button className="btn-primary" onClick={() => navigateTo('shop')}>
                  Înapoi la Catalogul de Produse
                </button>
              </div>
            </div>
          ) : (
            <ProductDetailPage 
              product={activeProduct}
              allProducts={products}
              onBack={() => navigateTo('shop')}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onSelectProduct={navigateToProduct}
              onOpenImageViewer={handleOpenImageViewer}
              isWishlisted={wishlist.includes(activeProduct.id)}
              onToggleWishlist={handleToggleWishlist}
              currentUser={currentUser}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>

      ) : currentView === 'termeni' ? (
        <TermeniConditiiPage onBack={() => navigateTo('shop')} onNavigateLegal={handleNavigateLegal} />

      ) : currentView === 'confidentialitate' ? (
        <PoliticaConfidentialitatePage onBack={() => navigateTo('shop')} onNavigateLegal={handleNavigateLegal} />

      ) : currentView === 'cookies' ? (
        <PoliticaCookiePage onBack={() => navigateTo('shop')} onNavigateLegal={handleNavigateLegal} />

      ) : (
        /* ====================================================================
           VEDERE 4: CATALOG MAGAZIN ONLINE PUBLIC
           ==================================================================== */
        <main>
          {/* Hero Banner cu căutare și filtre de categorii */}
          <HeroBanner 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryCounts={categoryCounts}
            totalProducts={products.length}
          />

          {/* Grid Produse Active */}
          <section className="container" style={{ marginTop: '24px' }}>
            <CatalogFilterToolbar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              sortBy={sortBy}
              onSortChange={setSortBy}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              totalCount={products.length}
              filteredCount={filteredProducts.length}
              onResetAll={handleResetAllFilters}
              onRefresh={loadProducts}
              isLoading={isLoadingProducts}
            />

            {isLoadingProducts ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                <p>Se încarcă catalogul de produse...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 24px', 
                background: 'var(--bg-card)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border-light)',
                maxWidth: '540px',
                margin: '20px auto'
              }}>
                <Search size={36} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Nu am găsit niciun produs care să corespundă căutării.</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Încearcă alte cuvinte cheie sau explorează toate categoriile magazinului.
                </p>
                <button 
                  className="btn-primary" 
                  onClick={handleResetAllFilters}
                >
                  Resetează toate filtrele
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onCustomize={(prod) => setCustomizingProduct(prod)}
                    onViewProduct={(id) => navigateToProduct(id)}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Secțiune Explicativă "Cum funcționează personalizarea 3D?" */}
          <section style={{ background: 'var(--bg-warm-tint)', padding: '64px 0', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', marginTop: '40px' }}>
            <div className="container">
              <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 48px' }}>
                <span className="badge badge-terracotta" style={{ marginBottom: '8px' }}>
                  Procesul Nostru Artizanal
                </span>
                <h3 style={{ fontSize: '2rem', marginBottom: '12px' }}>
                  Cum prinde viață comanda ta în 3D?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Îmbinăm tehnologia de fabricație aditivă de precizie micrometrică cu atenția pentru finisaje manuale.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                  <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>
                    1
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Configurezi produsul</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Alegi produsul, încarci fotografia la rezoluție originală sau introduci textul dorit și nuanța de filament.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                  <div style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>
                    2
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Modelare 3D & Slicing</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Transformăm poza ta într-o hartă de grosimi micrometrice (litofanie) și pregătim straturile de imprimare.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                  <div style={{ background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>
                    3
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Imprimare Strat cu Strat</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Folosim filamente sigure, ecologice (PLA organic pe bază de amidon de porumb), imprimate la 0.12mm.
                  </p>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                  <div style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>
                    4
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Ambalare & Expediere</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Fiecare piesă este verificată cu atenție, ambalată cu grijă pentru protecție și expediată direct la ușa ta.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </main>
      )}
      </Suspense>

      {/* Footer Unificat pentru toate paginile magazinului (exclus Panoul Admin) */}
      {currentView !== 'admin' && (
        <Footer 
          onNavigateShop={() => navigateTo('shop')} 
          onNavigateLegal={handleNavigateLegal} 
        />
      )}

      {/* ======================================================================
          MODALE: AUTENTIFICARE CLIENT, PERSONALIZARE RAPIDĂ, COȘ, CHECKOUT, LIGHTBOX
          ====================================================================== */}
      <Suspense fallback={null}>
        {/* 0. Modal Autentificare / Înregistrare Client */}
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onSuccess={handleLoginSuccess}
          />
        )}

        {/* 1. Modal Configurare Produs Rapidă */}
        {customizingProduct && (
          <ProductCustomizerModal 
            product={customizingProduct}
            onClose={() => setCustomizingProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* 3. Checkout Modal */}
        {isCheckoutOpen && (
          <CheckoutModal 
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cartItems={cartItems}
            onOrderSuccess={handleOrderSuccess}
            currentUser={currentUser}
          />
        )}
      </Suspense>

      {/* 2. Coș de cumpărături Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* 4. Lightbox Vizualizator Imagini Originale */}
      <ImageViewerModal 
        isOpen={imageViewer.isOpen}
        imageUrl={imageViewer.url}
        filename={imageViewer.filename}
        onClose={() => setImageViewer({ isOpen: false, url: '', filename: '' })}
      />

      {/* 5. Banner Consimțământ Cookie-uri (GDPR / ePrivacy) */}
      <CookieConsentBanner onNavigateCookies={() => navigateTo('cookies')} />
    </div>
  );
}
