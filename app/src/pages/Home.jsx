import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/course/CourseCard';
import CourseSearch from '../components/course/CourseSearch';
import Pagination from '../components/course/Pagination';
import { toSlug } from '../utils/slug';

const HERO_COURSES = [
  { id: 285, cat: 'เทคโนโลยี · คอร์สใหม่', name: 'ปัญญาประดิษฐ์เชิงสร้างสรรค์และกระบวนการสร้างคำสั่ง', meta: 'CHULA MOOC · ธอส.', img: 'https://mooc.chula.ac.th/img/upload/%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%8D%E0%B8%B2%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B4%E0%B8%A9%E0%B8%90%E0%B9%8C%E0%B9%80%E0%B8%8A%E0%B8%B4%E0%B8%87%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87%E0%B8%AA%E0%B8%A3%E0%B8%A3%E0%B8%84%E0%B9%8C%20(%E0%B8%98%E0%B8%AD%E0%B8%AA.).png' },
  { id: 283, cat: 'เทคโนโลยี · เปิดรับสมัคร', name: 'ไฟฟ้าที่เราใช้มาจากไหน', seats: '4,354 ที่ว่าง', img: 'https://mooc.chula.ac.th/img/upload/%E0%B9%84%E0%B8%9F%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%80%E0%B8%A3%E0%B8%B2%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B8%A1%E0%B8%B2%E0%B8%88%E0%B8%B2%E0%B8%81%E0%B9%84%E0%B8%AB%E0%B8%99.png' },
  { id: 280, cat: 'ภาษา · ญี่ปุ่น', name: 'คู่คิดคันจิไฟนอลไฟต์', seats: '3,844 ที่ว่าง', img: 'https://mooc.chula.ac.th/img/upload/%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%84%E0%B8%B4%E0%B8%94%E0%B8%84%E0%B8%B1%E0%B8%99%E0%B8%88%E0%B8%B4%E0%B9%84%E0%B8%9F%E0%B8%99%E0%B8%AD%E0%B8%A5%E0%B9%84%E0%B8%9F%E0%B8%95%E0%B9%8C.png' },
];

const STATS = [
  { num: '1,247', label: 'หลักสูตรทั้งหมด' },
  { num: '380K+', label: 'ผู้เรียนสะสม' },
  { num: '96%', label: 'ความพึงพอใจ' },
  { num: '19', label: 'คณะ + พันธมิตร' },
];

const LOGOS = [
  { abbr: 'ENG', label: 'คณะวิศวกรรมศาสตร์', bg: '#7A0040' },
  { abbr: 'ART', label: 'คณะอักษรศาสตร์', bg: '#C2410C' },
  { abbr: 'CBS', label: 'คณะพาณิชยศาสตร์ฯ', bg: '#1E3A8A' },
  { abbr: 'MED', label: 'คณะแพทยศาสตร์', bg: '#047857' },
  { abbr: 'PHA', label: 'คณะเภสัชศาสตร์', bg: '#6D28D9' },
  { abbr: 'LAW', label: 'คณะนิติศาสตร์', bg: '#B91C1C' },
  { abbr: 'POL', label: 'คณะรัฐศาสตร์', bg: '#0369A1' },
  { abbr: 'EDU', label: 'คณะครุศาสตร์', bg: '#0F766E' },
  { abbr: 'กลาโหม', label: 'กระทรวงกลาโหม', bg: '#0B3D2E', small: true },
  { abbr: 'ธอส.', label: 'ธนาคารอาคารสงเคราะห์', bg: '#B71C2C', small: true },
  { abbr: 'วธ.', label: 'กระทรวงวัฒนธรรม', bg: '#5B21B6' },
  { abbr: 'Chula XL', label: 'วิทยาลัยส่งเสริมการเรียนรู้ตลอดชีวิตฯ', bg: '#9E0056', small: true },
];

