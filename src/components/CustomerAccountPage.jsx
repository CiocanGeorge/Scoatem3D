import React, { useState, useEffect, useCallback } from 'react';
import { 
  Package, 
  Heart, 
  User, 
  LogOut, 
  Clock, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Trash2, 
  RotateCw, 
  ShieldCheck 
} from 'lucide-react';
import { 
  fetchCustomerOrders, 
  updateCustomerProfile, 
  getCustomerWishlist, 
  toggleCustomerWishlist 
} from '../lib/supabaseClient';

const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov', 
  'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța', 
  'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 
  'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 
  'Vaslui', 'Vâlcea', 'Vrancea'
];

export default function CustomerAccountPage({ 
  user, 
  onLogout, 
  allProducts = [], 
  onSelectProduct, 
  onBackToShop,
  onNavigateAdmin,
  onOpenImageViewer 
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'wishlist' | 'profile'
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Formular editare profil
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    county: user?.county || '',
    city: user?.city || '',
    address_street: user?.address_street || '',
    postal_code: user?.postal_code || '',
    email: user?.email || ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const loadOrders = useCallback(async () => {
    if (!user?.email) return;
    setIsLoadingOrders(true);
    try {
      const customerOrders = await fetchCustomerOrders(user.email);
      setOrders(customerOrders || []);
    } catch (e) {
      console.error('Eroare la preluare comenzi client:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        county: user.county || prev.county || '',
        city: user.city || prev.city || '',
        address_street: user.address_street || prev.address_street || '',
        postal_code: user.postal_code || prev.postal_code || '',
        email: user.email || ''
      }));
      // Completare din localStorage dacă profilul nu are adresă
      if (!user.county && !user.city && !user.address_street) {
        try {
          const raw = localStorage.getItem('atelier3d_customer_data');
          if (raw) {
            const saved = JSON.parse(raw);
            setProfileForm(prev => ({
              ...prev,
              county: prev.county || saved.county || '',
              city: prev.city || saved.city || '',
              address_street: prev.address_street || saved.address || '',
              postal_code: prev.postal_code || saved.postal_code || '',
              phone: prev.phone || saved.phone || ''
            }));
          }
        } catch (e) {}
      }
      loadOrders();
      setWishlistIds(getCustomerWishlist());
    }
  }, [user, loadOrders]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateCustomerProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        county: profileForm.county.trim(),
        city: profileForm.city.trim(),
        address_street: profileForm.address_street.trim(),
        postal_code: profileForm.postal_code.trim()
      });
      // Sincronizare în localStorage pentru checkout rapid
      try {
        const existingRaw = localStorage.getItem('atelier3d_customer_data');
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        localStorage.setItem('atelier3d_customer_data', JSON.stringify({
          ...existing,
          phone: profileForm.phone.trim(),
          county: profileForm.county.trim(),
          city: profileForm.city.trim(),
          address: profileForm.address_street.trim(),
          postal_code: profileForm.postal_code.trim()
        }));
        if (profileForm.phone.trim()) {
          localStorage.setItem('atelier3d_customer_phone', profileForm.phone.trim());
        }
      } catch (e) {}
      setProfileSuccessMsg('Datele tale au fost actualizate cu succes!');
      setTimeout(() => setProfileSuccessMsg(''), 3500);
    } catch (err) {
      console.error('Eroare actualizare profil:', err);
      setProfileSuccessMsg('⚠️ A apărut o eroare. Te rugăm încearcă din nou.');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    const res = toggleCustomerWishlist(productId);
    setWishlistIds(res.wishlist);
  };

  // Produse favorite complete
  const safeWishlistIds = Array.isArray(wishlistIds) ? wishlistIds : [];
  const wishlistProducts = allProducts.filter(p => safeWishlistIds.includes(p.id));

  // Comenzi active
  const activeOrdersCount = orders.filter(o => o.status !== 'expediata').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'noua':
        return { text: 'În Prelucrare', className: 'status-noua', step: 1 };
      case 'in_productie':
        return { text: 'În Producție 3D', className: 'status-in_productie', step: 2 };
      case 'printata':
        return { text: 'Finisată & Ambalată', className: 'status-printata', step: 3 };
      case 'expediata':
        return { text: 'Expediată prin Curier', className: 'status-expediata', step: 4 };
      default:
        return { text: status, className: 'status-noua', step: 1 };
    }
  };

  return (
    <div className="account-portal-page">
      <div className="container">
        {/* Banner Profil Client */}
        <div className="account-hero-card">
          <div className="account-user-meta">
            <div className="account-avatar">
              {(user?.name || user?.email || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 className="account-name">{user?.name || 'Client Scoatem3D'}</h1>
                {user?.isAdmin && (
                  <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontWeight: '700', border: '1px solid #bbf7d0' }}>
                    <ShieldCheck size={12} /> Administrator
                  </span>
                )}
              </div>
              <p className="account-email">{user?.email}</p>
            </div>
          </div>

          <div className="account-hero-actions">
            {user?.isAdmin && (
              <button 
                className="btn-primary" 
                onClick={onNavigateAdmin} 
                style={{ fontSize: '0.86rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Deschide panoul de administrare"
              >
                <ShieldCheck size={16} />
                <span>Panou Admin</span>
              </button>
            )}
            <button className="btn-secondary" onClick={onBackToShop} style={{ fontSize: '0.86rem', padding: '8px 16px' }}>
              ← Înapoi la Magazin
            </button>
            <button className="btn-secondary btn-logout" onClick={onLogout} style={{ fontSize: '0.86rem', padding: '8px 16px' }}>
              <LogOut size={15} />
              <span>Deconectare</span>
            </button>
          </div>
        </div>

        {/* Cifre Cheie / Statistici */}
        <div className="account-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="account-metric-card" onClick={() => setActiveTab('orders')}>
            <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Package size={22} />
            </div>
            <div>
              <div className="metric-num">{orders.length}</div>
              <div className="metric-lbl">Comenzi Totale</div>
            </div>
          </div>

          <div className="account-metric-card" onClick={() => setActiveTab('orders')}>
            <div className="metric-icon" style={{ background: 'var(--status-prod-bg)', color: 'var(--status-prod-text)' }}>
              <Clock size={22} />
            </div>
            <div>
              <div className="metric-num">{activeOrdersCount}</div>
              <div className="metric-lbl">În Producție / Livrare</div>
            </div>
          </div>

          <div className="account-metric-card" onClick={() => setActiveTab('wishlist')}>
            <div className="metric-icon" style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)' }}>
              <Heart size={22} />
            </div>
            <div>
              <div className="metric-num">{wishlistProducts.length}</div>
              <div className="metric-lbl">Produse Favorite</div>
            </div>
          </div>
        </div>

        {/* Taburi Navigare Cont */}
        <div className="account-tabs-nav">
          <button 
            className={`account-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={17} />
            <span>Comenzile Mele ({orders.length})</span>
          </button>
          <button 
            className={`account-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={17} />
            <span>Favorite ({wishlistProducts.length})</span>
          </button>
          <button 
            className={`account-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={17} />
            <span>Profil & Date Livrare</span>
          </button>
        </div>

        {/* CONȚINUT TABURI */}
        <div className="account-tab-panel">
          {/* TAB 1: COMENZILE MELE & TRACKING */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Istoricul Comenzilor Tale</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Urmărește în timp real stadiul fiecărei piese imprimate 3D pentru tine.
                  </p>
                </div>
                <button className="btn-secondary" onClick={loadOrders} style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                  <RotateCw size={14} className={isLoadingOrders ? 'animate-spin' : ''} />
                  <span>Actualizează</span>
                </button>
              </div>

              {isLoadingOrders ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                  Se încarcă istoricul comenzilor...
                </div>
              ) : orders.length === 0 ? (
                <div className="account-empty-state">
                  <div className="empty-state-icon">
                    <Package size={44} color="var(--primary)" />
                  </div>
                  <h4>Nu ai plasat nicio comandă încă.</h4>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '8px auto 20px', fontSize: '0.9rem' }}>
                    Personalizează o lampă litofanie, un breloc auto sau o veioză lună 3D și transformă-ți amintirile în piese reale!
                  </p>
                  <button className="btn-primary" onClick={onBackToShop}>
                    Explorează Catalogul de Cadouri
                  </button>
                </div>
              ) : (
                <div className="customer-orders-list">
                  {orders.map((order) => {
                    const statusInfo = getStatusBadge(order.status);
                    const formattedTotal = Number(order.total).toFixed(2).replace('.', ',');
                    const formattedDate = new Date(order.created_at).toLocaleDateString('ro-RO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    });

                    return (
                      <article key={order.id} className="customer-order-card">
                        {/* Header Comandă */}
                        <div className="order-card-top">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span className="order-id-label">Comanda #{order.id}</span>
                              <span className={`status-pill ${statusInfo.className}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            <span className="order-date-text">
                              <Calendar size={13} /> Plasată pe {formattedDate}
                            </span>
                          </div>

                          <div className="order-total-pill">
                            <span className="total-lbl">Total Plată:</span>
                            <span className="total-val">{formattedTotal} Lei</span>
                          </div>
                        </div>

                        {/* BARA GRAFICĂ DE TRACKING COMANDĂ */}
                        <div className="order-tracking-stepper">
                          <div className={`track-step ${statusInfo.step >= 1 ? 'completed' : ''}`}>
                            <div className="track-bullet">{statusInfo.step >= 1 ? '✓' : '1'}</div>
                            <span className="track-name">Comandă Primită</span>
                          </div>
                          <div className={`track-line ${statusInfo.step >= 2 ? 'active' : ''}`}></div>

                          <div className={`track-step ${statusInfo.step >= 2 ? 'completed' : ''}`}>
                            <div className="track-bullet">{statusInfo.step >= 2 ? '✓' : '2'}</div>
                            <span className="track-name">Modelare & Slicing</span>
                          </div>
                          <div className={`track-line ${statusInfo.step >= 3 ? 'active' : ''}`}></div>

                          <div className={`track-step ${statusInfo.step >= 3 ? 'completed' : ''}`}>
                            <div className="track-bullet">{statusInfo.step >= 3 ? '✓' : '3'}</div>
                            <span className="track-name">Imprimare 3D</span>
                          </div>
                          <div className={`track-line ${statusInfo.step >= 4 ? 'active' : ''}`}></div>

                          <div className={`track-step ${statusInfo.step >= 4 ? 'completed' : ''}`}>
                            <div className="track-bullet">{statusInfo.step >= 4 ? '✓' : '4'}</div>
                            <span className="track-name">Expediată</span>
                          </div>
                        </div>

                        {/* Articole din Comandă */}
                        <div className="order-items-wrapper">
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="order-item-detail-row">
                              <div className="order-item-img-box">
                                <img 
                                  src={item.customization?.photo || '/images/products/lampa-litofanie.jpg'} 
                                  alt={item.product_name}
                                  onClick={() => {
                                    if (item.customization?.photo && onOpenImageViewer) {
                                      onOpenImageViewer(item.customization.photo, item.product_name);
                                    }
                                  }}
                                />
                              </div>

                              <div style={{ flexGrow: 1, minWidth: 0 }}>
                                <h4 className="order-item-name">{item.product_name}</h4>
                                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                  Cantitate: <strong>{item.quantity || 1} buc</strong> • Preț: <strong>{Number(item.price).toFixed(2).replace('.', ',')} Lei</strong>
                                </div>

                                {/* Personalizările produsului */}
                                {item.customization && Object.keys(item.customization).length > 0 && (
                                  <div className="order-customizations-box">
                                    {Object.entries(item.customization)
                                      .filter(([k]) => !k.endsWith('_filename'))
                                      .map(([k, val], i) => (
                                        <div key={i} className="custom-entry-pill">
                                          <span className="entry-key">{k}:</span>
                                          <strong className="entry-val">
                                            {typeof val === 'string' && val.startsWith('http') ? 'Fotografie atașată' : val}
                                          </strong>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Subsol Comandă */}
                        <div className="order-card-footer">
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                            <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                            <span>Livrare la: <strong>{order.customer_address}</strong></span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Bună ziua! Am o întrebare despre comanda mea #${order.id} (${user.email}).`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary"
                              style={{ padding: '6px 14px', fontSize: '0.82rem', textDecoration: 'none' }}
                            >
                              <span>Întreabă pe WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUSE FAVORITE (WISHLIST) */}
          {activeTab === 'wishlist' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px' }}>Produsele Tale Favorite</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Piesele pe care le-ai salvat pentru a le personaliza sau comanda mai târziu.
              </p>

              {wishlistProducts.length === 0 ? (
                <div className="account-empty-state">
                  <div className="empty-state-icon" style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)' }}>
                    <Heart size={44} />
                  </div>
                  <h4>Lista ta de favorite este goală.</h4>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '8px auto 20px', fontSize: '0.9rem' }}>
                    Apasă pe inimioara de pe cardul oricărui produs pentru a-l salva aici!
                  </p>
                  <button className="btn-primary" onClick={onBackToShop}>
                    Vezi Toate Modelele
                  </button>
                </div>
              ) : (
                <div className="products-grid">
                  {wishlistProducts.map((prod) => (
                    <article key={prod.id} className="product-card">
                      <div className="product-img-box">
                        {prod.badge && (
                          <div className="card-badge-top">
                            <span className="badge badge-gold">{prod.badge}</span>
                          </div>
                        )}
                        <img src={prod.image_url} alt={prod.name} />
                      </div>

                      <div className="product-body">
                        <span className="product-category-label">{prod.category}</span>
                        <h4 className="product-name">{prod.name}</h4>
                        <p className="product-description-snippet">{prod.description}</p>

                        <div className="product-card-footer">
                          <div className="product-price">
                            {Number(prod.price).toFixed(2).replace('.', ',')} <span>Lei</span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleRemoveFromWishlist(prod.id)}
                              title="Șterge din favorite"
                              style={{ color: '#DC2626' }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => onSelectProduct(prod.id)}
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Comandă
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFIL & DATE LIVRARE */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '680px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px' }}>Date Personale &amp; Livrare</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Aceste informații vor fi completate automat la checkout pentru a economisi timp la fiecare comandă.
              </p>

              {profileSuccessMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: profileSuccessMsg.startsWith('⚠') ? '#FEF3C7' : 'var(--accent-sage-light)',
                  color: profileSuccessMsg.startsWith('⚠') ? '#92400E' : 'var(--accent-sage)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  <CheckCircle2 size={18} />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                {/* DATE PERSONALE */}
                <p style={{ fontSize: '0.76rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Date Personale</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group-custom" style={{ margin: 0 }}>
                    <label className="form-label-custom">Nume și Prenume</label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="ex: Popescu Ion"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group-custom" style={{ margin: 0 }}>
                    <label className="form-label-custom">Număr de Telefon (pentru curier)</label>
                    <input
                      type="tel"
                      className="custom-input"
                      placeholder="07xxxxxxxx"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Adresă de Email (folosită la autentificare)</label>
                  <input
                    type="email"
                    disabled
                    className="custom-input"
                    style={{ background: '#F0ECE6', cursor: 'not-allowed' }}
                    value={profileForm.email}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Email-ul este unic și nu poate fi modificat.
                  </span>
                </div>

                {/* ADRESĂ DE LIVRARE */}
                <p style={{ fontSize: '0.76rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px', marginTop: '8px' }}>Adresă Implicită de Livrare</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group-custom" style={{ margin: 0 }}>
                    <label className="form-label-custom">Județ</label>
                    <select
                      className="custom-input"
                      value={profileForm.county}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, county: e.target.value }))}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">— Selectează Județul —</option>
                      {ROMANIAN_COUNTIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-custom" style={{ margin: 0 }}>
                    <label className="form-label-custom">Localitate</label>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="ex: Cluj-Napoca"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Strada, Nr., Bloc, Ap.</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="ex: Str. Florilor nr. 12, bl. A, ap. 5"
                    value={profileForm.address_street}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, address_street: e.target.value }))}
                  />
                </div>

                <div className="form-group-custom" style={{ maxWidth: '220px' }}>
                  <label className="form-label-custom">Cod Poștal</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="ex: 400001"
                    maxLength={6}
                    value={profileForm.postal_code}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, postal_code: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={profileSaving}
                  style={{ padding: '12px 28px', marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {profileSaving ? (
                    <>
                      <RotateCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Se salvează...</span>
                    </>
                  ) : (
                    <span>Salvează Modificările</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
