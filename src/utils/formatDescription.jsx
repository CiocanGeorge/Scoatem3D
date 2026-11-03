import React from 'react';

/**
 * Parsea formatările inline: **îngroșat**, *cursiv*, <b>îngroșat</b>, <strong>îngroșat</strong>
 */
function parseInlineFormatting(text) {
  if (!text || typeof text !== 'string') return text;

  const tokens = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|<b>.*?<\/b>|<strong>.*?<\/strong>|<i>.*?<\/i>|<em>.*?<\/em>)/g;

  let lastIdx = 0;
  let match;
  let keyCounter = 0;

  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];
    const matchStart = match.index;

    if (matchStart > lastIdx) {
      tokens.push(text.substring(lastIdx, matchStart));
    }

    if (matchedText.startsWith('**') && matchedText.endsWith('**')) {
      tokens.push(<strong key={keyCounter++}>{matchedText.slice(2, -2)}</strong>);
    } else if (matchedText.startsWith('*') && matchedText.endsWith('*')) {
      tokens.push(<em key={keyCounter++}>{matchedText.slice(1, -1)}</em>);
    } else if (matchedText.startsWith('<b>') || matchedText.startsWith('<strong>')) {
      const inner = matchedText.replace(/<\/?(b|strong)>/g, '');
      tokens.push(<strong key={keyCounter++}>{inner}</strong>);
    } else if (matchedText.startsWith('<i>') || matchedText.startsWith('<em>')) {
      const inner = matchedText.replace(/<\/?(i|em)>/g, '');
      tokens.push(<em key={keyCounter++}>{inner}</em>);
    } else {
      tokens.push(matchedText);
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    tokens.push(text.substring(lastIdx));
  }

  return tokens.length > 0 ? tokens : text;
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

    // Listă numerotată: "1. ", "2) ", etc.
    const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberedMatch[2]);
      return;
    }

    // Listă cu buline: "• ", "- ", "* "
    const bulletMatch = trimmed.match(/^[•\-\*]\s+(.+)$/);
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
    <div className={`formatted-description ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'ol') {
          return (
            <ol key={idx} style={{ paddingLeft: '24px', margin: '10px 0', lineHeight: '1.7', listStyleType: 'decimal' }}>
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ marginBottom: '4px' }}>
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} style={{ paddingLeft: '22px', margin: '10px 0', lineHeight: '1.7', listStyleType: 'disc' }}>
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ marginBottom: '4px' }}>
                  {parseInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={idx} style={{ margin: '8px 0', lineHeight: '1.65' }}>
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

