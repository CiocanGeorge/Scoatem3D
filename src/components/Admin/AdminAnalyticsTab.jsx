import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart2, RefreshCw, Users, TrendingUp, Calendar,
  Globe, Eye, Search, X, Download,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Smartphone, Monitor, RotateCcw, Copy, Check,
  ExternalLink, SlidersHorizontal
} from 'lucide-react';
import { fetchVisitStats, fetchRecentVisits } from '../../lib/supabaseClient';

const PLATFORM_ICONS = {
  tiktok: '🎵', instagram: '📸', facebook: '👤',
  youtube: '▶️', google: '🔍', whatsapp: '💬', direct: '🔗',
};

const PLATFORM_COLORS = {
  tiktok: '#010101', instagram: '#E1306C', facebook: '#1877F2',
  youtube: '#FF0000', google: '#4285F4', whatsapp: '#25D366', direct: '#8B5CF6',
};

function getPlatformLabel(platform) {
  if (!platform) return 'Direct / Necunoscut';
  const map = { 
    tiktok: 'TikTok', 
    instagram: 'Instagram', 
    facebook: 'Facebook', 
    youtube: 'YouTube', 
    google: 'Google', 
    whatsapp: 'WhatsApp', 
    direct: 'Direct' 
  };
  return map[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1);
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('ro-RO', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatShortDate(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

function getDeviceInfo(ua) {
  if (!ua) return { type: 'desktop', label: 'Desktop', isMobile: false, os: 'Desktop' };
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  let os = 'Desktop';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone/i.test(ua)) os = 'iOS (iPhone)';
  else if (/iPad/i.test(ua)) os = 'iOS (iPad)';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return {
    type: isMobile ? 'mobile' : 'desktop',
    label: `${isMobile ? 'Mobil' : 'Desktop'} · ${os}`,
    os,
    isMobile
  };
}

function matchesDateFilter(isoDateStr, rangePreset, customStart, customEnd) {
  if (!isoDateStr) return false;
  const date = new Date(isoDateStr);
  const now = new Date();

  if (rangePreset === 'today') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }
  if (rangePreset === 'yesterday') {
    const yStart = new Date();
    yStart.setDate(yStart.getDate() - 1);
    yStart.setHours(0, 0, 0, 0);
    const yEnd = new Date();
    yEnd.setDate(yEnd.getDate() - 1);
    yEnd.setHours(23, 59, 59, 999);
    return date >= yStart && date <= yEnd;
  }
  if (rangePreset === '7days') {
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    d7.setHours(0, 0, 0, 0);
    return date >= d7;
  }
  if (rangePreset === '30days') {
    const d30 = new Date();
    d30.setDate(d30.getDate() - 30);
    d30.setHours(0, 0, 0, 0);
    return date >= d30;
  }
  if (rangePreset === 'this_month') {
    const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return date >= mStart;
  }
  if (rangePreset === 'custom') {
    if (customStart) {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      if (date < s) return false;
    }
    if (customEnd) {
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      if (date > e) return false;
    }
    return true;
  }
  return true; // 'all'
}

function getPaginationButtons(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

function MiniBarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '90px', width: '100%' }}>
      {data.map(({ date, count }) => (
        <div key={date} title={`${formatShortDate(date)}: ${count} vizite`}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', height: '100%', cursor: 'default' }}>
          <div style={{
            width: '100%',
            background: count > 0 ? 'linear-gradient(180deg, var(--accent-sage) 0%, #6bab87 100%)' : 'var(--border-light)',
            borderRadius: '3px 3px 0 0',
            height: `${Math.max((count / max) * 68, count > 0 ? 4 : 0)}px`,
            transition: 'height 0.4s ease',
          }} />
          <span style={{ fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {formatShortDate(date)}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ background: bg, color, padding: '7px', borderRadius: '8px', display: 'flex' }}>{icon}</div>
        <span style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '900', color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export default function AdminAnalyticsTab() {
  const [stats, setStats] = useState(null);
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtre multiple
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [pageFilter, setPageFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Paginare
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Copiere ID sesiune
  const [copiedSessionId, setCopiedSessionId] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, v] = await Promise.all([fetchVisitStats(), fetchRecentVisits(1000)]);
      setStats(s);
      setVisits(v || []);
    } catch (e) {
      console.error('Eroare analytics:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Lista dinamică de platforme și pagini găsite în date
  const uniquePlatforms = useMemo(() => {
    const set = new Set();
    visits.forEach(v => {
      if (v.platform) set.add(v.platform.toLowerCase());
    });
    return Array.from(set).sort();
  }, [visits]);

  const uniquePages = useMemo(() => {
    const set = new Set();
    visits.forEach(v => {
      if (v.page) set.add(v.page);
    });
    return Array.from(set).sort();
  }, [visits]);

  // Număr filtre active aplicate
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (platformFilter !== 'all') count++;
    if (dateRange !== 'all') count++;
    if (pageFilter !== 'all') count++;
    if (deviceFilter !== 'all') count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [searchQuery, platformFilter, dateRange, pageFilter, deviceFilter, sortBy]);

  // Resetare la pagina 1 când se modifică un filtru sau dimensiunea paginii
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, platformFilter, dateRange, customStartDate, customEndDate, pageFilter, deviceFilter, pageSize, sortBy]);

  // Filtrare și sortare
  const filteredVisits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const list = visits.filter(v => {
      // 1. Dată
      if (!matchesDateFilter(v.created_at, dateRange, customStartDate, customEndDate)) {
        return false;
      }

      // 2. Platformă
      if (platformFilter !== 'all') {
        if (platformFilter === 'direct') {
          if (v.platform) return false;
        } else {
          if ((v.platform || '').toLowerCase() !== platformFilter.toLowerCase()) return false;
        }
      }

      // 3. Pagină
      if (pageFilter !== 'all') {
        if ((v.page || '/') !== pageFilter) return false;
      }

      // 4. Dispozitiv
      if (deviceFilter !== 'all') {
        const dev = getDeviceInfo(v.user_agent);
        if (dev.type !== deviceFilter) return false;
      }

      // 5. Căutare text liberă
      if (q) {
        const matchPage = (v.page || '').toLowerCase().includes(q);
        const matchRef = (v.referrer || '').toLowerCase().includes(q);
        const matchPlatform = (v.platform || '').toLowerCase().includes(q);
        const matchSession = (v.session_id || '').toLowerCase().includes(q);
        const matchUA = (v.user_agent || '').toLowerCase().includes(q);
        if (!matchPage && !matchRef && !matchPlatform && !matchSession && !matchUA) {
          return false;
        }
      }

      return true;
    });

    // Sortare
    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'platform') return (a.platform || 'Direct').localeCompare(b.platform || 'Direct');
      if (sortBy === 'page') return (a.page || '/').localeCompare(b.page || '/');
      return 0;
    });

    return list;
  }, [visits, searchQuery, platformFilter, dateRange, customStartDate, customEndDate, pageFilter, deviceFilter, sortBy]);

  // Date paginare
  const totalItems = filteredVisits.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedVisits = useMemo(() => {
    return filteredVisits.slice(startIndex, endIndex);
  }, [filteredVisits, startIndex, endIndex]);

  // Statistici rapide pentru selecția filtrată
  const filteredQuickStats = useMemo(() => {
    let mobileCount = 0;
    const platformFreq = {};

    filteredVisits.forEach(v => {
      const dev = getDeviceInfo(v.user_agent);
      if (dev.isMobile) mobileCount++;
      const p = v.platform ? v.platform.toLowerCase() : 'direct';
      platformFreq[p] = (platformFreq[p] || 0) + 1;
    });

    let topPlatform = '—';
    let topPlatformCount = 0;
    Object.entries(platformFreq).forEach(([p, count]) => {
      if (count > topPlatformCount) {
        topPlatformCount = count;
        topPlatform = getPlatformLabel(p);
      }
    });

    const mobilePct = totalItems > 0 ? Math.round((mobileCount / totalItems) * 100) : 0;
    const desktopPct = 100 - mobilePct;

    return { mobilePct, desktopPct, topPlatform, topPlatformCount };
  }, [filteredVisits, totalItems]);

  // Resetare completă filtre
  const handleResetFilters = () => {
    setSearchQuery('');
    setPlatformFilter('all');
    setDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setPageFilter('all');
    setDeviceFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!filteredVisits || filteredVisits.length === 0) return;
    const headers = ['Data & Ora', 'Platforma', 'Pagina', 'Referrer', 'Dispozitiv', 'Sistem de Operare', 'Session ID', 'User Agent'];
    const rows = filteredVisits.map(v => {
      const dev = getDeviceInfo(v.user_agent);
      return [
        `"${formatDate(v.created_at)}"`,
        `"${v.platform ? getPlatformLabel(v.platform) : 'Direct'}"`,
        `"${v.page || '/'}"`,
        `"${(v.referrer || '').replace(/"/g, '""')}"`,
        `"${dev.type === 'mobile' ? 'Mobil' : 'Desktop'}"`,
        `"${dev.os}"`,
        `"${v.session_id || ''}"`,
        `"${(v.user_agent || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statistici-vizite-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySession = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedSessionId(id);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  const SQL_SETUP = `-- Rulează în Supabase > SQL Editor:
CREATE TABLE IF NOT EXISTS public.page_visits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  platform    TEXT,
  referrer    TEXT,
  page        TEXT DEFAULT '/',
  session_id  TEXT,
  user_agent  TEXT
);
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert"
  ON public.page_visits FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin select"
  ON public.page_visits FOR SELECT USING (auth.role() = 'authenticated');`;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={20} style={{ color: 'var(--accent-sage)' }} />
            Statistici Vizitatori &amp; Trafic
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Tracking complet al vizitelor, surselor promoționale și dispozitivelor de acces.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={loadData} 
            disabled={isLoading}
            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Reîmprospătează</span>
          </button>
        </div>
      </div>

      {isLoading && !stats ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Se încarcă statisticile de trafic...</p>
        </div>
      ) : !stats ? (
        /* Alertă creare tabelă Supabase */
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
          <p style={{ fontWeight: '700', color: '#92400E', margin: '0 0 8px' }}>⚠️ Tabela page_visits nu există încă în Supabase</p>
          <p style={{ color: '#92400E', fontSize: '0.88rem', margin: '0 0 12px' }}>
            Execută scriptul SQL de mai jos în <strong>Supabase → SQL Editor</strong> pentru a activa tracking-ul de vizite:
          </p>
          <pre style={{ background: '#1e1e2e', color: '#cdd6f4', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', overflowX: 'auto', margin: 0 }}>
            {SQL_SETUP}
          </pre>
        </div>
      ) : (
        <>
          {/* Carduri statistici globale */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard icon={<Eye size={20} />} label="Total Vizite Înregistrate" value={stats.total.toLocaleString('ro-RO')} color="var(--accent-sage)" bg="var(--accent-sage-light)" />
            <StatCard icon={<Calendar size={20} />} label="Vizite Astăzi" value={stats.today.toLocaleString('ro-RO')} color="#2563EB" bg="#EFF6FF" />
            <StatCard icon={<TrendingUp size={20} />} label="Ultimele 7 Zile" value={stats.thisWeek.toLocaleString('ro-RO')} color="#7C3AED" bg="#F5F3FF" />
            <StatCard icon={<Globe size={20} />} label="Platforme Distincte" value={Object.keys(stats.byPlatform).length} color="#D97706" bg="#FFFBEB" />
          </div>

          {/* Grafic 14 zile + Distribuție platforme */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <p style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Activitate Vizite — Ultimele 14 Zile
              </p>
              <MiniBarChart data={stats.dailyChart} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <p style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                Distribuție Surse Trafic
              </p>
              {Object.keys(stats.byPlatform).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Fără date cu platformă încă.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(stats.byPlatform).sort((a, b) => b[1] - a[1]).map(([platform, count]) => {
                    const total = Object.values(stats.byPlatform).reduce((a, b) => a + b, 0);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const color = PLATFORM_COLORS[platform.toLowerCase()] || '#6B7280';
                    return (
                      <div key={platform}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {PLATFORM_ICONS[platform.toLowerCase()] || '🌐'} {getPlatformLabel(platform)}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                            {count} <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>({pct}%)</span>
                          </span>
                        </div>
                        <div style={{ background: 'var(--border-light)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* GHID RAPID LINK-URI */}
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ fontWeight: '700', fontSize: '0.9rem', margin: '0 0 8px', color: '#1D4ED8' }}>💡 Cum generezi link-uri de promovare cu tracking automat</p>
            <p style={{ fontSize: '0.85rem', color: '#374151', margin: '0 0 10px' }}>
              Adaugă parametrul <code style={{ background: '#DBEAFE', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 'bold' }}>?platform=numeplatforma</code> la adresa URL a magazinului sau a oricărui produs:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {['tiktok', 'instagram', 'facebook', 'youtube', 'whatsapp'].map(p => (
                <code key={p} style={{ background: 'white', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#1D4ED8', fontWeight: '600' }}>
                  {PLATFORM_ICONS[p]} ?platform={p}
                </code>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
              ✅ Parametrul este detectat, salvat și curățat automat din bara de adrese a vizitatorului, oferind un aspect curat.
            </p>
          </div>

          {/* SECȚIUNE FILTRE MULTIPLE & PAGINARE */}
          <div style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-light)', 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Header Secțiune Tabel */}
            <div style={{ 
              padding: '18px 20px', 
              borderBottom: '1px solid var(--border-light)', 
              background: 'var(--bg-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SlidersHorizontal size={18} style={{ color: 'var(--primary)' }} />
                    Filtrare &amp; Istoric Vizite
                    <span style={{ 
                      background: 'var(--primary-light)', 
                      color: 'var(--primary)', 
                      borderRadius: 'var(--radius-full)', 
                      padding: '2px 9px', 
                      fontSize: '0.78rem', 
                      fontWeight: '700' 
                    }}>
                      {totalItems} {totalItems === 1 ? 'vizită găsită' : 'vizite găsite'}
                    </span>
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                    Filtrează după dată, canal de promovare, pagină, tip dispozitiv sau căutare text.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {activeFiltersCount > 0 && (
                    <button 
                      type="button" 
                      onClick={handleResetFilters}
                      className="btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                      title="Resetează toate filtrele aplicate"
                    >
                      <RotateCcw size={13} />
                      <span>Resetează filtrele ({activeFiltersCount})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={filteredVisits.length === 0}
                    className="btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Exportă tabelul filtrat în format CSV"
                  >
                    <Download size={14} />
                    <span>Exportă CSV</span>
                  </button>
                </div>
              </div>

              {/* Panou de Filtre Multiple */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '14px',
                background: 'var(--bg-page)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                {/* 1. Căutare Text */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Căutare liberă
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input 
                      type="text"
                      className="custom-input"
                      placeholder="Pagină, referrer, sesiune..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ 
                        width: '100%',
                        height: '42px',
                        padding: '8px 36px 8px 36px',
                        fontSize: '0.88rem',
                        lineHeight: '1.4',
                        background: '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-light)',
                        boxSizing: 'border-box'
                      }}
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={() => setSearchQuery('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                        title="Șterge căutarea"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Perioadă / Dată */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Perioadă
                  </label>
                  <select 
                    className="custom-input" 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      fontSize: '0.88rem',
                      lineHeight: '1.4',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Toate perioadele</option>
                    <option value="today">Astăzi</option>
                    <option value="yesterday">Ieri</option>
                    <option value="7days">Ultimele 7 zile</option>
                    <option value="30days">Ultimele 30 zile</option>
                    <option value="this_month">Luna aceasta</option>
                    <option value="custom">Interval personalizat...</option>
                  </select>
                </div>

                {/* 3. Platformă / Sursă */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Platformă / Sursă
                  </label>
                  <select 
                    className="custom-input" 
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      fontSize: '0.88rem',
                      lineHeight: '1.4',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Toate platformele</option>
                    <option value="direct">Direct / Fără platformă</option>
                    {uniquePlatforms.map(p => (
                      <option key={p} value={p}>{PLATFORM_ICONS[p] || '🌐'} {getPlatformLabel(p)}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Pagină accesată */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Pagină accesată
                  </label>
                  <select 
                    className="custom-input" 
                    value={pageFilter}
                    onChange={(e) => setPageFilter(e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      fontSize: '0.88rem',
                      lineHeight: '1.4',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Toate paginile</option>
                    {uniquePages.map(page => (
                      <option key={page} value={page}>{page}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Tip Dispozitiv */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Dispozitiv
                  </label>
                  <select 
                    className="custom-input" 
                    value={deviceFilter}
                    onChange={(e) => setDeviceFilter(e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      fontSize: '0.88rem',
                      lineHeight: '1.4',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">Toate dispozitivele</option>
                    <option value="mobile">📱 Doar Mobil / Smartphone</option>
                    <option value="desktop">💻 Doar Desktop / PC</option>
                  </select>
                </div>

                {/* 6. Sortare */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Sortare
                  </label>
                  <select 
                    className="custom-input" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '42px',
                      padding: '8px 12px',
                      fontSize: '0.88rem',
                      lineHeight: '1.4',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-light)',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="newest">⏰ Cele mai noi primele</option>
                    <option value="oldest">🕰️ Cele mai vechi primele</option>
                    <option value="platform">🔤 Platformă (A-Z)</option>
                    <option value="page">📄 Pagină (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Câmpuri speciale pentru interval personalizat */}
              {dateRange === 'custom' && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '14px', 
                  marginTop: '12px', 
                  padding: '12px 16px', 
                  background: 'var(--bg-warm-tint)', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>De la data:</span>
                    <input 
                      type="date" 
                      className="custom-input"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={{ 
                        height: '38px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        background: '#FFFFFF',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border-light)'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>Până la data:</span>
                    <input 
                      type="date" 
                      className="custom-input"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={{ 
                        height: '38px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        background: '#FFFFFF',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border-light)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bară de metrici rapide pentru selecția filtrată */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginTop: '14px', 
                padding: '8px 12px', 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-light)', 
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <span>
                    <strong>{totalItems}</strong> din {visits.length} vizite afișate ({visits.length > 0 ? Math.round((totalItems / visits.length) * 100) : 0}%)
                  </span>
                  <span>
                    📱 <strong>{filteredQuickStats.mobilePct}%</strong> Mobil · 💻 <strong>{filteredQuickStats.desktopPct}%</strong> Desktop
                  </span>
                  <span>
                    Top Sursă: <strong>{filteredQuickStats.topPlatform}</strong> ({filteredQuickStats.topPlatformCount} vizite)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Afișează pe pagină:</span>
                  <select 
                    className="custom-input"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{ 
                      height: '34px',
                      padding: '4px 10px',
                      fontSize: '0.82rem',
                      lineHeight: '1.4',
                      background: '#FFFFFF',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border-light)',
                      boxSizing: 'border-box',
                      width: 'auto',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TABEL CU VIZITE */}
            {paginatedVisits.length === 0 ? (
              <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', margin: '0 0 6px' }}>
                  Nu s-au găsit vizite conform filtrelor alese
                </p>
                <p style={{ fontSize: '0.85rem', margin: '0 0 16px' }}>
                  Încearcă să resetezi sau să ajustezi criteriile de căutare de mai sus.
                </p>
                {activeFiltersCount > 0 && (
                  <button type="button" className="btn-secondary" onClick={handleResetFilters} style={{ fontSize: '0.82rem' }}>
                    Șterge toate filtrele
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border-light)' }}>
                        <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          Dată &amp; Oră
                        </th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                          Platformă / Sursă
                        </th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                          Pagină
                        </th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                          Dispozitiv
                        </th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                          Referrer (Sursă Web)
                        </th>
                        <th style={{ padding: '12px 16px', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                          Session ID
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedVisits.map((v, i) => {
                        const dev = getDeviceInfo(v.user_agent);
                        return (
                          <tr 
                            key={v.id || i} 
                            style={{ 
                              borderBottom: '1px solid var(--border-light)', 
                              background: i % 2 === 0 ? 'transparent' : 'var(--bg-page)',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-warm-tint)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-page)'}
                          >
                            {/* Dată */}
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                              {formatDate(v.created_at)}
                            </td>

                            {/* Platformă */}
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              {v.platform ? (
                                <span style={{
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '6px',
                                  background: (PLATFORM_COLORS[v.platform.toLowerCase()] || '#6B7280') + '15',
                                  color: PLATFORM_COLORS[v.platform.toLowerCase()] || '#6B7280',
                                  border: `1px solid ${(PLATFORM_COLORS[v.platform.toLowerCase()] || '#6B7280')}35`,
                                  padding: '3px 9px', 
                                  borderRadius: 'var(--radius-full)', 
                                  fontSize: '0.8rem', 
                                  fontWeight: '700'
                                }}>
                                  {PLATFORM_ICONS[v.platform.toLowerCase()] || '🌐'} {getPlatformLabel(v.platform)}
                                </span>
                              ) : (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  color: 'var(--text-muted)', 
                                  fontSize: '0.82rem',
                                  background: 'var(--bg-warm-tint)',
                                  padding: '3px 8px',
                                  borderRadius: 'var(--radius-sm)'
                                }}>
                                  🔗 Direct
                                </span>
                              )}
                            </td>

                            {/* Pagină */}
                            <td style={{ padding: '12px 16px', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                              <span style={{ 
                                background: 'var(--bg-warm-tint)', 
                                padding: '3px 6px', 
                                borderRadius: '4px',
                                border: '1px solid var(--border-light)' 
                              }}>
                                {v.page || '/'}
                              </span>
                            </td>

                            {/* Dispozitiv */}
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                fontSize: '0.8rem',
                                color: dev.isMobile ? 'var(--primary)' : 'var(--text-secondary)'
                              }} title={v.user_agent || ''}>
                                {dev.isMobile ? <Smartphone size={14} /> : <Monitor size={14} />}
                                <span>{dev.label}</span>
                              </span>
                            </td>

                            {/* Referrer */}
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '200px' }}>
                              {v.referrer ? (
                                <a 
                                  href={v.referrer.startsWith('http') ? v.referrer : `https://${v.referrer}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  title={v.referrer} 
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px',
                                    color: 'var(--primary)', 
                                    textDecoration: 'none',
                                    maxWidth: '180px',
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    whiteSpace: 'nowrap' 
                                  }}
                                >
                                  <span>{v.referrer.replace(/^https?:\/\//, '').split('/')[0]}</span>
                                  <ExternalLink size={11} />
                                </a>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>—</span>
                              )}
                            </td>

                            {/* Session ID */}
                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              {v.session_id ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <span title={v.session_id}>
                                    {v.session_id.substring(0, 10)}…
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopySession(v.session_id)}
                                    title="Copiază ID complet de sesiune"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: '2px',
                                      color: copiedSessionId === v.session_id ? 'var(--accent-sage)' : 'var(--text-muted)'
                                    }}
                                  >
                                    {copiedSessionId === v.session_id ? <Check size={12} /> : <Copy size={12} />}
                                  </button>
                                </div>
                              ) : (
                                <span>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BARA DE PAGINARE */}
                <div style={{ 
                  padding: '16px 20px', 
                  borderTop: '1px solid var(--border-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: '12px',
                  background: 'var(--bg-card)'
                }}>
                  {/* Indicator de pagină */}
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Afișare <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> din <strong>{totalItems}</strong> vizite 
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>(Pagina {safeCurrentPage} din {totalPages})</span>
                  </div>

                  {/* Butoane de navigare pagini */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Prima pagină */}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentPage(1)}
                      disabled={safeCurrentPage <= 1}
                      title="Prima pagină"
                      style={{ padding: '6px 8px', fontSize: '0.8rem', opacity: safeCurrentPage <= 1 ? 0.4 : 1 }}
                    >
                      <ChevronsLeft size={15} />
                    </button>

                    {/* Pagina precedentă */}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={safeCurrentPage <= 1}
                      title="Pagina precedentă"
                      style={{ padding: '6px 8px', fontSize: '0.8rem', opacity: safeCurrentPage <= 1 ? 0.4 : 1 }}
                    >
                      <ChevronLeft size={15} />
                    </button>

                    {/* Butoane numerotate */}
                    {getPaginationButtons(safeCurrentPage, totalPages).map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`ellipsis-${idx}`} style={{ padding: '4px 8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            ...
                          </span>
                        );
                      }
                      const isCurrent = p === safeCurrentPage;
                      return (
                        <button
                          key={`page-${p}`}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={isCurrent ? 'btn-primary' : 'btn-secondary'}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.82rem',
                            fontWeight: isCurrent ? '800' : '500',
                            minWidth: '34px'
                          }}
                        >
                          {p}
                        </button>
                      );
                    })}

                    {/* Pagina următoare */}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={safeCurrentPage >= totalPages}
                      title="Pagina următoare"
                      style={{ padding: '6px 8px', fontSize: '0.8rem', opacity: safeCurrentPage >= totalPages ? 0.4 : 1 }}
                    >
                      <ChevronRight size={15} />
                    </button>

                    {/* Ultima pagină */}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={safeCurrentPage >= totalPages}
                      title="Ultima pagină"
                      style={{ padding: '6px 8px', fontSize: '0.8rem', opacity: safeCurrentPage >= totalPages ? 0.4 : 1 }}
                    >
                      <ChevronsRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
