import React, { useEffect } from 'react';
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import LegalHeaderNav from './LegalHeaderNav';

export default function TermeniConditiiPage({ onBack, onNavigateLegal }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const quickLinks = [
    { id: 'sec-comerciant', title: '1. Comerciant' },
    { id: 'sec-preturi', title: '3. Prețuri' },
    { id: 'sec-comenzi', title: '4. Comenzi' },
    { id: 'sec-livrare', title: '5. Livrare' },
    { id: 'sec-plata', title: '6. Plată' },
    { id: 'sec-retur', title: '7. Drept Retragere' },
    { id: 'sec-garantie', title: '8. Garanție' },
    { id: 'sec-litigii', title: '10. Reclamații & ANPC' }
  ];

  return (
    <main style={{ minHeight: '80vh', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '880px', padding: '36px 20px 80px' }}>

        {/* Meniu Navigare Rapidă, Tab-uri și Buton Print */}
        <LegalHeaderNav 
          currentPage="termeni"
          onBack={onBack}
          onNavigateLegal={onNavigateLegal}
          quickLinks={quickLinks}
        />

        {/* Titlu Pagină */}
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
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Termeni și Condiții
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Regulamentul de utilizare al platformei și condițiile comerciale · Scoatem3D România
            </p>
          </div>
        </div>

        {/* Conținut Articol */}
        <div style={{ 
          background: 'var(--bg-card)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-light)', 
          padding: '40px 44px', 
          lineHeight: '1.75', 
          color: 'var(--text-main)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>

          <Section id="sec-comerciant" title="1. Date de identificare a comerciantului">
            <p>
              Website-ul <strong>www.scoatem3d.ro</strong> este operat de <strong>Scoatem3D</strong>, producător artizanal de decorațiuni printate 3D personalizate și lumânări handmade din ceară de soia, cu sediul în România.
            </p>
            <div style={{ background: 'var(--bg-warm-tint)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
              <div>📧 <strong>E-mail suport:</strong> <a href="mailto:ciocan_george97@yahoo.com" style={{ color: 'var(--primary)', fontWeight: '600' }}>ciocan_george97@yahoo.com</a></div>
              <div style={{ marginTop: '4px' }}>📱 <strong>Telefon / WhatsApp:</strong> <a href="tel:0763409836" style={{ color: 'var(--primary)', fontWeight: '600' }}>0763 409 836</a></div>
              <div style={{ marginTop: '4px' }}>📍 <strong>Țară de origine:</strong> România</div>
            </div>
          </Section>

          <Section id="sec-general" title="2. Dispoziții generale și aplicabilitate">
            <p>
              Prezenții Termeni și Condiții definesc cadrul contractual dintre Scoatem3D (Vânzător) și orice persoană fizică sau juridică (Cumpărător) care plasează comenzi prin intermediul platformei noastre.
            </p>
            <p>
              Navigarea pe site și finalizarea unei comenzi implică acceptarea necondiționată a prezentelor clauze, în conformitate cu <strong>OUG nr. 34/2014</strong> privind drepturile consumatorilor în cadrul contractelor încheiate cu profesioniștii și <strong>Legea nr. 365/2002</strong> privind comerțul electronic.
            </p>
          </Section>

          <Section id="sec-preturi" title="3. Produse și Prețuri">
            <p>
              Toate prețurile afișate pe site sunt exprimate în <strong>LEI (RON)</strong> și includ toate taxele aplicabile conform legislației române.
            </p>
            <ul>
              <li>Prețurile nu includ costul transportului prin curier, care este afișat clar și transparent în sumarul comenzii înainte de trimitere.</li>
              <li>Scoatem3D își rezervă dreptul de a actualiza în orice moment prețurile și ofertele de produse. Comenzile deja plasate și confirmate nu vor fi afectate de eventuale modificări ulterioare de preț.</li>
              <li>Fiecare produs este însoțit de descriere detaliată, imagini reale sau randări representative și opțiuni de personalizare disponibile (fotografie litofanie, culoare filament, text).</li>
            </ul>
          </Section>

          <Section id="sec-comenzi" title="4. Plasarea și Confirmarea Comenzii">
            <p>
              Pentru a plasa o comandă pe <strong>Scoatem3D</strong>, Cumpărătorul parcurge următorii pași:
            </p>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Selectarea produsului dorit și, după caz, configurarea personalizării (încărcarea pozei dorite, selectarea nuanței de filament, text gravat).</li>
              <li>Adăugarea în coșul de cumpărături.</li>
              <li>Completarea datelor obligatorii de livrare și contact: <strong>prenume, nume, email, telefon, județ, localitate, adresă completă, cod poștal</strong> și opțional observații speciale pentru atelier sau curier.</li>
              <li>Trimiterea comenzii.</li>
            </ol>
            <p>
              Odată înregistrată comanda, Cumpărătorul primește o confirmare pe ecran și pe adresa de e-mail furnizată. Atelierul nostru poate contacta clientul pe WhatsApp sau telefonic pentru confirmarea detaliilor de personalizare grafică 3D.
            </p>
          </Section>

          <Section id="sec-livrare" title="5. Livrare și Costuri de Transport">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', margin: '8px 0 16px' }}>
              <div style={{ background: 'var(--bg-warm-tint)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>⏱️ Timp Producție Artizanală</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>1-2 zile lucrătoare pentru imprimarea 3D și pregătirea produselor.</div>
              </div>
              <div style={{ background: 'var(--bg-warm-tint)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>🚚 Curier Rapid în România</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Livrare în 24-48h lucrătoare de la expediere direct la adresa specificată.</div>
              </div>
              <div style={{ background: 'var(--bg-warm-tint)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>🎁 Transport Gratuit</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>La orice comandă cu valoarea produselor de peste 200 Lei.</div>
              </div>
            </div>
            <p>
              Pentru comenzi cu valoare sub 200 Lei, se aplică un cost fix de transport de 19 Lei, adăugat automat în totalul comenzii.
            </p>
          </Section>

          <Section id="sec-plata" title="6. Modalitatea de Plată">
            <p>
              Plata comenzilor se realizează în sistem <strong>Ramburs (plată la livrare)</strong>, direct curierului în momentul înmânării coletului. Acest mod oferă siguranță deplină cumpărătorului.
            </p>
          </Section>

          <Section id="sec-retur" title="7. Dreptul de Retragere și Returnarea Produselor">
            <p>
              Conform <strong>OUG nr. 34/2014</strong>, consumatorul beneficiază de o perioadă de <strong>14 zile calendaristice</strong> pentru a se retrage dintr-un contract la distanță, fără a fi nevoit să justifice decizia.
            </p>
            
            <div style={{ 
              background: '#FFFBEB', 
              border: '1px solid #FCD34D', 
              borderRadius: 'var(--radius-md)', 
              padding: '16px 20px', 
              margin: '12px 0 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.88rem', color: '#92400E' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Excepție Legală pentru Produse Personalizate (Art. 16 lit. c din OUG nr. 34/2014):</strong>
                Produsele confecționate după specificațiile prezentate de consumator sau personalizate în mod clar (cum ar fi lămpi cu litofanie personalizate cu poza clientului, litere sau obiecte imprimate 3D cu text personalizat la comandă) <strong>sunt exceptate de la dreptul legal de retragere</strong>, întrucât sunt bunuri unice create exclusiv pentru clientul respectiv și nu pot fi recondiționate sau revândute.
              </div>
            </div>

            <p>
              Produsele nepersonalizate (de exemplu lumânări artizanale standard sau accesorii neindividualizate) pot fi returnate în termen de 14 zile calendaristice de la primire, în ambalajul original intact, neutilizate și nedeteriorate. Costul de returnare este suportat de către cumpărător.
            </p>
          </Section>

          <Section id="sec-garantie" title="8. Garanție Legală de Conformitate și Reclamații">
            <p>
              Toate produsele comercializate beneficiază de <strong>garanția legală de conformitate de 2 ani</strong>, conform Legii nr. 449/2003 și OUG 140/2021.
            </p>
            <p>
              Dacă un colet ajunge deteriorat sau dacă produsul prezintă un defect de fabricație la deschiderea coletului, Cumpărătorul are obligația să ne notifice în termen de <strong>48 de ore</strong> de la recepție la <a href="mailto:ciocan_george97@yahoo.com" style={{ color: 'var(--primary)', fontWeight: '600' }}>ciocan_george97@yahoo.com</a> sau pe WhatsApp la <a href="tel:0763409836" style={{ color: 'var(--primary)', fontWeight: '600' }}>0763 409 836</a>, transmițând fotografii clare ale produsului și ambalajului.
            </p>
            <p>
              Scoatem3D va înlocui produsul defect fără costuri suplimentare pentru client sau va returna contravaloarea acestuia în termen de maximum 14 zile.
            </p>
          </Section>

          <Section id="sec-gdpr" title="9. Protecția Datelor cu Caracter Personal">
            <p>
              Scoatem3D prelucrează datele cu caracter personal (nume, telefon, adresă, email) exclusiv în scopul onorării și expedierii comenzii tale, în deplină conformitate cu Regulamentul European (UE) 2016/679 (GDPR). Pentru detalii complete, consultă secțiunea noastră dedicată{' '}
              <a 
                href="#/politica-de-confidentialitate" 
                onClick={(e) => {
                  if (onNavigateLegal) {
                    e.preventDefault();
                    onNavigateLegal('confidentialitate');
                  }
                }}
                style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Politică de Confidențialitate
              </a>.
            </p>
          </Section>

          <Section id="sec-litigii" title="10. Soluționarea Litigiilor — ANPC & SOL">
            <p>
              În cazul oricărui diferend, încurajăm soluționarea pe cale amiabilă. Dacă o problemă nu poate fi rezolvată amiabil, consumatorul are dreptul de a apela la mecanismele oficiale de soluționare alternativă a litigiilor:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <a
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: 'var(--primary)', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  background: 'var(--bg-warm-tint)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                ⚖️ Autoritatea Națională pentru Protecția Consumatorilor (ANPC — SAL) <ExternalLink size={14} />
              </a>
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: '#2563EB', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  background: 'var(--bg-warm-tint)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)'
                }}
              >
                🇪🇺 Platforma SOL a Comisiei Europene (Online Dispute Resolution) <ExternalLink size={14} />
              </a>
            </div>
          </Section>

          <Section id="sec-lege" title="11. Legea Aplicabilă">
            <p>
              Prezentul contract este supus <strong>legislației române în vigoare</strong>. Orice litigiu care nu va putea fi soluționat pe cale amiabilă va fi înaintat instanțelor judecătorești competente din România.
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
              <strong>Scoatem3D România</strong> · Cadouri 3D &amp; Lumânări Artizanale
            </div>
            <div>
              <a href="mailto:ciocan_george97@yahoo.com" style={{ color: 'var(--primary)', marginRight: '14px', textDecoration: 'none', fontWeight: '600' }}>
                ciocan_george97@yahoo.com
              </a>
              <a href="tel:0763409836" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                0763 409 836
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
