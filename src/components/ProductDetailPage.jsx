import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  Box, 
  Heart,
  Share2, 
  Check, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ShoppingBag, 
  Zap, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  MessageSquare, 
  HelpCircle, 
  Info,
  Layers,
  Award,
  Loader2,
  Lock
} from 'lucide-react';
import { uploadCustomerFile, fetchProductReviews, saveProductReview, likeProductReview } from '../lib/supabaseClient';

export default function ProductDetailPage({ 
  product, 
  allProducts = [], 
  onBack, 
  onAddToCart, 
  onBuyNow, 
  onSelectProduct,
  onOpenImageViewer,
  isWishlisted = false,
  onToggleWishlist,
  currentUser = null,
  onOpenAuthModal
}) {
  const productId = product?.id;

  // Imagine activă în galerie
  const galleryImages = (product?.gallery && product.gallery.length > 0)
    ? product.gallery
    : [product?.image_url || '/images/products/lampa-litofanie.jpg'];
  
  const [activeImage, setActiveImage] = useState(galleryImages[0]);

  // Tab activ în secțiunea de detalii
  const [activeTab, setActiveTab] = useState('descriere'); // 'descriere' | 'specificatii' | 'ingrijire' | 'faq'

  // Stare formular personalizare inline
  const [formData, setFormData] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Recenzii
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewFilter, setReviewFilter] = useState('toate'); // 'toate' | '5' | '4'
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    author_name: currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : ''),
    author_location: currentUser?.address ? currentUser.address.split(',')[0].trim() : '',
    rating: 5,
    title: '',
    comment: ''
  });

  // Sincronizare date autor la schimbarea stării de autentificare
  useEffect(() => {
    if (currentUser) {
      setNewReview(prev => ({
        ...prev,
        author_name: currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : ''),
        author_location: prev.author_location || (currentUser.address ? currentUser.address.split(',')[0].trim() : '')
      }));
    } else {
      setNewReview(prev => ({
        ...prev,
        author_name: '',
        author_location: ''
      }));
    }
  }, [currentUser]);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [likedReviews, setLikedReviews] = useState({});

  // Accordion FAQ
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Feedback copiere link
  const [copiedLink, setCopiedLink] = useState(false);

  const reviewsSectionRef = useRef(null);

  // Sincronizare imagine activă la schimbarea produsului
  useEffect(() => {
    if (galleryImages && galleryImages.length > 0) {
      setActiveImage(galleryImages[0]);
    }
    setFormData({});
    setImageFiles({});
    setFormErrors({});
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Încărcare recenzii
  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      if (!productId) return;
      setIsLoadingReviews(true);
      try {
        const revs = await fetchProductReviews(productId);
        if (isMounted) setReviews(revs || []);
      } catch (e) {
        console.error('Eroare la preluare recenzii:', e);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    };

    loadReviews();
    return () => { isMounted = false; };
  }, [productId]);

  if (!product) return null;

  // Schimbare câmpuri formular
  const handleInputChange = (fieldKey, value) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));
    if (formErrors[fieldKey]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  const handleFileSelect = (fieldKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors(prev => ({ ...prev, [fieldKey]: 'Te rugăm să alegi un fișier imagine valid (JPG, PNG, WEBP).' }));
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, [fieldKey]: 'Imaginea depășește limita de 20MB.' }));
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setImageFiles(prev => ({
      ...prev,
      [fieldKey]: {
        file,
        previewUrl: localPreview,
        fileName: file.name
      }
    }));

    if (formErrors[fieldKey]) {
      setFormErrors(prev => {
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

  // Validare formular de personalizare
  const validateForm = () => {
    const newErrors = {};
    const fields = product.fields || [];

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
          const val = (formData[field.key] || '').trim();
          if (!val) {
            newErrors[field.key] = `Te rugăm să completezi acest text de personalizare.`;
          }
        }
      }

      if (field.type === 'text' && field.max_length && formData[field.key]) {
        if (formData[field.key].length > field.max_length) {
          newErrors[field.key] = `Textul depășește limita maximă de ${field.max_length} caractere.`;
        }
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Pregătire element comandă
  const prepareOrderItem = async () => {
    if (!validateForm()) return null;

    setIsProcessingOrder(true);
    try {
      const finalCustomization = { ...formData };
      const imageKeys = Object.keys(imageFiles);

      for (const key of imageKeys) {
        const fileObj = imageFiles[key];
        const uploadResult = await uploadCustomerFile(fileObj.file);
        if (uploadResult?.url) {
          finalCustomization[key] = uploadResult.url;
          finalCustomization[`${key}_filename`] = uploadResult.filename;
        }
      }

      return {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity,
        customization: finalCustomization,
        fields_schema: product.fields || []
      };
    } catch (err) {
      console.error('Eroare la procesare fișiere:', err);
      alert('A apărut o problemă la încărcarea fotografiei. Te rugăm să reîncerci.');
      return null;
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleAddToCartClick = async () => {
    const item = await prepareOrderItem();
    if (item) {
      onAddToCart(item);
    }
  };

  const handleBuyNowClick = async () => {
    const item = await prepareOrderItem();
    if (item) {
      onBuyNow(item);
    }
  };

  // Trimitere recenzie nouă
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Trebuie să fii conectat în cont pentru a putea adăuga o recenzie.');
      onOpenAuthModal?.();
      return;
    }

    const reviewerName = (currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : '')).trim();
    if (!reviewerName) {
      alert('Nu s-a putut prelua numele din contul tău conectat.');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Te rugăm să introduci o scurtă impresie despre produs.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await saveProductReview({
        product_id: product.id,
        author_name: reviewerName,
        author_location: (newReview.author_location || 'România').trim(),
        rating: newReview.rating,
        title: newReview.title ? newReview.title.trim() : 'Recomand cu încredere!',
        comment: newReview.comment.trim()
      });

      if (res.success) {
        setReviews(prev => [res.review, ...prev]);
        setNewReview(prev => ({
          ...prev,
          title: '',
          comment: ''
        }));
        setIsReviewFormOpen(false);
        alert('Îți mulțumim din suflet pentru recenzie! Părerea ta ajută comunitatea.');
      }
    } catch (err) {
      console.error('Eroare la salvare recenzie:', err);
      alert('A apărut o problemă la salvarea recenziei. Te rugăm să încerci din nou.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Like la recenzie
  const handleLikeReview = async (reviewId) => {
    if (likedReviews[reviewId]) return;
    setLikedReviews(prev => ({ ...prev, [reviewId]: true }));
    const newCount = await likeProductReview(reviewId);
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful_count: newCount } : r));
  };

  // Copiere link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Scroll la recenzii
  const scrollToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calcule recenzii
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  const fiveStarCount = reviews.filter(r => Number(r.rating) === 5).length;
  const fourStarCount = reviews.filter(r => Number(r.rating) === 4).length;
  const threeStarCount = reviews.filter(r => Number(r.rating) === 3).length;

  const filteredReviews = reviewFilter === 'toate'
    ? reviews
    : reviews.filter(r => String(r.rating) === reviewFilter);

  // Produse Similare / Recomandate
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  const formattedPrice = Number(product.price).toFixed(2).replace('.', ',');
  const totalPrice = (Number(product.price) * quantity).toFixed(2).replace('.', ',');

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb & Acțiuni sus */}
        <div className="detail-top-nav">
          <button className="btn-back-nav" onClick={onBack}>
            <ArrowLeft size={18} />
            <span>Înapoi la Catalog</span>
          </button>

          <div className="detail-breadcrumbs">
            <span onClick={onBack} className="crumb-link">Magazin</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-category">{product.category}</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{product.name}</span>
          </div>

          <div className="detail-share-actions">
            <button 
              type="button"
              className={`btn-share ${isWishlisted ? 'btn-wishlist-active' : ''}`} 
              onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
              title={isWishlisted ? "Șterge din favorite" : "Salvează în lista de dorințe"}
            >
              <Heart 
                size={16} 
                fill={isWishlisted ? "#C26377" : "none"} 
                color={isWishlisted ? "#C26377" : "currentColor"} 
              />
              <span>{isWishlisted ? 'Salvat' : 'Favorite'}</span>
            </button>

            <button className="btn-share" onClick={handleCopyLink} title="Copiază link produs">
              {copiedLink ? <Check size={16} color="var(--accent-sage)" /> : <Share2 size={16} />}
              <span>{copiedLink ? 'Link copiat!' : 'Distribuie'}</span>
            </button>
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Uite ce am găsit la Scoatem3D: ${product.name} - ${window.location.href}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-share whatsapp-btn"
              title="Trimite pe WhatsApp"
            >
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* ====================================================================
            HERO PRODUS: 2 COLOANE (GALERIE & COMANDĂ / PERSONALIZARE)
            ==================================================================== */}
        <div className="detail-hero-grid">
          {/* COLOANA STÂNGA: GALERIE FOTO & HIGHLIGHTS */}
          <div className="detail-gallery-col">
            <div className="detail-main-image-wrap">
              {product.badge && (
                <div className="detail-badge-tag">
                  <span className="badge badge-gold">{product.badge}</span>
                </div>
              )}
              <img 
                src={activeImage} 
                alt={product.name} 
                className="detail-main-img"
                onClick={() => onOpenImageViewer && onOpenImageViewer(activeImage, product.name)}
                style={{ cursor: 'zoom-in' }}
              />
              <div className="detail-zoom-hint">
                <Sparkles size={14} />
                <span>Apasă pentru zoom imagine la claritate maximă</span>
              </div>
            </div>

            {/* Miniaturi Galerie */}
            {galleryImages.length > 1 && (
              <div className="detail-thumbs-strip">
                {galleryImages.map((imgUrl, idx) => (
                  <button 
                    key={idx}
                    className={`detail-thumb-item ${activeImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setActiveImage(imgUrl)}
                  >
                    <img src={imgUrl} alt={`Unghi ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Buline de încredere & Măiestrie 3D */}
            <div className="artisan-features-card">
              <h4 className="artisan-card-title">
                <Award size={18} color="var(--primary)" />
                <span>Standardul de Calitate Scoatem3D</span>
              </h4>
              <div className="artisan-features-grid">
                <div className="artisan-feature-item">
                  <div className="artisan-feat-icon">🌱</div>
                  <div>
                    <strong>PLA Organic Biodegradabil</strong>
                    <p>Filamente ecologice pe bază de amidon de porumb regenerabil</p>
                  </div>
                </div>

                <div className="artisan-feature-item">
                  <div className="artisan-feat-icon">🎯</div>
                  <div>
                    <strong>Rezoluție Strat 0.12 mm</strong>
                    <p>Sculptură micrometrică pentru contururi fine și expresivitate</p>
                  </div>
                </div>

                <div className="artisan-feature-item">
                  <div className="artisan-feat-icon">⏱️</div>
                  <div>
                    <strong>Producție Rapidă 24-48h</strong>
                    <p>Imprimat, finisat manual și testat înainte de expediere</p>
                  </div>
                </div>

                <div className="artisan-feature-item">
                  <div className="artisan-feat-icon">🎁</div>
                  <div>
                    <strong>Ambalaj Sigur de Cadou</strong>
                    <p>Cutie robustă căptușită cu protecție antishoc dedicată</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLOANA DREAPTA: COMANDĂ & PERSONALIZARE LIVE */}
          <div className="detail-info-col">
            <div className="detail-header-meta">
              <span className="badge badge-terracotta">{product.category}</span>
              
              <div className="detail-rating-pill" onClick={scrollToReviews} title="Vezi recenziile clienților">
                <div className="rating-stars-inline">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={15} 
                      fill={totalReviews > 0 && i < Math.round(Number(avgRating)) ? "#D48B28" : "#E2D7C8"} 
                      color={totalReviews > 0 && i < Math.round(Number(avgRating)) ? "#D48B28" : "#E2D7C8"} 
                    />
                  ))}
                </div>
                {totalReviews > 0 ? (
                  <>
                    <span className="rating-score-txt">{avgRating}</span>
                    <span className="rating-count-txt">({totalReviews} {totalReviews === 1 ? 'recenzie' : 'recenzii'})</span>
                  </>
                ) : (
                  <span className="rating-count-txt">Fii primul care lasă o recenzie</span>
                )}
              </div>
            </div>

            <h1 className="detail-product-title">{product.name}</h1>

            {/* Preț & Stoc */}
            <div className="detail-price-box">
              <div className="detail-price-main">
                <span className="price-val">{formattedPrice}</span>
                <span className="price-curr">Lei</span>
              </div>
              <div className="detail-stock-status">
                <span className="stock-dot"></span>
                <span>În stoc • Modelat și imprimat individual pentru tine</span>
              </div>
            </div>

            <p className="detail-short-description">
              {product.description}
            </p>

            {/* FORMULARUL DE PERSONALIZARE INTEGRAT */}
            <div className="detail-customization-section">
              <div className="customization-header">
                <Sparkles size={18} color="var(--primary)" />
                <h3>Personalizează piesa ta 3D</h3>
              </div>

              <div className="custom-fields-container">
                {(product.fields || []).map((field) => {
                  const isError = Boolean(formErrors[field.key]);

                  // 1. CÂMP IMAGINE
                  if (field.type === 'image') {
                    const currentImg = imageFiles[field.key];
                    return (
                      <div key={field.key} className="detail-field-group">
                        <label className="detail-field-label">
                          <span>
                            {field.label}
                            {field.required && <span className="req-star">*</span>}
                          </span>
                        </label>

                        {currentImg ? (
                          <div className="detail-img-preview-card">
                            <img src={currentImg.previewUrl} alt="Previzualizare" />
                            <div className="img-preview-meta">
                              <span className="img-preview-name">{currentImg.fileName}</span>
                              <span className="img-preview-status">
                                <CheckCircle2 size={13} color="var(--accent-sage)" /> Poză gata de sculptat în 3D
                              </span>
                            </div>
                            <button 
                              type="button" 
                              className="btn-remove-thumb"
                              onClick={() => handleRemoveImage(field.key)}
                              title="Șterge poza"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <label className={`detail-dropzone ${isError ? 'error-border' : ''}`}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileSelect(field.key, e)}
                            />
                            <UploadCloud size={28} color="var(--primary)" />
                            <strong>Apasă pentru a alege fotografia</strong>
                            <span>Acceptă JPEG, PNG, WEBP până la 20MB. Calitate originală.</span>
                          </label>
                        )}

                        {isError && (
                          <div className="detail-error-msg">
                            <AlertCircle size={14} />
                            <span>{formErrors[field.key]}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 2. CÂMP SELECT DROPDOWN
                  if (field.type === 'select') {
                    const currentVal = formData[field.key] || '';
                    const options = Array.isArray(field.options) ? field.options : [];
                    return (
                      <div key={field.key} className="detail-field-group">
                        <label className="detail-field-label">
                          <span>
                            {field.label}
                            {field.required && <span className="req-star">*</span>}
                          </span>
                        </label>

                        <select
                          className={`detail-select ${isError ? 'error-border' : ''}`}
                          value={currentVal}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                        >
                          <option value="">-- Alege o opțiune --</option>
                          {options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>

                        {isError && (
                          <div className="detail-error-msg">
                            <AlertCircle size={14} />
                            <span>{formErrors[field.key]}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 3. CÂMP TEXT
                  const currentVal = formData[field.key] || '';
                  const maxLen = field.max_length || null;
                  return (
                    <div key={field.key} className="detail-field-group">
                      <div className="detail-field-label">
                        <span>
                          {field.label}
                          {field.required && <span className="req-star">*</span>}
                        </span>
                        {maxLen && (
                          <span className="detail-char-count">
                            {currentVal.length} / {maxLen} caractere
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        className={`detail-text-input ${isError ? 'error-border' : ''}`}
                        value={currentVal}
                        maxLength={maxLen || undefined}
                        placeholder={field.required ? "Scrie textul dorit aici..." : "Opțional..."}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                      />

                      {isError && (
                        <div className="detail-error-msg">
                          <AlertCircle size={14} />
                          <span>{formErrors[field.key]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* REZUMAT PERSONALIZARE LIVE */}
              <div className="live-custom-summary-card">
                <div className="summary-title">
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Rezumat Personalizare Live</span>
                </div>
                <div className="summary-list">
                  {(product.fields || []).map(f => {
                    if (f.type === 'image') {
                      const img = imageFiles[f.key];
                      return (
                        <div key={f.key} className="summary-row">
                          <span className="summary-lbl">{f.label.split('(')[0]}:</span>
                          <span className="summary-val">
                            {img ? `Fotografie selectată (${img.fileName.slice(0, 18)}...)` : 'Nicio poză aleasă încă'}
                          </span>
                        </div>
                      );
                    }
                    const val = formData[f.key];
                    return (
                      <div key={f.key} className="summary-row">
                        <span className="summary-lbl">{f.label.split('(')[0]}:</span>
                        <span className="summary-val">{val || 'Nu a fost completat încă'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CANTITATE & BUTOANE DE COMANDĂ */}
            <div className="detail-cta-box">
              <div className="quantity-and-price-row">
                <div className="quantity-stepper">
                  <span className="stepper-label">Cantitate:</span>
                  <div className="stepper-controls">
                    <button 
                      type="button" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="stepper-value">{quantity}</span>
                    <button 
                      type="button" 
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="computed-total-box">
                  <span className="computed-lbl">Preț Total:</span>
                  <span className="computed-price">{totalPrice} Lei</span>
                </div>
              </div>

              {/* 2 BUTOANE STRATEGICE DE COMANDĂ */}
              <div className="detail-action-buttons">
                {/* Buton 1: CUMPĂRĂ ACUM (Direct Checkout) */}
                <button 
                  type="button"
                  className="btn-buy-now"
                  onClick={handleBuyNowClick}
                  disabled={isProcessingOrder}
                >
                  {isProcessingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Procesare fișiere...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>Cumpără Acum • Comandă Rapidă</span>
                    </>
                  )}
                </button>

                {/* Buton 2: ADAUGĂ ÎN COȘ */}
                <button 
                  type="button"
                  className="btn-add-cart-detail"
                  onClick={handleAddToCartClick}
                  disabled={isProcessingOrder}
                >
                  <ShoppingBag size={18} />
                  <span>Adaugă în Coș</span>
                </button>
              </div>

              <div className="reassurance-strip">
                <div className="reassurance-item">
                  <Truck size={15} color="var(--primary)" />
                  <span>Livrare 24-48h prin curier rapid</span>
                </div>
                <div className="reassurance-item">
                  <ShieldCheck size={15} color="var(--accent-sage)" />
                  <span>Plată securizată ramburs la livrare</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            TABURI DE CONȚINUT DETALIAT (DESCRIERE, SPECIFICAȚII, ÎNGRIJIRE, FAQ)
            ==================================================================== */}
        <div className="detail-tabs-section">
          <div className="detail-tabs-nav">
            <button 
              className={`detail-tab-btn ${activeTab === 'descriere' ? 'active' : ''}`}
              onClick={() => setActiveTab('descriere')}
            >
              <Info size={17} />
              <span>Descriere Completă</span>
            </button>
            <button 
              className={`detail-tab-btn ${activeTab === 'specificatii' ? 'active' : ''}`}
              onClick={() => setActiveTab('specificatii')}
            >
              <Layers size={17} />
              <span>Specificații Tehnice</span>
            </button>
            <button 
              className={`detail-tab-btn ${activeTab === 'ingrijire' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingrijire')}
            >
              <Box size={17} />
              <span>Pachet & Îngrijire</span>
            </button>
            <button 
              className={`detail-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
              onClick={() => setActiveTab('faq')}
            >
              <HelpCircle size={17} />
              <span>Întrebări Frecvente ({product.faq?.length || 0})</span>
            </button>
          </div>

          <div className="detail-tab-content-panel">
            {/* TAB 1: DESCRIERE DETALIATĂ */}
            {activeTab === 'descriere' && (
              <div className="tab-pane-descriere">
                <h3 className="pane-heading">Arta imprimării 3D personalizate pentru amintirile tale</h3>
                
                <div className="desc-paragraphs">
                  {(product.long_description || product.description).split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {product.highlights && product.highlights.length > 0 && (
                  <div className="highlights-block">
                    <h4>Puncte Forte & Beneficii</h4>
                    <ul className="highlights-list">
                      {product.highlights.map((h, i) => (
                        <li key={i}>
                          <CheckCircle2 size={16} color="var(--accent-sage)" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SPECIFICAȚII TEHNICE */}
            {activeTab === 'specificatii' && (
              <div className="tab-pane-specs">
                <h3 className="pane-heading">Specificații & Parametri de Fabricație</h3>
                <p className="pane-subtitle">
                  Fiecare piesă este fabricată conform celor mai stricte standarde din industria 3D artizanală.
                </p>

                <div className="specs-table-wrap">
                  <table className="specs-table">
                    <tbody>
                      {Object.entries(product.specs || {}).map(([key, val], i) => (
                        <tr key={i}>
                          <td className="spec-key">{key}</td>
                          <td className="spec-val">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PACHET & ÎNGRIJIRE */}
            {activeTab === 'ingrijire' && (
              <div className="tab-pane-care">
                <div className="care-grid">
                  <div className="care-box">
                    <h4 className="care-box-title">
                      <Box size={18} color="var(--primary)" />
                      <span>Ce primești în colet:</span>
                    </h4>
                    <ul className="package-list">
                      {(product.package_contents || ['Produs 3D gata finisat', 'Instrucțiuni de utilizare']).map((item, i) => (
                        <li key={i}>
                          <span className="dot-num">{i + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="care-box">
                    <h4 className="care-box-title">
                      <ShieldCheck size={18} color="var(--accent-sage)" />
                      <span>Ghid de Întreținere & Păstrare:</span>
                    </h4>
                    <p className="care-text">
                      {product.care_instructions || 'Ștergeți ușor cu o lavetă uscată sau ușor umedă din microfibră. Evitați expunerea la temperaturi peste 55°C.'}
                    </p>
                    <div className="care-tip-pill">
                      💡 Sfat util: Nu lăsați produsele pe bordul mașinii în zilele caniculare de vară.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ÎNTREBĂRI FRECVENTE (FAQ) */}
            {activeTab === 'faq' && (
              <div className="tab-pane-faq">
                <h3 className="pane-heading">Întrebări Frecvente despre acest produs</h3>
                <div className="faq-accordion-list">
                  {(product.faq || []).map((faqItem, idx) => {
                    const isOpen = expandedFaq === idx;
                    return (
                      <div key={idx} className={`faq-card ${isOpen ? 'open' : ''}`}>
                        <button 
                          className="faq-question-btn"
                          onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        >
                          <span>{faqItem.q}</span>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        {isOpen && (
                          <div className="faq-answer-body">
                            <p>{faqItem.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================
            SECȚIUNEA DE RECENZII CLIENȚI (REVIEWS)
            ==================================================================== */}
        <section className="detail-reviews-section" ref={reviewsSectionRef} id="reviews">
          <div className="reviews-section-header">
            <div>
              <span className="badge badge-sage">Părerile Comunității</span>
              <h2 className="reviews-title">Recenziile Clienților Verificați</h2>
              <p className="reviews-subtitle">
                Află cum au transformat produsele noastre momentele speciale ale altor clienți.
              </p>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal?.();
                  setIsReviewFormOpen(true);
                  return;
                }
                setIsReviewFormOpen(!isReviewFormOpen);
              }}
            >
              {currentUser ? (
                <>
                  <MessageSquare size={16} />
                  <span>{isReviewFormOpen ? 'Închide Formularul' : 'Scrie o Recenzie'}</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Conectează-te pentru a scrie o recenzie</span>
                </>
              )}
            </button>
          </div>

          {/* CARD DACĂ UTILIZATORUL NU ESTE CONECTAT */}
          {isReviewFormOpen && !currentUser && (
            <div className="add-review-card" style={{ textAlign: 'center', padding: '36px 24px', border: '1px dashed var(--border-medium)' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(212, 139, 40, 0.12)', color: 'var(--accent-gold)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <Lock size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Autentificare necesară pentru a lăsa o recenzie</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px', maxWidth: '460px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                Pentru a asigura autenticitatea fiecărei evaluări, doar utilizatorii autentificați pot publica recenzii. Te rugăm să te conectezi sau să îți creezi un cont.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={() => onOpenAuthModal?.()}
                >
                  Conectează-te sau Înregistrează-te
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setIsReviewFormOpen(false)}
                >
                  Închide
                </button>
              </div>
            </div>
          )}

          {/* FORMULAR DE ADĂUGARE RECENZIE NOUĂ PENTRU UTILIZATOR CONECTAT */}
          {isReviewFormOpen && currentUser && (
            <div className="add-review-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Împărtășește părerea ta despre acest produs</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Feedback-ul tău ne ajută să perfecționăm fiecare detaliu artizanal!
                  </p>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(34, 197, 94, 0.12)',
                  color: '#15803d',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}>
                  <CheckCircle2 size={14} />
                  <span>Cont conectat</span>
                </div>
              </div>

              {/* CARD IDENTITATE AUTOR CONECTAT */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                background: 'var(--bg-main)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-light)', 
                marginBottom: '20px' 
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  flexShrink: 0
                }}>
                  {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {currentUser.name || currentUser.email.split('@')[0]}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--border-light)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                      Autor recenzie
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {currentUser.email} • Recenzia va fi asociată automat contului tău
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitReview}>
                {/* Selector Stele */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '0.92rem' }}>
                    Nota ta pentru acest produs:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        style={{ padding: '4px' }}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: starVal }))}
                      >
                        <Star 
                          size={28} 
                          fill={(hoverRating || newReview.rating) >= starVal ? "#D48B28" : "none"} 
                          color={(hoverRating || newReview.rating) >= starVal ? "#D48B28" : "#B8ACA0"} 
                        />
                      </button>
                    ))}
                    <span style={{ marginLeft: '10px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                      {(hoverRating || newReview.rating)} / 5 Stele
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.88rem' }}>
                      Orașul tău (opțional)
                    </label>
                    <input 
                      type="text" 
                      className="custom-input"
                      placeholder="ex: București, Cluj-Napoca, Timișoara"
                      value={newReview.author_location}
                      onChange={(e) => setNewReview(prev => ({ ...prev, author_location: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.88rem' }}>
                      Titlu recenzie (opțional)
                    </label>
                    <input 
                      type="text" 
                      className="custom-input"
                      placeholder="ex: Finisaj impecabil, recomand!"
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '0.88rem' }}>
                    Comentariul tău detaliat *
                  </label>
                  <textarea 
                    className="custom-input"
                    rows={4}
                    required
                    placeholder="Descrie cum a arătat piesa, calitatea finisajelor, cum a reacționat persoana care a primit cadoul..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsReviewFormOpen(false)}
                  >
                    Anulează
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isSubmittingReview}
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Se publică...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>Publică Recenzia</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STATISTICI & SUMAR RECENZII */}
          <div className="reviews-summary-card">
            <div className="reviews-score-col">
              <div className="big-score-num">{totalReviews > 0 ? avgRating : '-'}</div>
              <div className="score-stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={20} 
                    fill={totalReviews > 0 && i < Math.round(Number(avgRating)) ? "#D48B28" : "#E2D7C8"} 
                    color={totalReviews > 0 && i < Math.round(Number(avgRating)) ? "#D48B28" : "#E2D7C8"} 
                  />
                ))}
              </div>
              <span className="score-total-txt">
                {totalReviews > 0 ? `Bazat pe ${totalReviews} ${totalReviews === 1 ? 'părere verificată' : 'păreri verificate'}` : 'Nicio recenzie încă'}
              </span>
            </div>

            <div className="reviews-bars-col">
              {/* 5 stele */}
              <div className="rating-bar-row">
                <span className="bar-label">5 Stele</span>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${totalReviews > 0 ? (fiveStarCount / totalReviews) * 100 : 100}%` }}
                  ></div>
                </div>
                <span className="bar-count">{fiveStarCount}</span>
              </div>

              {/* 4 stele */}
              <div className="rating-bar-row">
                <span className="bar-label">4 Stele</span>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${totalReviews > 0 ? (fourStarCount / totalReviews) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="bar-count">{fourStarCount}</span>
              </div>

              {/* 3 stele */}
              <div className="rating-bar-row">
                <span className="bar-label">3 Stele</span>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${totalReviews > 0 ? (threeStarCount / totalReviews) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="bar-count">{threeStarCount}</span>
              </div>
            </div>

            <div className="reviews-badge-col">
              <div className="trust-stamp">
                <ShieldCheck size={32} color="var(--accent-sage)" />
                <strong>100% Recenzii Reale</strong>
                <span>Clienți care au comandat și testat piesele din atelier</span>
              </div>
            </div>
          </div>

          {/* Filtrare recenzii */}
          <div className="reviews-filter-bar">
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Filtrează:</span>
            <button 
              className={`cat-btn ${reviewFilter === 'toate' ? 'active' : ''}`}
              onClick={() => setReviewFilter('toate')}
            >
              Toate ({totalReviews})
            </button>
            <button 
              className={`cat-btn ${reviewFilter === '5' ? 'active' : ''}`}
              onClick={() => setReviewFilter('5')}
            >
              5 Stele ({fiveStarCount})
            </button>
            {fourStarCount > 0 && (
              <button 
                className={`cat-btn ${reviewFilter === '4' ? 'active' : ''}`}
                onClick={() => setReviewFilter('4')}
              >
                4 Stele ({fourStarCount})
              </button>
            )}
          </div>

          {/* LISTA DE RECENZII */}
          {isLoadingReviews ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Se încarcă recenziile...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Nu există încă recenzii pentru acest produs.</p>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  if (!currentUser) {
                    onOpenAuthModal?.();
                  }
                  setIsReviewFormOpen(true);
                }}
              >
                {currentUser ? 'Fii primul care lasă o recenzie!' : 'Conectează-te și lasă prima recenzie!'}
              </button>
            </div>
          ) : (
            <div className="reviews-cards-list">
              {filteredReviews.map((rev) => (
                <article key={rev.id} className="review-card">
                  <div className="review-card-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {(rev.author_name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 className="reviewer-name">{rev.author_name}</h4>
                          {rev.verified_purchase && (
                            <span className="verified-badge">
                              <CheckCircle2 size={12} /> Cumpărător Verificat
                            </span>
                          )}
                        </div>
                        <span className="reviewer-meta">
                          {rev.author_location ? `${rev.author_location} • ` : ''}{rev.date || (rev.created_at ? new Date(rev.created_at).toLocaleDateString('ro-RO') : 'Recent')}
                        </span>
                      </div>
                    </div>

                    <div className="review-rating-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < Number(rev.rating) ? "#D48B28" : "#E2D7C8"} 
                          color={i < Number(rev.rating) ? "#D48B28" : "#E2D7C8"} 
                        />
                      ))}
                    </div>
                  </div>

                  {rev.title && <h5 className="review-card-title">{rev.title}</h5>}
                  <p className="review-card-body">{rev.comment}</p>

                  <div className="review-card-footer">
                    <button 
                      className={`btn-helpful ${likedReviews[rev.id] ? 'liked' : ''}`}
                      onClick={() => handleLikeReview(rev.id)}
                      title="Marchează această recenzie ca fiind utilă"
                    >
                      <ThumbsUp size={14} />
                      <span>Util ({rev.helpful_count || 0})</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ====================================================================
            SECȚIUNEA: PRODUSE SIMILARE / RECOMANDATE
            ==================================================================== */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <div className="related-header">
              <span className="badge badge-terracotta">Descoperă Mai Mult</span>
              <h3>Alte Creații 3D Recomandate</h3>
              <p>Produse similare create cu aceeași pasiune în atelierul nostru.</p>
            </div>

            <div className="products-grid">
              {relatedProducts.map(relProd => (
                <div 
                  key={relProd.id} 
                  className="product-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectProduct(relProd.id)}
                >
                  <div className="product-img-box">
                    {relProd.badge && (
                      <div className="card-badge-top">
                        <span className="badge badge-gold">{relProd.badge}</span>
                      </div>
                    )}
                    <img 
                      src={relProd.image_url || '/images/products/lampa-litofanie.jpg'} 
                      alt={relProd.name} 
                    />
                  </div>
                  <div className="product-body">
                    <span className="product-category-label">{relProd.category}</span>
                    <h4 className="product-name">{relProd.name}</h4>
                    <p className="product-description-snippet">{relProd.description}</p>
                    <div className="product-card-footer">
                      <div className="product-price">
                        {Number(relProd.price).toFixed(2).replace('.', ',')} <span>Lei</span>
                      </div>
                      <button 
                        className="btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(relProd.id);
                        }}
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Vezi Produsul
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
