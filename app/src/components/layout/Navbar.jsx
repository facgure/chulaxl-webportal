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
      if (loginOpen && !e.target.closest('.modal-box')) {
        setLoginOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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

          <div className="nav-search" ref={searchRef}>
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
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLoginOpen(false)}>✕</button>
            <div className="modal-tabs">
              <button className={loginTab === 'login' ? 'active' : ''} onClick={() => setLoginTab('login')}>เข้าสู่ระบบ</button>
              <button className={loginTab === 'signup' ? 'active' : ''} onClick={() => setLoginTab('signup')}>สมัครสมาชิก</button>
            </div>
            <div className="modal-body">
              <p style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 14 }}>
                {loginTab === 'login' ? 'ระบบเข้าสู่ระบบ (Prototype)' : 'ระบบสมัครสมาชิก (Prototype)'}
              </p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>
                {loginTab === 'login' ? 'เข้าสู่ระบบด้วย ThaID' : 'สมัครด้วย ThaID'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
