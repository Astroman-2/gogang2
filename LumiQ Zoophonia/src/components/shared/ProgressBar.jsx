import React from 'react';

export default function ProgressBar({ value = 0, max = 100, color, label, showPercent = false, size = 'md' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`progress-wrap progress-${size}`}>
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: color || 'var(--indigo)' }}
        />
      </div>
      {showPercent && <div className="progress-pct">{Math.round(pct)}%</div>}
    </div>
  );
}
