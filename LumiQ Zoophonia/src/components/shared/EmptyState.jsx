import React from 'react';

export default function EmptyState({ icon = '📭', title, description, action, actionLabel }) {
  return (
    <div className="empty-state">
      <div className="es-icon">{icon}</div>
      <h3 className="es-title">{title}</h3>
      {description && <p className="es-desc">{description}</p>}
      {action && actionLabel && (
        <button className="btn-primary btn-sm" onClick={action} style={{ marginTop: '1rem' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
