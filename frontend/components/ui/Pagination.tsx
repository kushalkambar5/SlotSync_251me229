"use client";

export function Pagination({
  page,
  total,
  limit,
  onPage,
}: {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 ring-1 ring-gray-300 disabled:opacity-40"
      >
        ← Prev
      </button>
      <span className="text-xs font-semibold text-gray-600">
        Page {page} of {pages} · {total} total
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 ring-1 ring-gray-300 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
