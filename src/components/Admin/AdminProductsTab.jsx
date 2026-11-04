import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Power, UploadCloud, Layers, X, 
  Check, AlertCircle, Sparkles, HelpCircle, FolderTree,
  Image as ImageIcon, Star, Bold, Italic, ListOrdered, List, Eye, Edit3
} from 'lucide-react';
import { FormattedDescription } from '../../utils/formatDescription';
import { 
  saveProduct, 
  deleteProduct, 
  toggleProductActiveState, 
  uploadProductImage,
  saveCategory 
} from '../../lib/supabaseClient';

export default function AdminProductsTab({ 
  products = [], 
  categories = [], 
  onRefresh, 
  onRefreshCategories, 
  onGoToCategories 
}) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [descTab, setDescTab] = useState('write'); // 'write' | 'preview'
  const descriptionTextareaRef = useRef(null);

  // Formatare text stil Word pentru descriere
  const handleFormatDescription = (type) => {
    const textarea = descriptionTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = productForm.description || '';
    const selected = text.substring(start, end);

    let replacement = '';
    let newCursorPos = start;

    if (type === 'bold') {
      if (selected) {
        replacement = `**${selected}**`;
        newCursorPos = start + replacement.length;
      } else {
        replacement = '**Text îngroșat**';
        newCursorPos = start + 2;
      }
    } else if (type === 'italic') {
      if (selected) {
        replacement = `*${selected}*`;
        newCursorPos = start + replacement.length;
      } else {
        replacement = '*Text cursiv*';
        newCursorPos = start + 1;
      }
    } else if (type === 'ordered') {
      if (selected) {
        const lines = selected.split('\n');
        replacement = lines.map((l, i) => `${i + 1}. ${l.replace(/^(\d+[\.\)]|[•\-\*])\s*/, '')}`).join('\n');
        newCursorPos = start + replacement.length;
      } else {
        const prefix = (start > 0 && text[start - 1] !== '\n') ? '\n' : '';
        replacement = `${prefix}1. Primul element\n2. Al doilea element\n3. Al treilea element\n`;
        newCursorPos = start + replacement.length;
      }
    } else if (type === 'bullet') {
      if (selected) {
        const lines = selected.split('\n');
        replacement = lines.map(l => `• ${l.replace(/^(\d+[\.\)]|[•\-\*])\s*/, '')}`).join('\n');
        newCursorPos = start + replacement.length;
      } else {
        const prefix = (start > 0 && text[start - 1] !== '\n') ? '\n' : '';
        replacement = `${prefix}• Primul detaliu\n• Al doilea detaliu\n• Al treilea detaliu\n`;
        newCursorPos = start + replacement.length;
      }
    }

    const nextVal = text.substring(0, start) + replacement + text.substring(end);
    setProductForm(prev => ({ ...prev, description: nextVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Fișiere în așteptare (nu încă urcate pe Supabase)
  // Structură: { id, file, previewUrl, isPrimary }
  // - id: string unic pentru identificare
  // - file: File object original
  // - previewUrl: URL.createObjectURL(file) — doar pentru preview local
  // - isPrimary: dacă e imaginea principală cover
  const [pendingMainFile, setPendingMainFile] = useState(null);  // { file, previewUrl }
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState([]); // [{ id, file, previewUrl }]

  const galleryFileInputRef = useRef(null);
  const mainFileInputRef = useRef(null);

  // Curăță toate object URL-urile create local (anti memory leak)
  const revokeAllPreviews = () => {
    if (pendingMainFile?.previewUrl) URL.revokeObjectURL(pendingMainFile.previewUrl);
    pendingGalleryFiles.forEach(pf => URL.revokeObjectURL(pf.previewUrl));
  };

  // Quick add categorie din modal
  const [isAddingQuickCat, setIsAddingQuickCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [isSavingQuickCat, setIsSavingQuickCat] = useState(false);

  // Lista dinamica de categorii pentru select
  const categoryOptions = useMemo(() => {
    const list = categories.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
    products.forEach(p => {
      if (p.category && !list.includes(p.category)) {
        list.push(p.category);
      }
    });
    return list;
  }, [categories, products]);

  // Formular produs
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '/images/products/lampa-litofanie.jpg',
    gallery: [],
    badge: '',
    active: true,
    fields: []
  });

  // Deschidere modal pentru creare produs nou
  const handleOpenNewProduct = () => {
    revokeAllPreviews();
    setPendingMainFile(null);
    setPendingGalleryFiles([]);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: categoryOptions[0] || '',
      image_url: '/images/products/lampa-litofanie.jpg',
      gallery: [],
      badge: 'Nou',
      active: true,
      fields: []
    });
    setGalleryUrlInput('');
    setDescTab('write');
    setIsModalOpen(true);
  };

  // Deschidere modal pentru editare produs existent
  const handleOpenEditProduct = (prod) => {
    revokeAllPreviews();
    setPendingMainFile(null);
    setPendingGalleryFiles([]);
    setEditingProduct(prod);
    setProductForm({
      id: prod.id,
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      category: prod.category || '',
      image_url: prod.image_url || '/images/products/lampa-litofanie.jpg',
      gallery: Array.isArray(prod.gallery) ? prod.gallery : [],
      badge: prod.badge || '',
      active: prod.active !== undefined ? prod.active : true,
      fields: (prod.fields || []).map(f => ({
        ...f,
        raw_options: Array.isArray(f.options) ? f.options.join(', ') : ''
      }))
    });
    setGalleryUrlInput('');
    setDescTab('write');
    setIsModalOpen(true);
  };

  // Închidere modal (cu curățare object URL-uri)
  const handleCloseModal = () => {
    revokeAllPreviews();
    setPendingMainFile(null);
    setPendingGalleryFiles([]);
    setIsModalOpen(false);
  };

  // Schimbare stare activ/inactiv din listă
  const handleToggleActive = async (prod) => {
    const nextState = !prod.active;
    await toggleProductActiveState(prod.id, nextState);
    onRefresh();
  };

  // Ștergere produs (inclusiv fișierele din Storage)
  const handleDelete = async (prod) => {
    if (window.confirm(`Ești sigur că vrei să ștergi produsul "${prod.name}"?\nSe vor șterge definitiv produsul și pozele asociate din Supabase Storage.`)) {
      try {
        const result = await deleteProduct(prod.id, prod);
        if (result?.storageWarning === 'RLS_DELETE_BLOCKED') {
          alert(
            `Produsul "${prod.name}" a fost șters din magazin!\n\n` +
            `⚠️ ATENȚIE: Pozele nu au putut fi șterse automat din Supabase Storage din cauza lipsei permisiunii RLS DELETE.\n\n` +
            `Pentru ca pozele să fie șterse automat pe viitor, mergi în Supabase Dashboard > SQL Editor și rulează:\n\n` +
            `CREATE POLICY "Admin can delete product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');`
          );
        }
        onRefresh();
      } catch (err) {
        console.error(err);
        alert('Eroare la ștergerea produsului: ' + (err.message || err));
      }
    }
  };

  // ──────────────────────────────────────────────────────
  // IMAGINE PRINCIPALĂ — stocare locală, fără upload imediat
  // ──────────────────────────────────────────────────────
  const handleMainFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revocăm preview-ul anterior dacă exista
    if (pendingMainFile?.previewUrl) URL.revokeObjectURL(pendingMainFile.previewUrl);
    const previewUrl = URL.createObjectURL(file);
    setPendingMainFile({ file, previewUrl });
    // Setăm previewUrl drept image_url temporar (ca să se afișeze)
    setProductForm(prev => ({ ...prev, image_url: previewUrl }));
    if (mainFileInputRef.current) mainFileInputRef.current.value = '';
  };

  // ──────────────────────────────────────────────────────
  // GALERIE — stocare locală, fără upload imediat
  // ──────────────────────────────────────────────────────
  const handleGalleryFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPending = files.map(file => ({
      id: `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setPendingGalleryFiles(prev => [...prev, ...newPending]);
    // Adăugăm previewUrl-urile în gallery ca placeholder vizual
    setProductForm(prev => ({
      ...prev,
      gallery: [...prev.gallery, ...newPending.map(pf => pf.previewUrl)]
    }));
    if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
  };

  // Adăugare imagine în galerie prin URL
  const handleAddGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    setProductForm(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
    setGalleryUrlInput('');
  };

  // Ștergere imagine din galerie (poate fi URL real sau previewUrl pending)
  const handleRemoveGalleryImage = (idx) => {
    const removedUrl = productForm.gallery[idx];
    // Dacă e un fișier pending, îl revocăm și îl scoatem din lista pending
    setPendingGalleryFiles(prev => {
      const found = prev.find(pf => pf.previewUrl === removedUrl);
      if (found) URL.revokeObjectURL(found.previewUrl);
      return prev.filter(pf => pf.previewUrl !== removedUrl);
    });
    setProductForm(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx)
    }));
  };

  // Setare imagine din galerie ca imagine principală
  const handleSetGalleryAsPrimary = (url) => {
    setProductForm(prev => ({ ...prev, image_url: url }));
  };

  // Salvare rapidă a unei categorii noi din formularul de produs
  const handleSaveQuickCat = async () => {
    if (!quickCatName.trim()) return;
    setIsSavingQuickCat(true);
    try {
      await saveCategory({ name: quickCatName.trim() });
      setProductForm(prev => ({ ...prev, category: quickCatName.trim() }));
      setQuickCatName('');
      setIsAddingQuickCat(false);
      onRefreshCategories?.();
    } catch (err) {
      console.error('Eroare salvare categorie rapida:', err);
      alert(err.message || 'Nu s-a putut salva categoria.');
    } finally {
      setIsSavingQuickCat(false);
    }
  };

  // ============================================================================
  // CONSTRUCTOR VIZUAL DE CÂMPURI DE PERSONALIZARE
  // ============================================================================

  const handleAddField = () => {
    const newField = {
      key: `camp_${Date.now().toString(36)}`,
      label: 'Câmp nou de personalizare',
      type: 'text',
      required: true,
      max_length: 30,
      options: ['Opțiunea 1', 'Opțiunea 2'],
      raw_options: 'Opțiunea 1, Opțiunea 2'
    };

    setProductForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleUpdateField = (index, keyNameOrObj, value) => {
    setProductForm(prev => {
      const updatedFields = [...prev.fields];
      const updates = typeof keyNameOrObj === 'object' && keyNameOrObj !== null
        ? keyNameOrObj
        : { [keyNameOrObj]: value };

      updatedFields[index] = {
        ...updatedFields[index],
        ...updates
      };

      // Dacă s-a schimbat eticheta și cheia era generică, sugerăm o cheie curățată
      if (updates.label && (!updatedFields[index].key || updatedFields[index].key.startsWith('camp_'))) {
        const autoKey = updates.label
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, '_')
          .slice(0, 24);
        if (autoKey) updatedFields[index].key = autoKey;
      }

      return { ...prev, fields: updatedFields };
    });
  };

  const handleRemoveField = (index) => {
    setProductForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  // Salvare formular — uploadul fișierelor are loc ACUM
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      alert('Numele și prețul sunt obligatorii.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = productForm.image_url;
      let finalGallery = [...productForm.gallery];

      // 1. Upload imagine principală dacă e un fișier pending
      if (pendingMainFile) {
        const uploadedUrl = await uploadProductImage(pendingMainFile.file);
        if (uploadedUrl) {
          // Înlocuim previewUrl cu URL-ul real în gallery și image_url
          finalGallery = finalGallery.map(u =>
            u === pendingMainFile.previewUrl ? uploadedUrl : u
          );
          if (finalImageUrl === pendingMainFile.previewUrl) {
            finalImageUrl = uploadedUrl;
          }
          URL.revokeObjectURL(pendingMainFile.previewUrl);
        }
      }

      // 2. Upload imagini galerie pending (în paralel pentru viteză)
      if (pendingGalleryFiles.length > 0) {
        const uploadResults = await Promise.all(
          pendingGalleryFiles.map(async (pf) => {
            const uploadedUrl = await uploadProductImage(pf.file);
            URL.revokeObjectURL(pf.previewUrl);
            return { previewUrl: pf.previewUrl, uploadedUrl };
          })
        );
        // Înlocuim fiecare previewUrl cu URL-ul real în gallery
        for (const { previewUrl, uploadedUrl } of uploadResults) {
          if (uploadedUrl) {
            finalGallery = finalGallery.map(u => u === previewUrl ? uploadedUrl : u);
            if (finalImageUrl === previewUrl) finalImageUrl = uploadedUrl;
          } else {
            // Dacă upload-ul a eșuat, scoatem imaginea din galerie
            finalGallery = finalGallery.filter(u => u !== previewUrl);
          }
        }
      }

      // 3. Asigurăm că image_url e și în galerie (la prima poziție)
      if (finalImageUrl && !finalGallery.includes(finalImageUrl)) {
        finalGallery.unshift(finalImageUrl);
      }

      // Curățăm câmpurile de personalizare (eliminăm raw_options temporar și asigurăm options curate)
      const cleanFields = (productForm.fields || []).map(f => {
        const { raw_options, ...rest } = f;
        if (rest.type === 'select') {
          if (raw_options !== undefined) {
            rest.options = raw_options.split(',').map(s => s.trim()).filter(Boolean);
          } else if (!Array.isArray(rest.options)) {
            rest.options = [];
          }
        }
        return rest;
      });

      // 4. Salvăm în Supabase
      const result = await saveProduct({
        ...productForm,
        image_url: finalImageUrl,
        gallery: finalGallery,
        fields: cleanFields
      });

      if (result?._needsGalleryColumn) {
        alert('Produsul a fost salvat, dar galeria de imagini nu a putut fi stocată.\nRulează în Supabase SQL Editor:\nALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT \'[]\'::jsonb;');
      }

      // Curăță starea pending
      setPendingMainFile(null);
      setPendingGalleryFiles([]);
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Eroare la salvarea produsului: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header cu buton adăugare */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Catalog Produse & Personalizări</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Configurează produsele afișate în magazin și câmpurile dinamice de personalizare pentru fiecare piesă.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {onGoToCategories && (
            <button 
              className="btn-secondary" 
              onClick={onGoToCategories}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Gestionează lista de categorii din baza de date"
            >
              <FolderTree size={16} />
              <span>Gestionează Categorii</span>
            </button>
          )}

          <button className="btn-primary" onClick={handleOpenNewProduct}>
            <Plus size={18} />
            <span>Adaugă Produs Nou</span>
          </button>
        </div>
      </div>

      {/* Grid Produse Admin */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {products.map(prod => (
          <div 
            key={prod.id} 
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              opacity: prod.active ? 1 : 0.65,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ position: 'relative', height: '170px', background: 'var(--bg-warm-tint)' }}>
              <img
                src={prod.image_url || '/images/products/lampa-litofanie.jpg'}
                alt={prod.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                <span className={`badge ${prod.active ? 'badge-sage' : 'badge-rose'}`}>
                  {prod.active ? 'Activ în Magazin' : 'Dezactivat (Ascuns)'}
                </span>
              </div>
            </div>

            <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {prod.category && (
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                  {prod.category}
                </div>
              )}
              <h4 style={{ fontSize: '1.05rem', margin: '4px 0 8px', color: 'var(--text-main)' }}>
                {prod.name}
              </h4>
              <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '10px' }}>
                {Number(prod.price).toFixed(2).replace('.', ',')} Lei
              </div>

              {/* Rezumat Câmpuri Configurate */}
              <div style={{ background: 'var(--bg-warm-tint)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <strong>{(prod.fields || []).length} câmpuri de personalizare:</strong>
                <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                  {(prod.fields || []).map((f, i) => (
                    <li key={i}>
                      {f.label} ({f.type}) {f.required && '• obligatoriu'}
                    </li>
                  ))}
                  {(prod.fields || []).length === 0 && <li>Fără câmpuri personalizate</li>}
                </ul>
              </div>

              {/* Butoane Acțiuni */}
              <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  className="btn-secondary"
                  onClick={() => handleToggleActive(prod)}
                  style={{ flexGrow: 1, padding: '8px', fontSize: '0.82rem' }}
                  title={prod.active ? 'Ascunde din magazin' : 'Activează în magazin'}
                >
                  <Power size={14} color={prod.active ? '#059669' : '#DC2626'} />
                  <span>{prod.active ? 'Dezactivează' : 'Activează'}</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleOpenEditProduct(prod)}
                  style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  title="Editează produs și câmpuri"
                >
                  <Edit2 size={14} />
                  <span>Editează</span>
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleDelete(prod)}
                  style={{ padding: '8px 12px', color: '#DC2626' }}
                  title="Șterge produs"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================
          MODAL ADĂUGARE / EDITARE PRODUS & CONSTRUCTOR VIZUAL CÂMPURI
          ======================================================================== */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '820px' }}
          >
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <X size={20} />
            </button>

            <form onSubmit={handleSaveProduct} style={{ padding: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <span className="badge badge-terracotta" style={{ marginBottom: '6px' }}>
                  {editingProduct ? 'Editare Produs' : 'Creare Produs Nou'}
                </span>
                <h2 style={{ fontSize: '1.5rem' }}>
                  {editingProduct ? `Editează: ${editingProduct.name}` : 'Adaugă Produs 3D Nou'}
                </h2>
              </div>

              {/* Informații Generale */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label-custom">Nume Produs *</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label-custom">Preț (Lei) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="custom-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label-custom" style={{ margin: 0 }}>Categorie</label>
                    {!isAddingQuickCat && (
                      <button
                        type="button"
                        onClick={() => setIsAddingQuickCat(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary)',
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Plus size={13} /> Categorie nouă
                      </button>
                    )}
                  </div>

                  {isAddingQuickCat ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="custom-input"
                        placeholder="Nume categorie..."
                        value={quickCatName}
                        onChange={(e) => setQuickCatName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSaveQuickCat}
                        disabled={isSavingQuickCat || !quickCatName.trim()}
                        style={{ padding: '6px 12px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                      >
                        {isSavingQuickCat ? '...' : 'Adaugă'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => { setIsAddingQuickCat(false); setQuickCatName(''); }}
                        style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <select
                      className="custom-input"
                      value={productForm.category || ''}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="">{categoryOptions.length === 0 ? '-- Fără categorie --' : '-- Fără categorie / Selectează --'}</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="form-label-custom">Badge Opțional (Bestseller, Nou etc.)</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Bestseller, Nou, etc."
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                  />
                </div>
              </div>

              {/* Descriere cu toolbar stil Word */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label-custom" style={{ margin: 0 }}>
                    Descriere Produs (Formatare stil Word / Text Îmbogățit)
                  </label>

                  {/* Buton comutare Editor / Previzualizare */}
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-warm-tint)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                    <button
                      type="button"
                      onClick={() => setDescTab('write')}
                      style={{
                        background: descTab === 'write' ? 'var(--bg-card)' : 'transparent',
                        color: descTab === 'write' ? 'var(--primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Editare</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab('preview')}
                      style={{
                        background: descTab === 'preview' ? 'var(--bg-card)' : 'transparent',
                        color: descTab === 'preview' ? 'var(--primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={13} />
                      <span>Previzualizare</span>
                    </button>
                  </div>
                </div>

                {/* Toolbar Word-like */}
                {descTab === 'write' && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--bg-warm-tint)',
                    border: '1px solid var(--border-light)',
                    borderBottom: 'none',
                    borderRadius: '8px 8px 0 0',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      type="button"
                      onClick={() => handleFormatDescription('bold')}
                      title="Îngroșat (Bold) - selectează un text sau apasă aici"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        color: 'var(--text-main)'
                      }}
                    >
                      <Bold size={14} />
                      <span>Bold</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFormatDescription('italic')}
                      title="Cursiv (Italic)"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.82rem',
                        fontStyle: 'italic',
                        color: 'var(--text-main)'
                      }}
                    >
                      <Italic size={14} />
                      <span>Cursiv</span>
                    </button>

                    <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 4px' }} />

                    <button
                      type="button"
                      onClick={() => handleFormatDescription('ordered')}
                      title="Listă Numerotată (1. 2. 3.) - numerotează rândurile selectate"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        color: 'var(--text-main)'
                      }}
                    >
                      <ListOrdered size={15} color="var(--primary)" />
                      <span>1. 2. 3. Numerotare</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFormatDescription('bullet')}
                      title="Listă cu Buline (•)"
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                        color: 'var(--text-main)'
                      }}
                    >
                      <List size={15} color="var(--primary)" />
                      <span>• Buline</span>
                    </button>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      💡 Selectează textul cu mouse-ul și apasă pe buton
                    </span>
                  </div>
                )}

                {descTab === 'write' ? (
                  <textarea
                    ref={descriptionTextareaRef}
                    className="custom-input"
                    rows={6}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Scrie descrierea produsului...&#10;Exemplu:&#10;Această lampă este **unică** și realizată din PLA biodegradabil.&#10;&#10;Beneficii principale:&#10;1. Personalizată cu fotografia ta&#10;2. Bază din lemn natural cu lumină caldă&#10;3. Consum redus pe USB"
                    style={{
                      borderRadius: descTab === 'write' ? '0 0 8px 8px' : '8px',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <div style={{
                    minHeight: '150px',
                    padding: '16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)'
                  }}>
                    {productForm.description ? (
                      <FormattedDescription text={productForm.description} />
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Descrierea este goală. Comută pe „Editare” pentru a scrie textul.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Imagine Principală Produs */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label-custom">Imagine Principală (Cover)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img
                    src={productForm.image_url}
                    alt="Preview"
                    style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <input
                      type="text"
                      className="custom-input"
                      value={pendingMainFile ? '' : productForm.image_url}
                      onChange={(e) => {
                        // URL manual → anulăm fișierul pending dacă era
                        if (pendingMainFile) {
                          URL.revokeObjectURL(pendingMainFile.previewUrl);
                          setPendingMainFile(null);
                        }
                        setProductForm({ ...productForm, image_url: e.target.value });
                      }}
                      placeholder={pendingMainFile ? `📎 ${pendingMainFile.file.name} (se urcă la salvare)` : 'URL imagine principală...'}
                      style={{ marginBottom: '8px' }}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}>
                      <UploadCloud size={16} />
                      <span>Alege poză principală de pe dispozitiv</span>
                      <input ref={mainFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMainFileChange} />
                    </label>
                    {pendingMainFile && (
                      <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        ⏳ Se urcă la salvare
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Galerie de imagini */}
              <div style={{ marginBottom: '24px', background: 'var(--bg-warm-tint)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="form-label-custom" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={16} color="var(--primary)" />
                    Galerie de imagini
                    <span style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                      ({productForm.gallery.length} {productForm.gallery.length === 1 ? 'imagine' : 'imagini'})
                    </span>
                  </label>
                  <label
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.82rem', cursor: 'pointer',
                      color: 'var(--primary)', fontWeight: '600',
                      background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                      borderRadius: '8px', padding: '6px 12px'
                    }}
                    title="Poți selecta mai multe poze deodată. Se urcă pe Supabase la salvare."
                  >
                    <UploadCloud size={15} />
                    <span>Adaugă poze</span>
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleGalleryFileChange}
                    />
                  </label>
                </div>

                {/* Grid imagini galerie */}
                {productForm.gallery.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    {productForm.gallery.map((imgUrl, idx) => {
                      const isPrimary = imgUrl === productForm.image_url;
                      const isPending = pendingGalleryFiles.some(pf => pf.previewUrl === imgUrl);
                      return (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: isPrimary ? '2px solid var(--primary)' : '2px solid var(--border-light)',
                            flexShrink: 0
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`Galerie ${idx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          {/* Badge "Principal" */}
                          {isPrimary && (
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'var(--primary)', color: '#fff',
                              fontSize: '0.6rem', fontWeight: '700',
                              textAlign: 'center', padding: '2px 0',
                              letterSpacing: '0.5px'
                            }}>
                              COVER
                            </div>
                          )}
                          {/* Badge "în așteptare" */}
                          {isPending && !isPrimary && (
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'rgba(0,0,0,0.55)', color: '#fff',
                              fontSize: '0.58rem', fontWeight: '600',
                              textAlign: 'center', padding: '2px 0'
                            }}>
                              ⏳ local
                            </div>
                          )}
                          {/* Buton ștergere */}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            style={{
                              position: 'absolute', top: '3px', right: '3px',
                              background: 'rgba(0,0,0,0.65)', color: '#fff',
                              border: 'none', borderRadius: '50%',
                              width: '20px', height: '20px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', padding: 0
                            }}
                            title="Șterge din galerie"
                          >
                            <X size={11} />
                          </button>
                          {/* Buton setare ca principală */}
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetGalleryAsPrimary(imgUrl)}
                              style={{
                                position: 'absolute', top: '3px', left: '3px',
                                background: 'rgba(0,0,0,0.55)', color: '#fff',
                                border: 'none', borderRadius: '50%',
                                width: '20px', height: '20px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', padding: 0
                              }}
                              title="Setează ca imagine principală (cover)"
                            >
                              <Star size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '12px', fontStyle: 'italic' }}>
                    Nicio imagine în galerie. Adaugă poze de mai sus sau prin URL.
                  </div>
                )}

                {/* Adăugare prin URL */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="URL imagine (https://...)..."
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGalleryUrl(); } }}
                    style={{ flexGrow: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddGalleryUrl}
                    disabled={!galleryUrlInput.trim()}
                    style={{ padding: '8px 14px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    <Plus size={14} /> Adaugă URL
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Apasă ⭐ pe o imagine ca să o setezi drept cover. Apasă ✕ ca s-o ștergi din galerie.
                  {pendingGalleryFiles.length > 0 && (
                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                      {' '}· {pendingGalleryFiles.length} {pendingGalleryFiles.length === 1 ? 'poză nouă' : 'poze noi'} se urcă pe Supabase la salvare.
                    </span>
                  )}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '24px 0' }} />

              {/* ================================================================
                  CONSTRUCTOR DE CÂMPURI DE PERSONALIZARE (FĂRĂ COD)
                  ================================================================ */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="var(--primary)" />
                      <span>Constructor Câmpuri Personalizare</span>
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Adaugă câmpurile pe care clientul trebuie să le completeze (fotografii, texte gravate, opțiuni culori filament).
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddField}
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} />
                    <span>+ Adaugă Câmp</span>
                  </button>
                </div>

                {productForm.fields.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-warm-tint)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Niciun câmp de personalizare adăugat. Apasă pe "+ Adaugă Câmp" pentru a cere clientului un text sau o fotografie.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {productForm.fields.map((field, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-warm-tint)',
                          padding: '16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--primary)' }}>
                            Câmp #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            style={{ color: '#DC2626', padding: '2px' }}
                            title="Șterge acest câmp"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          {/* Etichetă afișată clientului */}
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                              Etichetă afișată clientului:
                            </label>
                            <input
                              type="text"
                              className="custom-input"
                              placeholder="Etichetă câmp"
                              value={field.label}
                              onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                              required
                            />
                          </div>

                          {/* Tip câmp: text | image | select */}
                          <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                              Tip câmp:
                            </label>
                            <select
                              className="custom-input"
                              value={field.type}
                              onChange={(e) => {
                                const newType = e.target.value;
                                if (newType === 'select') {
                                  const defaultOpts = (Array.isArray(field.options) && field.options.length > 0)
                                    ? field.options
                                    : ['Opțiunea 1', 'Opțiunea 2'];
                                  handleUpdateField(idx, {
                                    type: newType,
                                    options: defaultOpts,
                                    raw_options: defaultOpts.join(', ')
                                  });
                                } else {
                                  handleUpdateField(idx, 'type', newType);
                                }
                              }}
                            >
                              <option value="text">Text (input tastatură)</option>
                              <option value="image">Imagine (încărcare foto client)</option>
                              <option value="select">Select (listă opțiuni filament / stil)</option>
                            </select>
                          </div>

                          {/* Obligatoriu */}
                          <div style={{ display: 'flex', alignItems: 'center', marginTop: '22px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' }}>
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                              />
                              <span>Câmp Obligatoriu</span>
                            </label>
                          </div>
                        </div>

                        {/* Opțiuni suplimentare în funcție de tip */}
                        {field.type === 'text' && (
                          <div style={{ marginTop: '10px', maxWidth: '240px' }}>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              Limită maximă caractere:
                            </label>
                            <input
                              type="number"
                              className="custom-input"
                              placeholder="Număr maxim caractere"
                              value={field.max_length || ''}
                              onChange={(e) => handleUpdateField(idx, 'max_length', Number(e.target.value) || null)}
                            />
                          </div>
                        )}

                        {field.type === 'select' && (
                          <div style={{ marginTop: '10px' }}>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              Opțiuni dropdown (separate prin virgulă):
                            </label>
                            <input
                              type="text"
                              className="custom-input"
                              placeholder="Opțiune 1, Opțiune 2, Opțiune 3"
                              value={field.raw_options !== undefined ? field.raw_options : (Array.isArray(field.options) ? field.options.join(', ') : '')}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const opts = raw.split(',').map(s => s.trim()).filter(Boolean);
                                handleUpdateField(idx, {
                                  raw_options: raw,
                                  options: opts
                                });
                              }}
                              onBlur={(e) => {
                                // La ieșirea din câmp, formatează frumos opțiunile
                                const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                handleUpdateField(idx, {
                                  raw_options: opts.join(', '),
                                  options: opts
                                });
                              }}
                            />
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Scrie opțiunile separate prin virgulă (ex: Roșu, Albastru, Negru).
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Butoane Salvare Modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Anulează
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  <Check size={18} />
                  <span>
                    {isSaving
                      ? `Se salvează${(pendingMainFile || pendingGalleryFiles.length > 0) ? ' și se urcă pozele' : ''}...`
                      : 'Salvează Produsul'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
