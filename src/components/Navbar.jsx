import React from 'react';
import { ShoppingBag, Box, ShieldCheck, User, Heart, Store, LogIn } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  currentView,
  onNavigate,
  currentUser,
  onOpenAuthModal,
  onLogout,
  wishlistCount = 0
}) {
  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Logo & Brand - Click duce întotdeauna la Magazin */}
          <div
            className="brand-logo"
            onClick={() => onNavigate('shop')}
            title="Scoatem3D - Înapoi la Magazin"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('shop')}
          >
            <div className="brand-icon-box">
              <img src="/logo.png" alt="Scoatem3D Logo" />
            </div>
            <div className="brand-text">
              <h1>Scoatem3D</h1>
              <span>Decor 3D & Lumânări Artizanale</span>
            </div>
          </div>

          {/* Meniu Navigare */}
          <nav className="nav-actions" aria-label="Meniu principal">
            {/* Buton Magazin - Permanent */}
            <button
              className={`nav-item-btn ${currentView === 'shop' || currentView === 'product' ? 'active' : ''}`}
              onClick={() => onNavigate('shop')}
              title="Catalog Magazin Online"
              aria-label="Magazin"
            >
              <Store
                size={17}
                color={currentView === 'shop' || currentView === 'product' ? 'var(--primary)' : 'var(--text-main)'}
              />
              <span className="nav-item-label">Magazin</span>
            </button>

            {/* Buton Favorite Wishlist - DOAR pentru utilizatori logati */}
            {currentUser && (
              <button
                className={`nav-item-btn btn-wishlist-nav ${currentView === 'wishlist' ? 'active' : ''}`}
                onClick={() => onNavigate('wishlist')}
                title={wishlistCount > 0 ? `${wishlistCount} produse favorite` : 'Lista de favorite'}
                aria-label="Favorite"
              >
                <div className="heart-counter-wrap">
                  <Heart
                    size={wishlistCount > 0 ? 25 : 19}
                    fill={wishlistCount > 0 ? '#C26377' : 'none'}
                    color={wishlistCount > 0 ? '#C26377' : (currentView === 'wishlist' ? 'var(--primary)' : 'var(--text-main)')}
                    strokeWidth={wishlistCount > 0 ? 1.5 : 2}
                  />
                  {wishlistCount > 0 && (
                    <span
                      className="heart-counter-number"
                      style={{ fontSize: wishlistCount > 9 ? '0.54rem' : '0.64rem' }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="nav-item-label">Favorite</span>
              </button>
            )}


            {/* TAB-URI PENTRU UTILIZATOR LOGAT */}
            {currentUser ? (
              <>
                {/* Buton Contul Meu */}
                <button
                  className={`nav-item-btn user-nav-btn ${currentView === 'account' ? 'active' : ''}`}
                  onClick={() => onNavigate('account')}
                  title="Accesează contul tău, comenzile și profilul"
                  aria-label="Contul Meu"
                >
                  <div className="nav-avatar-mini" style={{ position: 'relative' }}>
                    {(currentUser.name || currentUser.email || 'C').charAt(0).toUpperCase()}
                    {currentUser.isAdmin && (
                      <span style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#22c55e',
                        border: '1.5px solid var(--bg-main)'
                      }} title="Administrator" />
                    )}
                  </div>
                  <span className="nav-item-label user-nav-name">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Contul Meu'}
                  </span>
                </button>

                {/* Buton Admin (Apare DOAR dacă utilizatorul are rolul admin) */}
                {currentUser.isAdmin && (
                  <button
                    className={`nav-item-btn btn-admin-nav ${currentView === 'admin' ? 'active' : ''}`}
                    onClick={() => onNavigate('admin')}
                    title="Panou de control administrator"
                    aria-label="Admin"
                  >
                    <ShieldCheck
                      size={17}
                      color={currentView === 'admin' ? 'var(--primary)' : 'var(--text-secondary)'}
                    />
                    <span className="nav-item-label">Admin</span>
                  </button>
                )}
              </>
            ) : (
              /* BUTON AUTENTIFICARE (Când NU ești logat) */
              <button
                className="nav-item-btn"
                onClick={onOpenAuthModal}
                title="Intră în cont sau înregistrează-te"
                aria-label="Autentificare"
              >
                <LogIn size={17} color="var(--primary)" />
                <span className="nav-item-label">Autentificare</span>
              </button>
            )}

            {/* Buton Coș Cumpărături - Permanent */}
            <button
              className="cart-button-nav"
              onClick={onOpenCart}
              title="Deschide coșul de cumpărături"
              aria-label="Deschide coșul de cumpărături"
            >
              <ShoppingBag size={18} color="var(--primary)" />
              <span className="nav-item-label" style={{ fontSize: '0.88rem' }}>Coș</span>
              {cartCount > 0 && (
                <span className="cart-badge-count">{cartCount}</span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
