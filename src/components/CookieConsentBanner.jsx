import React, { useState, useEffect } from 'react';
import { Cookie, X, Check, Shield } from 'lucide-react';

const STORAGE_KEY = 'scoatem3d_cookie_consent';

export default function CookieConsentBanner({ onNavigateCookies }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Arată bannerul cu o mică întârziere pentru un efect plăcut
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage indisponibil (ex: mod privat extrem)
    }
  }, []);

  const handleAccept = (type) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        type,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Nu s-a putut salva consimțământul:', e);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Consimțământ Cookie-uri"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        maxWidth: '540px',
        margin: '0 auto 0 0',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.16)',
        padding: '22px 24px',
        zIndex: 9999,
        animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Cookie size={22} />
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-main)' }}>
            Respectăm confidențialitatea ta 🍪
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.55' }}>
            Folosim cookie-uri esențiale pentru a-ți păstra coșul de cumpărături salvat și pentru a asigura buna funcționare a magazinului Scoatem3D. 
            Poți consulta oricând{' '}
            <a
              href="#/politica-de-cookie-uri"
              onClick={(e) => {
                if (onNavigateCookies) {
                  e.preventDefault();
                  onNavigateCookies();
                }
              }}
              style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
            >
              Politica noastră de Cookie-uri
            </a>.
          </p>
        </div>

        <button
          onClick={() => handleAccept('essential')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          title="Închide și acceptă doar cookie-urile esențiale"
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Butoane de acțiune */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleAccept('essential')}
          style={{
            background: 'var(--bg-warm-tint)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-main)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-secondary)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Doar esențiale
        </button>

        <button
          type="button"
          onClick={() => handleAccept('all')}
          style={{
            background: 'var(--primary)',
            border: 'none',
            color: 'white',
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.84rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(200, 90, 50, 0.25)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.92';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Check size={15} />
          <span>Acceptă toate</span>
        </button>
      </div>
    </aside>
  );
}
