import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { idFromSlug, toSlug, courseNumericId } from '../utils/slug';

function mockPriceFor(id) {
  const prices = [2490, 1890, 990, 3290, 1490, 2290, 1290];
  const olds   = [4900, 3690, 1990, 5990, 2990, 4290, 2590];
  const i = id % prices.length;
  return { price: prices[i], old: olds[i] };
}

const RELATED_TOPICS = [
  'Generative AI', 'Prompt Engineering', 'LLM', 'ChatGPT',
  'AI in Finance', 'Digital Literacy', 'Data Science', 'Machine Learning',
];

const REVIEW_BARS = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 14 },
  { stars: 3, pct: 5 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
];

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
  instructor: {
    name: 'อาจารย์จุฬาลงกรณ์มหาวิทยาลัย',
    initials: 'CU',
    gradient: 'linear-gradient(135deg,#7A0040,#9E0056)',
    role: 'อาจารย์ จุฬาลงกรณ์มหาวิทยาลัย',
    rating: 4.8,
    reviews: 200,
    students: 3000,
    courses: 3,
    bio: 'อาจารย์ผู้เชี่ยวชาญจากจุฬาลงกรณ์มหาวิทยาลัย',
  },
  reviews: [],
};

export default function CourseDetail() {
  const { slug } = useParams();
  const id = idFromSlug(slug);
  const [course, setCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [openSections, setOpenSections] = useState({ 0: true });

  useEffect(() => {
    fetch('/courses.json')
      .then(r => r.json())
      .then(data => {
        const courses = Array.isArray(data) ? data : (data.courses ?? []);
        setAllCourses(courses);
        const found = courses.find(c => courseNumericId(c) === id);
        setCourse(found || null);
      })
      .catch(() => {});
  }, [id]);

  const moocId = isNaN(id) ? null : id;
  const detail = moocId === 285 ? RICH_DETAIL : GENERIC_DETAIL;
  const { price, old } = mockPriceFor(moocId || 285);
  const discount = Math.round(100 - (price / old) * 100);

  const title = course?.title || (moocId === 285
    ? 'ปัญญาประดิษฐ์เชิงสร้างสรรค์และกระบวนการสร้างคำสั่ง (ธอส.)'
    : `หลักสูตร #${moocId}`);
  const coverImg = course?.coverImageUrl || null;
  const categoryType = course?.category?.type || '';
  const partnerLabel = course?.platform || '';

  const relatedCourses = allCourses.filter(c => courseNumericId(c) !== id).slice(0, 4);
  const alsoBought     = allCourses.filter(c => courseNumericId(c) !== id).slice(4, 8);
  const moreByInstr    = allCourses.filter(c => courseNumericId(c) !== id).slice(8, 12);

  function toggleSection(i) {
    setOpenSections(prev => ({ ...prev, [i]: !prev[i] }));
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="cd-hero">
        <div className="wrap">
          <nav className="cd-breadcrumb">
            <Link to="/">หน้าแรก</Link>
            {categoryType && <><span className="sep">›</span><Link to="/">{categoryType}</Link></>}
            {partnerLabel && <><span className="sep">›</span><Link to="/">{partnerLabel}</Link></>}
            <span className="sep">›</span>
            <span className="current">{title}</span>
          </nav>

          <div className="cd-hero-grid">
            {/* ── Left column ── */}
            <div className="cd-main">
              <div className="cd-pills">
                {categoryType && <span className="cd-pill cd-pill-cat">{categoryType}</span>}
                {partnerLabel && <span className="cd-pill cd-pill-partner">{partnerLabel}</span>}
                {detail.creditEligible && (
                  <span className="cd-pill cd-pill-credit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z"/></svg>
                    เก็บ {detail.creditUnits} หน่วยกิตได้
                  </span>
                )}
                {detail.bestseller && <span className="cd-pill cd-pill-best">Bestseller</span>}
              </div>

              <h1 className="cd-title">{title}</h1>
              <p className="cd-lede">{detail.subtitle || detail.description?.[0]}</p>

              <div className="cd-hero-meta">
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

              <div className="cd-hero-instructor">
                สอนโดย <a href="#cd-instr">{detail.instructor?.name || 'อาจารย์จุฬาลงกรณ์มหาวิทยาลัย'}</a>
              </div>

              <div className="cd-video">
                <img src={coverImg} alt="" onError={e => e.target.style.display = 'none'} />
                <span className="vlabel">ดูตัวอย่างคอร์สนี้</span>
                <span className="play">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </span>
              </div>
            </div>

            {/* ── Right column — sticky CTA ── */}
            <aside className="cd-aside">
              <div className="cd-cta-card">
                <div className="cd-cta-cover">
                  <img src={coverImg} alt="" onError={e => e.target.style.display = 'none'} />
                </div>
                <div className="cd-cta-body">
                  <div className="cd-price-row">
                    <span className="cd-price">฿{price.toLocaleString()}</span>
                    <span className="cd-price-old">฿{old.toLocaleString()}</span>
                    <span className="cd-price-disc">{discount}% OFF</span>
                  </div>
                  {detail.bestseller && (
                    <div className="cd-urgency">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                      ราคาพิเศษเหลือ 2 วัน · มีผู้ลงทะเบียน {detail.enrolledRecent || 184} คนใน 24 ชั่วโมง
                    </div>
                  )}

                  <div className="cd-cta-buttons">
                    <a href="#" className="btn btn-primary btn-block">ลงทะเบียนเรียน</a>
                    <a href="#" className="btn btn-outline btn-block">ทดลองเรียนฟรี</a>
                  </div>
                  <div className="cd-guarantee">รับประกันคืนเงิน 30 วัน · ฟรีตลอดสำหรับเนื้อหา CHULA MOOC</div>

                  <div className="cd-app-mini">
                    <div className="cd-app-mini-label">เรียนต่อในแอปได้</div>
                    <div className="cd-app-mini-badges">
                      <a href="#" target="_blank" rel="noopener" aria-label="App Store">
                        <img src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://d3njjcbhbojbot.cloudfront.net/web/images/icons/download_on_the_app_store_badge_en.svg?auto=format%2Ccompress&dpr=2&w=152&h=45&q=40" alt="" />
                      </a>
                      <a href="#" target="_blank" rel="noopener" aria-label="Google Play">
                        <img src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://d3njjcbhbojbot.cloudfront.net/web/images/icons/en_generic_rgb_wo_45.png?auto=format%2Ccompress&dpr=2&w=152&h=45&q=40" alt="" />
                      </a>
                    </div>
                  </div>

                  <div className="cd-includes-head">คอร์สนี้รวม</div>
                  <ul className="cd-includes">
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 4H5c-1 0-2 1-2 2v12c0 1 1 2 2 2h14c1 0 2-1 2-2V6c0-1-1-2-2-2zM10 16V8l6 4z"/></svg>
                      วิดีโอ HD {detail.duration || '6 ชั่วโมง'}
                    </li>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                      {detail.lectures || 24} บทเรียน
                    </li>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                      ประกาศนียบัตรอิเล็กทรอนิกส์
                    </li>
                    <li>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
                      เรียนได้ทุกที่ทุกเวลา
                    </li>
                  </ul>

                  <div className="cd-share-row">
                    <a href="#">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.5 10.5 7-4M8.5 13.5l7 4"/></svg>
                      แชร์
                    </a>
                    <a href="#">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4h12v17l-6-3.5L6 21z"/></svg>
                      บันทึก
                    </a>
                    <a href="#">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
                      ของขวัญ
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="cd-content">
        <div className="wrap">
          <div className="cd-content-grid">
            <main className="cd-body">

              {/* สิ่งที่จะได้เรียนรู้ */}
              <div className="cd-section">
                <h2>สิ่งที่คุณจะได้เรียนรู้</h2>
                <div className="wyl">
                  <div className="wyl-grid">
                    {detail.whatYoullLearn.map((item, i) => (
                      <div key={i} className="wyl-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* หัวข้อที่เกี่ยวข้อง */}
              <div className="cd-section">
                <h2>หัวข้อที่เกี่ยวข้อง</h2>
                <div className="cd-topics">
                  {RELATED_TOPICS.map((t, i) => (
                    <a key={i} href="#" className="cd-topic">{t}</a>
                  ))}
                </div>
              </div>

              {/* เนื้อหาคอร์ส */}
              <div className="cd-section">
                <h2>เนื้อหาคอร์ส</h2>
                <div className="cu-summary">
                  <span><strong>{detail.curriculum.length}</strong> ส่วน</span>
                  <span><strong>{detail.lectures}</strong> บทเรียน</span>
                  <span><strong>{detail.duration}</strong></span>
                </div>
                <div>
                  {detail.curriculum.map((sec, i) => (
                    <div key={i} className={`cu-section${openSections[i] ? ' open' : ''}`}>
                      <div className="cu-head" onClick={() => toggleSection(i)}>
                        <div className="l">
                          <span className="ch">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                          </span>
                          {sec.title}
                        </div>
                        <div className="r">{sec.lectures} บทเรียน · {sec.duration}</div>
                      </div>
                      {sec.items.length > 0 && (
                        <div className="cu-body">
                          {sec.items.map((item, j) => (
                            <div key={j} className="cu-lec">
                              <div className="l">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l14 9-14 9V3z"/></svg>
                                {item.title}
                                {item.preview && <span className="preview">Preview</span>}
                              </div>
                              <span className="dur">{item.dur}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* คุณสมบัติผู้เรียน */}
              <div className="cd-section">
                <h2>คุณสมบัติผู้เรียน</h2>
                <ul className="cd-list">
                  {detail.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              {/* เกี่ยวกับคอร์สนี้ */}
              <div className="cd-section">
                <h2>เกี่ยวกับคอร์สนี้</h2>
                <div className="cd-prose">
                  {detail.description.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>

              {/* คอร์สอื่นในเส้นทางเดียวกัน */}
              {relatedCourses.length > 0 && (
                <div className="cd-section">
                  <h2>คอร์สอื่นในเส้นทางเดียวกัน</h2>
                  <div className="cd-related">
                    {relatedCourses.map(c => {
                      const { price: rp, old: ro } = mockPriceFor(c.id);
                      return (
                        <Link key={c.href} to={`/course/${toSlug(courseNumericId(c), c.title)}`} className="cd-related-card">
                          <div className="cover">
                            <img src={c.coverImageUrl} alt="" onError={e => e.target.style.display = 'none'} />
                            {c.platform && <span className="badge">{c.platform}</span>}
                          </div>
                          <div className="body">
                            <div className="t">{c.title}</div>
                            <div className="by">{c.section}</div>
                            <div className="price"><span className="old">฿{ro.toLocaleString()}</span>฿{rp.toLocaleString()}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ผู้เรียนคอร์สนี้ยังเลือกเรียน */}
              {alsoBought.length > 0 && (
                <div className="cd-section">
                  <h2>ผู้เรียนคอร์สนี้ยังเลือกเรียน</h2>
                  <div className="cd-bought-list">
                    {alsoBought.map(c => {
                      const { price: ap } = mockPriceFor(c.id);
                      return (
                        <Link key={c.href} to={`/course/${toSlug(courseNumericId(c), c.title)}`} className="cd-bought-row">
                          <div className="img">
                            <img src={c.coverImageUrl} alt="" onError={e => e.target.style.display = 'none'} />
                          </div>
                          <div>
                            <div className="b-title">{c.title}</div>
                            <div className="b-meta">
                              <span>{c.platform}</span>
                              <span className="bs">Bestseller</span>
                            </div>
                          </div>
                          <div className="b-price">฿{ap.toLocaleString()}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ผู้สอน */}
              {detail.instructor && (
                <div id="cd-instr" className="cd-section">
                  <h2>ผู้สอน</h2>
                  <div className="instr-block">
                    <div className="avatar-l" style={{ background: detail.instructor.gradient }}>
                      {detail.instructor.initials}
                    </div>
                    <div>
                      <div className="name">{detail.instructor.name}</div>
                      <div className="role">{detail.instructor.role}</div>
                      <div className="instr-stats">
                        <div className="s">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <strong>{detail.instructor.rating}</strong> คะแนน
                        </div>
                        <div className="s">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          <strong>{detail.instructor.reviews?.toLocaleString()}</strong> รีวิว
                        </div>
                        <div className="s">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          <strong>{detail.instructor.students?.toLocaleString()}</strong> ผู้เรียน
                        </div>
                      </div>
                      <p className="instr-bio">{detail.instructor.bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* รีวิว */}
              {detail.reviews && detail.reviews.length > 0 && (
                <div className="cd-section">
                  <h2>★ {detail.rating} · เสียงสะท้อนจากผู้เรียน</h2>
                  <div className="rev-summary">
                    <div>
                      <div className="big">{detail.rating}</div>
                      <div className="stars">{'★'.repeat(5)}</div>
                      <div className="count">({detail.ratingCount?.toLocaleString()} รีวิว)</div>
                    </div>
                    <div className="rev-bars">
                      {REVIEW_BARS.map(bar => (
                        <div key={bar.stars} className="rev-bar">
                          <span className="star">★</span>
                          <span>{bar.stars}</span>
                          <div className="track"><div className="fill" style={{ width: `${bar.pct}%` }} /></div>
                          <span className="pct">{bar.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rev-list">
                    {detail.reviews.map((r, i) => (
                      <div key={i} className="rev-card">
                        <div className="rev-head">
                          <div className="rev-avatar" style={{ background: r.grad }}>{r.initials}</div>
                          <div>
                            <div className="rev-name">{r.name}</div>
                            <div className="rev-rating">{'★'.repeat(r.stars)}</div>
                            <div className="rev-when">{r.when}</div>
                          </div>
                        </div>
                        <p className="rev-text">{r.text}</p>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-outline" style={{ marginTop: 16 }}>ดูรีวิวทั้งหมด →</button>
                </div>
              )}

              {/* คอร์สอื่นโดยผู้สอนคนเดียวกัน */}
              {moreByInstr.length > 0 && (
                <div className="cd-section">
                  <h2>คอร์สอื่นโดยผู้สอนคนเดียวกัน</h2>
                  <div className="cd-related">
                    {moreByInstr.map(c => {
                      const { price: mp } = mockPriceFor(c.id);
                      return (
                        <Link key={c.href} to={`/course/${toSlug(courseNumericId(c), c.title)}`} className="cd-related-card">
                          <div className="cover">
                            <img src={c.coverImageUrl} alt="" onError={e => e.target.style.display = 'none'} />
                          </div>
                          <div className="body">
                            <div className="t">{c.title}</div>
                            <div className="by">{c.section}</div>
                            <div className="price">฿{mp.toLocaleString()}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            </main>
            <div className="cd-body-aside-stub" />
          </div>
        </div>
      </section>
    </div>
  );
}
