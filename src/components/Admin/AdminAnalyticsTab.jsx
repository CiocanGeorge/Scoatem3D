import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, RefreshCw, Users, TrendingUp, Calendar,
  Globe, Eye, Clock, Filter
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
  const map = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', google: 'Google', whatsapp: 'WhatsApp', direct: 'Direct' };
  return map[platform.toLowerCase()] || platform.charAt(0).toUpperCase() + platform.slice(1);
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatShortDate(isoDate) {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
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
  const [platformFilter, setPlatformFilter] = useState('all');
  const [visitsLimit, setVisitsLimit] = useState(50);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, v] = await Promise.all([fetchVisitStats(), fetchRecentVisits(200)]);
      setStats(s);
      setVisits(v);
    } catch (e) {
      console.error('Eroare analytics:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredVisits = platformFilter === 'all'
    ? visits
    : visits.filter(v => platformFilter === 'direct' ? !v.platform : (v.platform || '').toLowerCase() === platformFilter);

  const displayedVisits = filteredVisits.slice(0, visitsLimit);
  const allPlatforms = [...new Set(visits.map(v => v.platform || 'direct'))].sort();

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
-- Oricine poate insera (anon key) – necesar pentru tracking
CREATE POLICY "Allow public insert"
  ON public.page_visits FOR INSERT WITH CHECK (true);
-- Doar utilizatori autentificați pot citi
CREATE POLICY "Allow admin select"
  ON public.page_visits FOR SELECT USING (auth.role() = 'authenticated');`;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={20} style={{ color: 'var(--accent-sage)' }} />
            Statistici Vizitatori
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Tracking automat al vizitelor și surselor de trafic.
          </p>
        </div>
        <button className="btn-secondary" onClick={loadData} disabled={isLoading}
          style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Reîmprospătează</span>
        </button>
      </div>

      {isLoading && !stats ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
          <p>Se încarcă statisticile...</p>
        </div>
      ) : !stats ? (
        /* Instrucțiuni creare tabel dacă nu există */
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
          <p style={{ fontWeight: '700', color: '#92400E', margin: '0 0 8px' }}>⚠️ Tabela page_visits nu există în Supabase</p>
          <p style={{ color: '#92400E', fontSize: '0.88rem', margin: '0 0 12px' }}>
            Execută SQL-ul de mai jos în <strong>Supabase → SQL Editor</strong> pentru a activa tracking-ul:
          </p>
          <pre style={{ background: '#1e1e2e', color: '#cdd6f4', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', overflowX: 'auto', margin: 0 }}>
            {SQL_SETUP}
          </pre>
        </div>
      ) : (
        <>
          {/* Carduri statistici */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <StatCard icon={<Eye size={20} />} label="Total Vizite" value={stats.total.toLocaleString('ro-RO')} color="var(--accent-sage)" bg="var(--accent-sage-light)" />
            <StatCard icon={<Calendar size={20} />} label="Azi" value={stats.today.toLocaleString('ro-RO')} color="#2563EB" bg="#EFF6FF" />
            <StatCard icon={<TrendingUp size={20} />} label="Ultima Săptămână" value={stats.thisWeek.toLocaleString('ro-RO')} color="#7C3AED" bg="#F5F3FF" />
            <StatCard icon={<Globe size={20} />} label="Platforme Distincte" value={Object.keys(stats.byPlatform).length} color="#D97706" bg="#FFFBEB" />
          </div>

          {/* Grafic + Distribuție platforme */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <p style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Vizite — ultimele 14 zile
              </p>
              <MiniBarChart data={stats.dailyChart} />
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <p style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 14px' }}>
                Surse Trafic
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
                        <div style={{ background: 'var(--border-light)', borderRadius: '99px', height: '5px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cum să folosești link-urile */}
          <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '24px' }}>
            <p style={{ fontWeight: '700', fontSize: '0.9rem', margin: '0 0 8px', color: '#1D4ED8' }}>💡 Cum să distribui cu tracking</p>
            <p style={{ fontSize: '0.85rem', color: '#374151', margin: '0 0 10px' }}>
              Adaugă <code style={{ background: '#DBEAFE', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem' }}>?platform=numeplatforma</code> la URL-ul tău:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
              {['tiktok', 'instagram', 'facebook', 'youtube', 'whatsapp'].map(p => (
                <code key={p} style={{ background: 'white', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', color: '#1D4ED8' }}>
                  {PLATFORM_ICONS[p]} ?platform={p}
                </code>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
              ✅ Parametrul este eliminat automat din URL după captare — vizitatorul vede URL-ul curat.
            </p>
          </div>

          {/* Tabel vizite recente */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                Vizite Recente
                <span style={{ background: 'var(--border-light)', borderRadius: '99px', padding: '2px 8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {filteredVisits.length}
                </span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select className="custom-input" value={platformFilter}
                  onChange={e => { setPlatformFilter(e.target.value); setVisitsLimit(50); }}
                  style={{ padding: '5px 10px', fontSize: '0.83rem', width: 'auto' }}>
                  <option value="all">Toate platformele</option>
                  <option value="direct">Direct / Necunoscut</option>
                  {allPlatforms.filter(p => p !== 'direct').map(p => (
                    <option key={p} value={p}>{getPlatformLabel(p)}</option>
                  ))}
                </select>
              </div>
            </div>

            {displayedVisits.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Users size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p style={{ margin: 0 }}>Nicio vizită înregistrată încă.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-page)', borderBottom: '1px solid var(--border-light)' }}>
                        {['Data & Ora', 'Platformă', 'Pagină', 'Referrer', 'Session'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: '700', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedVisits.map((v, i) => (
                        <tr key={v.id} style={{ borderBottom: '1px solid var(--border-light)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-page)' }}>
                          <td style={{ padding: '10px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{formatDate(v.created_at)}</td>
                          <td style={{ padding: '10px 16px' }}>
                            {v.platform ? (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                background: (PLATFORM_COLORS[v.platform.toLowerCase()] || '#6B7280') + '18',
                                color: PLATFORM_COLORS[v.platform.toLowerCase()] || '#6B7280',
                                border: `1px solid ${(PLATFORM_COLORS[v.platform.toLowerCase()] || '#6B7280')}33`,
                                padding: '3px 8px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '700'
                              }}>
                                {PLATFORM_ICONS[v.platform.toLowerCase()] || '🌐'} {getPlatformLabel(v.platform)}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Direct</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 16px', color: 'var(--text-main)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{v.page || '/'}</td>
                          <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '180px' }}>
                            {v.referrer ? (
                              <span title={v.referrer} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {v.referrer.replace(/^https?:\/\//, '').split('/')[0]}
                              </span>
                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                          </td>
                          <td style={{ padding: '10px 16px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {v.session_id ? v.session_id.substring(0, 10) + '…' : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredVisits.length > visitsLimit && (
                  <div style={{ padding: '14px 20px', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}>
                    <button className="btn-secondary" onClick={() => setVisitsLimit(v => v + 50)}
                      style={{ fontSize: '0.85rem', padding: '8px 20px' }}>
                      Încarcă mai multe ({filteredVisits.length - visitsLimit} rămase)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
