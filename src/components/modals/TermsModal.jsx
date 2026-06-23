"use client";

import { useEffect, useState } from 'react';

export default function TermsModal({ open, onClose }) {
  const [html, setHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetch('/api/policies/terms', { signal: ac.signal, headers: { Accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load policy');
        return r.json();
      })
      .then((data) => {
        setHtml(data.content || '');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message || 'Error loading policy');
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-[90vw] max-w-4xl max-h-[85vh] bg-white rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Terms &amp; Conditions</h3>
          <button onClick={onClose} className="text-sm font-medium text-neutral-600 hover:text-black">Close</button>
        </div>
        <div className="h-[calc(85vh-64px)] overflow-auto p-4">
          {loading && <div className="text-center py-12">Loading terms…</div>}
          {error && <div className="text-center py-12 text-red-600">{error}</div>}
          {!loading && !error && html && (
            <div className="policy-body prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          )}
        </div>
      </div>
    </div>
  );
}
