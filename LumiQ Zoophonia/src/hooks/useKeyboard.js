import { useEffect } from 'react';

/**
 * Register global keyboard shortcuts.
 * shortcuts: Array<{ key, ctrlKey?, metaKey?, shiftKey?, handler }>
 */
export function useKeyboard(shortcuts) {
  useEffect(() => {
    const handler = (e) => {
      for (const s of shortcuts) {
        const ctrl  = s.ctrlKey  ? (e.ctrlKey  || e.metaKey) : true;
        const meta  = s.metaKey  ? e.metaKey   : true;
        const shift = s.shiftKey ? e.shiftKey  : true;
        if (e.key === s.key && ctrl && meta && shift) {
          e.preventDefault();
          s.handler(e);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
