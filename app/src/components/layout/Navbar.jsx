import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginTab, setLoginTab] = useState('login');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (loginOpen && !e.target.closest('.modal')) {
        setLoginOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [loginOpen]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setLoginOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = loginOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [loginOpen]);

  return (
    <>
      <div className="search-backdrop" style={{ opacity: searchFocused ? 1 : 0, pointerEvents: searchFocused ? 'auto' : 'none' }} />

      <header className="site-header">
        <div className="wrap nav">
          <Link to="/" className="brand">
            <img
              src="https://d1xutesu22jhtx.cloudfront.net/paas-landing-web/lll-cu-landing/logo/lll-logo.png"
              alt="ChulaXL"
              className="brand-logo"
            />
          </Link>

          <nav className="nav-links">
            <Link to="/" className="nav-link">สำรวจหลักสูตร</Link>
            <a href="#paths" className="nav-link">เส้นทางอาชีพ</a>
            <a href="#partners" className="nav-link">พันธมิตร</a>
            <a href="#corporate" className="nav-link">สำหรับองค์กร</a>
          </nav>

          <div className={`nav-search${searchFocused ? ' open' : ''}`} ref={searchRef}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
            </svg>
            <input
              type="search"
              placeholder="ค้นหาหลักสูตร ทักษะ หรืออาจารย์ผู้สอน…"
              onFocus={() => setSearchFocused(true)}
            />
            {searchFocused && (
              <div className="search-flyout">
                <div className="sf-section">
                  <div className="sf-label">ฮอตใน CHULA MOOC</div>
                  <div className="sf-chips">
                    {['AI', 'Python', 'ภาษาอังกฤษ', 'PDPA', 'การลงทุน', 'ESG', 'Cloud Computing', 'Design Thinking'].map(c => (
                      <a key={c} href="#" className="sf-chip">{c}</a>
                    ))}
                  </div>
                </div>
                <div className="sf-foot">
                  <span className="q">ไม่รู้จะเริ่มจากตรงไหน?</span>
                  <a href="#">ทำแบบทดสอบสั้น ๆ →</a>
                </div>
              </div>
            )}
          </div>

          <div className="nav-actions">
            <div className="lang-toggle">
              <button className="active">ไทย</button>
              <button>EN</button>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setLoginTab('login'); setLoginOpen(true); }}>
              เข้าสู่ระบบ
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setLoginTab('signup'); setLoginOpen(true); }}>
              สมัครเรียนฟรี
            </button>
          </div>
        </div>
      </header>

      {loginOpen && (
        <div className="modal-overlay" onClick={() => setLoginOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLoginOpen(false)} aria-label="ปิด">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </button>

            <div className="modal-head">
              <div className="brand-mark">CX</div>
              <h2>{loginTab === 'signup' ? 'สมัครสมาชิก ChulaXL' : 'เข้าสู่ระบบ ChulaXL'}</h2>
              <p>เริ่มเรียนต่อจากเดิม หรือสมัครเรียนหลักสูตรใหม่</p>
            </div>

            <div className="modal-tabs">
              <button className={`modal-tab${loginTab === 'login' ? ' active' : ''}`} onClick={() => setLoginTab('login')}>เข้าสู่ระบบ</button>
              <button className={`modal-tab${loginTab === 'signup' ? ' active' : ''}`} onClick={() => setLoginTab('signup')}>สมัครสมาชิก</button>
            </div>

            <div className="modal-body">
              <button className="social-btn thaid" style={{ width: '100%', marginBottom: 4 }}>
                <span className="glyph sb-thaid">ThaID</span>
                <div style={{ textAlign: 'left' }}>
                  <div>{loginTab === 'login' ? 'เข้าสู่ระบบด้วย ThaID' : 'สมัครด้วย ThaID'}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-500)', fontWeight: 500 }}>ยืนยันตัวตนของรัฐ · ปลอดภัยที่สุด</div>
                </div>
                <span className="badge">Recommended</span>
              </button>

              <div className="divider">หรือใช้ Social Network</div>

              <div className="social-grid">
                <button className="social-btn">
                  <span className="glyph" style={{ background: '#fff', border: '1px solid #e5e7eb' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.5 12.2c0-.7 0-1.4-.2-2H12v3.8h5.4c-.2 1.2-1 2.3-2 3v2.5h3.3c2-1.8 3-4.5 3-7.3z"/><path fill="#34A853" d="M12 22c2.7 0 5-1 6.7-2.5l-3.3-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6C4.7 19.7 8.1 22 12 22z"/><path fill="#FBBC05" d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3c-.7 1.3-1 2.8-1 4.4s.4 3.1 1 4.4l3.4-2.6z"/><path fill="#EA4335" d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.7 14.7 2 12 2 8.1 2 4.7 4.3 3 7.6l3.4 2.6C7.2 7.6 9.4 5.8 12 5.8z"/></svg>
                  </span>
                  เข้าสู่ระบบด้วย Google
                </button>
                <button className="social-btn">
                  <span className="glyph sb-fb">f</span>
                  เข้าสู่ระบบด้วย Facebook
                </button>
                <button className="social-btn">
                  <span className="glyph sb-line">L</span>
                  เข้าสู่ระบบด้วย LINE
                </button>
                <button className="social-btn">
                  <span className="glyph sb-apple">
                    <svg width="12" height="14" viewBox="0 0 24 28" fill="white"><path d="M20.5 14.8c0-3.4 2.8-5 2.9-5.1-1.6-2.3-4-2.6-4.9-2.6-2.1-.2-4 1.2-5.1 1.2-1 0-2.7-1.2-4.4-1.1-2.3.03-4.4 1.3-5.5 3.4-2.4 4.1-.6 10.1 1.7 13.4 1.1 1.6 2.4 3.4 4.2 3.3 1.7-.07 2.3-1.1 4.3-1.1 2 0 2.6 1.1 4.4 1 1.8-.03 2.9-1.6 4-3.2 1.3-1.8 1.8-3.6 1.8-3.7-.04-.01-3.4-1.3-3.4-5.2z"/><path d="M17 5.3c.9-1.1 1.5-2.6 1.3-4.1-1.3.05-2.8.9-3.7 1.9-.8.9-1.5 2.4-1.3 3.8 1.4.1 2.9-.7 3.7-1.6z"/></svg>
                  </span>
                  เข้าสู่ระบบด้วย Apple
                </button>
              </div>

              <div className="divider">หรือใช้อีเมล</div>

              <div className="input-group">
                <label>อีเมล</label>
                <input type="email" placeholder="you@example.com" />
              </div>
              <div className="input-group">
                <label>รหัสผ่าน</label>
                <input type="password" placeholder="••••••••" />
              </div>

              <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 6 }}>
                {loginTab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>

              <div className="modal-foot">
                การใช้งานหมายความว่าคุณยอมรับ <a href="#">เงื่อนไขการใช้บริการ</a> และ <a href="#">นโยบายความเป็นส่วนตัว</a> ของ ChulaXL
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
