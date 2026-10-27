import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Truck, Phone, MapPin, User, Mail, FileText, ArrowLeft, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { placeOrder, supabase, updateCustomerProfile } from '../lib/supabaseClient';

const ROMANIAN_COUNTIES = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov', 
  'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța', 
  'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt', 
  'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 
  'Vaslui', 'Vâlcea', 'Vrancea'
];

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onOrderSuccess,
  currentUser = null
}) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    county: '',
    city: '',
    address: '',
    postal_code: '',
    notes: '',
    terms_accepted: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Preluare date salvate local (telefon, date livrare anterioare)
    let savedPhone = '';
    let savedCustomerData = null;
    try {
      savedPhone = localStorage.getItem('atelier3d_customer_phone') || '';
      const raw = localStorage.getItem('atelier3d_customer_data');
      if (raw) savedCustomerData = JSON.parse(raw);
    } catch (e) {}

    let fn = '';
    let ln = '';
    if (currentUser?.name) {
      const parts = currentUser.name.trim().split(/\s+/);
      if (parts.length > 1) {
        ln = parts[0];
        fn = parts.slice(1).join(' ');
      } else {
        fn = currentUser.name;
      }
    } else if (savedCustomerData) {
      fn = savedCustomerData.first_name || '';
      ln = savedCustomerData.last_name || '';
    }

    const email = currentUser?.email || savedCustomerData?.email || '';
    const phone = currentUser?.phone || savedPhone || savedCustomerData?.phone || '';
    // Câmpuri structurate adresă: prioritate profil Supabase > localStorage > gol
    const county = currentUser?.county || savedCustomerData?.county || '';
    const city = currentUser?.city || savedCustomerData?.city || '';
    const address = currentUser?.address_street || savedCustomerData?.address || '';
    const postal_code = currentUser?.postal_code || savedCustomerData?.postal_code || '';

    setFormData(prev => ({
      ...prev,
      first_name: prev.first_name || fn,
      last_name: prev.last_name || ln,
      email: prev.email || email,
      phone: prev.phone || phone,
      county: prev.county || county,
      city: prev.city || city,
      address: prev.address || address,
      postal_code: prev.postal_code || postal_code
    }));

    // Dacă utilizatorul este conectat dar nu are încă telefonul salvat în profil,
    // interogăm ultima comandă plasată pe baza adresei sale de email
    if (currentUser?.email && !currentUser?.phone && !savedPhone) {
      supabase
        .from('orders')
        .select('customer_phone, customer_address')
        .eq('customer_email', currentUser.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0 && data[0].customer_phone) {
            const fetchedPhone = data[0].customer_phone;
            setFormData(prev => ({
              ...prev,
              phone: prev.phone || fetchedPhone
            }));
            try {
              localStorage.setItem('atelier3d_customer_phone', fetchedPhone);
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
  const deliveryCost = subtotal >= 200 ? 0 : 19;
  const total = subtotal + deliveryCost;

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (key === 'phone' && value.trim()) {
      try {
        localStorage.setItem('atelier3d_customer_phone', value.trim());
      } catch (e) {}
    }
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const validate = () => {
    const errs = {};
    
    // 1. Date Personale (obligatorii)
    if (!formData.first_name.trim()) {
      errs.first_name = 'Prenumele este obligatoriu.';
    }
    if (!formData.last_name.trim()) {
      errs.last_name = 'Numele de familie este obligatoriu.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Adresa de email este obligatorie.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Te rugăm să introduci o adresă de email validă.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Numărul de telefon este obligatoriu.';
    } else if (formData.phone.replace(/\D/g, '').length < 9) {
      errs.phone = 'Te rugăm să introduci un număr de telefon valid.';
    }

    // 2. Adresă de Livrare (obligatorii)
    if (!formData.county.trim()) {
      errs.county = 'Selectarea județului este obligatorie.';
    }
    if (!formData.city.trim()) {
      errs.city = 'Localitatea este obligatorie.';
    }
    if (!formData.address.trim()) {
      errs.address = 'Adresa de livrare (stradă, număr etc.) este obligatorie.';
    }
    if (!formData.postal_code.trim()) {
      errs.postal_code = 'Codul poștal este obligatoriu.';
    }

    // 3. Acord Termeni & Politică de Confidențialitate (obligatoriu conform OUG 34/2014 & GDPR)
    if (!formData.terms_accepted) {
      errs.terms_accepted = 'Este obligatoriu să bifezi acordul cu Termenii și Condițiile și Politica de Confidențialitate.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const fullName = `${formData.last_name.trim()} ${formData.first_name.trim()}`.trim();
      const fullAddress = `${formData.address.trim()}, ${formData.city.trim()}, Jud. ${formData.county.trim()}, CP ${formData.postal_code.trim()}`;

      const orderPayload = {
        customer_name: fullName,
        customer_phone: formData.phone.trim(),
        customer_address: fullAddress,
        customer_email: formData.email.trim(),
        customer_notes: formData.notes.trim(),
        total: total,
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          product_name: item.product_name || item.name || 'Produs',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          customization: item.customization || {}
        }))
      };

      const result = await placeOrder(orderPayload);

      if (result.success) {
        // Salvează telefonul și datele de livrare pentru comenzi viitoare
        try {
          localStorage.setItem('atelier3d_customer_phone', formData.phone.trim());
          localStorage.setItem('atelier3d_customer_data', JSON.stringify({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            county: formData.county.trim(),
            city: formData.city.trim(),
            address: formData.address.trim(),
            postal_code: formData.postal_code.trim()
          }));
        } catch (e) {}

        // Actualizează profilul Supabase al clientului conectat cu câmpuri structurate
        if (currentUser) {
          updateCustomerProfile({
            phone: formData.phone.trim(),
            county: formData.county.trim(),
            city: formData.city.trim(),
            address_street: formData.address.trim(),
            postal_code: formData.postal_code.trim()
          }).catch(err => console.warn('Eroare sincronizare adresă în profil client:', err));
        }

        setCompletedOrder(result.order);
        onOrderSuccess(); // golește coșul în App.jsx
        
        // Trimite emailuri (confirmare client + notificare admin)
        try {
          supabase.functions.invoke('notify-new-order', {
            body: {
              order: result.order,
              items: orderPayload.items
            }
          }).then(({ data, error }) => {
            if (error) {
              console.warn('Eroare Edge Function email:', error);
            } else {
              console.log('Edge Function email trimis cu succes:', data);
            }
          }).catch(err => console.warn('Email notification error:', err));
        } catch (e) {
          // Nu bloca UI-ul dacă emailul eșuează
        }
        
        // Efect festiv de confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas-confetti fails
        }
      } else {
        alert('A apărut o problemă la plasarea comenzii. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      console.error('Eroare la salvare comandă:', err);
      alert('Eroare la trimiterea comenzii. Te rugăm să reîncerci.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: completedOrder ? '600px' : '780px' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Închide">
          <X size={20} />
        </button>

        {completedOrder ? (
          /* ECRAN CONFIRMARE SUCCES */
          <div style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'var(--accent-sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'var(--accent-sage)'
            }}>
              <CheckCircle size={44} />
            </div>

            <span className="badge badge-sage" style={{ marginBottom: '10px' }}>
              Comandă Înregistrată cu Succes!
            </span>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
              Mulțumim, {completedOrder.customer_name}!
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px' }}>
              Comanda ta a fost transmisă către atelierul nostru. Vom pregăti modelul 3D și fișierele de imprimare.
            </p>

            {/* Detalii Comandă Box */}
            <div style={{
              background: 'var(--bg-warm-tint)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              border: '1px solid var(--border-light)',
              textAlign: 'left',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Număr comandă:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>#{completedOrder.id.slice(0, 12)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Client:</span>
                <strong>{completedOrder.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Telefon:</span>
                <strong>{completedOrder.customer_phone}</strong>
              </div>
              {completedOrder.customer_email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Email confirmare:</span>
                  <strong>{completedOrder.customer_email}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Livrare la:</span>
                <span style={{ textAlign: 'right', maxWidth: '320px', fontWeight: '600' }}>{completedOrder.customer_address}</span>
              </div>
              {completedOrder.customer_notes && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Observații:</span>
                  <span style={{ textAlign: 'right', maxWidth: '320px', fontStyle: 'italic' }}>{completedOrder.customer_notes}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', marginTop: '10px', borderTop: '1px dashed var(--border-light)', fontSize: '1.05rem', fontWeight: '800' }}>
                <span>Total de achitat:</span>
                <span style={{ color: 'var(--primary)' }}>{Number(completedOrder.total).toFixed(2).replace('.', ',')} Lei</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                onClick={onClose}
                style={{ padding: '12px 28px' }}
              >
                Înapoi la Magazin
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAR CHECKOUT */
          <div style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <span className="badge badge-terracotta" style={{ marginBottom: '8px' }}>
                Pasul Final
              </span>
              <h2 style={{ fontSize: '1.6rem' }}>Finalizare Comandă</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Completează datele de contact și adresa pentru expedierea comenzii tale.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder}>
              {/* SECȚIUNEA 1: DATE PERSONALE */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginBottom: '14px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <User size={18} color="var(--primary)" />
                <span>1. Date Personale</span>
              </div>

              {/* Prenume & Nume */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="form-label-custom">
                    Prenume <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="ex: Ion"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    style={{ borderColor: errors.first_name ? '#DC2626' : undefined }}
                  />
                  {errors.first_name && (
                    <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                      {errors.first_name}
                    </span>
                  )}
                </div>

                <div>
                  <label className="form-label-custom">
                    Nume de familie <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="ex: Popescu"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    style={{ borderColor: errors.last_name ? '#DC2626' : undefined }}
                  />
                  {errors.last_name && (
                    <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                      {errors.last_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Email & Telefon */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label className="form-label-custom">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} /> Adresă de Email <span className="required-star">*</span>
                    </span>
                  </label>
                  <input
                    type="email"
                    className="custom-input"
                    placeholder="adresa@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={{ borderColor: errors.email ? '#DC2626' : undefined }}
                  />
                  {errors.email && (
                    <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                      {errors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label className="form-label-custom">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={15} /> Număr de Telefon <span className="required-star">*</span>
                    </span>
                  </label>
                  <input
                    type="tel"
                    className="custom-input"
                    placeholder="07xxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={{ borderColor: errors.phone ? '#DC2626' : undefined }}
                  />
                  {errors.phone && (
                    <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                      {errors.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* SECȚIUNEA 2: ADRESĂ DE LIVRARE */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginTop: '26px',
                marginBottom: '14px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <MapPin size={18} color="var(--primary)" />
                <span>2. Adresă de Livrare</span>
              </div>

              {/* Județ & Localitate */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="form-label-custom">
                    Județ <span className="required-star">*</span>
                  </label>
                  <select
                    className="custom-input"
                    value={formData.county}
                    onChange={(e) => handleInputChange('county', e.target.value)}
                    style={{ borderColor: errors.county ? '#DC2626' : undefined, cursor: 'pointer' }}
                  >
                    <option value="">Selectează județul...</option>
                    {ROMANIAN_COUNTIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.county && (
                    <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                      {errors.county}
                    </span>
                  )}
                </div>

                <div>
                  <label className="form-label-custom">
                    Localitate (Oraș / Sat / Comună) <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="ex: București, Cluj-Napoca"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={{ borderColor: errors.city ? '#DC2626' : undefined }}
                  />
                  {errors.city && (
                    <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                      {errors.city}
                    </span>
                  )}
                </div>
              </div>

              {/* Adresă (stradă, număr etc.) */}
              <div style={{ marginTop: '16px' }}>
                <label className="form-label-custom">
                  Adresă (Stradă, număr, bloc, scară, apartament) <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="ex: Str. Libertății nr. 12, Bl. B2, Sc. 1, Ap. 14"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={{ borderColor: errors.address ? '#DC2626' : undefined }}
                />
                {errors.address && (
                  <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    {errors.address}
                  </span>
                )}
              </div>

              {/* Cod Poștal */}
              <div style={{ marginTop: '16px', maxWidth: '280px' }}>
                <label className="form-label-custom">
                  Cod Poștal <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="ex: 010101"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  style={{ borderColor: errors.postal_code ? '#DC2626' : undefined }}
                />
                {errors.postal_code && (
                  <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    {errors.postal_code}
                  </span>
                )}
              </div>

              {/* SECȚIUNEA 3: OBSERVAȚII (OPȚIONAL) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem',
                fontWeight: '700',
                color: 'var(--text-main)',
                marginTop: '26px',
                marginBottom: '14px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <FileText size={18} color="var(--primary)" />
                <span>3. Observații Comandă (opțional)</span>
              </div>

              <div>
                <label className="form-label-custom">
                  Mențiuni speciale / instrucțiuni de livrare (opțional)
                </label>
                <textarea
                  className="custom-input"
                  rows={2}
                  placeholder="Instrucțiuni speciale pentru livrare sau atelier..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Rezumat cost & buton */}
              <div style={{
                marginTop: '24px',
                padding: '18px',
                background: 'var(--bg-warm-tint)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                  <span>Produse ({cartItems.length}):</span>
                  <span>{subtotal.toFixed(2).replace('.', ',')} Lei</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Cost transport curier:</span>
                  <span>{deliveryCost === 0 ? 'Gratuit' : `${deliveryCost.toFixed(2).replace('.', ',')} Lei`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
                  <span>Total de plată:</span>
                  <span style={{ color: 'var(--primary)' }}>{total.toFixed(2).replace('.', ',')} Lei</span>
                </div>
              </div>

              {/* Acord Legal Obligatoriu (Termeni & Confidențialitate) */}
              <div style={{
                marginTop: '20px',
                padding: '14px 16px',
                background: errors.terms_accepted ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-warm-tint)',
                borderRadius: 'var(--radius-md)',
                border: errors.terms_accepted ? '1.5px solid #EF4444' : '1px solid var(--border-light)',
                transition: 'all 0.2s ease'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  lineHeight: '1.55',
                  color: 'var(--text-main)',
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.terms_accepted}
                    onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                    style={{
                      marginTop: '3px',
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--primary)',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                  <span>
                    Confirm că am citit și sunt de acord cu{' '}
                    <a 
                      href="#/termeni-si-conditii" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Termenii și Condițiile
                    </a>{' '}
                    și cu{' '}
                    <a 
                      href="#/politica-de-confidentialitate" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Politica de Confidențialitate
                    </a>{' '}
                    (inclusiv exceptarea de la dreptul legal de retragere pentru produsele unice imprimate 3D la comandă, conform art. 16 lit. c din OUG nr. 34/2014). <span style={{ color: '#DC2626', fontWeight: 'bold' }}>*</span>
                  </span>
                </label>
                {errors.terms_accepted && (
                  <div style={{ 
                    color: '#DC2626', 
                    fontSize: '0.82rem', 
                    fontWeight: '600', 
                    marginTop: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px' 
                  }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{errors.terms_accepted}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Anulează
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isSubmitting}
                  style={{ minWidth: '200px' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Se trimite comanda...</span>
                    </>
                  ) : (
                    <>
                      <Truck size={18} />
                      <span>Plasează Comanda ({total.toFixed(2).replace('.', ',')} Lei)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
