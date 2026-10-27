import React from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  Truck, 
  Layers, 
  Search, 
  X, 
  SunMedium, 
  Key, 
  Gift, 
  Cake, 
  Boxes, 
  Tag 
} from 'lucide-react';

const SEARCH_SUGGESTIONS = [
  'Lampă Litofanie',
  'Lumânări Parfumate',
  'Breloc Personalizat',
  'Cadou Cuplu',
  'Decor 3D'
];

const getCategoryIcon = (categoryName) => {
  const norm = (categoryName || '').toLowerCase();
  if (norm === 'toate') return Sparkles;
  if (norm.includes('lamp') || norm.includes('litofanie') || norm.includes('lumin')) return SunMedium;
  if (norm.includes('lumân') || norm.includes('lumanari') || norm.includes('candl')) return Sparkles;
  if (norm.includes('breloc') || norm.includes('chei')) return Key;
  if (norm.includes('ram') || norm.includes('cadou') || norm.includes('foto')) return Gift;
  if (norm.includes('bucatar') || norm.includes('eveniment') || norm.includes('prajitur') || norm.includes('forma')) return Cake;
  if (norm.includes('diverse')) return Boxes;
  return Tag;
};

export default function HeroBanner({ 
  categories = [], 
  selectedCategory = 'Toate', 
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  categoryCounts = {},
  totalProducts = 0
}) {
  return (
    <section className="hero-section">
      <div className="container">
        {/* Pill Highlight */}
        <div className="hero-pill">
          <Sparkles size={16} />
          <span>Cadouri artizanale & lumânări parfumate — fabricate cu dragă in România</span>
        </div>

        {/* Hero Title */}
        <h2 className="hero-title">
          Cadouri care <span>spun o poveste</span>
        </h2>

        {/* Subtitle */}
        <p className="hero-subtitle">
          De la lămpi litofanie și decorațiuni 3D personalizate, până la lumânări parfumate artizanale. Configurează cadoul perfect în câteva secunde.
        </p>

        {/* Trust Badges */}
        <div className="hero-features">
          <div className="hero-feature-item">
            <Layers size={16} color="var(--primary)" />
            <span>Imprimate 3D & Handmade</span>
          </div>
          <div className="hero-feature-item">
            <HeartHandshake size={16} color="var(--accent-gold)" />
            <span>Materiale naturale & ecologice</span>
          </div>
          <div className="hero-feature-item">
            <Truck size={16} color="var(--accent-sage)" />
            <span>Livrare rapidă 24-48h</span>
          </div>
        </div>

        {/* Bară de Căutare Inteligentă */}
        {onSearchChange && (
          <div className="hero-search-wrapper">
            <div className="hero-search-box">
              <div className="hero-search-input-group">
                <Search size={19} color="var(--primary)" className="hero-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Caută în catalog (ex: lampă litofanie, lumânări parfumate, cadou personalizat)..."
                  className="hero-search-input"
                  aria-label="Căutare produse"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="hero-search-clear-btn"
                    title="Șterge căutarea"
                    aria-label="Șterge căutarea"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Sugestii Rapide de Căutare */}
            <div className="search-suggestions-strip">
              <span className="search-suggest-label">Populare:</span>
              {SEARCH_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`search-suggest-chip ${searchQuery.toLowerCase() === tag.toLowerCase() ? 'active' : ''}`}
                  onClick={() => onSearchChange(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Pills - Cu Pictograme & Contoare */}
        <div className="categories-filter-wrapper">
          <div className="categories-filter-bar">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat);
              const count = cat === 'Toate' ? totalProducts : (categoryCounts[cat] || 0);
              const isActive = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  className={`cat-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectCategory(cat)}
                  type="button"
                  title={`Filtrează după: ${cat}`}
                >
                  <span className="cat-pill-icon">
                    <Icon size={16} />
                  </span>
                  <span className="cat-pill-title">{cat}</span>
                  {count > 0 && (
                    <span className="cat-pill-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
