import React from 'react';
import { Mail, MessageCircle, FileText, Shield, Cookie, Scale, ExternalLink } from 'lucide-react';

export default function Footer({ onNavigateShop, onNavigateLegal }) {
  const whatsappUrl = "https://wa.me/40763409836?text=Bun%C4%83%20ziua!%20V%C4%83%20contactez%20%C3%AEn%20leg%C4%83tur%C4%83%20cu%20produsele%20Scoatem3D.";

  const legalLinks = [
    { 
      label: 'Termeni și Condiții', 
      href: '#/termeni-si-conditii', 
      icon: <FileText size={15} style={{ color: 'var(--primary)' }} /> 
    },
    { 
      label: 'Politică de Confidențialitate', 
      href: '#/politica-de-confidentialitate', 
      icon: <Shield size={15} style={{ color: 'var(--primary)' }} /> 
    },
    { 
      label: 'Politică de Cookie-uri', 
      href: '#/politica-de-cookie-uri', 
      icon: <Cookie size={15} style={{ color: 'var(--primary)' }} /> 
    },
    { 
      label: 'Soluționarea Litigiilor — ANPC', 
      href: 'https://anpc.ro/ce-este-sal/', 
      external: true,
      icon: <Scale size={15} style={{ color: '#D97706' }} />
    },
    { 
      label: 'Platforma SOL (UE)', 
      href: 'https://ec.europa.eu/consumers/odr', 
      external: true,
      icon: <ExternalLink size={15} style={{ color: '#2563EB' }} />
    },
  ];

  const handleLegalClick = (e, href, external) => {
    if (external) return; // Deschide link extern oficial (ANPC / SOL) în tab nou
    e.preventDefault();
    if (onNavigateLegal) {
      onNavigateLegal(href);
    } else {
      window.location.hash = href.startsWith('#') ? href : `#${href}`;
    }
  };

  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', padding: '48px 0 32px' }}>
      <div className="container">
        
        {/* Secțiunea Principală: 3 Coloane Echilibrate */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '40px', 
          marginBottom: '32px', 
          alignItems: 'start' 
        }}>

          {/* Coloana 1: Brand & Prezentare */}
          <div>
            <div
              className="brand-logo"
              onClick={onNavigateShop}
              style={{ marginBottom: '12px', cursor: onNavigateShop ? 'pointer' : 'default' }}
            >
              <div className="brand-icon-box">
                <img src="/logo.png" alt="Scoatem3D Logo" />
              </div>
              <div className="brand-text">
                <h3 style={{ fontSize: '1.15rem' }}>Scoatem3D</h3>
                <span>Cadouri, Decor 3D &amp; Lumânări Artizanale</span>
              </div>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
              Creăm cadouri unice cu suflet — de la decorațiuni imprimate 3D cu fotografii litofanie la lumânări parfumate handmade din ceară naturală de soia. Fiecare piesă este lucrată cu pasiune în atelierul nostru.
            </p>
          </div>

          {/* Coloana 2: Comenzi & Livrare */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)', fontWeight: '700' }}>
              Comenzi &amp; Livrare
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>⏱️ <strong>Timp producție:</strong> 1-2 zile lucrătoare</li>
              <li>🚚 <strong>Livrare curier rapid:</strong> 24-48h pe teritoriul României</li>
              <li>🎁 <strong>Transport GRATUIT:</strong> la comenzi de peste 200 Lei</li>
              <li>💳 <strong>Plată:</strong> Ramburs securizat la primirea coletului</li>
            </ul>
          </div>

          {/* Coloana 3: Contact & Suport Direct */}
          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)', fontWeight: '700' }}>
              Contact &amp; Suport
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>

              {/* Email */}
              <a
                href="mailto:ciocan_george97@yahoo.com"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                title="Trimite-ne un e-mail"
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>Email Suport</div>
                  <strong style={{ fontSize: '0.88rem' }}>ciocan_george97@yahoo.com</strong>
                </div>
              </a>

              {/* WhatsApp & Telefon */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', textDecoration: 'none', transition: 'transform 0.15s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                title="Deschide conversație pe WhatsApp"
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#16A34A', textTransform: 'uppercase', fontWeight: '700' }}>WhatsApp &amp; Comenzi</div>
                  <strong style={{ fontSize: '0.92rem' }}>0763 409 836</strong>
                </div>
              </a>

              {/* Buton Direct WhatsApp */}
              <div style={{ marginTop: '2px' }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: '#25D366', 
                    color: 'white', 
                    padding: '8px 18px', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.82rem', 
                    fontWeight: '700', 
                    textDecoration: 'none', 
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)', 
                    transition: 'all 0.2s ease' 
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
                  <MessageCircle size={15} />
                  <span>Scrie-ne pe WhatsApp</span>
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Secțiunea Legală — Toate opțiunile plasate pe ACEEAȘI LINIE */}
        <div style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: 'var(--bg-warm-tint)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px 20px'
        }}>
          <span style={{ fontSize: '0.76rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
            Informații Legale:
          </span>
          {legalLinks.map(({ label, href, external, icon }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              onClick={(e) => handleLegalClick(e, href, external)}
              style={{
                fontSize: '0.84rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 3px 8px rgba(200,90,50,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
              }}
            >
              {icon}
              <span>{label}</span>
              {external && <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>↗</span>}
            </a>
          ))}
        </div>

        {/* Plachete Vizuale Oficiale ANPC (SAL & SOL) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Badge ANPC SAL */}
          <a
            href="https://anpc.ro/ce-este-sal/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1.5px solid #F59E0B',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)',
              transition: 'all 0.2s ease',
              maxWidth: '300px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(245, 158, 11, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.08)';
            }}
            title="ANPC — Soluționarea Alternativă a Litigiilor"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#FEF3C7',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '1.1rem'
            }}>
              ⚖️
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', color: '#B45309' }}>
                ANPC — SAL
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>
                Soluționarea Alternativă a Litigiilor
              </div>
            </div>
          </a>

          {/* Badge SOL Comisia Europeana */}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1.5px solid #3B82F6',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.08)',
              transition: 'all 0.2s ease',
              maxWidth: '300px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(59, 130, 246, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.08)';
            }}
            title="Platforma SOL a Comisiei Europene"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#DBEAFE',
              color: '#1D4ED8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: '1.1rem'
            }}>
              🇪🇺
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', color: '#1D4ED8' }}>
                COMISIA EUROPEANĂ
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>
                Soluționarea Online a Litigiilor (SOL)
              </div>
            </div>
          </a>
        </div>

        {/* Bara de Jos a Footer-ului (Copyright & Credite) */}
        <div style={{ 
          paddingTop: '20px', 
          borderTop: '1px solid var(--border-light)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '12px', 
          alignItems: 'center',
          fontSize: '0.8rem', 
          color: 'var(--text-muted)' 
        }}>
          <div>
            © {new Date().getFullYear()} Scoatem3D România. Toate drepturile rezervate.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Creat cu pasiune — produse 3D &amp; lumânări artizanale handmade.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
