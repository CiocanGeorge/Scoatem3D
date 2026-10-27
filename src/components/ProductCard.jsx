import React from 'react';
import { ArrowRight, Wand2, Star, Eye, Heart } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onCustomize, 
  onViewProduct, 
  isWishlisted = false, 
  onToggleWishlist 
}) {
  const getBadgeClass = (badgeText) => {
    if (!badgeText) return 'badge-terracotta';
    const lower = badgeText.toLowerCase();
    if (lower.includes('bestseller') || lower.includes('top')) return 'badge-gold';
    if (lower.includes('nou')) return 'badge-terracotta';
    if (lower.includes('popular') || lower.includes('dulce')) return 'badge-sage';
    return 'badge-rose';
  };

  const formattedPrice = Number(product.price).toFixed(2).replace('.', ',');

  const handleCardClick = () => {
    if (onViewProduct) {
      onViewProduct(product.id);
    } else if (onCustomize) {
      onCustomize(product);
    }
  };

  return (
    <article className="product-card clickable-card" onClick={handleCardClick}>
      <div className="product-img-box">
        {product.badge && (
          <div className="card-badge-top">
            <span className={`badge ${getBadgeClass(product.badge)}`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Buton Wishlist Favorite */}
        <button 
          type="button"
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product.id);
          }}
          title={isWishlisted ? "Șterge din favorite" : "Salvează la favorite"}
        >
          <Heart 
            size={16} 
            fill={isWishlisted ? "#C26377" : "none"} 
            color={isWishlisted ? "#C26377" : "currentColor"} 
          />
        </button>

        <img 
          src={product.image_url || '/images/products/lampa-litofanie.jpg'} 
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/products/lampa-litofanie.jpg';
          }}
        />
        <div className="card-hover-overlay">
          <span className="btn-view-quick">
            <Eye size={15} /> Vezi Detalii & Recenzii
          </span>
        </div>
      </div>

      <div className="product-body">
        <div className="product-card-top-meta">
          <span className="product-category-label">{product.category}</span>
          {product.rating ? (
            <div className="card-rating-tiny">
              <Star size={13} fill="#D48B28" color="#D48B28" />
              <span>{product.rating}</span>
            </div>
          ) : null}
        </div>

        <h3 className="product-name">{product.name}</h3>
        <p className="product-description-snippet">{product.description}</p>

        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="price-label">Preț de la</span>
            <div className="product-price">
              {formattedPrice} <span>Lei</span>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={(e) => {
              e.stopPropagation();
              if (onViewProduct) {
                onViewProduct(product.id);
              } else if (onCustomize) {
                onCustomize(product);
              }
            }}
            style={{ padding: '9px 16px', fontSize: '0.86rem' }}
          >
            <span>Comandă</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
