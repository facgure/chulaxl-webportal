import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { idFromSlug } from '../utils/slug';

// Mock prices (same as course-data.js)
function mockPriceFor(id) {
  const prices = [2490, 1890, 990, 3290, 1490, 2290, 1290];
  const olds = [4900, 3690, 1990, 5990, 2990, 4290, 2590];
  const i = id % prices.length;
  return { price: prices[i], old: olds[i] };
}

// Rich detail for featured course (id=285)
const RICH_DETAIL = {
  subtitle: 'เรียนรู้พื้นฐาน Generative AI ตั้งแต่หลักการทำงานของโมเดลภาษา การเขียน Prompt ที่ดี จนถึงการประยุกต์ใช้กับงานจริงในองค์กรการเงินและบริการ',
  rating: 4.8,
  ratingCount: 512,
  students: 8412,
  language: 'ไทย',
  level: 'ระดับเริ่มต้น – ปานกลาง',
  lastUpdated: 'มีนาคม 2026',
  duration: '6 ชั่วโมง 24 นาที',
  lectures: 26,
  sections: 6,
  creditEligible: true,
  creditUnits: 2,
  bestseller: true,
  enrolledRecent: 184,
  whatYoullLearn: [
    'เข้าใจหลักการทำงานของโมเดลภาษาขนาดใหญ่ (LLM) และเอไอเชิงสร้างสรรค์',
    'เขียน Prompt ที่มีโครงสร้างเพื่อให้ได้ผลลัพธ์คุณภาพสูงในงานองค์กร',
    'ประยุกต์ใช้ Generative AI กับโจทย์จริงในภาคการเงินและบริการลูกค้า',
    'วิเคราะห์ผลลัพธ์ที่ได้จากเอไอเพื่อความถูกต้องและความรับผิดชอบ',
    'เข้าใจประเด็นจริยธรรมและกฎหมายในการใช้ AI ในองค์กร',
    'สร้างกรอบการกำกับดูแลและการใช้ AI อย่างปลอดภัยภายในทีม',
  ],
  requirements: [
    'ไม่ต้องมีความรู้พื้นฐานด้านการเขียนโปรแกรม',
    'สามารถใช้งานคอมพิวเตอร์และอินเทอร์เน็ตในระดับพื้นฐานได้',
    'มีบัญชี ChatGPT หรือ Gemini สำหรับทำแบบฝึกหัด (ฟรี)',
  ],
  description: [
    'พร้อมก้าวข้ามกระแสและสร้างผลลัพธ์จริงด้วย AI ใช่ไหม? คอร์สนี้ให้ความเข้าใจพื้นฐานเกี่ยวกับการทำงานกับ AI และวิธีการเขียนคำสั่งอย่างมีโครงสร้าง เพื่อให้คุณใช้ AI ได้อย่างมีประสิทธิภาพในที่ทำงาน',
    'เมื่อจบคอร์สนี้ คุณจะสามารถนำวิธีคิดใหม่ในการทำงานร่วมกับ AI ไปประยุกต์ในบทบาทของคุณได้ทันที พร้อมกับเทคนิคการ Prompt ที่ทดสอบและปรับปรุงได้',
    'ผลิตโดยอาจารย์จุฬาฯ ร่วมกับ ธนาคารอาคารสงเคราะห์ (ธอส.) เพื่อยกระดับทักษะดิจิทัลของบุคลากรในภาคการเงินและประชาชนทั่วไปที่สนใจ',
  ],
  curriculum: [
    { title: 'รู้จัก Generative AI และทำงานร่วมกัน', lectures: 4, duration: '38 นาที', items: [
      { title: 'AI fundamentals', dur: '8:04', preview: true },
      { title: 'ปรับวิธีคิดให้ทำงานกับ AI ได้ดี', dur: '12:50', preview: true },
      { title: 'สามวิธีในการทำงานร่วมกับ AI', dur: '7:42' },
      { title: 'เคล็ดลับสำหรับคนที่เพิ่งเริ่มต้นกับ AI', dur: '9:30', preview: true },
    ]},
    { title: 'ฝึกใช้ AI ในงานประจำ', lectures: 6, duration: '49 นาที', items: [
      { title: 'การสรุปและเรียบเรียงข้อมูล', dur: '8:12' },
      { title: 'การช่วยเขียนอีเมลและรายงาน', dur: '7:45' },
      { title: 'การวิเคราะห์ตารางและข้อมูล', dur: '9:20' },
    ]},
    { title: 'การเขียน Prompt ขั้นเริ่มต้น', lectures: 4, duration: '34 นาที', items: [
      { title: 'โครงสร้าง Prompt ที่ดี', dur: '10:14' },
      { title: 'ตัวอย่าง Prompt สำหรับงานบริการ', dur: '8:50' },
    ]},
    { title: 'Prompt ขั้นสูง: Chain & Pattern', lectures: 5, duration: '46 นาที', items: [] },
    { title: 'ใช้ AI อย่างมีจริยธรรม', lectures: 4, duration: '32 นาที', items: [] },
    { title: 'นำไปใช้จริงในองค์กร', lectures: 3, duration: '25 นาที', items: [] },
  ],
  instructor: {
    name: 'รศ.ดร.อติวงศ์ สุชาโต',
    initials: 'อต',
    gradient: 'linear-gradient(135deg,#5B21B6,#1E3A8A)',
    role: 'รองศาสตราจารย์ ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
    rating: 4.9,
    reviews: 1744,
    students: 12450,
    courses: 5,
    bio: 'อาจารย์ผู้สอนและนักวิจัยด้านปัญญาประดิษฐ์ การประมวลผลภาษาธรรมชาติ และการศึกษาดิจิทัล ผู้ผลิตเนื้อหา CHULA MOOC ในซีรีส์การรู้เท่าทันดิจิทัล',
  },
  reviews: [
    { name: 'Elemental', initials: 'EL', grad: '#5B21B6', stars: 5, when: '22 วันที่แล้ว', text: 'คอร์สนี้น่าสนใจมาก เนื้อหากระชับและประยุกต์ใช้ได้จริงในงาน' },
    { name: 'Eugene', initials: 'EU', grad: '#0F766E', stars: 5, when: '1 เดือนที่แล้ว', text: 'อาจารย์อธิบายชัดเจน เข้าใจง่าย ที่สำคัญที่สุดคือสามารถเอาวิธีไปใช้ทำงานจริงได้' },
    { name: 'Tim', initials: 'TI', grad: '#DC2626', stars: 4, when: '1 เดือนที่แล้ว', text: 'คิดว่าได้เรียนรู้สิ่งใหม่ทุกวันจากการเรียนคอร์สนี้ คิดว่าควรแนะนำต่อให้เพื่อนร่วมงาน' },
  ],
};

