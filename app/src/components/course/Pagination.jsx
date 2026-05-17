export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page <= 1}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="page-btn" style={{ cursor: 'default' }}>…</span>
        ) : (
          <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onPage(p)}>
            {p}
          </button>
        )
      )}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}
