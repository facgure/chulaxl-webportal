const PLATFORMS = ['CU MOOC', 'Degree+', 'MyCourseVille', 'CU Neuron', 'MedUMore', 'CBS Academy', 'Lifelong Learning'];

export default function CourseSearch({ query, platform, total, onQuery, onPlatform }) {
  return (
    <div className="all-courses-header">
      <div className="cat-tabs">
        <button className={`cat-tab${!platform ? ' active' : ''}`} onClick={() => onPlatform('')}>
          ทั้งหมด
        </button>
        {PLATFORMS.map(p => (
          <button key={p} className={`cat-tab${platform === p ? ' active' : ''}`} onClick={() => onPlatform(p)}>
            {p}
          </button>
        ))}
      </div>
      <div className="all-courses-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
        </svg>
        <input
          type="search"
          placeholder="ค้นหาในคอร์สทั้งหมด…"
          value={query}
          onChange={e => onQuery(e.target.value)}
        />
        {query && (
          <button className="search-clear" onClick={() => onQuery('')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
      <div className="courses-count-badge" id="courses-count-badge">
        {total.toLocaleString()} คอร์ส
      </div>
    </div>
  );
}
