import React from 'react';
import { Printer, Download, Clock, CheckCircle, Play, FileText, Image as ImageIcon } from 'lucide-react';
import { updateOrderStatus } from '../../lib/supabaseClient';

export default function AdminPrintQueueTab({ orders = [], onRefresh, onOpenImageViewer }) {
  // Comenzi de printat: cele noi sau cele deja în producție, ordonate cronologic (FIFO)
  const printQueueOrders = orders
    .filter(o => o.status === 'noua' || o.status === 'in_productie')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'noua' ? 'in_productie' : 'printata';
    try {
      await updateOrderStatus(orderId, nextStatus);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Eroare la actualizarea comenzii.');
    }
  };

  return (
    <div>
      <div style={{
        background: '#FFF9F2',
        border: '1.5px solid #F0DFCE',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Printer size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>Coadă Printare Scoatem3D</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Comenzi active în așteptare pentru feliere (slicing) și imprimare 3D. Ordonate cronologic (FIFO).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>În Așteptare</span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
              {printQueueOrders.length} comenzi
            </div>
          </div>
        </div>
      </div>

      {printQueueOrders.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '50px 20px',
          textAlign: 'center',
          border: '1px solid var(--border-light)'
        }}>
          <CheckCircle size={44} color="var(--accent-sage)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Toate comenzile sunt la zi!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Nu există nicio piesă în așteptare pentru imprimare în acest moment.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {printQueueOrders.map((order, queueIndex) => {
            const items = order.items || [];
            const timeAgoMinutes = Math.round((Date.now() - new Date(order.created_at)) / (1000 * 60));

            return (
              <div 
                key={order.id} 
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: order.status === 'in_productie' ? '2px solid var(--status-prod-border)' : '1px solid var(--border-light)',
                  padding: '20px 24px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-main)',
                      fontWeight: '800',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem'
                    }}>
                      #{queueIndex + 1}
                    </span>

                    <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)' }}>
                      #{order.id.slice(0, 8)}
                    </span>

                    <strong>{order.customer_name}</strong>

                    <span className={`status-pill status-${order.status}`}>
                      {order.status === 'noua' ? '🟡 Nouă (Neîncepută)' : '🔵 În Imprimare / Slicing'}
                    </span>
                  </div>

                  {/* Buton Acțiune Rapidă Producție */}
                  <div>
                    {order.status === 'noua' ? (
                      <button
                        className="btn-primary"
                        onClick={() => handleAdvanceStatus(order.id, 'noua')}
                        style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                      >
                        <Play size={14} />
                        <span>Pornește Slicing / Printare</span>
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => handleAdvanceStatus(order.id, 'in_productie')}
                        style={{ padding: '8px 18px', fontSize: '0.85rem', background: '#6D28D9' }}
                      >
                        <CheckCircle size={14} />
                        <span>Marchează ca Printată 3D</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Produse din comandă pentru pregătirea slicer-ului */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, itIdx) => {
                    const custom = item.customization || {};
                    const keys = Object.keys(custom).filter(k => !k.endsWith('_filename'));

                    return (
                      <div 
                        key={itIdx}
                        style={{
                          background: 'var(--bg-warm-tint)',
                          borderRadius: 'var(--radius-md)',
                          padding: '14px 18px',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.98rem' }}>
                            {item.product_name} <span style={{ color: 'var(--primary)' }}>x {item.quantity || 1} buc</span>
                          </span>
                        </div>

                        {/* Parametri de personalizare (poze și texte) */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
                          {keys.map(key => {
                            const val = custom[key];
                            const filename = custom[`${key}_filename`] || 'poza.jpg';
                            const isImage = typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:image'));

                            if (isImage) {
                              return (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                  <img 
                                    src={val} 
                                    alt="poza" 
                                    style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                                  />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>{key}</div>
                                    <a
                                      href={val}
                                      download={filename}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                                    >
                                      <Download size={12} /> Descarcă Foto
                                    </a>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={key} style={{ background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{key}:</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#8C4020' }}>{val}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
