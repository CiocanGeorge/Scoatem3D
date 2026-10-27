import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, AlertCircle, ShoppingBag, Trash2, Loader2, Sparkles } from 'lucide-react';
import { uploadCustomerFile } from '../lib/supabaseClient';

export default function ProductCustomizerModal({ product, onClose, onAddToCart }) {
  // Stare pentru valorile completate de client { [fieldKey]: value }
  const [formData, setFormData] = useState({});
  // Stare pentru fișierele selectate { [fieldKey]: { file, previewUrl, isUploading } }
  const [imageFiles, setImageFiles] = useState({});
  // Erori de validare { [fieldKey]: errorMessage }
  const [errors, setErrors] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product) return null;

  const fields = product.fields || [];

  // Schimbare text sau select
  const handleInputChange = (fieldKey, value) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    if (errors[fieldKey]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  // Selectare fișier imagine pentru un câmp
  const handleFileSelect = (fieldKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificare tip fișier
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [fieldKey]: 'Te rugăm să încarci un fișier de tip imagine (JPEG, PNG, WEBP).' }));
      return;
    }

    // Verificare mărime maximă (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [fieldKey]: 'Imaginea depășește limita de 20MB. Te rugăm să alegi o poză mai mică.' }));
      return;
    }

    // Generăm un preview local instant
    const localPreview = URL.createObjectURL(file);
    setImageFiles(prev => ({
      ...prev,
      [fieldKey]: {
        file,
        previewUrl: localPreview,
        fileName: file.name
      }
    }));

    // Ștergem eroarea dacă exista
    if (errors[fieldKey]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  const handleRemoveImage = (fieldKey) => {
    setImageFiles(prev => {
      const copy = { ...prev };
      if (copy[fieldKey]?.previewUrl) {
        URL.revokeObjectURL(copy[fieldKey].previewUrl);
      }
      delete copy[fieldKey];
      return copy;
    });
  };

  // Validare formular
  const validateForm = () => {
    const newErrors = {};

    fields.forEach(field => {
      if (field.required) {
        if (field.type === 'image') {
          if (!imageFiles[field.key]) {
            newErrors[field.key] = `Acest câmp este obligatoriu. Te rugăm să încarci o fotografie.`;
          }
        } else if (field.type === 'select') {
          if (!formData[field.key]) {
            newErrors[field.key] = `Te rugăm să selectezi o opțiune.`;
          }
        } else {
          // text
          const val = (formData[field.key] || '').trim();
          if (!val) {
            newErrors[field.key] = `Te rugăm să completezi acest text de personalizare.`;
          }
        }
      }

      // Validare limită lungime text dacă există
      if (field.type === 'text' && field.max_length && formData[field.key]) {
        if (formData[field.key].length > field.max_length) {
          newErrors[field.key] = `Textul depășește numărul maxim de ${field.max_length} caractere.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Adăugare în coș cu upload imagine
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const finalCustomization = { ...formData };

      // Upload pentru fiecare imagine către Supabase Storage (sau DataURL fallback)
      const imageKeys = Object.keys(imageFiles);
      for (const key of imageKeys) {
        const fileObj = imageFiles[key];
        const uploadResult = await uploadCustomerFile(fileObj.file);

        if (uploadResult?.url) {
          finalCustomization[key] = uploadResult.url;
          finalCustomization[`${key}_filename`] = uploadResult.filename;
        }
      }

      // Adăugăm articolul în coș
      const cartItem = {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity,
        customization: finalCustomization,
        fields_schema: fields
      };

      onAddToCart(cartItem);
      onClose();
    } catch (err) {
      console.error('Eroare la procesarea personalizării:', err);
      alert('A apărut o problemă la încărcarea fotografiilor. Te rugăm să încerci din nou.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedPrice = Number(product.price).toFixed(2).replace('.', ',');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px' }}
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose} 
          aria-label="Închide fereastra"
        >
          <X size={20} />
        </button>

        <div className="customization-layout">
          {/* Coloana Stânga: Imagine & Rezumat Live */}
          <div>
            <div className="detail-img-container">
              <img 
                src={product.image_url || '/images/products/lampa-litofanie.jpg'} 
                alt={product.name} 
              />
            </div>

            {/* Rezumat Personalizare Live */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'var(--bg-warm-tint)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Rezumat Personalizare Live</h4>
              </div>

              {fields.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Acest produs nu necesită personalizare suplimentară.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                  {fields.map(field => {
                    if (field.type === 'image') {
                      const img = imageFiles[field.key];
                      return (
                        <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'var(--text-secondary)', minWidth: '120px' }}>{field.label}:</span>
                          {img ? (
                            <span style={{ color: 'var(--accent-sage)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> Poză selectată ({img.fileName.slice(0, 16)}...)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nicio poză încărcată</span>
                          )}
                        </div>
                      );
                    }

                    const val = formData[field.key];
                    return (
                      <div key={field.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: 'var(--text-secondary)', minWidth: '120px' }}>{field.label}:</span>
                        <strong style={{ color: val ? 'var(--text-main)' : 'var(--text-muted)', wordBreak: 'break-word' }}>
                          {val || '(necompletat)'}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Coloana Dreapta: Formular Configurare */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-terracotta" style={{ marginBottom: '8px' }}>
                {product.category}
              </span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {formattedPrice} Lei
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TVA inclus • Livrare gratuită la peste 200 Lei</span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {product.description}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '18px 0' }} />

            {/* FORMULARUL DINAMIC GENERAT DIN `fields` */}
            <form onSubmit={handleSubmit}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Configurează personalizarea</span>
              </h3>

              {fields.map((field) => {
                const isError = Boolean(errors[field.key]);

                // 1. CÂMP DE TIP IMAGINE
                if (field.type === 'image') {
                  const currentImage = imageFiles[field.key];

                  return (
                    <div key={field.key} className="form-group-custom">
                      <label className="form-label-custom">
                        <span>
                          {field.label}
                          {field.required && <span className="required-star">*</span>}
                        </span>
                      </label>

                      {currentImage ? (
                        <div className="preview-thumb-box">
                          <img 
                            src={currentImage.previewUrl} 
                            alt="Previzualizare" 
                            className="preview-thumb-img" 
                          />
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {currentImage.fileName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-sage)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Gata de încărcare în calitate originală
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleRemoveImage(field.key)}
                            title="Șterge imaginea"
                            style={{ color: '#DC2626' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="image-upload-box" style={{ display: 'block', borderColor: isError ? '#DC2626' : undefined }}>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileSelect(field.key, e)}
                          />
                          <UploadCloud size={32} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                          <div style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                            Apasă pentru a alege fotografia
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Acceptă JPG, PNG, WEBP până la 20MB. Calitate originală păstrată.
                          </div>
                        </label>
                      )}

                      {isError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '0.8rem', marginTop: '6px' }}>
                          <AlertCircle size={14} />
                          <span>{errors[field.key]}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                // 2. CÂMP DE TIP SELECT (Dropdown)
                if (field.type === 'select') {
                  const currentValue = formData[field.key] || '';
                  const options = Array.isArray(field.options) ? field.options : [];

                  return (
                    <div key={field.key} className="form-group-custom">
                      <label className="form-label-custom">
                        <span>
                          {field.label}
                          {field.required && <span className="required-star">*</span>}
                        </span>
                      </label>

                      <select
                        className="custom-input"
                        value={currentValue}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        style={{ borderColor: isError ? '#DC2626' : undefined }}
                      >
                        <option value="">-- Alege o opțiune --</option>
                        {options.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      {isError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '0.8rem', marginTop: '6px' }}>
                          <AlertCircle size={14} />
                          <span>{errors[field.key]}</span>
                        </div>
                      )}
                    </div>
                  );
                }

                // 3. CÂMP DE TIP TEXT (cu contor live caractere)
                const currentVal = formData[field.key] || '';
                const maxLen = field.max_length || null;

                return (
                  <div key={field.key} className="form-group-custom">
                    <div className="form-label-custom">
                      <span>
                        {field.label}
                        {field.required && <span className="required-star">*</span>}
                      </span>
                      {maxLen && (
                        <span className="char-counter" style={{ color: currentVal.length >= maxLen ? '#DC2626' : undefined }}>
                          {currentVal.length} / {maxLen} caractere
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      className="custom-input"
                      value={currentVal}
                      maxLength={maxLen || undefined}
                      placeholder={field.required ? "Completează textul dorit..." : "Opțional..."}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      style={{ borderColor: isError ? '#DC2626' : undefined }}
                    />

                    {isError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '0.8rem', marginTop: '6px' }}>
                        <AlertCircle size={14} />
                        <span>{errors[field.key]}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Cantitate & Adăugare în Coș */}
              <div style={{ 
                marginTop: '28px', 
                paddingTop: '20px', 
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-warm-tint)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)', padding: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', background: 'white' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 14px', fontWeight: '700', fontSize: '1rem', minWidth: '40px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', background: 'white' }}
                  >
                    +
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isProcessing}
                  style={{ flexGrow: 1, padding: '14px 28px', fontSize: '1rem' }}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Se procesează fișierele...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Adaugă în coș • {(Number(product.price) * quantity).toFixed(2).replace('.', ',')} Lei</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
