"use client";

import React from 'react';

export default function Pagination({ current = 1, last = 1, onPage = () => {}, maxPages = 10 }) {
  const total = Math.max(1, last || 1);
  const cur = Math.max(1, Math.min(current || 1, total));

  if (total === 1) return null;

  const numberedMax = Math.max(1, Math.min(maxPages - 2, 8)); // reserve up to 2 slots for first/last

  let start = Math.max(1, cur - Math.floor(numberedMax / 2));
  let end = start + numberedMax - 1;
  if (end > total) {
    end = total;
    start = Math.max(1, end - numberedMax + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const handle = (p) => {
    if (p < 1 || p > total || p === cur) return;
    onPage(p);
  };

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <button
        disabled={cur <= 1}
        onClick={() => handle(cur - 1)}
        className={`rounded px-3 py-1 text-sm border border-neutral-300 bg-white ${cur <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'}`}
      >
        Previous
      </button>

      {start > 1 && (
        <>
          <button onClick={() => handle(1)} className={`rounded px-3 py-1 text-sm border ${1 === cur ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:bg-neutral-50'}`}>1</button>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => handle(p)}
          className={`rounded px-3 py-1 text-sm border ${p === cur ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:bg-neutral-50'}`}
        >
          {p}
        </button>
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span className="px-2">…</span>}
          <button onClick={() => handle(total)} className={`rounded px-3 py-1 text-sm border ${total === cur ? 'bg-black text-white border-black' : 'bg-white border-neutral-300 hover:bg-neutral-50'}`}>{total}</button>
        </>
      )}

      <button
        disabled={cur >= total}
        onClick={() => handle(cur + 1)}
        className={`rounded px-3 py-1 text-sm border border-neutral-300 bg-white ${cur >= total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50'}`}
      >
        Next
      </button>
    </div>
  );
}
