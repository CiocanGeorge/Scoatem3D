import React from 'react';
import { 
  ArrowUpDown, 
  SlidersHorizontal, 
  X, 
  DollarSign, 
  RotateCcw
} from 'lucide-react';

export default function CatalogFilterToolbar({
  searchQuery = '',
  onSearchChange,
  selectedCategory = 'Toate',
  onSelectCategory,
  sortBy = 'featured',
  onSortChange,
  priceRange = 'all',
  onPriceRangeChange,
  totalCount = 0,
  filteredCount = 0,
  onResetAll
}) {
  const hasActiveFilters = 
    selectedCategory !== 'Toate' || 
    Boolean(searchQuery.trim()) || 
    priceRange !== 'all';

  const getPriceLabel = (range) => {
    switch (range) {
      case 'under50': return '< 50 Lei';
      case '50to100': return '50 - 100 Lei';
      case 'over100': return '> 100 Lei';
      default: return 'Toate Prețurile';
    }
  };

  return (
    <div className="catalog-toolbar-card">
      <div className="catalog-toolbar-main">
        {/* Titlu & Contor Rezultate */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.28rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              {searchQuery 
                ? `Rezultate pentru „${searchQuery}”`
                : selectedCategory === 'Toate' 
                  ? 'Toate Modelele Disponibile' 
                  : `Categoria: ${selectedCategory}`}
            </h3>
            <span className="badge badge-warm-pill">
              {filteredCount} {filteredCount === 1 ? 'model' : 'modele'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Produse 3D imprimate la comandă & lumânări parfumate artizanale, realizate în România.
          </p>
        </div>

        {/* Grupul de Controale Rapide */}
        <div className="filter-controls-group">
          {/* Filtru Interval Preț */}
          <div className="filter-select-wrap">
            <DollarSign size={14} color="var(--primary)" className="filter-select-icon" />
            <select
              value={priceRange}
              onChange={(e) => onPriceRangeChange(e.target.value)}
              className="filter-custom-select"
              title="Filtrează după preț"
              aria-label="Filtru Preț"
            >
              <option value="all">Toate Prețurile</option>
              <option value="under50">Sub 50 Lei</option>
              <option value="50to100">50 - 100 Lei</option>
              <option value="over100">Peste 100 Lei</option>
            </select>
          </div>


          {/* Sortare */}
          <div className="filter-select-wrap">
            <ArrowUpDown size={14} color="var(--primary)" className="filter-select-icon" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="filter-custom-select"
              title="Sortează catalogul"
              aria-label="Sortare produse"
            >
              <option value="featured">🌟 Recomandate</option>
              <option value="price_asc">🏷️ Preț: Mic → Mare</option>
              <option value="price_desc">💎 Preț: Mare → Mic</option>
              <option value="rating">⭐ Cele mai apreciate</option>
              <option value="name">🔤 Nume: A → Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bara de Filtre Active (Dismissable Chips) */}
      {hasActiveFilters && (
        <div className="active-filters-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            <SlidersHorizontal size={13} color="var(--primary)" />
            <span>Filtre active:</span>
          </div>

          {selectedCategory !== 'Toate' && (
            <span className="active-filter-chip">
              <span>Categorie: {selectedCategory}</span>
              <button 
                type="button" 
                onClick={() => onSelectCategory('Toate')}
                title="Elimină filtrul de categorie"
                aria-label="Elimină filtru categorie"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {searchQuery.trim() && (
            <span className="active-filter-chip">
              <span>Căutare: „{searchQuery}”</span>
              <button 
                type="button" 
                onClick={() => onSearchChange('')}
                title="Șterge termenul de căutare"
                aria-label="Șterge termen căutare"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {priceRange !== 'all' && (
            <span className="active-filter-chip">
              <span>Preț: {getPriceLabel(priceRange)}</span>
              <button 
                type="button" 
                onClick={() => onPriceRangeChange('all')}
                title="Elimină filtrul de preț"
                aria-label="Elimină filtru preț"
              >
                <X size={12} />
              </button>
            </span>
          )}


          <button
            type="button"
            className="clear-all-filters-btn"
            onClick={onResetAll}
            title="Resetează toate filtrele aplicate"
          >
            <RotateCcw size={12} />
            <span>Șterge toate filtrele</span>
          </button>
        </div>
      )}
    </div>
  );
}
