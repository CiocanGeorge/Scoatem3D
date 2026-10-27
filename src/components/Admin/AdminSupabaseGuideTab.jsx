import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export default function AdminSupabaseGuideTab() {
  const [copied, setCopied] = useState(false);
  const isConnected = isSupabaseConfigured();

  const handleCopySqlScript = async () => {
    try {
      const response = await fetch('/supabase_schema.sql');
      const text = await response.text();
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
      alert('Fișierul supabase_schema.sql se află în rădăcina proiectului tău.');
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Banner Conexiune Supabase */}
      <div style={{
        background: isConnected ? 'var(--accent-sage-light)' : '#FFFBEB',
        border: `1.5px solid ${isConnected ? '#A7F3D0' : '#FDE68A'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: isConnected ? 'var(--accent-sage)' : '#D97706',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                {isConnected ? 'Supabase este CONECTAT și activ!' : 'Aplicația rulează în Modul Test Local'}
              </h3>
              <span className={`badge ${isConnected ? 'badge-sage' : 'badge-gold'}`}>
                {isConnected ? 'Conexiune Live' : 'Fallback LocalStorage'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
              {isConnected
                ? 'Datele comenzilor și pozele clienților sunt salvate direct în baza ta de date Supabase și Storage.'
                : 'Poți testa toate funcționalitățile magazinului imediat. Pentru a conecta Supabase-ul tău live, urmează pașii de mai jos.'}
            </p>
          </div>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <span>Deschide Supabase Dashboard</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Ghid de Configurare în 3 Pași */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
        Ghid de Conectare Supabase & Securitate RLS
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Pasul 1: Scriptul SQL */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                1
              </span>
              <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Rulare Script SQL în Supabase</h4>
            </div>

            <button
              className="btn-secondary"
              onClick={handleCopySqlScript}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              {copied ? <Check size={14} color="var(--accent-sage)" /> : <Copy size={14} />}
              <span>{copied ? 'Copiat în Clipboard!' : 'Copiază supabase_schema.sql'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Mergi în panoul Supabase la <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, lipește conținutul fișierului <code>supabase_schema.sql</code> și apasă <strong>Run</strong>. Acesta va crea automat:
          </p>

          <ul style={{ fontSize: '0.85rem', color: 'var(--text-main)', paddingLeft: '20px', lineHeight: '1.7' }}>
            <li>Tabela <code>products</code> cu câmpul JSONB <code>fields</code> pentru personalizări configurabile</li>
            <li>Tabela <code>categories</code> pentru categoriile dinamice de produse gestionate din panou</li>
            <li>Tabela <code>orders</code> cu statusurile: <em>'noua', 'in_productie', 'printata', 'expediata'</em></li>
            <li>Tabela <code>order_items</code> cu FK către orders și produsele cu personalizările complete</li>
            <li>Storage Buckets: <code>customer-uploads</code> (calitate foto originală, link direct) și <code>product-images</code></li>
            <li>Politicile <strong>RLS (Row Level Security)</strong>: clienții pot comanda și încărca fotografii, iar comenzile pot fi citite/modificate <strong>doar de admin</strong>!</li>
          </ul>
        </div>

        {/* Pasul 2: Variabile de mediu */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
              2
            </span>
            <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Adăugare Chei în fișierul .env</h4>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Din Supabase &gt; <strong>Project Settings</strong> &gt; <strong>API</strong>, copiază <strong>Project URL</strong> și <strong>anon public key</strong> în fișierul <code>.env</code> din rădăcina proiectului:
          </p>

          <div style={{ background: '#1E1B18', color: '#E6DCD2', padding: '14px 18px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            <div>VITE_SUPABASE_URL=https://nume-proiect.supabase.co</div>
            <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
          </div>
        </div>

        {/* Pasul 3: Cont Admin */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
              3
            </span>
            <h4 style={{ fontSize: '1.05rem', margin: 0 }}>Creare Cont Administrator Manual</h4>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            În Supabase, accesează <strong>Authentication</strong> &gt; <strong>Users</strong> &gt; <strong>Add User</strong> &gt; <strong>Create User</strong>. Introdu adresa ta de email și parola dorită. Aceasta este adresa cu care te vei autentifica în pagina <code>/admin</code>!
          </p>
        </div>
      </div>
    </div>
  );
}
