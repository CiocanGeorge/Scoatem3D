import React from 'react';
import { ArrowLeft, Printer, FileText, Shield, Cookie, ExternalLink, Scale } from 'lucide-react';

export default function LegalHeaderNav({ 
  currentPage = 'termeni', // 'termeni' | 'confidentialitate' | 'cookies'
  onBack,
  onNavigateLegal,
  quickLinks = []
}) {
  const tabs = [
    { id: 'termeni', label: 'Termeni și Condiții', href: '#/termeni-si-conditii', icon: <FileText size={15} /> },
    { id: 'confidentialitate', label: 'Confidențialitate', href: '#/politica-de-confidentialitate', icon: <Shield size={15} /> },
    { id: 'cookies', label: 'Cookie-uri', href: '#/politica-de-cookie-uri', icon: <Cookie size={15} /> },
  ];

  const handleTabClick = (e, tabId, href) => {
    e.preventDefault();
    if (onNavigateLegal) {
      onNavigateLegal(tabId);
    } else {
      window.location.hash = href;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ marginBottom: '28px' }}>
      
      {/* Rândul de sus: Buton Înapoi + Buton Printare */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <button
          onClick={onBack}
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-light)', 
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-main)', 
            cursor: 'pointer', 
            fontSize: '0.86rem', 
            fontWeight: '600',
            padding: '8px 18px', 
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--primary)';
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-main)';
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={16} /> Înapoi la magazin
        </button>

        <button
          onClick={handlePrint}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-full)',
            padding: '7px 14px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Tipărește sau salvează documentul ca PDF"
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--text-main)';
            e.currentTarget.style.borderColor = 'var(--text-secondary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-light)';
          }}
        >
          <Printer size={14} /> Tipărește / Salvează PDF
        </button>
      </div>

      {/* Rândul de navigare rapidă între politicile legale (Tab-uri) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px 12px',
        padding: '10px 14px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--text-muted)', marginRight: '4px' }}>
          Documente Legale:
        </span>

        {tabs.map(tab => {
          const isActive = currentPage === tab.id;
          return (
            <a
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleTabClick(e, tab.id, tab.href)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.84rem',
                fontWeight: isActive ? '700' : '500',
                textDecoration: 'none',
                background: isActive ? 'var(--primary)' : 'var(--bg-warm-tint)',
                color: isActive ? 'white' : 'var(--text-main)',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                transition: 'all 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </a>
          );
        })}

        <div style={{ height: '18px', width: '1px', background: 'var(--border-light)', margin: '0 4px' }} />

        {/* Linkuri externe ANPC / SOL */}
        <a
          href="https://anpc.ro/ce-este-sal/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: '600',
            textDecoration: 'none',
            color: '#B45309',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            transition: 'all 0.15s ease'
          }}
          title="Soluționarea Alternativă a Litigiilor — ANPC"
        >
          <Scale size={13} />
          <span>ANPC (SAL)</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>↗</span>
        </a>

        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: '600',
            textDecoration: 'none',
            color: '#1D4ED8',
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            transition: 'all 0.15s ease'
          }}
          title="Soluționarea Online a Litigiilor — Comisia Europeană"
        >
          <ExternalLink size={13} />
          <span>SOL (UE)</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>↗</span>
        </a>
      </div>

      {/* Cuprins rapid (Table of Contents) dacă este specificat */}
      {quickLinks && quickLinks.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '10px 16px',
          background: 'var(--bg-warm-tint)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-light)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px 14px',
          fontSize: '0.8rem'
        }}>
          <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>Salt rapid la secțiune:</span>
          {quickLinks.map((item, idx) => (
            <a
              key={idx}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              {item.title}
            </a>
          ))}
        </div>
      )}

    </div>
  );
}
