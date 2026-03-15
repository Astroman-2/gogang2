import React from 'react';

const TYPE_COLORS = {
  success: '#10b981',
  warning: '#f59e0b',
  error:   '#ef4444',
  info:    '#6366f1',
};

export default function Toast({ toast }) {
  return (
    <div
      className="toast"
      style={{ borderLeftColor: TYPE_COLORS[toast.type] ?? TYPE_COLORS.info }}
    >
      {toast.msg}
    </div>
  );
}