const GENERIC_DETAIL = {
  subtitle: null,
  rating: 4.5,
  ratingCount: 120,
  students: 2000,
  language: 'ไทย',
  level: 'ทุกระดับ',
  lastUpdated: '2566',
  duration: '4 ชั่วโมง',
  lectures: 16,
  sections: 4,
  creditEligible: false,
  creditUnits: 0,
  bestseller: false,
  whatYoullLearn: [
    'ความรู้พื้นฐานในด้านนี้อย่างครบถ้วน',
    'ทักษะปฏิบัติที่สามารถนำไปใช้งานได้จริง',
    'เข้าใจแนวคิดและหลักการสำคัญ',
    'เตรียมพร้อมสำหรับการเรียนระดับสูงขึ้น',
  ],
  requirements: ['ไม่ต้องมีพื้นฐานใดๆ'],
  description: ['หลักสูตรออนไลน์คุณภาพสูงโดยอาจารย์จุฬาลงกรณ์มหาวิทยาลัย เรียนได้ทุกที่ทุกเวลาพร้อมประกาศนียบัตรอิเล็กทรอนิกส์'],
  curriculum: [
    { title: 'บทเรียนที่ 1', lectures: 4, duration: '40 นาที', items: [{ title: 'แนะนำรายวิชา', dur: '5:00', preview: true }] },
    { title: 'บทเรียนที่ 2', lectures: 4, duration: '40 นาที', items: [] },
    { title: 'บทเรียนที่ 3', lectures: 4, duration: '40 นาที', items: [] },
    { title: 'บทเรียนที่ 4', lectures: 4, duration: '40 นาที', items: [] },
  ],
  instructor: { name: 'อาจารย์จุฬาลงกรณ์มหาวิทยาลัย', initials: 'CU', gradient: 'linear-gradient(135deg,#7A0040,#9E0056)', role: 'อาจารย์ จุฬาลงกรณ์มหาวิทยาลัย', rating: 4.8, reviews: 200, students: 3000, courses: 3, bio: 'อาจารย์ผู้เชี่ยวชาญจากจุฬาลงกรณ์มหาวิทยาลัย' },
  reviews: [],
};

