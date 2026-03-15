import React from 'react';

/**
 * Lightweight markdown renderer that handles:
 *  # h1  ## h2  - list  **bold**  plain paragraphs
 * Designed for streaming AI output — appends a blinking cursor while streaming.
 */
export default function MarkdownRenderer({ text = '', streaming = false }) {
  const lines = text.split('\n');

  return (
    <div className={`markdown${streaming ? ' markdown-streaming' : ''}`}>
      {lines.map((line, i) => {
        if (line.startsWith('## '))
          return <h2 key={i} className="md-h2">{line.slice(3)}</h2>;
        if (line.startsWith('# '))
          return <h1 key={i} className="md-h1">{line.slice(2)}</h1>;
        if (line.startsWith('- '))
          return <li key={i} className="md-li">{renderInline(line.slice(2))}</li>;
        if (line.trim() === '')
          return <br key={i} />;
        return <p key={i} className="md-p">{renderInline(line)}</p>;
      })}
      {streaming && <span className="cursor-blink">▌</span>}
    </div>
  );
}

/** Render **bold** inline within a line */
function renderInline(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1
      ? <strong key={j} className="md-bold">{part}</strong>
      : part
  );
}
