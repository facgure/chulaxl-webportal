export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand">
              <img
                src="https://d1xutesu22jhtx.cloudfront.net/paas-landing-web/lll-cu-landing/logo/lll-logo.png"
                alt="ChulaXL"
                className="brand-logo"
                style={{ height: 36 }}
              />
            </div>
            <p>แพลตฟอร์มการเรียนรู้ตลอดชีวิตโดย<br />จุฬาลงกรณ์มหาวิทยาลัย</p>
            <div className="foot-social">
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
              </a>
              <a href="#" aria-label="Line">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.105.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
              </a>
            </div>
          </div>
          <div className="foot-col">
            <div className="foot-heading">หลักสูตร</div>
            <a href="#">เทคโนโลยี & AI</a>
            <a href="#">ภาษา</a>
            <a href="#">การจัดการ</a>
            <a href="#">สุขภาพ</a>
            <a href="#">ศิลปะและการพัฒนาตนเอง</a>
          </div>
          <div className="foot-col">
            <div className="foot-heading">เกี่ยวกับ</div>
            <a href="#">เกี่ยวกับ ChulaXL</a>
            <a href="#">พันธมิตร</a>
            <a href="#">สำหรับองค์กร</a>
            <a href="#">ติดต่อเรา</a>
          </div>
          <div className="foot-col">
            <div className="foot-heading">ช่วยเหลือ</div>
            <a href="#">ศูนย์ช่วยเหลือ</a>
            <a href="#">นโยบายความเป็นส่วนตัว</a>
            <a href="#">ข้อกำหนดการใช้งาน</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Chulalongkorn University · ChulaXL Lifelong Learning</span>
        </div>
      </div>
    </footer>
  );
}
