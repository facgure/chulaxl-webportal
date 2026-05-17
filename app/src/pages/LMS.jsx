import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { idFromSlug } from '../utils/slug';

// Same curriculum data as CourseDetail for the featured course
const CURRICULUM = [
  { title: 'รู้จัก Generative AI และทำงานร่วมกัน', items: [
    { title: 'AI fundamentals', dur: '8:04' },
    { title: 'ปรับวิธีคิดให้ทำงานกับ AI ได้ดี', dur: '12:50' },
    { title: 'สามวิธีในการทำงานร่วมกับ AI', dur: '7:42' },
    { title: 'เคล็ดลับสำหรับคนที่เพิ่งเริ่มต้นกับ AI', dur: '9:30' },
  ]},
  { title: 'ฝึกใช้ AI ในงานประจำ', items: [
    { title: 'การสรุปและเรียบเรียงข้อมูล', dur: '8:12' },
    { title: 'การช่วยเขียนอีเมลและรายงาน', dur: '7:45' },
    { title: 'การวิเคราะห์ตารางและข้อมูล', dur: '9:20' },
  ]},
  { title: 'การเขียน Prompt ขั้นเริ่มต้น', items: [
    { title: 'โครงสร้าง Prompt ที่ดี', dur: '10:14' },
    { title: 'ตัวอย่าง Prompt สำหรับงานบริการ', dur: '8:50' },
  ]},
];

export default function LMS() {
  const { slug } = useParams();
  const id = idFromSlug(slug);
  const [course, setCourse] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentLecture, setCurrentLecture] = useState(0);
  const [openSections, setOpenSections] = useState({ 0: true });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch('/courses.json')
      .then(r => r.json())
      .then(data => setCourse(data.find(c => c.id === id) || null))
      .catch(() => {});
  }, [id]);

  const title = course?.title || 'หลักสูตร ChulaXL';
  const coverImg = course?.coverImageUrl || '';
  const currentItem = CURRICULUM[currentSection]?.items[currentLecture];

  function selectLecture(sIdx, lIdx) {
    setCurrentSection(sIdx);
    setCurrentLecture(lIdx);
    setPlaying(false);
    setOpenSections(prev => ({ ...prev, [sIdx]: true }));
  }

  // Count completed lectures (all before current)
  let totalLectures = CURRICULUM.reduce((s, sec) => s + sec.items.length, 0);
  let completedCount = 0;
  for (let s = 0; s < CURRICULUM.length; s++) {
    for (let l = 0; l < CURRICULUM[s].items.length; l++) {
      if (s < currentSection || (s === currentSection && l < currentLecture)) completedCount++;
    }
  }
  const progress = Math.round((completedCount / totalLectures) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--ink-900)', color: '#fff' }}>
      {/* Top bar */}
      <div className="lms-topbar">
        <Link to={`/course/${slug}`} className="lms-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          กลับ
        </Link>
        <div className="lms-brand">
          <img src="https://d1xutesu22jhtx.cloudfront.net/paas-landing-web/lll-cu-landing/logo/lll-logo.png" alt="ChulaXL" />
        </div>
        <div className="lms-title">{title}</div>
        <div className="lms-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <div className="lms-progress-ring" title={`${progress}% เสร็จแล้ว`}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="3"/>
              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--pink-500)" strokeWidth="3"
                strokeDasharray={`${progress * 0.942} 94.2`} strokeLinecap="round"
                transform="rotate(-90 18 18)" />
            </svg>
            <span style={{ position: 'absolute', fontSize: 9, fontWeight: 700 }}>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="lms-main">
        {/* Video */}
        <div className="lms-content">
          <div className="video-wrap">
            {coverImg && !playing && (
              <img src={coverImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <button className="video-play" onClick={() => setPlaying(p => !p)} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 64, height: 64, cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#fff', zIndex: 2 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z"/> : <path d="M5 3l14 9-14 9V3z"/>}
              </svg>
            </button>
          </div>

          <div className="lms-meta" style={{ padding: '24px 0 32px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>{currentItem?.title || 'เลือกบทเรียน'}</h1>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14 }}>
              {CURRICULUM[currentSection]?.title} · {currentItem?.dur}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lms-sidebar">
          <div className="sb-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', fontSize: 13, fontWeight: 600 }}>
            เนื้อหาหลักสูตร
          </div>
          <div className="sb-sections">
            {CURRICULUM.map((sec, sIdx) => (
              <div key={sIdx} className="sb-section">
                <button
                  className="sb-section-hd"
                  onClick={() => setOpenSections(prev => ({ ...prev, [sIdx]: !prev[sIdx] }))}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 20px', background: 'rgba(255,255,255,.04)', border: 'none', borderBottom: '1px solid rgba(255,255,255,.06)', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600 }}
                >
                  <span>{openSections[sIdx] ? '▼' : '▶'} </span>
                  {sec.title}
                </button>
                {openSections[sIdx] && sec.items.map((item, lIdx) => {
                  const isActive = sIdx === currentSection && lIdx === currentLecture;
                  const isDone = sIdx < currentSection || (sIdx === currentSection && lIdx < currentLecture);
                  return (
                    <button
                      key={lIdx}
                      className={`sb-lec${isActive ? ' current' : ''}${isDone ? ' done' : ''}`}
                      onClick={() => selectLecture(sIdx, lIdx)}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 20px 10px 36px', background: isActive ? 'rgba(229,0,122,.15)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', color: isActive ? '#fff' : 'rgba(255,255,255,.7)', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: isDone ? '#10B981' : isActive ? 'var(--pink-400)' : 'rgba(255,255,255,.3)', fontSize: 12 }}>
                          {isDone ? '✓' : '▶'}
                        </span>
                        {item.title}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, flexShrink: 0 }}>{item.dur}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
