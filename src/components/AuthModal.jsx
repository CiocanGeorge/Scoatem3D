import React, { useState } from 'react';
import { 
  X, User, Mail, Lock, CheckCircle2, 
  AlertCircle, Loader2, LogIn, UserPlus 
} from 'lucide-react';
import { customerSignIn, customerSignUp } from '../lib/supabaseClient';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [signupSuccessData, setSignupSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSignupSuccessData(null);
    setGeneralError('');
    setErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (generalError) setGeneralError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = 'Te rugăm să introduci o adresă de email validă.';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Parola trebuie să conțină minim 6 caractere.';
    }
    if (mode === 'signup') {
      if (!formData.name.trim()) {
        errs.name = 'Te rugăm să introduci numele și prenumele tău.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGeneralError('');

    try {
      if (mode === 'signin') {
        const result = await customerSignIn(formData.email, formData.password);
        if (result.success) {
          if (result.user?.phone) {
            try {
              localStorage.setItem('atelier3d_customer_phone', result.user.phone);
            } catch (e) {}
          }
          onSuccess(result.user);
          handleClose();
        }
      } else {
        const result = await customerSignUp({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          password: formData.password
        });
        if (result.success) {
          if (formData.phone) {
            try {
              localStorage.setItem('atelier3d_customer_phone', formData.phone.trim());
            } catch (e) {}
          }
          // Afișăm pop-up-ul / ecranul de succes cu atenționarea de verificare a email-ului și a folderului SPAM
          setSignupSuccessData({
            email: formData.email.trim().toLowerCase(),
            name: formData.name.trim()
          });
        }
      }
    } catch (err) {
      console.error('Eroare autentificare client:', err);
      const rawMsg = err.message || '';
      const lower = rawMsg.toLowerCase();
      let errorText = rawMsg || 'A apărut o problemă. Te rugăm să verifici datele introduse.';

      if (
        lower.includes('există deja un cont') || 
        lower.includes('user already registered') || 
        lower.includes('already registered') || 
        lower.includes('already in use')
      ) {
        errorText = 'Există deja un cont înregistrat cu această adresă de email. Te rugăm să te conectezi.';
      } else if (lower.includes('email not confirmed')) {
        errorText = 'Adresa de email nu a fost încă confirmată. Te rugăm să verifici Inbox și folderul SPAM pentru link-ul de activare.';
      } else if (lower.includes('invalid login credentials')) {
        errorText = 'Adresă de email sau parolă incorectă.';
      }
      setGeneralError(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '32px' }}
      >
        <button className="modal-close-btn" onClick={handleClose} aria-label="Închide">
          <X size={20} />
        </button>

        {/* ECRAN POP-UP DE SUCCES DUPĂ ÎNREGISTRARE */}
        {signupSuccessData ? (
          <div style={{ textAlign: 'center', padding: '10px 4px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--accent-sage-light)',
              color: 'var(--accent-sage)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              boxShadow: '0 6px 20px rgba(46, 125, 50, 0.15)'
            }}>
              <Mail size={36} strokeWidth={2.2} />
            </div>

            <h2 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '800' }}>
              Cont creat cu succes! 🎉
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: '1.5' }}>
              Îți mulțumim pentru înregistrare, <strong>{signupSuccessData.name}</strong>!
            </p>

            {/* Caseta evidențiată pentru verificare email și SPAM */}
            <div style={{
              background: 'var(--bg-warm-tint)',
              border: '1.5px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={18} color="var(--accent-sage)" />
                <span style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  Confirmare necesară pe e-mail
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.55' }}>
                Am trimis un link securizat de activare la adresa:
                <br />
                <span style={{ 
                  display: 'inline-block',
                  marginTop: '4px',
                  background: 'var(--bg-card)', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border-light)',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  fontSize: '0.92rem'
                }}>
                  {signupSuccessData.email}
                </span>
              </p>

              <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.86rem',
                color: '#92400E',
                lineHeight: '1.5'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#D97706' }} />
                <span>
                  <strong>Important:</strong> Te rugăm să verifici atât folderul <strong>Inbox</strong>, cât și folderul de <strong>SPAM / Junk</strong>, în cazul în care email-ul a fost filtrat automat.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setMode('signin');
                  setFormData(prev => ({ ...prev, password: '' }));
                  setSignupSuccessData(null);
                }}
                style={{ width: '100%', padding: '13px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <LogIn size={18} />
                <span>Mergi la Conectare</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                style={{ width: '100%', padding: '11px', fontSize: '0.88rem' }}
              >
                Închide fereastra
              </button>
            </div>
          </div>
        ) : (
          /* FORMULAR OBIȘNUIT DE AUTENTIFICARE / ÎNREGISTRARE */
          <>
            {/* Header Modal */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                {mode === 'signin' ? <LogIn size={26} /> : <UserPlus size={26} />}
              </div>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '6px' }}>
                {mode === 'signin' ? 'Conectare în Contul Tău' : 'Creează un Cont Nou'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                {mode === 'signin' 
                  ? 'Accesează istoricul comenzilor și produsele tale favorite.' 
                  : 'Gestionează comenzile și produsele tale favorite ușor și rapid.'}
              </p>
            </div>

            {/* Tab-uri Comutare Mod */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'var(--bg-warm-tint)',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '20px',
              border: '1px solid var(--border-light)'
            }}>
              <button
                type="button"
                className={`admin-tab-btn ${mode === 'signin' ? 'active' : ''}`}
                onClick={() => { setMode('signin'); setErrors({}); setGeneralError(''); }}
                style={{ justifyContent: 'center' }}
              >
                Autentificare
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                onClick={() => { setMode('signup'); setErrors({}); setGeneralError(''); }}
                style={{ justifyContent: 'center' }}
              >
                Înregistrare
              </button>
            </div>

            {/* Notificare eroare generală */}
            {generalError && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                background: '#FEE2E2',
                color: '#DC2626',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.86rem',
                lineHeight: '1.45'
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flexGrow: 1 }}>
                  <span>{generalError}</span>
                  {generalError.includes('Există deja un cont') && mode === 'signup' && (
                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin');
                          setGeneralError('');
                          setErrors({});
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#991B1B',
                          textDecoration: 'underline',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '0.85rem'
                        }}
                      >
                        Apasă aici pentru a te conecta →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formular */}
            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="form-group-custom">
                  <label className="form-label-custom">Nume și Prenume *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className={`custom-input ${errors.name ? 'error-border' : ''}`}
                      placeholder="Nume și prenume"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  {errors.name && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px' }}>{errors.name}</span>}
                </div>
              )}

              <div className="form-group-custom">
                <label className="form-label-custom">Adresă de Email *</label>
                <input
                  type="email"
                  className={`custom-input ${errors.email ? 'error-border' : ''}`}
                  placeholder="adresa@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px' }}>{errors.email}</span>}
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Parolă *</label>
                <input
                  type="password"
                  className={`custom-input ${errors.password ? 'error-border' : ''}`}
                  placeholder="Minim 6 caractere"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                {errors.password && <span style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px' }}>{errors.password}</span>}
              </div>


              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '0.98rem' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Se procesează...</span>
                  </>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn size={18} />
                    <span>Conectează-te</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Creează Contul Gratuit</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
