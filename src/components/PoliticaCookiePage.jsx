import React, { useEffect } from 'react';
import { Cookie } from 'lucide-react';
import LegalHeaderNav from './LegalHeaderNav';

export default function PoliticaCookiePage({ onBack, onNavigateLegal }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const quickLinks = [
    { id: 'sec-ce-sunt', title: '1. Ce sunt' },
    { id: 'sec-tipuri', title: '2. Tipuri Cookie-uri' },
    { id: 'sec-terti', title: '3. Terți' },
    { id: 'sec-control', title: '5. Gestionare & Ștergere' }
  ];

  return (
    <main style={{ minHeight: '80vh', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '880px', padding: '36px 20px 80px' }}>

        {/* Meniu Navigare Rapidă, Tab-uri și Buton Print */}
        <LegalHeaderNav 
          currentPage="cookies"
          onBack={onBack}
          onNavigateLegal={onNavigateLegal}
          quickLinks={quickLinks}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ 
            width: '46px', 
            height: '46px', 
            borderRadius: '12px', 
            background: 'var(--primary-light)', 
            color: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Cookie size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Politică de Cookie-uri
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Cum utilizăm cookie-urile și tehnologiile similare · Scoatem3D România
            </p>
          </div>
        </div>

        {/* Conținut */}
        <div style={{ 
          background: 'var(--bg-card)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-light)', 
          padding: '40px 44px', 
          lineHeight: '1.75', 
          color: 'var(--text-main)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>

          <Section id="sec-ce-sunt" title="1. Ce sunt cookie-urile și de ce le utilizăm?">
            <p>
              Cookie-urile sunt mici fișiere text descărcate în memoria dispozitivului tău (calculator, laptop, tabletă sau telefon mobil) atunci când vizitezi website-ul <strong>www.scoatem3d.ro</strong>.
            </p>
            <p>
              Aceste fișiere permit site-ului să funcționeze corect (de pildă, să rețină produsele adăugate în coșul tău de cumpărături pe durata navigării sau sesiunea ta de autentificare), precum și să ofere o experiență mai rapidă și mai intuitivă.
            </p>
          </Section>

          <Section id="sec-tipuri" title="2. Ce tipuri de cookie-uri utilizăm pe Scoatem3D">
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                🔧 1. Cookie-uri strict necesare (Esențiale pentru magazin)
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Aceste tehnologii sunt obligatorii pentru funcționarea de bază a magazinului online. Fără ele, nu ai putea plasa comenzi sau păstra articolele în coș. Nu pot fi dezactivate din sistemele noastre și nu necesită acordul tău prealabil.
              </p>
              <CookieTable rows={[
                ['atelier3d_cart', 'localStorage', 'Persistent', 'Păstrează produsele adăugate în coșul tău de cumpărături chiar și după reîmprospătarea paginii.'],
                ['sb-*-auth-token', 'localStorage', 'Sesiune / 1 an', 'Token criptat pentru menținerea autentificării securizate în contul de client (Supabase).'],
                ['scoatem3d_cookie_consent', 'localStorage', 'Persistent', 'Stochează alegerea ta privind acordul de cookie-uri.'],
              ]} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                🎯 2. Cookie-uri de preferințe și funcționalitate
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Permit site-ului să rețină alegerile tale (filtrele de produse aplicate, modul de vizualizare, sortarea curentă) pentru a-ți oferi o experiență personalizată fără a fi nevoie să le reselectezi manual.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                📊 3. Cookie-uri de performanță și analiză
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Ne ajută să înțelegem modul în care vizitatorii utilizează platforma (timp de încărcare, pagini cele mai accesate, eventuale erori tehnice), permițându-ne să optimizăm constant viteza și performanța platformei. Datele colectate sunt agregate și complet anonimizate.
              </p>
            </div>

          </Section>

          <Section id="sec-terti" title="3. Cookie-uri ale partenerilor terți">
            <p>
              Site-ul nostru utilizează servicii cloud securizate partenere care pot plasa cookie-uri tehnice pentru buna funcționare:
            </p>
            <ul>
              <li><strong>Supabase</strong> — furnizorul infrastructurii cloud și autentificării securizate pentru clienți.</li>
              <li><strong>Google Analytics</strong> (dacă este activat) — colectează date statistice complet anonimizate cu privire la traficul pe platformă.</li>
            </ul>
          </Section>

          <Section id="sec-durata" title="4. Cât timp rămân stocate cookie-urile?">
            <ul>
              <li><strong>Cookie-uri de sesiune:</strong> stocate doar pe durata sesiunii tale de navigare și șterse automat la închiderea browserului.</li>
              <li><strong>Cookie-uri persistente:</strong> rămân stocate în browser pe o perioadă determinată de timp (de la câteva zile până la 12 luni) sau până când alegi să le ștergi manual din memoria browserului.</li>
            </ul>
          </Section>

          <Section id="sec-control" title="5. Cum poți controla și șterge cookie-urile">
            <p>
              Ai în orice moment control deplin asupra cookie-urilor. Poți configura browserul să blocheze sau să șteargă toate cookie-urile din setările de confidențialitate ale acestuia. Reține că blocarea completă a stocării locale (localStorage) va împiedica salvarea produselor în coș.
            </p>
            <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>Ghiduri oficiale de configurare pentru browsere:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: '6px' }}>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Google Chrome ↗
              </a>
              <a href="https://support.mozilla.org/ro/kb/cum-dezactivez-cookie-urile" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Mozilla Firefox ↗
              </a>
              <a href="https://support.microsoft.com/ro-ro/microsoft-edge/ștergerea-cookie-urilor-în-microsoft-edge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Microsoft Edge ↗
              </a>
              <a href="https://support.apple.com/ro-ro/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Apple Safari ↗
              </a>
            </div>
          </Section>

          <Section id="sec-contact" title="6. Întrebări și Contact">
            <p>
              Pentru orice clarificări legate de prezenta politică de cookie-uri, ne poți contacta oricând la:
            </p>
            <p>
              📧 <a href="mailto:ciocan_george97@yahoo.com" style={{ color: 'var(--primary)', fontWeight: '600' }}>ciocan_george97@yahoo.com</a><br />
              📱 <a href="tel:0763409836" style={{ color: 'var(--primary)', fontWeight: '600' }}>0763 409 836</a>
            </p>
          </Section>

          {/* Footer Card */}
          <div style={{ 
            marginTop: '36px', 
            padding: '18px 24px', 
            background: 'var(--bg-warm-tint)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border-light)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: '12px',
            alignItems: 'center',
            fontSize: '0.86rem'
          }}>
            <div>
              <strong>Scoatem3D România</strong> · Transparență și respect pentru confidențialitatea ta
            </div>
            <div>
              <a href="mailto:ciocan_george97@yahoo.com" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                ciocan_george97@yahoo.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

function Section({ id, title, children }) {
  return (
    <div id={id} style={{ marginBottom: '32px', scrollMarginTop: '80px' }}>
      <h2 style={{ 
        fontSize: '1.15rem', 
        fontWeight: '700', 
        color: 'var(--text-main)', 
        marginBottom: '12px', 
        paddingBottom: '8px', 
        borderBottom: '1px solid var(--border-light)' 
      }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </div>
  );
}

function CookieTable({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ background: 'var(--bg-warm-tint)' }}>
            {['Nume Tehnologie', 'Tip Stocare', 'Durată', 'Scop și Utilizare'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border-light)', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border-light)' : 'none', background: i % 2 === 1 ? 'rgba(0,0,0,0.01)' : 'transparent' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: j === 0 ? 'monospace' : 'inherit', fontSize: j === 0 ? '0.82rem' : '0.85rem', fontWeight: j === 0 ? '600' : 'normal' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
