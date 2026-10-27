import React, { useState } from 'react';
import { 
  Search, ChevronDown, ChevronUp, Download, Copy, Check, 
  ExternalLink, Phone, MapPin, Clock, PackageCheck, Archive
} from 'lucide-react';
import JSZip from 'jszip';
import { updateOrderStatus } from '../../lib/supabaseClient';

export default function AdminOrdersTab({ 
  orders = [], 
  onRefresh, 
  onOpenImageViewer 
}) {
  const [statusFilter, setStatusFilter] = useState('toate');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [copiedTextKey, setCopiedTextKey] = useState(null);
  const [isZipping, setIsZipping] = useState({});

  // Filtrare comenzi
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'toate' || order.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      order.customer_name?.toLowerCase().includes(q) ||
      order.customer_phone?.toLowerCase().includes(q) ||
      order.id?.toLowerCase().includes(q) ||
      order.customer_address?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Schimbare status comandă cu salvare imediată
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      onRefresh();
    } catch (err) {
      console.error('Eroare actualizare status:', err);
      alert('Eroare la actualizarea statusului comenzii.');
    }
  };

  // Copiere text personalizare (pentru CAD/Slicer)
  const handleCopyText = (text, keyId) => {
    navigator.clipboard.writeText(text);
    setCopiedTextKey(keyId);
    setTimeout(() => setCopiedTextKey(null), 2000);
  };

  // Descarcă toate imaginile unei comenzi sub formă de fișier ZIP
  const handleDownloadAllImagesZip = async (order) => {
    const imagesToDownload = [];
    (order.items || []).forEach((item, itemIdx) => {
      const custom = item.customization || {};
      Object.keys(custom).forEach(key => {
        const val = custom[key];
        if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:image'))) {
          const originalName = custom[`${key}_filename`] || `item-${itemIdx + 1}-${key}.jpg`;
          imagesToDownload.push({ url: val, filename: originalName });
        }
      });
    });

    if (imagesToDownload.length === 0) {
      alert('Această comandă nu conține fotografii încărcate de client.');
      return;
    }

    setIsZipping(prev => ({ ...prev, [order.id]: true }));

    try {
      const zip = new JSZip();
      const folder = zip.folder(`comanda_${order.id.slice(0, 8)}`);

      for (let i = 0; i < imagesToDownload.length; i++) {
        const img = imagesToDownload[i];
        try {
          if (img.url.startsWith('data:image')) {
            const base64Data = img.url.split(',')[1];
            folder.file(img.filename, base64Data, { base64: true });
          } else {
            const response = await fetch(img.url);
            const blob = await response.blob();
            folder.file(img.filename, blob);
          }
        } catch (fetchErr) {
          console.warn(`Nu s-a putut descărca imaginea ${img.filename}:`, fetchErr);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `comanda_${order.id.slice(0, 8)}_imagini_3d.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Eroare creare arhivă ZIP:', err);
      alert('Eroare la generarea arhivei ZIP.');
    } finally {
      setIsZipping(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'noua': return 'Nouă (Neîncepută)';
      case 'in_productie': return 'În Producție / Slicing';
      case 'printata': return 'Printată 3D';
      case 'expediata': return 'Expediată';
      default: return status;
    }
  };

  return (
    <div>
      {/* Bara de Filtrare & Căutare */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Butoane Filtru Status */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'toate', label: 'Toate Comenzile' },
            { id: 'noua', label: 'Noi' },
            { id: 'in_productie', label: 'În Producție' },
            { id: 'printata', label: 'Printate' },
            { id: 'expediata', label: 'Expediate' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`cat-btn ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
              style={{ padding: '8px 16px', fontSize: '0.86rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Input Căutare */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Caută după nume, telefon sau ID..."
            className="custom-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.88rem' }}
          />
        </div>
      </div>

      {/* Listă Comenzi */}
      {filteredOrders.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 20px',
          textAlign: 'center',
          border: '1px solid var(--border-light)'
        }}>
          <PackageCheck size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Nu a fost găsită nicio comandă</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {statusFilter !== 'toate' ? `Nu există comenzi cu statusul "${getStatusLabel(statusFilter)}".` : 'Nu sunt comenzi înregistrate.'}
          </p>
        </div>
      ) : (
        <div className="orders-list-grid">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const items = order.items || [];
            
            // Verificăm câte imagini are această comandă
            const totalUploadedPhotos = items.reduce((count, item) => {
              const c = item.customization || {};
              const imgFields = Object.keys(c).filter(k => !k.endsWith('_filename') && typeof c[k] === 'string' && (c[k].startsWith('http') || c[k].startsWith('data:image')));
              return count + imgFields.length;
            }, 0);

            const formattedDate = new Date(order.created_at).toLocaleString('ro-RO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div key={order.id} className="order-admin-card">
                {/* Rând Superior: ID, Client, Data, Preț, Status */}
                <div className="order-top-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>
                      #{order.id.slice(0, 8)}
                    </span>
                    <strong style={{ fontSize: '1.05rem' }}>{order.customer_name}</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {formattedDate}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {Number(order.total).toFixed(2).replace('.', ',')} Lei
                    </div>

                    {/* Selector Status Imediat */}
                    <select
                      className={`status-pill status-${order.status}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ cursor: 'pointer', outline: 'none' }}
                      title="Schimbă statusul comenzii"
                    >
                      <option value="noua">🟡 Nouă</option>
                      <option value="in_productie">🔵 În Producție</option>
                      <option value="printata">🟣 Printată 3D</option>
                      <option value="expediata">🟢 Expediată</option>
                    </select>

                    {/* Buton Expandare */}
                    <button
                      className="btn-icon"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      style={{ width: '34px', height: '34px' }}
                      title={isExpanded ? "Restrânge detaliile" : "Deschide detaliile"}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Rezumat Rapid când e pliat */}
                {!isExpanded && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>Produse: <strong>{items.map(it => it.product_name).join(', ') || 'Niciun produs'}</strong></span>
                    <span>Telefon: <strong>{order.customer_phone}</strong></span>
                    {totalUploadedPhotos > 0 && (
                      <span style={{ color: 'var(--accent-sage)', fontWeight: '600' }}>
                        📷 {totalUploadedPhotos} {totalUploadedPhotos === 1 ? 'fotografie atașată' : 'fotografii atașate'}
                      </span>
                    )}
                  </div>
                )}

                {/* DETALII COMPLETE CÂND E EXTINS */}
                {isExpanded && (
                  <div style={{ marginTop: '18px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
                    {/* Date Client */}
                    <div className="order-customer-box">
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Telefon client:</span>
                        <a href={`tel:${order.customer_phone}`} style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={14} /> {order.customer_phone}
                        </a>
                      </div>

                      {order.customer_email && (
                        <div>
                          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Email client:</span>
                          <strong>{order.customer_email}</strong>
                        </div>
                      )}

                      <div style={{ flexGrow: 1 }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Adresă de livrare:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <MapPin size={14} color="var(--primary)" /> {order.customer_address}
                        </div>
                      </div>

                      {order.customer_notes && (
                        <div style={{ width: '100%', background: '#FFF9E6', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F5E1A4' }}>
                          <strong style={{ fontSize: '0.8rem', color: '#92400E' }}>Mențiuni speciale client:</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>{order.customer_notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Acțiuni Globale Comandă (Descarcă Toate Imaginile ZIP) */}
                    {totalUploadedPhotos > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button
                          className="btn-primary"
                          onClick={() => handleDownloadAllImagesZip(order)}
                          disabled={isZipping[order.id]}
                          style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                        >
                          <Archive size={16} />
                          <span>
                            {isZipping[order.id] ? 'Se generează arhiva ZIP...' : `Descarcă toate imaginile (${totalUploadedPhotos} fișiere) .ZIP`}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Lista Articolelor Comandate cu Personalizări */}
                    <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Produse Comandate & Detalii Imprimare 3D:</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {items.map((item, idx) => {
                        const custom = item.customization || {};
                        const keys = Object.keys(custom).filter(k => !k.endsWith('_filename'));

                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              background: '#FCFAF7', 
                              border: '1px solid var(--border-light)', 
                              borderRadius: 'var(--radius-md)', 
                              padding: '16px' 
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                                  {item.product_name}
                                </strong>
                                <span className="badge badge-sage">
                                  Cantitate: {item.quantity || 1} buc
                                </span>
                              </div>
                              <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                {(Number(item.price) * (item.quantity || 1)).toFixed(2).replace('.', ',')} Lei
                              </span>
                            </div>

                            {/* Câmpuri de personalizare */}
                            {keys.length === 0 ? (
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Produs standard, fără câmpuri de personalizare.
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                                {keys.map(key => {
                                  const val = custom[key];
                                  const filename = custom[`${key}_filename`] || 'foto_client.jpg';
                                  const isImage = typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:image'));

                                  if (isImage) {
                                    return (
                                      <div 
                                        key={key} 
                                        style={{ 
                                          background: 'white', 
                                          padding: '12px', 
                                          borderRadius: 'var(--radius-sm)', 
                                          border: '1px solid var(--border-light)' 
                                        }}
                                      >
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                                          📷 {key}
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                          <img
                                            src={val}
                                            alt={filename}
                                            onClick={() => onOpenImageViewer(val, filename)}
                                            style={{
                                              width: '64px',
                                              height: '64px',
                                              borderRadius: '6px',
                                              objectFit: 'cover',
                                              cursor: 'pointer',
                                              border: '1px solid var(--border-light)'
                                            }}
                                            title="Click pentru previzualizare mărită"
                                          />

                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <button
                                              className="btn-secondary"
                                              onClick={() => onOpenImageViewer(val, filename)}
                                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                            >
                                              <ExternalLink size={12} />
                                              <span>Vezi Mărit</span>
                                            </button>

                                            <a
                                              href={val}
                                              download={filename}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="btn-primary"
                                              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                            >
                                              <Download size={12} />
                                              <span>Descarcă Original</span>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Text sau Select -> casetă de copiat pentru slicer
                                  const copyId = `${order.id}-${idx}-${key}`;
                                  const isCopied = copiedTextKey === copyId;

                                  return (
                                    <div 
                                      key={key}
                                      style={{ 
                                        background: 'white', 
                                        padding: '12px', 
                                        borderRadius: 'var(--radius-sm)', 
                                        border: '1px solid var(--border-light)' 
                                      }}
                                    >
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '6px' }}>
                                        {key}
                                      </div>

                                      <div className="cad-text-copy-box">
                                        <span style={{ wordBreak: 'break-all' }}>{val}</span>
                                        <button
                                          onClick={() => handleCopyText(val, copyId)}
                                          title="Copiază textul pentru CAD / Slicer"
                                          style={{ color: isCopied ? 'var(--accent-sage)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}
                                        >
                                          {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
