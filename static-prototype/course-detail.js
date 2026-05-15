// Course detail renderer — reads ?id= and populates template

(function() {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // Get ID from URL, default to 285 (Generative AI featured)
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'), 10) || 285;

  const course = COURSES.find(c => c.id === id) || COURSES[0];
  const detail = COURSE_DETAILS[course.id] || GENERIC_DETAIL;

  // Mock price
  const { price, old } = mockPriceFor(course.id);
  const discount = Math.round(100 - (price / old) * 100);

  // Title
  document.title = course.title + ' · ChulaXL';

  // ─── Breadcrumb ───
  const breadcrumb = [
    { label: 'หน้าแรก', href: 'index.html' },
    { label: course.cat, href: 'index.html#explore' },
    { label: CAT_FACULTY[course.cat] || 'หลักสูตร', href: 'index.html#explore' },
    { label: course.title, current: true },
  ];
  $('breadcrumb').innerHTML = breadcrumb.map((b, i) => {
    const sep = i > 0 ? '<span class="sep">›</span>' : '';
    if (b.current) return `${sep}<span class="current">${esc(b.label)}</span>`;
    return `${sep}<a href="${b.href}">${esc(b.label)}</a>`;
  }).join(' ');

  // ─── Pills ───
  const pills = [];
  pills.push(`<span class="cd-pill cd-pill-cat">${esc(course.cat)}</span>`);
  if (course.partner) pills.push(`<span class="cd-pill cd-pill-partner">CHULA × ${esc(course.partner)}</span>`);
  if (detail.creditEligible) {
    pills.push(`<span class="cd-pill cd-pill-credit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z"/></svg>เก็บ ${detail.creditUnits} หน่วยกิตได้</span>`);
  }
  if (detail.bestseller) pills.push(`<span class="cd-pill cd-pill-best">Bestseller</span>`);
  $('cd-pills').innerHTML = pills.join('');

  // ─── Title, lede ───
  $('cd-title').textContent = course.title;
  $('cd-lede').textContent = detail.subtitle || (detail.description ? detail.description[0] : `เรียนรู้${course.cat} กับอาจารย์จุฬาลงกรณ์มหาวิทยาลัย ในรูปแบบออนไลน์ที่ยืดหยุ่น พร้อมประกาศนียบัตรอิเล็กทรอนิกส์`);

  // ─── Hero meta ───
  const heroMeta = [];
  if (detail.rating) heroMeta.push(`
    <span class="cd-rating">
      <span class="num">${detail.rating}</span>
      <span class="stars">★★★★★</span>
      <span class="count">(${detail.ratingCount || 0} รีวิว)</span>
    </span>
  `);
  if (detail.students) heroMeta.push(`<span class="cd-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> <strong>${detail.students.toLocaleString()}</strong> ผู้เรียน</span>`);
  if (detail.lastUpdated) heroMeta.push(`<span class="cd-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.5 1 6 2.5"/><path d="M21 4v5h-5"/></svg> อัปเดต ${detail.lastUpdated}</span>`);
  heroMeta.push(`<span class="cd-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg> ${detail.language || 'ไทย'}</span>`);
  $('cd-hero-meta').innerHTML = heroMeta.join('');

  // ─── Instructor mention ───
  const instr = detail.instructor;
  if (instr) {
    $('cd-hero-instructor').innerHTML = `สอนโดย <a href="#cd-instr">${esc(instr.name)}</a>`;
  } else {
    $('cd-hero-instructor').innerHTML = `สอนโดย <a href="#">อาจารย์จุฬาลงกรณ์มหาวิทยาลัย</a>`;
  }

  // ─── Video & CTA cover ───
  const coverSrc = courseImgUrl(course.img);
  $('cd-video-img').src = coverSrc;
  $('cd-cta-cover').src = coverSrc;

  // ─── Price row ───
  const priceRow = [
    `<span class="cd-price">฿${price.toLocaleString()}</span>`,
    `<span class="cd-price-old">฿${old.toLocaleString()}</span>`,
    `<span class="cd-price-disc">${discount}% OFF</span>`,
  ];
  $('cd-price-row').innerHTML = priceRow.join('');
  $('cd-urgency').innerHTML = detail.bestseller
    ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> ราคาพิเศษเหลือ 2 วัน · มีผู้ลงทะเบียน ${detail.enrolledRecent || 184} คนใน 24 ชั่วโมง`
    : '';

  // ─── Course includes ───
  const includes = [
    [`M19 4H5c-1 0-2 1-2 2v12c0 1 1 2 2 2h14c1 0 2-1 2-2V6c0-1-1-2-2-2zM10 16V8l6 4z`, `วิดีโอ HD ${detail.duration || '6 ชั่วโมง'}`],
    [`M4 5h16v14H4z M4 9h16`, `${detail.lectures || 24} บทเรียน`],
    [`M9 11l3 3 8-8 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11`, `ประกาศนียบัตรอิเล็กทรอนิกส์`],
    [`M16 18a4 4 0 0 0-8 0 M12 14v-3 M12 2v3 M18 12h2 M4 12H2 M5 5l1.5 1.5 M17.5 5L19 6.5 M5 19l1.5-1.5 M17.5 19L19 17.5`, `เรียนได้ทุกที่ทุกเวลา`],
  ];
  if (detail.creditEligible) {
    includes.unshift([`M12 2l3 7 7 .5-5.5 4.5L18 21l-6-4-6 4 1.5-7L2 9.5 9 9z`, `เก็บได้ ${detail.creditUnits} หน่วยกิต GenEd`]);
  }
  $('cd-includes').innerHTML = includes.map(([d, text]) => `
    <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${d}"/></svg> ${esc(text)}</li>
  `).join('');

  // ─── What you'll learn ───
  const wyl = detail.whatYoullLearn || GENERIC_DETAIL.whatYoullLearn;
  $('cd-wyl').innerHTML = wyl.map(item => `
    <div class="wyl-item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span>${esc(item)}</span>
    </div>
  `).join('');

  // ─── Topics ───
  const topics = detail.topics || [course.cat, 'CHULA MOOC'];
  $('cd-topics').innerHTML = topics.map(t => `<a href="#" class="cd-topic">${esc(t)}</a>`).join('');

  // ─── Curriculum summary + sections ───
  const curriculum = detail.curriculum || [
    { title: 'บทนำ', lectures: 3, duration: '20 นาที', items: [] },
    { title: 'เนื้อหาหลัก', lectures: 8, duration: '1 ชั่วโมง 30 นาที', items: [] },
    { title: 'สรุปและประเมินผล', lectures: 2, duration: '15 นาที', items: [] },
  ];
  const totalLectures = curriculum.reduce((a, s) => a + s.lectures, 0);
  $('cu-summary').innerHTML = `
    <span><strong>${curriculum.length}</strong> หมวด</span>
    <span class="dot-sep" style="width:3px;height:3px;background:var(--ink-300);border-radius:99px;align-self:center;"></span>
    <span><strong>${totalLectures}</strong> บทเรียน</span>
    <span class="dot-sep" style="width:3px;height:3px;background:var(--ink-300);border-radius:99px;align-self:center;"></span>
    <span><strong>${detail.duration || '6 ชั่วโมง'}</strong> รวมเวลาเรียน</span>
    <span style="margin-left:auto; color:var(--pink-700); font-weight:600; cursor:pointer;" onclick="document.querySelectorAll('.cu-section').forEach(s => s.classList.add('open'))">ขยายทุกหมวด</span>
  `;
  $('cu-list').innerHTML = curriculum.map((section, i) => {
    const isOpen = i === 0;
    const items = (section.items || []).map(item => `
      <div class="cu-lec">
        <div class="l">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21"/></svg>
          <span>${esc(item.title)}</span>
          ${item.preview ? '<a href="#" class="preview">▶ ดูตัวอย่าง</a>' : ''}
        </div>
        <span class="dur">${esc(item.dur || '')}</span>
      </div>
    `).join('');
    return `
      <div class="cu-section${isOpen ? ' open' : ''}">
        <div class="cu-head" onclick="this.parentElement.classList.toggle('open')">
          <div class="l">
            <span class="ch">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
            <span>${esc(section.title)}</span>
          </div>
          <div class="r">${section.lectures} บทเรียน · ${section.duration}</div>
        </div>
        ${items ? `<div class="cu-body">${items}</div>` : ''}
      </div>
    `;
  }).join('');

  // ─── Requirements ───
  $('cd-reqs').innerHTML = (detail.requirements || GENERIC_DETAIL.requirements).map(r => `<li>${esc(r)}</li>`).join('');

  // ─── Description ───
  $('cd-desc').innerHTML = (detail.description || GENERIC_DETAIL.description).map(p => `<p>${p}</p>`).join('');

  // ─── Related & also bought helpers ───
  function relatedCardHtml(c) {
    const grad = CAT_GRAD[c.cat] || CAT_GRAD['เทคโนโลยี'];
    const { price, old } = mockPriceFor(c.id);
    return `
      <a href="course-detail.html?id=${c.id}" class="cd-related-card">
        <div class="cover" style="background:${grad}">
          <img src="${courseImgUrl(c.img)}" alt="" loading="lazy" />
          ${c.tags && c.tags.includes('ใหม่') ? '<span class="badge">New</span>' : ''}
          ${c.seats ? '<span class="badge">เปิดรับ</span>' : ''}
        </div>
        <div class="body">
          <div class="t">${esc(c.title)}</div>
          <div class="by">CHULA MOOC${c.partner ? ' × ' + esc(c.partner) : ''}</div>
          <div class="rating"><span class="star">★</span> ${(4.5 + (c.id % 5) / 10).toFixed(1)} · ${(c.id * 37 % 4000 + 800).toLocaleString()} ผู้เรียน</div>
          <div class="price"><span class="old">฿${old.toLocaleString()}</span>฿${price.toLocaleString()}</div>
        </div>
      </a>
    `;
  }

  function pickById(ids) {
    return (ids || []).map(rid => COURSES.find(c => c.id === rid)).filter(Boolean);
  }

  let relatedCourses = pickById(detail.relatedIds);
  if (relatedCourses.length < 4) {
    const fill = COURSES.filter(c => c.id !== course.id && !relatedCourses.includes(c));
    relatedCourses = relatedCourses.concat(fill).slice(0, 4);
  }
  $('cd-related').innerHTML = relatedCourses.map(relatedCardHtml).join('');

  // ─── Students also bought (list-style) ───
  let bought = pickById(detail.boughtIds);
  if (bought.length < 6) {
    const fill = COURSES.filter(c => c.id !== course.id && !bought.includes(c));
    bought = bought.concat(fill).slice(0, 6);
  }
  bought = bought.slice(0, 6);
  $('cd-bought').innerHTML = bought.map((c, i) => {
    const { price, old } = mockPriceFor(c.id);
    return `
      <a href="course-detail.html?id=${c.id}" class="cd-bought-row">
        <div class="img"><img src="${courseImgUrl(c.img)}" alt="" loading="lazy" /></div>
        <div>
          <div class="b-title">${esc(c.title)}</div>
          <div class="b-meta">
            ${i < 2 ? '<span class="bs">Bestseller</span>' : ''}
            <span>★ ${(4.4 + (c.id % 6) / 10).toFixed(1)}</span>
            <span>${(c.id * 53 % 60000 + 800).toLocaleString()} ผู้เรียน</span>
            <span>${(c.id % 12 + 3)} ชั่วโมง</span>
          </div>
        </div>
        <div class="b-price">฿${price.toLocaleString()}</div>
      </a>
    `;
  }).join('');

  // ─── Instructor profile ───
  if (instr) {
    $('cd-instr').innerHTML = `
      <div class="avatar-l" style="background:${instr.gradient || 'linear-gradient(135deg,#5B21B6,#1E3A8A)'}">${esc(instr.initials)}</div>
      <div>
        <div class="name">${esc(instr.name)}</div>
        <div class="role">${esc(instr.role)}</div>
        <div class="instr-stats">
          <span class="s">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 9 22 9.5 16.5 14 18 21 12 17 6 21 7.5 14 2 9.5 9 9"/></svg>
            <span><strong>${instr.rating || 4.8}</strong> Instructor Rating</span>
          </span>
          <span class="s">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></svg>
            <span><strong>${(instr.reviews || 1744).toLocaleString()}</strong> รีวิว</span>
          </span>
          <span class="s">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span><strong>${(instr.students || 12450).toLocaleString()}</strong> ผู้เรียน</span>
          </span>
          <span class="s">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span><strong>${instr.courses || 5}</strong> คอร์ส</span>
          </span>
        </div>
        <p class="instr-bio">${esc(instr.bio)}</p>
      </div>
    `;
  } else {
    $('cd-instr').innerHTML = `
      <div class="avatar-l">CU</div>
      <div>
        <div class="name">อาจารย์จุฬาลงกรณ์มหาวิทยาลัย</div>
        <div class="role">ผู้สอนจาก CHULA MOOC × ${esc(course.partner || 'จุฬาฯ')}</div>
        <p class="instr-bio">อาจารย์ผู้สอนเป็นผู้เชี่ยวชาญในสาขา ${esc(course.cat)} จากจุฬาลงกรณ์มหาวิทยาลัย</p>
      </div>
    `;
  }

  // ─── Reviews ───
  if (detail.rating) {
    $('cd-rating-title').innerHTML = `<span style="color:#F59E0B">★</span> ${detail.rating} เรตติ้งคอร์ส · ${(detail.ratingCount || 0).toLocaleString()} รีวิว`;
  }
  $('rev-summary').innerHTML = `
    <div>
      <div class="big">${detail.rating || 4.8}</div>
      <div class="stars">★★★★★</div>
      <div class="count">เรตติ้งคอร์ส</div>
    </div>
    <div class="rev-bars">
      ${(detail.ratingBreakdown || []).map(r => `
        <div class="rev-bar">
          <span class="star">★</span> ${r.stars}
          <div class="track"><div class="fill" style="width:${r.pct}%"></div></div>
          <span class="pct">${r.pct}%</span>
        </div>
      `).join('')}
    </div>
  `;
  $('rev-list').innerHTML = (detail.reviews || []).map(rev => `
    <div class="rev-card">
      <div class="rev-head">
        <div class="rev-avatar" style="background:${rev.grad}">${esc(rev.initials)}</div>
        <div>
          <div class="rev-name">${esc(rev.name)}</div>
          <div class="rev-rating">${'★'.repeat(rev.stars)}<span style="color:var(--ink-300)">${'★'.repeat(5 - rev.stars)}</span> · <span class="rev-when">${esc(rev.when)}</span></div>
        </div>
      </div>
      <div class="rev-text">${esc(rev.text)}</div>
    </div>
  `).join('');

  // ─── More by instructor ───
  let moreByInstr = pickById(detail.moreByInstructorIds);
  if (moreByInstr.length < 4) {
    const fill = COURSES.filter(c => c.cat === course.cat && c.id !== course.id && !moreByInstr.includes(c));
    moreByInstr = moreByInstr.concat(fill).slice(0, 4);
  }
  $('cd-more-by-instr').innerHTML = moreByInstr.map(relatedCardHtml).join('');

  // ─── Enroll button → simulate going to LMS ───
  $('cd-enroll').addEventListener('click', e => {
    e.preventDefault();
    location.href = 'lms.html?id=' + course.id;
  });
})();