export default function CourseDetail() {
  const { slug } = useParams();
  const id = idFromSlug(slug);
  const [course, setCourse] = useState(null);
  const [openSections, setOpenSections] = useState({ 0: true });

  useEffect(() => {
    fetch('/courses.json')
      .then(r => r.json())
      .then(data => {
        const found = data.find(c => c.id === id);
        setCourse(found || null);
      })
      .catch(() => setCourse(null));
  }, [id]);

  const detail = id === 285 ? RICH_DETAIL : GENERIC_DETAIL;
  const { price, old } = mockPriceFor(id || 285);
  const discount = Math.round(100 - (price / old) * 100);

  const title = course?.title || (id === 285 ? 'ปัญญาประดิษฐ์เชิงสร้างสรรค์และกระบวนการสร้างคำสั่ง (ธอส.)' : `หลักสูตร #${id}`);
  const coverImg = course?.coverImageUrl || `https://mooc.chula.ac.th/img/upload/${encodeURIComponent(title)}.png`;

  function toggleSection(i) {
    setOpenSections(prev => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div>
      {/* ── Course Hero ── */}
      <div className="cd-hero">
        <div className="wrap">
          <nav className="cd-breadcrumb">
            <Link to="/">หน้าแรก</Link>
            <span className="sep">›</span>
            <Link to="/">สำรวจหลักสูตร</Link>
            <span className="sep">›</span>
            <span className="current">{title}</span>
          </nav>

          <div className="cd-hero-grid">
            <div>
              <div className="cd-pills" id="cd-pills">
                {detail.creditEligible && (
                  <span className="cd-pill cd-pill-credit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z"/></svg>
                    เก็บ {detail.creditUnits} หน่วยกิตได้
                  </span>
                )}
                {detail.bestseller && <span className="cd-pill cd-pill-best">Bestseller</span>}
              </div>

              <h1 className="cd-title" id="cd-title">{title}</h1>
              <p className="cd-lede" id="cd-lede">{detail.subtitle || detail.description?.[0]}</p>

              <div className="cd-hero-meta" id="cd-hero-meta">
                {detail.rating && (
                  <span className="cd-rating">
                    <span className="num">{detail.rating}</span>
                    <span className="stars">★★★★★</span>
                    <span className="count">({(detail.ratingCount || 0).toLocaleString()} รีวิว)</span>
                  </span>
                )}
                {detail.students && (
                  <span className="cd-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <strong>{detail.students.toLocaleString()}</strong> ผู้เรียน
                  </span>
                )}
                {detail.lastUpdated && (
                  <span className="cd-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.5 1 6 2.5"/><path d="M21 4v5h-5"/></svg>
                    อัปเดต {detail.lastUpdated}
                  </span>
                )}
                <span className="cd-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
                  {detail.language || 'ไทย'}
                </span>
              </div>

              <p id="cd-hero-instructor">
                สอนโดย <a href="#cd-instr" style={{ color: 'var(--pink-700)', fontWeight: 600 }}>{detail.instructor?.name || 'อาจารย์จุฬาลงกรณ์มหาวิทยาลัย'}</a>
              </p>
            </div>

            {/* Sticky CTA card */}
            <div className="cd-sidebar">
              <div className="cd-cta-card">
                <div className="cd-cta-preview">
                  <img id="cd-cta-cover" src={coverImg} alt="" onError={e => e.target.style.display='none'} />
                  <button className="cd-play-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div className="cd-cta-body">
                  <div id="cd-price-row">
                    <span className="cd-price">฿{price.toLocaleString()}</span>
                    <span className="cd-price-old">฿{old.toLocaleString()}</span>
                    <span className="cd-price-disc">{discount}% OFF</span>
                  </div>
                  {detail.bestseller && (
                    <div id="cd-urgency" className="cd-urgency">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                      ราคาพิเศษเหลือ 2 วัน · มีผู้ลงทะเบียน {detail.enrolledRecent || 184} คนใน 24 ชั่วโมง
                    </div>
                  )}
                  <Link to={`/lms/${slug}`} className="btn btn-primary" style={{ width: '100%', marginBottom: 8, textAlign: 'center', display: 'block' }}>
                    เริ่มเรียนเลย
                  </Link>
                  <button className="btn btn-ghost" style={{ width: '100%' }}>เพิ่มในรายการโปรด</button>
                  <ul className="cd-includes" id="cd-includes" style={{ marginTop: 16, paddingLeft: 0, listStyle: 'none' }}>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 4H5c-1 0-2 1-2 2v12c0 1 1 2 2 2h14c1 0 2-1 2-2V6c0-1-1-2-2-2zM10 16V8l6 4z"/></svg>
                      วิดีโอ HD {detail.duration || '6 ชั่วโมง'}
                    </li>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16v14H4z"/></svg>
                      {detail.lectures || 24} บทเรียน
                    </li>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      ประกาศนียบัตรอิเล็กทรอนิกส์
                    </li>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
                      เรียนได้ทุกที่ทุกเวลา
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── What you'll learn ── */}
      <section className="wrap" style={{ marginTop: 48 }}>
        <div className="wyl">
          <h2 className="wyl-title">สิ่งที่จะได้เรียนรู้</h2>
          <ul className="wyl-grid">
            {detail.whatYoullLearn.map((item, i) => (
              <li key={i}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Curriculum ── */}
        <div className="cu-section" id="curriculum" style={{ marginTop: 48 }}>
          <h2>เนื้อหาหลักสูตร</h2>
          <p style={{ color: 'var(--ink-500)', fontSize: 14, marginBottom: 20 }}>
            {detail.curriculum.length} ส่วน · {detail.lectures} บทเรียน · {detail.duration}
          </p>
          {detail.curriculum.map((sec, i) => (
            <div key={i} className="cu-section-item">
              <button
                className="cu-section-hd"
                onClick={() => toggleSection(i)}
                style={{ width: '100%', textAlign: 'left', background: 'var(--ink-50)', border: '1px solid var(--ink-200)', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}
              >
                <span style={{ fontWeight: 600 }}>{sec.title}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>
                  {sec.lectures} บทเรียน · {sec.duration} {openSections[i] ? '▲' : '▼'}
                </span>
              </button>
              {openSections[i] && sec.items.length > 0 && (
                <div style={{ border: '1px solid var(--ink-200)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '8px 0' }}>
                  {sec.items.map((item, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', borderBottom: j < sec.items.length - 1 ? '1px solid var(--ink-100)' : 'none' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 9-14 9V3z"/></svg>
                      <span style={{ flex: 1, fontSize: 14 }}>{item.title}</span>
                      {item.preview && <span style={{ fontSize: 11, color: 'var(--pink-700)', fontWeight: 600 }}>Preview</span>}
                      <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>{item.dur}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Requirements ── */}
        <div style={{ marginTop: 40 }}>
          <h2>ข้อกำหนดเบื้องต้น</h2>
          <ul style={{ paddingLeft: 20 }}>
            {detail.requirements.map((r, i) => <li key={i} style={{ marginBottom: 8, fontSize: 15 }}>{r}</li>)}
          </ul>
        </div>

        {/* ── Instructor ── */}
        {detail.instructor && (
          <div id="cd-instr" style={{ marginTop: 48 }}>
            <h2>ผู้สอน</h2>
            <div className="instr-card" style={{ maxWidth: 480, marginTop: 16 }}>
              <div className="instr-avatar" style={{ background: detail.instructor.gradient }}>
                {detail.instructor.initials}
                <div className="instr-check">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                </div>
              </div>
              <div className="instr-info">
                <div className="instr-name">{detail.instructor.name}</div>
                <div className="instr-spec">{detail.instructor.role}</div>
                <p style={{ fontSize: 14, color: 'var(--ink-600)', marginTop: 8 }}>{detail.instructor.bio}</p>
                <div className="instr-foot">
                  <span>★ {detail.instructor.rating} · {detail.instructor.reviews?.toLocaleString()} รีวิว</span>
                  <span>{detail.instructor.students?.toLocaleString()} ผู้เรียน</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Reviews ── */}
        {detail.reviews && detail.reviews.length > 0 && (
          <div style={{ marginTop: 48, marginBottom: 64 }}>
            <h2>รีวิวจากผู้เรียน</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 20 }}>
              {detail.reviews.map((r, i) => (
                <div key={i} style={{ background: 'var(--ink-50)', borderRadius: 12, padding: 16, border: '1px solid var(--ink-200)' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.grad, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{r.initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{'★'.repeat(r.stars)} · {r.when}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: 'var(--ink-700)' }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
