import React from 'react';

/**
 * Parsea formatările inline: **îngroșat**, *cursiv*, <b>îngroșat</b>, <strong>îngroșat</strong>
 */
function parseInlineFormatting(text) {
  if (!text || typeof text !== 'string') return text;

  // Împărțire sigură după markdown bold (**...**), cursiv (*...*) sau taguri HTML
  const parts = text.split(/(\*\*[\s\S]+?\*\*|\*[^*\n]+?\*|<b>[\s\S]+?<\/b>|<strong>[\s\S]+?<\/strong>|<i>[\s\S]+?<\/i>|<em>[\s\S]+?<\/em>)/g);

  if (parts.length === 1) return text;

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} style={{ fontWeight: '700', color: 'var(--text-main)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('<b>') || part.startsWith('<strong>')) {
      const clean = part.replace(/<\/?(b|strong)>/gi, '');
      return (
        <strong key={idx} style={{ fontWeight: '700', color: 'var(--text-main)' }}>
          {clean}
        </strong>
      );
    }
    if (part.startsWith('<i>') || part.startsWith('<em>')) {
      const clean = part.replace(/<\/?(i|em)>/gi, '');
      return <em key={idx}>{clean}</em>;
    }
    return part;
  });
}

/**
 * Componentă pentru afișarea descrierilor formatate (bold, liste numerotate, buline, paragrafe)
 */
export function FormattedDescription({ text, className = '' }) {
  if (!text || typeof text !== 'string') return null;

  const rawLines = text.split('\n');
  const blocks = [];
  let currentList = null; // { type: 'ol' | 'ul', items: [] }

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  rawLines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Listă numerotată: "1. ", "1) ", "1 - ", etc.
    const numberedMatch = trimmed.match(/^(\d+)[\.\)\-]\s*(.+)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      return;
    }

    // Listă cu buline: "• ", "- ", "* "
    const bulletMatch = trimmed.match(/^[•\-\*]\s*(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      return;
    }

    // Paragraf obișnuit
    flushList();
    blocks.push({
      type: 'p',
      text: trimmed
    });
  });

  flushList();

  return (
    <div className={`formatted-description ${className}`} style={{ lineHeight: '1.65' }}>
      {blocks.map((block, idx) => {
        if (block.type === 'ol') {
          return (
            <ol 
              key={idx} 
              style={{ 
                paddingLeft: '28px', 
                margin: '12px 0', 
                lineHeight: '1.65', 
                listStyle: 'decimal outside',
                color: 'var(--text-main)'
              }}
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {parseInlineFormatting(item)}
                  </span>
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul 
              key={idx} 
              style={{ 
                paddingLeft: '26px', 
                margin: '12px 0', 
                lineHeight: '1.65', 
                listStyle: 'disc outside',
                color: 'var(--text-main)'
              }}
            >
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {parseInlineFormatting(item)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} style={{ margin: '8px 0', lineHeight: '1.65', color: 'var(--text-secondary)' }}>
            {parseInlineFormatting(block.text)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Elimină caracterele de formatare markdown pentru previzualizări scurte (carduri)
 */
export function stripFormatting(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export default FormattedDescription;