const CHULA_FACULTIES = [
  { abbr: 'ENG', name: 'คณะวิศวกรรมศาสตร์', sub: 'เทคโนโลยี & AI', bg: '#7A0040' },
  { abbr: 'ART', name: 'คณะอักษรศาสตร์', sub: 'ภาษาไทย/ต่างประเทศ', bg: '#C2410C' },
  { abbr: 'CBS', name: 'คณะพาณิชยศาสตร์และการบัญชี', sub: 'การจัดการ & การเงิน', bg: '#1E3A8A' },
  { abbr: 'MED', name: 'คณะแพทยศาสตร์', sub: 'สุขภาพ & สาธารณสุข', bg: '#047857' },
  { abbr: 'PHA', name: 'คณะเภสัชศาสตร์', sub: 'สมุนไพร & เครื่องสำอาง', bg: '#6D28D9' },
  { abbr: 'LAW', name: 'คณะนิติศาสตร์', sub: 'กฎหมาย & PDPA', bg: '#B91C1C' },
  { abbr: 'POL', name: 'คณะรัฐศาสตร์', sub: 'สังคมศาสตร์ & การสื่อสาร', bg: '#0369A1' },
  { abbr: 'EDU', name: 'คณะครุศาสตร์', sub: 'การพัฒนาตนเอง', bg: '#0F766E' },
];

const GOV_PARTNERS = [
  { abbr: 'กลาโหม', name: 'กระทรวงกลาโหม', sub: '15+ คอร์ส · พัฒนาบุคลากร', bg: '#0B3D2E', fs: '11px' },
  { abbr: 'ธอส.', name: 'ธนาคารอาคารสงเคราะห์', sub: 'AI & Productivity', bg: '#B71C2C', fs: '13px' },
  { abbr: 'วธ.', name: 'กระทรวงวัฒนธรรม', sub: 'รู้เท่าทันสื่อ & ดิจิทัล', bg: '#5B21B6', fs: '14px' },
  { abbr: 'Chula XL', name: 'วิทยาลัยส่งเสริมการเรียนรู้ตลอดชีวิตฯ', sub: 'ผู้ดูแลแพลตฟอร์ม (Chula XL)', bg: '#9E0056', fs: '10px' },
];

