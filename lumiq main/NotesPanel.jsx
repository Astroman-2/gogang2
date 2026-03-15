import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Floating side notepad for an analysis.
 * Auto-saves via debounce; supports markdown shortcuts.
 */
export default function NotesPanel({ analysisId, initialText = '', onSave, onClose }) {
  const [text, setText]     = useState(initialText);
  const [saved, setSaved]   = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef         = useRef(null);
  const debounced           = useDebounce(text, 800);

  // Word count
  useEffect(() => {
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
  }, [text]);

  // Autosave
  useEffect(() => {
    if (debounced === initialText) return;
    onSave(analysisId, debounced);
    setSaved(true);
  }, [debounced]); // eslint-disable-line

  const handleChange = (e) => {
    setText(e.target.value);
    setSaved(false);
  };

  // Tab inserts spaces instead of changing focus
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const next  = text.slice(0, start) + '  ' + text.slice(end);
      setText(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 2; });
    }
    // Cmd/Ctrl+S force save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave(analysisId, text);
      setSaved(true);
    }
  };

  const insertTemplate = (tpl) => {
    const ta     = textareaRef.current;
    const start  = ta.selectionStart;
    const before = text.slice(0, start);
    const after  = text.slice(start);
    const newText = before + tpl + after;
    setText(newText);
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + tpl.length; ta.focus(); });
  };

  return (
    <div className="notes-panel">
      <div className="notes-header">
        <span className="notes-title">📝 Notes</span>
        <div className="notes-header-actions">
          <span className={`notes-status ${saved ? 'notes-saved' : 'notes-unsaved'}`}>
            {saved ? '✓ Saved' : '● Editing'}
          </span>
          <button className="btn-ghost btn-xs" onClick={onClose} title="Close notes">✕</button>
        </div>
      </div>

      <div className="notes-toolbar">
        {[
          ['## Heading',      '## '],
          ['**Bold**',        '**bold**'],
          ['- List',          '\n- '],
          ['> Quote',         '\n> '],
          ['[ ] Task',        '\n- [ ] '],
        ].map(([label, tpl]) => (
          <button key={label} className="notes-tpl-btn" onClick={() => insertTemplate(tpl)} title={label}>
            {label}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        className="notes-textarea"
        placeholder={`Jot down insights, timestamps to revisit, questions, or key takeaways…\n\nTip: Use Ctrl/Cmd+S to save, Tab for indentation.`}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck
      />

      <div className="notes-footer">
        <span className="notes-wordcount">{wordCount} words</span>
        <button
          className="btn-ghost btn-xs"
          onClick={() => { if (window.confirm('Clear all notes?')) { setText(''); onSave(analysisId, ''); } }}
        >
          Clear
        </button>
        <button className="btn-primary btn-sm" onClick={() => { onSave(analysisId, text); setSaved(true); }}>
          Save
        </button>
      </div>
    </div>
  );
}
