import { Link } from 'react-router-dom';
import { toSlug } from '../../utils/slug';

const PLATFORM_GRAD = {
  'CU MOOC':          'linear-gradient(135deg,#7A0040 0%,#9E0056 100%)',
  'Degree+':          'linear-gradient(135deg,#0369A1 0%,#1E3A8A 100%)',
  'MyCourseVille':    'linear-gradient(135deg,#5B21B6 0%,#8B5CF6 100%)',
  'Google Sites':     'linear-gradient(135deg,#0F766E 0%,#06B6D4 100%)',
  'CU Neuron':        'linear-gradient(135deg,#1E3A8A 0%,#5B21B6 100%)',
  'MedUMore':         'linear-gradient(135deg,#DC2626 0%,#F59E0B 100%)',
  'CBS Academy':      'linear-gradient(135deg,#047857 0%,#1E3A8A 100%)',
  'Lifelong Learning':'linear-gradient(135deg,#7C2D12 0%,#EAB308 100%)',
  'External':         'linear-gradient(135deg,#374151 0%,#6B7280 100%)',
};

function platformGrad(platform) {
  return PLATFORM_GRAD[platform] || 'linear-gradient(135deg,#1E3A8A 0%,#5B21B6 100%)';
}

export default function CourseCard({ course }) {
  const c = course;
  const grad = platformGrad(c.platform);
  const initial = (c.platform || 'C').charAt(0);
  const rawSection = c.section || '';
  const section = rawSection.replace(/^[^—]+—\s*/, '');
  const base = parseFloat((c.price && c.price.base) || 0) || 0;
  const sale = parseFloat((c.price && c.price.sale) || 0) || 0;
  const isFree = base === 0 && sale === 0;
  const instructor = c.instructors && c.instructors[0] ? c.instructors[0].name : '';
  const priceLabel = isFree ? 'ฟรี' : `${(sale || base).toLocaleString()} ฿`;
  const slug = toSlug(c.id, c.title);
  // External courses link out; internal ones use React Router
  const isExternal = !c.id;

  if (isExternal) {
    return (
      <a href={c.href || '#'} target="_blank" rel="noopener" className="course-card">
        <CardInner c={c} grad={grad} initial={initial} section={section} isFree={isFree} priceLabel={priceLabel} instructor={instructor} />
      </a>
    );
  }

  return (
    <Link to={`/course/${slug}`} className="course-card">
      <CardInner c={c} grad={grad} initial={initial} section={section} isFree={isFree} priceLabel={priceLabel} instructor={instructor} />
    </Link>
  );
}

function CardInner({ c, grad, initial, section, isFree, priceLabel, instructor }) {
  return (
    <>
      <div className="course-cover" style={{ background: grad }}>
        {c.coverImageUrl && (
          <img className="cover-img" src={c.coverImageUrl} alt="" loading="lazy"
            onError={e => { e.target.style.display = 'none'; }} />
        )}
        <button className="cover-bookmark"
          onClick={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.toggle('active'); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 4h12v17l-6-3.5L6 21z"/>
          </svg>
        </button>
      </div>
      <div className="course-body">
        <div className="course-partner">
          <span className="pf-mark">{initial}</span> {c.platform || ''}
        </div>
        <div className="course-title">{c.title || ''}</div>
        <div className="course-meta">
          {section && <span>{section}</span>}
          {section && <span className="dot-sep" />}
          <span style={{ color: isFree ? '#047857' : 'inherit', fontWeight: isFree ? 700 : 500 }}>
            {priceLabel}
          </span>
        </div>
        {instructor && <div className="course-instructor">{instructor}</div>}
        <div className="course-foot">
          <div className={`course-price${isFree ? ' free' : ''}`}>{priceLabel}</div>
          <span className="course-cta-mini">ดูคอร์ส →</span>
        </div>
      </div>
    </>
  );
}