export default function Home() {
  const { courses, allFiltered, totalPages, page, loading, query, platform, setQuery, setPlatform, setPage } = useCourses();
  const exploreRef = useRef(null);

  function handleHeroSearch(e) {
    e.preventDefault();
    const q = e.target.querySelector('input').value.trim();
    if (q) setQuery(q);
    exploreRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const marqueeItems = [...LOGOS, ...LOGOS];

  return (
    <main>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow"><span className="dot" /> ChulaXL · เปิดเรียนใหม่ Q3/2026</span>
            <h1 style={{ lineHeight: 1.2 }}>
              เรียนรู้ตลอดชีวิตและร่วมเดินทางไปกับ{' '}
              <span className="accent">จุฬาลงกรณ์มหาวิทยาลัย</span>
            </h1>
            <p className="lede">หลักสูตรออนไลน์มากกว่า 1,200 คอร์ส จาก 19 คณะและเครือข่ายพันธมิตรชั้นนำ ค้นพบเส้นทางการเรียนของคุณที่ปรับเฉพาะบุคคล พร้อมประกาศนียบัตรที่ยืนยันตัวตนด้วย ThaID</p>

            <form className="hero-search" onSubmit={handleHeroSearch}>
              <input type="search" placeholder="ฉันอยากเรียน… เช่น Data Science, ภาษาจีน, การลงทุน" />
              <button type="submit" className="btn btn-primary">ค้นหา</button>
            </form>

            <div className="hero-suggest">
              <span>ยอดนิยม:</span>
              {['ปัญญาประดิษฐ์', 'ภาษาญี่ปุ่น', 'สุขภาพ', 'การจัดการ', 'อังกฤษไวยากรณ์'].map(t => (
                <button key={t} className="chip" onClick={() => { setQuery(t); exploreRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>{t}</button>
              ))}
            </div>

            <div className="hero-stats">
              {STATS.map(s => (
                <div key={s.label} className="hero-stat">
                  <div className="num">{s.num}</div>
                  <div className="label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-tiles">
              <div className="hero-tile tile-thaid">
                <div className="icon">
                  <img src="https://play-lh.googleusercontent.com/jg2lAQET3kV_-6fhPQ_TcDyDItUdDcO7euuUNcANIn78_XJUmCtFBJzEdP3nG4_e2kM=w480-h960" alt="ThaID" />
                </div>
                <div>
                  <div className="tile-eb">ยืนยันตัวตนด้วย</div>
                  <div className="tile-title">Thai Digital ID</div>
                  <div className="tile-sub">เข้าสู่ระบบครั้งเดียว · ปลอดภัย</div>
                </div>
              </div>
              <div className="hero-tile tile-cert">
                <div className="seal">★</div>
                <div>
                  <div className="tile-eb">Verified</div>
                  <div className="tile-title">Chulalongkorn<br />Certificate</div>
                </div>
              </div>
            </div>

            <div className="hero-course-list">
              {HERO_COURSES.map(c => (
                <Link key={c.id} to={`/course/${toSlug(c.id, c.name)}`} className="hero-course">
                  <div className="hc-img"><img src={c.img} alt="" loading="lazy" /></div>
                  <div className="hc-info">
                    <div className="hc-cat">{c.cat}</div>
                    <div className="hc-name">{c.name}</div>
                    <div className="hc-info-meta">
                      {c.seats ? <span className="seats">{c.seats}</span> : <span>{c.meta}</span>}
                    </div>
                  </div>
                  <div className="hc-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo Strip ── */}
      <section className="logos">
        <div className="wrap">
          <div className="logos-head">ร่วมมือกับคณะของจุฬาฯ และหน่วยงานชั้นนำ</div>
        </div>
        <div className="marquee" aria-label="พันธมิตรผู้ผลิตเนื้อหา">
          <div className="marquee-track">
            {marqueeItems.map((l, i) => (
              <div key={i} className="logo-item">
                <span className="glyph" style={{ background: l.bg, fontSize: l.small ? '10px' : undefined }}>{l.abbr}</span>
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explore + Featured ── */}
      <section className="block" id="explore" ref={exploreRef}>
        <div className="wrap">

          <div className="block-head">
            <div>
              <span className="section-pill">สำรวจหลักสูตร</span>
              <h2>คอร์สเรียนจาก CHULA MOOC</h2>
              <p className="sub">เรียงตามทักษะที่ตลาดต้องการ ผสมกับความสนใจที่คุณเลือก · ข้อมูลจริงจาก chulaxl.chula.ac.th</p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="stats-strip">
            <div><div className="k">คอร์สทั้งหมด</div><div className="v">1,901</div><div className="delta">↑ 8 คอร์สใหม่เดือนนี้</div></div>
            <div><div className="k">หมวดวิชาหลัก</div><div className="v">5 หมวด</div><div className="delta">ภาษา · เทคโนโลยี · การจัดการ · ศิลปะ · สุขภาพ</div></div>
            <div><div className="k">ค่าใช้จ่าย</div><div className="v">ฟรีทั้งหมด</div><div className="delta">รวมประกาศนียบัตรอิเล็กทรอนิกส์</div></div>
            <div><div className="k">ที่ว่างเปิดรับ</div><div className="v">15,763</div><div className="delta">↑ พร้อมเริ่มเรียนทันที</div></div>
          </div>

          {/* Featured course */}
          <div className="sub-head">
            <h3><span className="swatch" />คอร์สเด่นประจำสัปดาห์</h3>
            <a href="https://mooc.chula.ac.th/course-all" target="_blank" rel="noopener" className="meta-link">ดูคอร์สใหม่ทั้งหมด →</a>
          </div>

          <Link to={`/course/${toSlug(285, 'ปัญญาประดิษฐ์เชิงสร้างสรรค์และกระบวนการสร้างคำสั่ง')}`} className="featured">
            <div className="featured-cover">
              <img src="https://mooc.chula.ac.th/img/upload/%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%8D%E0%B8%B2%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B4%E0%B8%A9%E0%B8%90%E0%B9%8C%E0%B9%80%E0%B8%8A%E0%B8%B4%E0%B8%87%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87%E0%B8%AA%E0%B8%A3%E0%B8%A3%E0%B8%84%E0%B9%8C%20(%E0%B8%98%E0%B8%AD%E0%B8%AA.).png" alt="" loading="lazy" />
              <span className="badge"><span className="dot" /> คอร์สใหม่</span>
            </div>
            <div className="featured-body">
              <div className="eb">CHULA MOOC × ธนาคารอาคารสงเคราะห์ · CHULAMOOC2654</div>
              <h3>ปัญญาประดิษฐ์เชิงสร้างสรรค์ และกระบวนการสร้างคำสั่ง (Prompt)</h3>
              <p>เรียนรู้การใช้งาน Generative AI เพื่อเพิ่มประสิทธิภาพการทำงาน สร้างสรรค์เนื้อหา และออกแบบ Prompt ที่ตอบโจทย์งานจริง พัฒนาโดยจุฬาฯ ร่วมกับ ธอส.</p>
              <div className="meta">
                <div><div className="k">ระดับ</div><div className="v">เริ่มต้น</div></div>
                <div><div className="k">ภาษา</div><div className="v">ไทย</div></div>
                <div><div className="k">ค่าใช้จ่าย</div><div className="v">ฟรี</div></div>
              </div>
              <div className="cta-row">
                <span className="btn btn-light">ดูรายละเอียด →</span>
                <span className="btn btn-outline-light">ลงทะเบียน</span>
              </div>
            </div>
          </Link>

          {/* All courses browse */}
          <div className="sub-head" style={{ marginTop: 56 }}>
            <h3><span className="swatch" />คอร์สทั้งหมด</h3>
          </div>

          <CourseSearch
            query={query}
            platform={platform}
            total={allFiltered.length}
            onQuery={setQuery}
            onPlatform={setPlatform}
          />

          {loading ? (
            <div className="courses-loading">
              <div className="loading-spinner" />
              <p>กำลังโหลดหลักสูตร…</p>
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-500)' }}>
              <p style={{ marginBottom: 16 }}>ไม่พบหลักสูตรที่ตรงกับการค้นหา</p>
              <button className="btn btn-ghost" onClick={() => { setQuery(''); setPlatform(''); }}>ล้างการกรอง</button>
            </div>
          ) : (
            <>
              <div className="course-grid">
                {courses.map(c => <CourseCard key={c.id || c.href} course={c} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </section>

      {/* ── Personalize ── */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="personalize">
            <div>
              <span className="pz-pill">AI-Powered · เส้นทางส่วนตัว</span>
              <h2>เรียนตามแบบที่ใช่สำหรับคุณ</h2>
              <p>ตอบ 5 คำถามง่ายๆ แล้ว AI ของ ChulaXL จะจัดหลักสูตรที่เหมาะกับเป้าหมายอาชีพ ทักษะปัจจุบัน และเวลาที่คุณมี</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary">เริ่มทำแบบทดสอบ →</button>
              </div>
            </div>
            <div className="pz-quiz">
              <div className="pz-quiz-head">
                <span className="q">แบบทดสอบสั้นๆ</span>
                <span className="step">2 / 5</span>
              </div>
              <div className="pz-quiz-title">เป้าหมายในการเรียนของคุณคืออะไร?</div>
              <div className="pz-options">
                {[['เปลี่ยนสายงาน','🔄'],['เลื่อนตำแหน่ง','📈'],['เก็บหน่วยกิต','🎓'],['เรียนเพื่อตัวเอง','🎯'],['เริ่มทำธุรกิจ','💼'],['Reskill / Upskill','🔁']].map(([label, em]) => (
                  <button key={label} className={`pz-option${label === 'เปลี่ยนสายงาน' ? ' sel' : ''}`}>
                    <span>{em}</span>{label}
                  </button>
                ))}
              </div>
              <div className="pz-quiz-foot">
                <div className="pz-progress">
                  {[0,1,2,3,4].map(i => <span key={i} className={i < 2 ? 'on' : ''} />)}
                </div>
                <button className="btn btn-primary btn-sm">ถัดไป →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Career Paths ── */}
      <section className="block" id="paths" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="block-head">
            <div>
              <span className="section-pill">Career Paths</span>
              <h2>เส้นทางอาชีพ พร้อมประกาศนียบัตรชุด</h2>
              <p className="sub">รวม 4–8 คอร์สที่ออกแบบเป็นชุด เรียนจบแล้วได้ปริญญาบัตรชุดวิชาที่ระบุชัดเจน</p>
            </div>
            <a href="#" className="btn btn-outline btn-sm">ดูทั้งหมด 32 เส้นทาง →</a>
          </div>

          <div className="paths">
            <div className="path-card p-1">
              <span className="path-eyebrow">AI & Data · 6 เดือน</span>
              <h3>Data Scientist สาย Business</h3>
              <p>จาก Excel สู่ Python และ ML — สร้าง portfolio จริงจากโจทย์องค์กรไทย</p>
              <div className="path-modules">
                <div className="path-mod done"><div className="num">✓</div><div className="lbl">Statistics for Decisions</div></div>
                <div className="path-mod done"><div className="num">✓</div><div className="lbl">Python for Data Analysis</div></div>
                <div className="path-mod"><div className="num">3</div><div className="lbl">SQL & Data Warehousing</div></div>
                <div className="path-mod"><div className="num">4</div><div className="lbl">Machine Learning Foundations</div></div>
                <div className="path-mod"><div className="num">5</div><div className="lbl">Capstone Project</div></div>
              </div>
              <div className="path-foot">
                <div className="meta"><strong>2 / 5</strong> โมดูล · เหลือ 14 สัปดาห์</div>
                <button className="btn btn-primary btn-sm">เรียนต่อ →</button>
              </div>
            </div>

            <div className="path-card p-2">
              <span className="path-eyebrow">Business · 5 เดือน</span>
              <h3>Sustainable Business Leader</h3>
              <p>กลยุทธ์ ESG การเงินสีเขียว และการรายงานที่ตรวจสอบได้ตามมาตรฐานสากล</p>
              <div className="path-modules">
                <div className="path-mod"><div className="num">1</div><div className="lbl">ESG Foundations</div></div>
                <div className="path-mod"><div className="num">2</div><div className="lbl">Carbon Accounting</div></div>
                <div className="path-mod"><div className="num">3</div><div className="lbl">Sustainable Finance</div></div>
                <div className="path-mod"><div className="num">4</div><div className="lbl">Stakeholder Engagement</div></div>
                <div className="path-mod"><div className="num">5</div><div className="lbl">Reporting & Assurance</div></div>
              </div>
              <div className="path-foot">
                <div className="meta"><strong>เริ่มต้น</strong> · ใบรับรองชุด</div>
                <button className="btn btn-dark btn-sm">ลงทะเบียน →</button>
              </div>
            </div>

            <div className="path-card p-3">
              <span className="path-eyebrow">Healthcare · 4 เดือน</span>
              <h3>Healthcare Manager 4.0</h3>
              <p>การบริหารงานสาธารณสุขในยุคดิจิทัล จาก Chula Medicine และเครือข่ายโรงพยาบาล</p>
              <div className="path-modules">
                <div className="path-mod"><div className="num">1</div><div className="lbl">Health Systems Thinking</div></div>
                <div className="path-mod"><div className="num">2</div><div className="lbl">Digital Health & Data</div></div>
                <div className="path-mod"><div className="num">3</div><div className="lbl">Operations & Quality</div></div>
                <div className="path-mod"><div className="num">4</div><div className="lbl">Leadership in Crisis</div></div>
              </div>
              <div className="path-foot">
                <div className="meta"><strong>ใหม่</strong> · เปิดรับ ก.ค. 2026</div>
                <button className="btn btn-dark btn-sm">รอบเปิดรับ →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LMS Banner ── */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="lms-banner">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="eyebrow" style={{ background: 'rgba(255,255,255,.15)', borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}>
                <span className="dot" style={{ background: '#fff', boxShadow: '0 0 0 4px rgba(255,255,255,.25)' }} />
                Single Sign-On · เชื่อมต่อระบบเดียวจบ
              </span>
              <h2 style={{ lineHeight: 1.5 }}>เรียนต่อในห้องเรียนของคุณ</h2>
              <p>หลังจากลงทะเบียน คุณจะเข้าถึง LMS — Learning Management System ของจุฬาฯ เพื่อเรียนวิดีโอ ทำแบบฝึกหัด เข้า Live Class และดาวน์โหลดเอกสาร ทั้งหมดในที่เดียว</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="#" className="btn" style={{ background: '#fff', color: 'var(--pink-700)' }}>ไปยัง LMS →</a>
                <a href="#" className="btn" style={{ color: '#fff', border: '1px solid rgba(255,255,255,.4)' }}>ดูคู่มือผู้เรียน</a>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
                {[['วิดีโอ HD','เล่นต่อจากเดิม + คำบรรยายไทย'],['Live & Forum','ถามอาจารย์ ทำกลุ่ม'],['Mobile App','เรียนออฟไลน์ได้']].map(([t,s]) => (
                  <div key={t}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{t}</div>
                    <div style={{ fontSize: 13, opacity: .85 }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lms-mockup">
              <div className="mk-head">
                <div className="mk-dots"><span /><span /><span /></div>
                <div className="mk-title">lms.chulaxl.chula.ac.th · บทที่ 4 — Prompt Patterns</div>
              </div>
              <div className="mk-video">
                <div className="mk-play">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div className="mk-progress"><span /></div>
              <div className="mk-meta">
                <span>26:14 / 40:00</span>
                <span>บทที่ 4 จาก 8</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="block partners" id="partners">
        <div className="wrap">
          <div className="block-head">
            <div>
              <span className="section-pill">Course Partners</span>
              <h2>เรียนจาก 8 คณะของจุฬาฯ ร่วมกับหน่วยงานรัฐ & พันธมิตร</h2>
              <p className="sub">เนื้อหาทุกหลักสูตรผลิตโดยคณาจารย์จุฬาฯ ร่วมกับหน่วยงานรัฐและองค์กรชั้นนำ เพื่อยกระดับทักษะคนไทย</p>
            </div>
            <a href="#" className="btn btn-outline btn-sm">เป็นพันธมิตรกับเรา →</a>
          </div>

          <div className="partner-section-label">คณะของจุฬาฯ</div>
          <div className="partner-grid">
            {CHULA_FACULTIES.map(f => (
              <a key={f.abbr} href="#" className="partner-card">
                <div className="partner-mark" style={{ background: f.bg }}>{f.abbr}</div>
                <div>
                  <div className="partner-name">{f.name}</div>
                  <div className="partner-count">{f.sub}</div>
                </div>
              </a>
            ))}
          </div>

          <div className="partner-section-label" style={{ marginTop: 32 }}>หน่วยงานรัฐ & องค์กรพันธมิตร</div>
          <div className="partner-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            {GOV_PARTNERS.map(p => (
              <a key={p.name} href="#" className="partner-card">
                <div className="partner-mark" style={{ background: p.bg, fontSize: p.fs }}>{p.abbr}</div>
                <div>
                  <div className="partner-name">{p.name}</div>
                  <div className="partner-count">{p.sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
