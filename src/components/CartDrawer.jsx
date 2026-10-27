import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Image as ImageIcon } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
  const deliveryThreshold = 200;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryCost = subtotal > 0 ? (isFreeDelivery ? 0 : 25) : 0;
  const grandTotal = subtotal + deliveryCost;

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Coș de cumpărături"
      >
        {/* Header */}
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Coșul tău ({cartItems.length})</h3>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Închide coșul"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {cartItems.length > 0 && (
          <div style={{
            background: isFreeDelivery ? 'var(--accent-sage-light)' : 'var(--bg-warm-tint)',
            padding: '10px 24px',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: isFreeDelivery ? 'var(--accent-sage)' : 'var(--text-secondary)',
            borderBottom: '1px solid var(--border-light)'
          }}>
            {isFreeDelivery ? (
              '🎉 Felicitări! Beneficiezi de livrare GRATUITĂ prin curier rapid!'
            ) : (
              `Mai adaugă produse de ${(deliveryThreshold - subtotal).toFixed(2).replace('.', ',')} Lei pentru LIVRARE GRATUITĂ!`
            )}
          </div>
        )}

        {/* Cart Items List */}
        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-warm-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <ShoppingBag size={28} color="var(--text-muted)" />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Coșul tău este gol</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Descoperă produsele noastre și personalizează primul tău cadou 3D!</p>
              <button className="btn-secondary" onClick={onClose}>
                Vezi Catalogul de Produse
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const itemTotal = (Number(item.price) * (item.quantity || 1)).toFixed(2).replace('.', ',');
              const customKeys = Object.keys(item.customization || {}).filter(k => !k.endsWith('_filename'));

              return (
                <div key={index} className="cart-item-card">
                  <img
                    src={item.image_url || '/images/products/lampa-litofanie.jpg'}
                    alt={item.product_name}
                    className="cart-item-thumb"
                  />

                  <div className="cart-item-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 className="cart-item-title">{item.product_name}</h4>
                      <button
                        onClick={() => onRemoveItem(index)}
                        style={{ color: '#9CA3AF', transition: 'color 0.2s', padding: '2px' }}
                        title="Șterge din coș"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '6px' }}>
                      {Number(item.price).toFixed(2).replace('.', ',')} Lei
                    </div>

                    {/* Rezumat Personalizare */}
                    {customKeys.length > 0 && (
                      <div className="cart-item-custom-list">
                        {customKeys.map(key => {
                          const val = item.customization[key];
                          const filename = item.customization[`${key}_filename`];
                          const isImage = typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:image'));

                          return (
                            <div key={key} className="cart-item-custom-entry">
                              <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{key}:</span>
                              {isImage ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-sage)', fontWeight: '600' }}>
                                  <ImageIcon size={12} /> {filename || 'Fotografie încărcată'}
                                </span>
                              ) : (
                                <span>{val}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Selector Cantitate */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                        <button
                          onClick={() => onUpdateQuantity(index, Math.max(1, (item.quantity || 1) - 1))}
                          style={{ fontWeight: 'bold', fontSize: '0.9rem', padding: '0 4px' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(index, (item.quantity || 1) + 1)}
                          style={{ fontWeight: 'bold', fontSize: '0.9rem', padding: '0 4px' }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
                        {itemTotal} Lei
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Sumar & Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal-row">
              <span>Subtotal produse</span>
              <span>{subtotal.toFixed(2).replace('.', ',')} Lei</span>
            </div>

            <div className="cart-subtotal-row">
              <span>Livrare curier rapid</span>
              <span>
                {deliveryCost === 0 ? (
                  <strong style={{ color: 'var(--accent-sage)' }}>GRATUIT</strong>
                ) : (
                  `${deliveryCost.toFixed(2).replace('.', ',')} Lei`
                )}
              </span>
            </div>

            <div className="cart-total-row">
              <span>Total de plată</span>
              <span style={{ color: 'var(--primary)' }}>{grandTotal.toFixed(2).replace('.', ',')} Lei</span>
            </div>

            <button
              className="btn-primary"
              onClick={onCheckout}
              style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '1rem' }}
            >
              <span>Continuă spre Checkout</span>
              <ArrowRight size={18} />
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '10px' }}>
              Plată ramburs la livrare sau transfer direct • Verificare colet
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
