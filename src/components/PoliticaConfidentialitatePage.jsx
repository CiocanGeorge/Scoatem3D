import React, { useEffect } from 'react';
import { Lock, ExternalLink } from 'lucide-react';
import LegalHeaderNav from './LegalHeaderNav';

export default function PoliticaConfidentialitatePage({ onBack, onNavigateLegal }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const quickLinks = [
    { id: 'sec-operator', title: '1. Operator Date' },
    { id: 'sec-date', title: '2. Date Colectate' },
    { id: 'sec-scopuri', title: '3. Scopuri' },
    { id: 'sec-temei', title: '4. Temei Juridic' },
    { id: 'sec-parteneri', title: '5. Parteneri & Curieri' },
    { id: 'sec-drepturi', title: '7. Drepturi GDPR & ANSPDCP' }
  ];

  return (
    <main style={{ minHeight: '80vh', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '880px', padding: '36px 20px 80px' }}>

        {/* Meniu Navigare Rapidă, Tab-uri și Buton Print */}
        <LegalHeaderNav 
          currentPage="confidentialitate"
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
            <Lock size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              Politică de Confidențialitate
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Protecția datelor cu caracter personal conform Regulamentului (UE) 2016/679 (GDPR) · Scoatem3D
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

          <Section id="sec-operator" title="1. Cine suntem și date de contact Operator">
            <p>
              Prezenta notificare de confidențialitate se aplică website-ului <strong>www.scoatem3d.ro</strong>, operat de <strong>Scoatem3D</strong> (atelier artizanal de producție și comercializare produse 3D și lumânări handmade).
            </p>
            <p>
              În sensul legislației aplicabile privind protecția datelor (Regulamentul UE 2016/679 - GDPR), Scoatem3D acționează în calitate de <strong>Operator de date cu caracter personal</strong>.
            </p>
            <div style={{ background: 'var(--bg-warm-tint)', padding: '14px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', marginTop: '10px' }}>
              <div>📧 <strong>Responsabil protecția datelor (DPO):</strong> <a href="mailto:ciocan_george97@yahoo.com" style={{ color: 'var(--primary)', fontWeight: '600' }}>ciocan_george97@yahoo.com</a></div>
              <div style={{ marginTop: '4px' }}>📱 <strong>Telefon:</strong> 0763 409 836</div>
              <div style={{ marginTop: '4px' }}>📍 <strong>Sediul operațional:</strong> România</div>
            </div>
          </Section>

          <Section id="sec-date" title="2. Ce date cu caracter personal colectăm">
            <p>
              Colectăm exclusiv datele pe care ni le furnizezi direct atunci când interacționezi cu platforma noastră sau când plasezi o comandă:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', margin: '12px 0 16px' }}>
              <div style={{ background: 'var(--bg-warm-tint)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>👤 Date de identificare &amp; contact</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <strong>Nume și Prenume</strong>, adresă de <strong>e-mail</strong> și <strong>număr de telefon</strong> (obligatorii pentru validarea și expedierea comenzii).
                </div>
              </div>

              <div style={{ background: 'var(--bg-warm-tint)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>📍 Date de livrare curier</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <strong>Județ</strong>, <strong>localitate</strong>, <strong>adresă de livrare</strong> completă (stradă, număr, bloc/apartament) și <strong>cod poștal</strong> (obligatorii pentru generarea AWB-ului).
                </div>
              </div>

              <div style={{ background: 'var(--bg-warm-tint)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>🎨 Detalii comandă &amp; personalizare 3D</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Fotografiile încărcate de tine pentru generarea litofaniei 3D, texte pentru inscripționare și mențiuni speciale/observații transmise.
                </div>
              </div>

              <div style={{ background: 'var(--bg-warm-tint)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>🔐 Date de cont (opțional)</div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  Dacă alegi să îți creezi un cont de client, stocăm adresa de email și parola într-un format criptat în mod ireversibil (hash securizat prin Supabase Auth).
                </div>
              </div>
            </div>
          </Section>

          <Section id="sec-scopuri" title="3. Scopurile în care prelucrăm datele tale">
            <p>Datele tale cu caracter personal sunt utilizate exclusiv pentru:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Preluarea, modelarea 3D și producția artizanală</strong> a produselor configurate de tine.</li>
              <li><strong>Expedierea coletului</strong> prin intermediul serviciilor de curierat rapid partenere pe teritoriul României.</li>
              <li><strong>Comunicarea statusului comenzii:</strong> transmiterea notificărilor automate pe email și clarificarea detaliilor tehnice (WhatsApp/telefon) în caz de necesitate.</li>
              <li><strong>Îndeplinirea obligațiilor legale</strong> financiare și contabile (emiterea facturilor, evidența vânzărilor conform legii române).</li>
              <li><strong>Gestionarea contului de client</strong> (istoricul comenzilor, salvarea produselor favorite).</li>
            </ul>
          </Section>

          <Section id="sec-temei" title="4. Temeiul juridic al prelucrării">
            <p>Prelucrarea datelor tale se întemeiază pe dispozițiile GDPR:</p>
            <ul>
              <li><strong>Executarea unui contract la distanță</strong> (Art. 6 alin. 1 lit. b GDPR) — fără aceste date nu putem produce și livra comanda ta.</li>
              <li><strong>Îndeplinirea unei obligații legale</strong> (Art. 6 alin. 1 lit. c GDPR) — obligațiile fiscale și contabile aplicabile comercianților din România.</li>
              <li><strong>Interesul legitim</strong> (Art. 6 alin. 1 lit. f GDPR) — prevenirea tentativelor de fraudă și asigurarea securității tehnice a platformei.</li>
            </ul>
          </Section>

          <Section id="sec-parteneri" title="5. Cu cine partajăm datele tale">
            <p>
              Nu vindem, nu închiriem și nu înstrăinăm datele tale cu caracter personal către terți în scopuri de marketing. Datele strict necesare sunt partajate exclusiv cu partenerii operaționali de încredere:
            </p>
            <ul>
              <li><strong>Companiile de Curierat Rapid</strong> partenere (nume, telefon, adresă completă) pentru livrarea efectivă a coletului.</li>
              <li><strong>Supabase Inc.</strong> — platforma cloud pentru stocarea securizată a bazei de date (cu servere securizate localizate în Uniunea Europeană).</li>
              <li><strong>Autoritățile statului</strong> — numai în cazurile strict prevăzute de legislația din România și la cererea formală a acestora.</li>
            </ul>
          </Section>

          <Section id="sec-stocare" title="6. Perioada de stocare a datelor">
            <ul>
              <li><strong>Datele aferente comenzilor finalizate:</strong> păstrate pe o perioadă de 5 ani conform cerințelor Codului Fiscal român privind documentele justificative contabile.</li>
              <li><strong>Fotografiile transmise pentru litofanii 3D:</strong> păstrate doar pe durata procesului tehnic de modelare și imprimare, după care sunt șterse periodic.</li>
              <li><strong>Datele contului de utilizator:</strong> păstrate pe durata activității contului sau până la solicitarea ta expresă de ștergere a contului.</li>
            </ul>
          </Section>

          <Section id="sec-drepturi" title="7. Drepturile tale conform Regulamentului GDPR">
            <p>În calitate de persoană vizată, ai următoarele drepturi garantate prin lege:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Dreptul de acces:</strong> poți solicita o copie a tuturor datelor pe care le deținem despre tine.</li>
              <li><strong>Dreptul la rectificare:</strong> poți cere corectarea datelor inexacte sau completarea celor incomplete.</li>
              <li><strong>Dreptul la ștergerea datelor („dreptul de a fi uitat"):</strong> poți solicita ștergerea datelor tale (în măsura în care nu există o obligație legală de păstrare a facturilor).</li>
              <li><strong>Dreptul la restricționarea prelucrării:</strong> poți solicita limitarea temporară a prelucrării în anumite cazuri.</li>
              <li><strong>Dreptul la portabilitatea datelor:</strong> primirea datelor tale într-un format structurat, utilizat în mod curent.</li>
              <li><strong>Dreptul de opoziție:</strong> dreptul de a te opune prelucrării în orice moment.</li>
            </ul>
            <p>
              Pentru exercitarea oricăruia dintre aceste drepturi, ne poți trimite o cerere prin email la <a href="mailto:ciocan_george97@yahoo.com" style={{ color: 'var(--primary)', fontWeight: '600' }}>ciocan_george97@yahoo.com</a>. Îți vom răspunde în termen de maximum 30 de zile.
            </p>
            <p>
              De asemenea, ai dreptul de a depune o plângere la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong>:
            </p>
            <div style={{ marginTop: '8px' }}>
              <a 
                href="https://www.dataprotection.ro" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: 'var(--primary)', 
                  fontWeight: '600', 
                  textDecoration: 'none' 
                }}
              >
                🌐 www.dataprotection.ro <ExternalLink size={14} />
              </a>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginLeft: '8px' }}>
                (B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București)
              </span>
            </div>
          </Section>

          <Section id="sec-securitate" title="8. Securitatea datelor">
            <p>
              Implementăm măsuri tehnice moderne de securitate: comunicarea între browserul tău și server este criptată integral prin protocol <strong>HTTPS / TLS</strong>, parolele conturilor sunt stocate exclusiv în formă de hash securizat criptografic, iar accesul la baza de date este strict limitat și protejat prin mecanisme de securitate de nivel enterprise.
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
              <strong>Scoatem3D România</strong> · Respectăm confidențialitatea datelor tale
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
