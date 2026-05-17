import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { idFromSlug } from '../utils/slug';

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

  const totalLectures = CURRICULUM.reduce((s, sec) => s + sec.items.length, 0);
  let completedCount = 0;
  for (let s = 0; s < CURRICULUM.length; s++) {
    for (let l = 0; l < CURRICULUM[s].items.length; l++) {
      if (s < currentSection || (s === currentSection && l < currentLecture)) completedCount++;
    }
  }
  const progress = Math.round((completedCount / totalLectures) * 100);

  function selectLecture(sIdx, lIdx) {
    setCurrentSection(sIdx);
    setCurrentLecture(lIdx);
    setPlaying(false);
    setOpenSections(prev => ({ ...prev, [sIdx]: true }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#1a1625', color: '#fff' }}>
      {/* Top bar */}
      <div style={{ background: '#0f0b1a', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 16, height: 64, position: 'sticky', top: 0, zIndex: 30 }}>
        <Link to={`/course/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          กลับ
        </Link>
        <img src="https://d1xutesu22jhtx.cloudfront.net/paas-landing-web/lll-cu-landing/logo/lll-logo.png" alt="ChulaXL" style={{ height: 28 }} />
        <div style={{ flex: 1, fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
        <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15" fill="none" stroke="#E5007A" strokeWidth="3"
              strokeDasharray={`${progress * 0.942} 94.2`} strokeLinecap="round"
              transform="rotate(-90 18 18)" />
          </svg>
          <span style={{ position: 'absolute', fontSize: 9, fontWeight: 700 }}>{progress}%</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', flex: 1, minHeight: 0 }}>
        {/* Video area */}
        <div style={{ padding: '0 0 32px' }}>
          <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9', width: '100%' }}>
            {coverImg && !playing && (
              <img src={coverImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <button onClick={() => setPlaying(p => !p)} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 64, height: 64, cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#fff', zIndex: 2 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                {playing ? <path d="M6 4h4v16H6zM14 4h4v16h-4z"/> : <path d="M5 3l14 9-14 9V3z"/>}
              </svg>
            </button>
          </div>
          <div style={{ padding: '24px 32px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>{currentItem?.title || 'เลือกบทเรียน'}</h1>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, margin: 0 }}>
              {CURRICULUM[currentSection]?.title} · {currentItem?.dur}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,.08)', overflowY: 'auto', background: '#0f0b1a' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', fontSize: 13, fontWeight: 600 }}>เนื้อหาหลักสูตร</div>
          {CURRICULUM.map((sec, sIdx) => (
            <div key={sIdx}>
              <button
                onClick={() => setOpenSections(prev => ({ ...prev, [sIdx]: !prev[sIdx] }))}
                style={{ width: '100%', textAlign: 'left', padding: '12px 20px', background: 'rgba(255,255,255,.04)', border: 'none', borderBottom: '1px solid rgba(255,255,255,.06)', cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600 }}
              >
                {openSections[sIdx] ? '▼' : '▶'} {sec.title}
              </button>
              {openSections[sIdx] && sec.items.map((item, lIdx) => {
                const isActive = sIdx === currentSection && lIdx === currentLecture;
                const isDone = sIdx < currentSection || (sIdx === currentSection && lIdx < currentLecture);
                return (
                  <button
                    key={lIdx}
                    onClick={() => selectLecture(sIdx, lIdx)}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 20px 10px 36px', background: isActive ? 'rgba(229,0,122,.15)' : 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', color: isActive ? '#fff' : 'rgba(255,255,255,.7)', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: isDone ? '#10B981' : isActive ? '#E5007A' : 'rgba(255,255,255,.3)', fontSize: 12 }}>
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
  );
}
