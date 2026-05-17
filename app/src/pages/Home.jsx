import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../hooks/useCourses';
import CourseCard from '../components/course/CourseCard';
import CourseSearch from '../components/course/CourseSearch';
import Pagination from '../components/course/Pagination';
import { toSlug } from '../utils/slug';

// Featured course data (the 3 hero courses + spotlight)
const HERO_COURSES = [
  { id: 285, cat: 'เทคโนโลยี', tag: 'คอร์สใหม่', name: 'ปัญญาประดิษฐ์เชิงสร้างสรรค์และกระบวนการสร้างคำสั่ง', meta: 'CHULA MOOC · ธอส.', img: 'https://mooc.chula.ac.th/img/upload/%E0%B8%9B%E0%B8%B1%E0%B8%8D%E0%B8%8D%E0%B8%B2%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B4%E0%B8%A9%E0%B8%90%E0%B9%8C%E0%B9%80%E0%B8%8A%E0%B8%B4%E0%B8%87%E0%B8%AA%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%87%E0%B8%AA%E0%B8%A3%E0%B8%A3%E0%B8%84%E0%B9%8C%20(%E0%B8%98%E0%B8%AD%E0%B8%AA.).png' },
  { id: 283, cat: 'เทคโนโลยี', tag: 'เปิดรับสมัคร', name: 'ไฟฟ้าที่เราใช้มาจากไหน', seats: '4,354 ที่ว่าง', img: 'https://mooc.chula.ac.th/img/upload/%E0%B9%84%E0%B8%9F%E0%B8%9F%E0%B9%89%E0%B8%B2%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B9%80%E0%B8%A3%E0%B8%B2%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B8%A1%E0%B8%B2%E0%B8%88%E0%B8%B2%E0%B8%81%E0%B9%84%E0%B8%AB%E0%B8%99.png' },
  { id: 280, cat: 'ภาษา', tag: 'ญี่ปุ่น', name: 'คู่คิดคันจิไฟนอลไฟต์', seats: '3,844 ที่ว่าง', img: 'https://mooc.chula.ac.th/img/upload/%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%84%E0%B8%B4%E0%B8%94%E0%B8%84%E0%B8%B1%E0%B8%99%E0%B8%88%E0%B8%B4%E0%B9%84%E0%B8%9F%E0%B8%99%E0%B8%AD%E0%B8%A5%E0%B9%84%E0%B8%9F%E0%B8%95%E0%B9%8C.png' },
];

const STATS = [
  { num: '1,247', label: 'หลักสูตรทั้งหมด' },
  { num: '380K+', label: 'ผู้เรียนสะสม' },
  { num: '96%', label: 'ความพึงพอใจ' },
  { num: '19', label: 'คณะ + พันธมิตร' },
];

export default function Home() {
  const { courses, allFiltered, totalPages, page, loading, query, platform, setQuery, setPlatform, setPage } = useCourses();
  const exploreRef = useRef(null);

  function handleHeroSearch(e) {
    e.preventDefault();
    const q = e.target.querySelector('input').value.trim();
    if (q) { setQuery(q); }
    exploreRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

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
                    <div className="hc-cat">{c.cat} · {c.tag}</div>
                    <div className="hc-name">{c.name}</div>
                    <div className="hc-info-meta">
                      {c.seats ? <span className="seats">{c.seats}</span> : <span>{c.meta}</span>}
                    </div>
                  </div>
                  <div className="hc-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── All Courses ── */}
      <section className="all-courses" id="explore" ref={exploreRef}>
        <div className="wrap">
          <div className="block-head">
            <div className="section-pill">สำรวจหลักสูตร</div>
            <h2>คอร์สเรียนทั้งหมด</h2>
            <p className="sub">เลือกเรียนตามความสนใจจากแพลตฟอร์มพันธมิตรหลายแห่ง</p>
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
            <div className="all-courses-empty" style={{ display: 'block' }}>
              <p>ไม่พบหลักสูตรที่ตรงกับการค้นหา</p>
              <button className="btn btn-ghost" onClick={() => { setQuery(''); setPlatform(''); }}>ล้างการกรอง</button>
            </div>
          ) : (
            <>
              <div className="course-grid" id="all-courses-grid">
                {courses.map(c => <CourseCard key={c.id || c.href} course={c} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
