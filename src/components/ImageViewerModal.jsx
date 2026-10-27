import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

export default function ImageViewerModal({ isOpen, imageUrl, filename = 'imagine-originala.jpg', onClose }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '850px', background: '#181412', color: 'white', padding: '16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 8px' }}>
          <span style={{ fontSize: '0.9rem', color: '#E0D8CE', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
            {filename}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={imageUrl}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem', background: 'var(--primary)' }}
            >
              <Download size={15} />
              <span>Descarcă Originalul</span>
            </a>
            <button 
              onClick={onClose}
              style={{ color: '#E0D8CE', background: 'rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', maxHeight: '78vh', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <img 
            src={imageUrl} 
            alt={filename} 
            style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      </div>
    </div>
  );
}
