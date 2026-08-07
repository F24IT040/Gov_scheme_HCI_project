import React from 'react';

export default function QueryBubble({ query }) {
  if (!query) return null;

  return (
    <div id="query-row" className="flex justify-end mb-5">
      <div
        id="query-bubble"
        className="max-w-xl rounded-2xl rounded-br-md px-4 py-3 text-white shadow-sm font-medium"
        style={{ background: 'var(--brand-500)' }}
      >
        {query}
      </div>
    </div>
  );
}
