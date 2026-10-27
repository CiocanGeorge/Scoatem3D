import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Trash2, Power, UploadCloud, Layers, X, 
  Check, AlertCircle, Sparkles, HelpCircle, FolderTree 
} from 'lucide-react';
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
  const [isUploadingImg, setIsUploadingImg] = useState(false);

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
    if (list.length === 0) return ['Lămpi Litofanie', 'Brelocuri', 'Diverse'];
    return list;
  }, [categories, products]);

  // Formular produs
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Lămpi Litofanie',
    image_url: '/images/products/lampa-litofanie.jpg',
    badge: '',
    active: true,
    fields: []
  });

  // Deschidere modal pentru creare produs nou
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'Lămpi Litofanie',
      image_url: '/images/products/lampa-litofanie.jpg',
      badge: 'Nou',
      active: true,
      fields: []
    });
    setIsModalOpen(true);
  };

  // Deschidere modal pentru editare produs existent
  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      id: prod.id,
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      category: prod.category || 'Diverse',
      image_url: prod.image_url || '/images/products/lampa-litofanie.jpg',
      badge: prod.badge || '',
      active: prod.active !== undefined ? prod.active : true,
      fields: JSON.parse(JSON.stringify(prod.fields || []))
    });
    setIsModalOpen(true);
  };

  // Schimbare stare activ/inactiv din listă
  const handleToggleActive = async (prod) => {
    const nextState = !prod.active;
    await toggleProductActiveState(prod.id, nextState);
    onRefresh();
  };

  // Ștergere produs
  const handleDelete = async (prodId, prodName) => {
    if (window.confirm(`Ești sigur că vrei să ștergi produsul "${prodName}"?`)) {
      await deleteProduct(prodId);
      onRefresh();
    }
  };

  // Upload imagine produs
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImg(true);
    try {
      const uploadedUrl = await uploadProductImage(file);
      if (uploadedUrl) {
        setProductForm(prev => ({ ...prev, image_url: uploadedUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('Eroare la încărcarea imaginii de produs.');
    } finally {
      setIsUploadingImg(false);
    }
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
      options: ['Opțiunea 1', 'Opțiunea 2']
    };

    setProductForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleUpdateField = (index, keyName, value) => {
    setProductForm(prev => {
      const updatedFields = [...prev.fields];
      updatedFields[index] = {
        ...updatedFields[index],
        [keyName]: value
      };

      // Dacă s-a schimbat eticheta și cheia era generică, sugerăm o cheie curățată
      if (keyName === 'label' && (!updatedFields[index].key || updatedFields[index].key.startsWith('camp_'))) {
        const autoKey = value
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

  // Salvare formular
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      alert('Numele și prețul sunt obligatorii.');
      return;
    }

    try {
      await saveProduct(productForm);
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Eroare la salvarea produsului.');
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
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase' }}>
                {prod.category}
              </div>
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
                  onClick={() => handleDelete(prod.id, prod.name)}
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
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '820px' }}
          >
            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
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
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    >
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

              {/* Descriere */}
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label-custom">Descriere Produs</label>
                <textarea
                  className="custom-input"
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              {/* Imagine Produs */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label-custom">Imagine Principală Produs</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img
                    src={productForm.image_url}
                    alt="Preview"
                    style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <input
                      type="text"
                      className="custom-input"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                      placeholder="URL imagine sau încarcă fișier..."
                      style={{ marginBottom: '8px' }}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600' }}>
                      <UploadCloud size={16} />
                      <span>{isUploadingImg ? 'Se încarcă...' : 'Încarcă altă poză de pe dispozitiv'}</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFileChange} />
                    </label>
                  </div>
                </div>
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
                              onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
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
                              value={Array.isArray(field.options) ? field.options.join(', ') : ''}
                              onChange={(e) => {
                                const opts = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                handleUpdateField(idx, 'options', opts);
                              }}
                            />
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
                  onClick={() => setIsModalOpen(false)}
                >
                  Anulează
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={18} />
                  <span>Salvează Produsul</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
