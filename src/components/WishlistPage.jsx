import React from 'react';
import { 
  Heart, 
  ArrowLeft, 
  Trash2, 
  ShoppingBag, 
  Sparkles, 
  User, 
  Box, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import ProductCard from './ProductCard';
import Footer from './Footer';

export default function WishlistPage({
  wishlistIds = [],
  allProducts = [],
  onSelectProduct,
  onBackToShop,
  onToggleWishlist,
  onOpenCustomize,
  currentUser,
  onOpenAuthModal,
  isLoadingProducts = false
}) {
  // Produsele salvate la favorite
  const safeIds = Array.isArray(wishlistIds) ? wishlistIds : [];
  const wishlistProducts = allProducts.filter(prod => safeIds.includes(prod.id));

  // Produse recomandate dacă lista e goală (primele 3 produse)
  const suggestedProducts = allProducts.slice(0, 3);

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Bara de sus / Navigare înapoi */}
        <div className="detail-top-nav" style={{ marginBottom: '24px' }}>
          <button 
            className="btn-back-nav" 
            onClick={onBackToShop}
            title="Înapoi la magazin"
          >
            <ArrowLeft size={18} />
            <span>Înapoi la Catalog</span>
          </button>

          <div className="detail-breadcrumbs">
            <span onClick={onBackToShop} className="crumb-link">Magazin</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Favorite ({wishlistProducts.length})</span>
          </div>

          {wishlistProducts.length > 0 && (
            <div style={{ marginLeft: 'auto' }}>
              <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Heart size={13} fill="#C26377" color="#C26377" />
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'produs salvat' : 'produse salvate'}
              </span>
            </div>
          )}
        </div>

        {/* Header Secțiune Favorite */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '180px',
            height: '180px',
            background: 'radial-gradient(circle, var(--accent-rose-light) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-rose">
                <Heart size={13} fill="#C26377" color="#C26377" /> Colecția Ta
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'model' : 'modele'} în listă
              </span>
            </div>

            <h1 style={{ fontSize: '2.1rem', marginBottom: '10px', letterSpacing: '-0.5px' }}>
              Produsele Tale Favorite
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.6' }}>
              Aici găsești toate cadourile și decorațiunile 3D pe care le-ai salvat. Configurează-le cu textele și fotografiile tale sau adaugă-le direct în coș!
            </p>
          </div>

          {/* Banner pentru vizitatori nelogați */}
          {!currentUser && (
            <div style={{
              marginTop: '24px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-warm-tint)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                <Sparkles size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Sfat util:</strong> Favoritele sunt salvate în browserul tău. Conectează-te pentru a le păstra permanent pe orice dispozitiv!
                </span>
              </div>
              <button 
                className="btn-secondary" 
                onClick={onOpenAuthModal}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                <User size={14} color="var(--primary)" />
                <span>Intră în Cont</span>
              </button>
            </div>
          )}
        </div>

        {/* Conținut: Grid Favorite sau Empty State */}
        {isLoadingProducts ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
            <p>Se încarcă produsele favorite...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* Stare listă goală */
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 24px',
            textAlign: 'center',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '600px',
            margin: '0 auto 60px'
          }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'var(--accent-rose-light)',
              color: 'var(--accent-rose)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <Heart size={36} fill="#C26377" />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>
              Lista ta de favorite este goală
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '28px', maxWidth: '460px', margin: '0 auto 28px' }}>
              Nu ai adăugat încă niciun produs la favorite. Răsfoiește catalogul nostru și apasă pe inimioara de pe cardul oricărui produs pentru a-l salva aici!
            </p>

            <button 
              className="btn-primary" 
              onClick={onBackToShop}
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              <span>Explorează Catalogul de Cadouri</span>
              <ArrowRight size={17} />
            </button>

            {/* Sugestii de modele populare */}
            {suggestedProducts.length > 0 && (
              <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-light)', textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  Câteva modele populare din atelier:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                  {suggestedProducts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => onSelectProduct(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-body)',
                        cursor: 'pointer',
                        border: '1px solid var(--border-light)',
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    >
                      <img 
                        src={p.image_url} 
                        alt={p.name} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} 
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700' }}>
                          {Number(p.price).toFixed(2).replace('.', ',')} Lei
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Grid produse favorite */
          <div style={{ marginBottom: '60px' }}>
            <div className="products-grid">
              {wishlistProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onCustomize={onOpenCustomize}
                  onViewProduct={onSelectProduct}
                  isWishlisted={true}
                  onToggleWishlist={onToggleWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Artizanal Cald */}
      <Footer onNavigateShop={onBackToShop} />
    </div>
  );
}
