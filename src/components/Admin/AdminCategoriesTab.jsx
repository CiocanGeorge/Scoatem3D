import React, { useState } from 'react';
import { 
  FolderTree, Plus, Edit2, Trash2, Check, Copy, AlertCircle, 
  RefreshCw, Package, ArrowUpDown, X, Sparkles 
} from 'lucide-react';
import { saveCategory, deleteCategory } from '../../lib/supabaseClient';

export default function AdminCategoriesTab({ 
  categories = [], 
  products = [], 
  onRefresh, 
  isLoading = false 
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catOrder, setCatOrder] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const sqlCreateCmd = `-- Ruleaza aceasta comanda in Supabase > SQL Editor:
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin can insert categories" ON public.categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can update categories" ON public.categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can delete categories" ON public.categories FOR DELETE USING (auth.role() = 'authenticated');
INSERT INTO public.categories (name, display_order)
VALUES ('Lămpi Litofanie', 1), ('Brelocuri', 2), ('Rame & Cadouri', 3), ('Bucătărie & Evenimente', 4), ('Diverse', 5)
ON CONFLICT (name) DO NOTHING;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCreateCmd);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCatName('');
    setCatOrder(String((categories.length + 1) * 10));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name || '');
    setCatOrder(String(cat.display_order ?? 0));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await saveCategory({
        id: editingCategory ? editingCategory.id : undefined,
        name: catName.trim(),
        display_order: Number(catOrder) || 0
      });
      setIsModalOpen(false);
      onRefresh?.();
    } catch (err) {
      console.error('Eroare salvare categorie:', err);
      const isMissingTable = err.message?.includes('does not exist') || err.code === '42P01';
      if (isMissingTable) {
        setErrorMsg('Tabela "categories" nu a fost creată încă în Supabase. Rulează scriptul SQL de mai jos în Supabase SQL Editor.');
      } else {
        setErrorMsg(err.message || 'Nu s-a putut salva categoria.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    const associatedCount = products.filter(p => p.category === cat.name).length;
    const msg = associatedCount > 0
      ? `Atenție: Există ${associatedCount} produse asociate acestei categorii ("${cat.name}"). Ești sigur că vrei să o ștergi?`
      : `Ești sigur că vrei să ștergi categoria "${cat.name}"?`;

    if (window.confirm(msg)) {
      try {
        await deleteCategory(cat.id);
        onRefresh?.();
      } catch (err) {
        console.error('Eroare stergere categorie:', err);
        alert(err.message || 'Nu s-a putut șterge categoria.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      {/* Antet Secțiune */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px', 
        flexWrap: 'wrap', 
        gap: '16px' 
      }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderTree size={22} color="var(--primary)" />
            <span>Categorii Magazin ({categories.length})</span>
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Categoriile salvate aici apar automat în filtrul din magazin și în formularul de adăugare produse.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={onRefresh}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Reîmprospătează lista"
          >
            <RefreshCw size={15} />
            <span>Actualizează</span>
          </button>

          <button 
            className="btn-primary" 
            onClick={handleOpenAdd}
            style={{ padding: '8px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Categorie Nouă</span>
          </button>
        </div>
      </div>

      {/* Tabel / Listă Categorii */}
      <div style={{ 
        background: 'var(--bg-card)', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border-light)', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-warm-tint)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 20px', width: '90px' }}>Ordine</th>
                <th style={{ padding: '14px 20px' }}>Nume Categorie</th>
                <th style={{ padding: '14px 20px', width: '160px' }}>Produse Asociate</th>
                <th style={{ padding: '14px 20px', width: '130px', textAlign: 'right' }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nu a fost găsită nicio categorie. Apasă pe <strong>„Categorie Nouă”</strong> pentru a adăuga prima categorie.
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => {
                  const count = products.filter(p => p.category === cat.name).length;
                  return (
                    <tr 
                      key={cat.id || idx} 
                      style={{ 
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-warm-tint)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ 
                          background: 'var(--bg-warm-tint)', 
                          border: '1px solid var(--border-light)', 
                          borderRadius: '6px', 
                          padding: '3px 8px', 
                          fontSize: '0.8rem', 
                          fontWeight: '700',
                          color: 'var(--text-secondary)'
                        }}>
                          #{cat.display_order ?? idx + 1}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {cat.name}
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.82rem',
                          background: count > 0 ? 'var(--primary-light)' : 'var(--bg-warm-tint)',
                          color: count > 0 ? 'var(--primary)' : 'var(--text-muted)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: '600'
                        }}>
                          <Package size={13} />
                          <span>{count} {count === 1 ? 'produs' : 'produse'}</span>
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleOpenEdit(cat)}
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                            title="Editează categorie"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => handleDelete(cat)}
                            style={{ padding: '6px 10px', fontSize: '0.82rem', color: '#DC2626' }}
                            title="Șterge categorie"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adăugare / Editare Categorie */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div 
            className="modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '500px' }}
          >
            <button 
              className="modal-close-btn" 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>

            <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
              <div style={{ marginBottom: '20px' }}>
                <span className="badge badge-terracotta" style={{ marginBottom: '6px' }}>
                  {editingCategory ? 'Editare Categorie' : 'Categorie Nouă'}
                </span>
                <h3 style={{ fontSize: '1.35rem', margin: '4px 0 0 0' }}>
                  {editingCategory ? `Modifică: ${editingCategory.name}` : 'Adaugă Categorie'}
                </h3>
              </div>

              {errorMsg && (
                <div style={{ 
                  background: '#FEF2F2', 
                  border: '1px solid #FCA5A5', 
                  color: '#991B1B', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '16px',
                  fontSize: '0.86rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '700' }}>
                    <AlertCircle size={16} />
                    <span>Eroare Supabase</span>
                  </div>
                  <div>{errorMsg}</div>

                  {errorMsg.includes('nu a fost creată') && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCopySql}
                      style={{ marginTop: '10px', width: '100%', fontSize: '0.8rem', padding: '6px 10px' }}
                    >
                      {copiedSql ? <Check size={14} color="var(--accent-sage)" /> : <Copy size={14} />}
                      <span>{copiedSql ? 'Comandă SQL Copiată!' : 'Copiază comanda SQL pentru tabelă'}</span>
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label className="form-label-custom">Nume Categorie *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Ex: Cadouri Paște, Figurine Anime, etc."
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label-custom">Ordine Afișare (Număr mai mic = mai la stânga)</label>
                  <input
                    type="number"
                    className="custom-input"
                    placeholder="Ex: 1, 2, 3..."
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Categoriile vor fi ordonate crescător în bara de filtrare a magazinului.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !catName.trim()}
                >
                  {isSubmitting ? 'Se salvează...' : (editingCategory ? 'Salvează Modificările' : 'Creează Categoria')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
