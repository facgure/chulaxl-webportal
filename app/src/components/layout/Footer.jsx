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
              />
            </div>
            <p className="foot-about">แพลตฟอร์มการเรียนรู้ตลอดชีวิตของจุฬาลงกรณ์มหาวิทยาลัย ดำเนินงานโดย Chula XL รวบรวมหลักสูตรที่เปิดให้ทุกคนเข้าถึงความรู้ระดับมหาวิทยาลัยได้ทุกที่ทุกเวลา</p>
            <div className="foot-org">
              วิทยาลัยส่งเสริมการเรียนรู้ตลอดชีวิตเพื่อประชาชนแห่งจุฬาลงกรณ์มหาวิทยาลัย (Chula XL)<br />
              จุฬาลงกรณ์มหาวิทยาลัย ถนนพญาไท แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ 10330<br />
              โทร 02-218-0000 · อีเมล hello@chulaxl.chula.ac.th
            </div>
          </div>

          <div className="foot-col">
            <h4>ผู้เรียน</h4>
            <ul>
              <li><a href="#">เข้าสู่ระบบ / LMS</a></li>
              <li><a href="#">หลักสูตรทั้งหมด</a></li>
              <li><a href="#">เส้นทางอาชีพ</a></li>
              <li><a href="#">ปริญญาบัตรชุดวิชา</a></li>
              <li><a href="#">หลักสูตรฟรี</a></li>
              <li><a href="#">คู่มือผู้เรียน</a></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>องค์กร & พันธมิตร</h4>
            <ul>
              <li><a href="#">ChulaXL for Business</a></li>
              <li><a href="#">เป็นพันธมิตรกับเรา</a></li>
              <li><a href="#">สอน / สร้างคอร์ส</a></li>
              <li><a href="#">ข่าวประชาสัมพันธ์</a></li>
              <li><a href="#">รายงานประจำปี</a></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>เกี่ยวกับเรา</h4>
            <ul>
              <li><a href="#">เกี่ยวกับ ChulaXL</a></li>
              <li><a href="#">วิสัยทัศน์ & พันธกิจ</a></li>
              <li><a href="#">ทีมงาน</a></li>
              <li><a href="#">ร่วมงานกับเรา</a></li>
              <li><a href="#">ติดต่อเรา</a></li>
            </ul>
          </div>

          <div className="foot-col col-extra">
            <h4>ช่วยเหลือ</h4>
            <ul>
              <li><a href="#">ศูนย์ช่วยเหลือ</a></li>
              <li><a href="#">คำถามที่พบบ่อย</a></li>
              <li><a href="#">การชำระเงิน</a></li>
              <li><a href="#">การคืนเงิน</a></li>
              <li><a href="#">รายงานปัญหา</a></li>
            </ul>
          </div>
        </div>

        <div className="foot-partners">
          <div className="foot-partners-head">Course Partners — เครือข่ายผู้ผลิตเนื้อหา</div>
          <div className="foot-partner-grid">
            {['คณะวิศวกรรมศาสตร์','คณะอักษรศาสตร์','คณะพาณิชยศาสตร์และการบัญชี','คณะแพทยศาสตร์',
              'คณะเภสัชศาสตร์','คณะนิติศาสตร์','คณะรัฐศาสตร์','คณะครุศาสตร์',
              'คณะวิทยาศาสตร์','คณะเศรษฐศาสตร์','คณะจิตวิทยา',
              'กระทรวงกลาโหม','ธนาคารอาคารสงเคราะห์ (ธอส.)','กระทรวงวัฒนธรรม'].map(p => (
              <a key={p} href="#">{p}</a>
            ))}
          </div>
        </div>

        <div className="foot-bottom">
          <div>© 2026 จุฬาลงกรณ์มหาวิทยาลัย · ChulaXL · สงวนลิขสิทธิ์</div>
          <div className="links">
            <a href="#">เงื่อนไขการใช้บริการ</a>
            <a href="#">นโยบายความเป็นส่วนตัว</a>
            <a href="#">PDPA</a>
            <a href="#">การเข้าถึง</a>
          </div>
          <div className="foot-social">
            <a href="#" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-9h3l.5-4H13V6.5c0-1 .3-1.7 1.8-1.7H17V1.2C16.6 1.1 15.3 1 13.8 1 10.8 1 8.7 2.9 8.7 6.2V9H5.5v4h3.2v9H13z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5c-.2-1.4-1-2.4-2.4-2.6C18.4 4.5 12 4.5 12 4.5s-6.4 0-8.6.4C2 5.1 1.2 6.1 1 7.5.6 9.7.6 12 .6 12s0 2.3.4 4.5c.2 1.4 1 2.4 2.4 2.6 2.2.4 8.6.4 8.6.4s6.4 0 8.6-.4c1.4-.2 2.2-1.2 2.4-2.6.4-2.2.4-4.5.4-4.5s0-2.3-.4-4.5zM10 15.5v-7l6 3.5-6 3.5z"/></svg>
            </a>
            <a href="#" aria-label="X (Twitter)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 3h2.9l-6.4 7.3L22 21h-5.8l-4.5-5.9L6.3 21H3.4l6.8-7.8L2 3h6l4.1 5.4L18.2 3zm-1 16h1.6L7 4.7H5.2L17.2 19z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
