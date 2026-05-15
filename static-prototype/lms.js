// LMS renderer — populates lms.html from course data

(function() {
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get('id'), 10) || 285;
  const course = COURSES.find(c => c.id === id) || COURSES[0];
  const detail = COURSE_DETAILS[course.id] || GENERIC_DETAIL;

  // Back link to course-detail
  document.getElementById('back-link').href = 'course-detail.html?id=' + course.id;

  // Topbar title
  document.title = course.title + ' · ChulaXL LMS';
  $('topbar-title').textContent = course.title;

  // Video poster
  $('video-poster').src = 'https://mooc.chula.ac.th/img/upload/' + encodeURIComponent(course.img);

  // ─── Sidebar curriculum ───
  const curriculum = detail.curriculum || [
    { title: 'บทนำ', lectures: 3, duration: '20 นาที', items: [{title:'ปฐมนิเทศ', dur:'5:00'}] },
    { title: 'เนื้อหาหลัก', lectures: 8, duration: '1 ชม. 30 น.', items: [] },
    { title: 'สรุปและประเมินผล', lectures: 2, duration: '15 นาที', items: [] },
  ];

  // Inject a quiz lecture into the last section (for the spotlight course)
  if (course.id === 285 && !curriculum.some(s => (s.items||[]).some(i => i.quiz))) {
    const lastSection = curriculum[curriculum.length - 1];
    lastSection.items = (lastSection.items || []).concat([
      { title: 'Quiz: ทดสอบความเข้าใจ Prompt Engineering', dur: '10 นาที', quiz: true },
    ]);
    lastSection.lectures = (lastSection.lectures || 0) + 1;
  }

  // Add fallback items where missing
  curriculum.forEach((sec, si) => {
    if (!sec.items || sec.items.length === 0) {
      sec.items = [];
      const total = sec.lectures || 3;
      for (let i = 0; i < total; i++) {
        sec.items.push({ title: `${sec.title} — บทย่อย ${i + 1}`, dur: '6:30' });
      }
    }
  });

  const totalLectures = curriculum.reduce((a, s) => a + (s.items||[]).length, 0);
  const doneLectures = Math.round(totalLectures * 0.64);

  $('sb-stat').textContent = `${doneLectures}/${totalLectures} บทเรียน · ${detail.duration || '6 ชั่วโมง'}`;

  // Render sections
  let lectureIndex = 0;
  let currentLectureIdx = doneLectures;  // Mark current as 65th
  let allLectures = [];

  $('sb-sections').innerHTML = curriculum.map((sec, si) => {
    const open = si === 0; // open first by default
    const items = (sec.items || []).map((item, ii) => {
      const myIdx = lectureIndex++;
      allLectures.push({ ...item, sectionTitle: sec.title, sectionIdx: si, idx: myIdx });
      const done = myIdx < doneLectures;
      const current = myIdx === doneLectures;
      const isQuiz = !!item.quiz;
      return `
        <div class="sb-lec ${done ? 'done' : ''} ${current ? 'current' : ''}" data-idx="${myIdx}" ${isQuiz ? 'data-quiz="1"' : ''}>
          <span class="check">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </span>
          <div class="info">
            <span class="lec-type ${isQuiz ? 'quiz' : ''}">${isQuiz ? '◆ Quiz' : '▶ บทเรียน'}</span>
            <div class="title">${esc(item.title)}</div>
          </div>
          <span class="dur">${esc(item.dur || '5:00')}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="sb-section${open ? ' open' : ''}" data-section="${si}">
        <div class="sb-section-head">
          <div>
            <div class="sb-section-title">หมวด ${si + 1}: ${esc(sec.title)}</div>
            <div class="sb-section-meta">${sec.lectures} บทเรียน · ${esc(sec.duration || '')}</div>
          </div>
          <span class="sb-section-ch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </div>
        <div class="sb-section-body">${items}</div>
      </div>
    `;
  }).join('');

  // Show current lecture info
  function setCurrentLecture(idx) {
    const lec = allLectures[idx] || allLectures[doneLectures];
    if (!lec) return;
    $('lecture-meta').innerHTML = `
      <span>หมวด ${lec.sectionIdx + 1}</span>
      <span style="opacity:.5">•</span>
      <strong>บทเรียนที่ ${idx + 1} จาก ${allLectures.length}</strong>
    `;
    $('lecture-title').textContent = lec.title;
    $('video-lecture-label').textContent = `บทที่ ${idx + 1} · ${lec.title.slice(0, 40)}${lec.title.length > 40 ? '…' : ''}`;
    $('video-time').textContent = `2:54 / ${lec.dur || '8:04'}`;

    // Update current highlight in sidebar
    document.querySelectorAll('.sb-lec').forEach(el => el.classList.remove('current'));
    const target = document.querySelector(`.sb-lec[data-idx="${idx}"]`);
    if (target) target.classList.add('current');

    // If quiz, open quiz overlay
    if (lec.quiz) openQuiz();
  }

  setCurrentLecture(doneLectures);

  // Section toggle
  document.querySelectorAll('.sb-section-head').forEach(h => {
    h.addEventListener('click', () => h.parentElement.classList.toggle('open'));
  });

  // Lecture click
  document.querySelectorAll('.sb-lec').forEach(el => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx, 10);
      setCurrentLecture(idx);
    });
  });

  // ─── Tabs ───
  document.querySelectorAll('.lms-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.lms-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });

  // ─── Panel: Overview ───
  $('panel-overview').innerHTML = `
    <h3>เกี่ยวกับคอร์สนี้</h3>
    <p>${(detail.description || GENERIC_DETAIL.description).join('</p><p>')}</p>
    <h3 style="margin-top:24px;">สิ่งที่คุณจะได้เรียนรู้</h3>
    <ul style="padding-left:22px;">
      ${(detail.whatYoullLearn || GENERIC_DETAIL.whatYoullLearn).map(x => `<li>${esc(x)}</li>`).join('')}
    </ul>
    <h3 style="margin-top:24px;">คุณสมบัติผู้เรียน</h3>
    <ul style="padding-left:22px;">
      ${(detail.requirements || GENERIC_DETAIL.requirements).map(x => `<li>${esc(x)}</li>`).join('')}
    </ul>
  `;

  // ─── Panel: Q&A ───
  const qaItems = [
    { name: 'Eugene', initials: 'EU', grad: '#0F766E', when: '2 วันที่แล้ว', q: 'ในตัวอย่าง Prompt ที่อาจารย์ใช้กับ ChatGPT ใช้ template ไหนเป็นพิเศษไหมครับ?', a: 'ขอบคุณสำหรับคำถามครับ ในบทนี้ใช้รูปแบบ "Role-Context-Task-Format" ลองดูเอกสารแนบในบทที่ 3 จะมีตารางสรุปครับ — รศ.ดร.อติวงศ์' },
    { name: 'Sandip', initials: 'SA', grad: '#C2410C', when: '5 วันที่แล้ว', q: 'ถ้าใช้ Gemini แทน ChatGPT จะต้องปรับ prompt อย่างไรครับ?', a: 'หลักการเดียวกันครับ Gemini รับ context ได้ยาวกว่า — คุณส่ง document ขนาดใหญ่ได้เลย แต่ขอเน้น Format ให้ชัดขึ้น' },
    { name: 'Tim', initials: 'TI', grad: '#DC2626', when: '1 สัปดาห์ที่แล้ว', q: 'อยากทราบว่า certificate ที่ได้นำไปยื่นในเรซูเม่ได้เลยไหมครับ?', a: 'ได้เลยครับ Certificate เป็น Verified จุฬาฯ มี QR สำหรับตรวจสอบ' },
  ];
  $('panel-qa').innerHTML = `
    <h3>คำถามและคำตอบ (${qaItems.length} คำถาม)</h3>
    <p style="margin-bottom:18px;">ถามอาจารย์ผู้สอนหรือเพื่อนผู้เรียนได้เสมอ คำตอบจะส่งให้คุณทางอีเมล</p>
    ${qaItems.map(q => `
      <div class="qa-item">
        <div class="qa-avatar" style="background:${q.grad}">${esc(q.initials)}</div>
        <div class="qa-body">
          <div class="qa-name">${esc(q.name)}</div>
          <div class="qa-when">${esc(q.when)}</div>
          <div class="qa-q">${esc(q.q)}</div>
          <div class="qa-a"><strong>ตอบโดยอาจารย์:</strong> ${esc(q.a)}</div>
        </div>
      </div>
    `).join('')}
  `;

  // ─── Panel: Notes ───
  function renderNotes() {
    const notes = JSON.parse(localStorage.getItem('lms-notes-' + course.id) || '[]');
    $('panel-notes').innerHTML = `
      <h3>โน้ตของฉัน (${notes.length})</h3>
      <p>เพิ่มโน้ตที่จุดที่ดูอยู่ในวิดีโอ — โน้ตจะบันทึกพร้อม timestamp</p>
      <textarea class="notes-input" id="note-text" placeholder="พิมพ์โน้ตที่จุดเวลานี้…"></textarea>
      <button class="btn btn-primary btn-sm" onclick="window.saveNote()">บันทึกโน้ต</button>
      <div style="margin-top:24px;">
        ${notes.length === 0 ? '<p style="color:var(--ink-500); font-style:italic;">ยังไม่มีโน้ต — เริ่มจดได้เลย</p>' : ''}
        ${notes.map(n => `
          <div class="note-card">
            <div class="ts">${esc(n.ts)} · ${esc(n.lecture || '')}</div>
            <div class="text">${esc(n.text)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
  renderNotes();

  window.saveNote = function() {
    const text = $('note-text').value.trim();
    if (!text) return;
    const notes = JSON.parse(localStorage.getItem('lms-notes-' + course.id) || '[]');
    const currentLec = document.querySelector('.sb-lec.current .title');
    notes.unshift({
      ts: $('video-time').textContent.split(' / ')[0],
      lecture: currentLec ? currentLec.textContent : '',
      text: text,
    });
    localStorage.setItem('lms-notes-' + course.id, JSON.stringify(notes));
    renderNotes();
  };
  window.addNote = function() {
    document.querySelector('.lms-tab[data-tab="notes"]').click();
    setTimeout(() => $('note-text').focus(), 100);
  };

  // ─── Panel: Announcements ───
  $('panel-ann').innerHTML = `
    <h3>ประกาศจากผู้สอน</h3>
    <div class="ann-card">
      <div class="ann-head">
        <div class="qa-avatar" style="background:linear-gradient(135deg,#5B21B6,#1E3A8A); width:36px; height:36px;">อต</div>
        <div>
          <div style="font-weight:700; font-size:14px;">รศ.ดร.อติวงศ์ สุชาโต</div>
          <div class="ann-when">โพสต์ 3 วันที่แล้ว</div>
        </div>
      </div>
      <div class="ann-title">📚 อัปเดตเอกสารบทที่ 4 — เทคนิค Chain-of-Thought</div>
      <div class="ann-body">สวัสดีครับทุกคน ผมได้อัปเดตเอกสารบทที่ 4 เพิ่มเติมตัวอย่าง Chain-of-Thought prompting สำหรับงานวิเคราะห์ข้อมูล กรุณาดาวน์โหลดเอกสารใหม่ในแท็บ "เครื่องมือเรียน" ครับ</div>
    </div>
    <div class="ann-card">
      <div class="ann-head">
        <div class="qa-avatar" style="background:linear-gradient(135deg,#5B21B6,#1E3A8A); width:36px; height:36px;">อต</div>
        <div>
          <div style="font-weight:700; font-size:14px;">รศ.ดร.อติวงศ์ สุชาโต</div>
          <div class="ann-when">โพสต์ 1 สัปดาห์ที่แล้ว</div>
        </div>
      </div>
      <div class="ann-title">🎯 Live Q&A วันอาทิตย์นี้ 20:00 น.</div>
      <div class="ann-body">ขอเชิญผู้เรียนทุกท่านเข้าร่วม Live Q&amp;A ผ่าน Zoom วันอาทิตย์ที่ 18 พ.ค. เวลา 20:00–21:00 น. จะตอบคำถามทุกประเด็นเกี่ยวกับ Prompt Engineering และนำตัวอย่างจริงในองค์กรมาพูดคุยครับ</div>
    </div>
    <div class="ann-card">
      <div class="ann-head">
        <div class="qa-avatar" style="background:linear-gradient(135deg,#5B21B6,#1E3A8A); width:36px; height:36px;">อต</div>
        <div>
          <div style="font-weight:700; font-size:14px;">รศ.ดร.อติวงศ์ สุชาโต</div>
          <div class="ann-when">โพสต์ 2 สัปดาห์ที่แล้ว</div>
        </div>
      </div>
      <div class="ann-title">🚀 ยินดีต้อนรับสู่คอร์ส!</div>
      <div class="ann-body">ขอขอบคุณที่ลงทะเบียนครับ คอร์สนี้จะใช้ ChatGPT และ Gemini เป็นเครื่องมือหลัก ขอให้เตรียมบัญชีฟรีไว้ก่อนเริ่มเรียน ขอให้สนุกและได้ประโยชน์เต็มที่นะครับ</div>
    </div>
  `;

  // ─── Panel: Reviews ───
  $('panel-reviews').innerHTML = `
    <h3>${detail.rating || 4.8} ★ จาก ${(detail.ratingCount || 0).toLocaleString()} รีวิว</h3>
    <p>คะแนนเฉลี่ยจากผู้เรียนที่จบคอร์ส</p>
    ${(detail.reviews || []).map(r => `
      <div class="qa-item">
        <div class="qa-avatar" style="background:${r.grad}">${esc(r.initials)}</div>
        <div class="qa-body">
          <div class="qa-name">${esc(r.name)}</div>
          <div class="qa-when">${'★'.repeat(r.stars)}<span style="color:var(--ink-300)">${'★'.repeat(5 - r.stars)}</span> · ${esc(r.when)}</div>
          <div class="qa-q" style="font-weight:400; color:var(--ink-700);">${esc(r.text)}</div>
        </div>
      </div>
    `).join('')}
  `;

  // ─── Panel: Learning tools ───
  $('panel-tools').innerHTML = `
    <h3>เครื่องมือเรียน</h3>
    <p style="margin-bottom:20px;">เอกสาร สไลด์ และทรัพยากรประกอบการเรียน</p>
    <div class="tools-grid">
      <a href="#" class="tool-card">
        <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
        <div><div class="name">สไลด์บทที่ 4.pdf</div><div class="sub">2.4 MB · อัปเดต 3 วันที่แล้ว</div></div>
      </a>
      <a href="#" class="tool-card">
        <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
        <div><div class="name">Prompt Templates รวม.docx</div><div class="sub">120 KB</div></div>
      </a>
      <a href="#" class="tool-card">
        <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg></span>
        <div><div class="name">บันทึกการเรียนทั้งคอร์ส</div><div class="sub">ดาวน์โหลด PDF</div></div>
      </a>
      <a href="#" class="tool-card">
        <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/><path d="M9 9h6v6H9z"/></svg></span>
        <div><div class="name">Worksheet ฝึกเขียน Prompt</div><div class="sub">.xlsx · 1.2 MB</div></div>
      </a>
      <a href="#" class="tool-card">
        <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a14 14 0 0 1 0 20M12 2a14 14 0 0 0 0 20"/></svg></span>
        <div><div class="name">Transcript (TH/EN)</div><div class="sub">คำบรรยายเต็มเรื่อง</div></div>
      </a>
      <a href="#" class="tool-card">
        <span class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15 9 22 9.5 16.5 14 18 21 12 17 6 21 7.5 14 2 9.5 9 9"/></svg></span>
        <div><div class="name">e-Certificate</div><div class="sub">ดาวน์โหลดเมื่อเรียนจบ</div></div>
      </a>
    </div>
  `;

  // ─── QUIZ ───
  const QUIZ = {
    title: 'ทดสอบความเข้าใจ Prompt Engineering',
    meta: '5 ข้อ · 10 นาที · ผ่าน 60%',
    questions: [
      {
        q: 'หลักการสำคัญที่สุดในการเขียน Prompt ที่ดีคืออะไร?',
        opts: [
          'ใช้คำศัพท์ทางเทคนิคให้มากที่สุด',
          'กำหนด Role, Context และ Format ที่ชัดเจน',
          'ใช้คำสั่งสั้น ๆ ไม่กี่คำเพื่อให้ AI ตีความเอง',
          'ใช้ภาษาอังกฤษเสมอ เพราะ AI เข้าใจดีกว่า',
        ],
        correct: 1,
        explain: 'การกำหนด Role, Context และ Format ที่ชัดเจนช่วยให้ AI เข้าใจขอบเขตและเป้าหมายของงาน ทำให้ผลลัพธ์ตรงกับความต้องการมากขึ้น',
      },
      {
        q: 'เทคนิค "Chain-of-Thought" หมายถึงอะไร?',
        opts: [
          'การให้ AI สร้างห่วงโซ่อาหารโดยอัตโนมัติ',
          'การเขียน Prompt ที่กำหนดให้ AI แสดงขั้นตอนการคิดทีละขั้น',
          'การเชื่อม Prompt หลายอันต่อเนื่องกัน',
          'การสร้าง chatbot ที่จำการสนทนาก่อนหน้า',
        ],
        correct: 1,
        explain: 'Chain-of-Thought คือเทคนิคขอให้ AI "คิดออกเสียง" ทีละขั้น ช่วยให้คุณตรวจสอบเหตุผลและได้คำตอบที่แม่นยำขึ้น โดยเฉพาะในงานคณิตศาสตร์และตรรกะ',
      },
      {
        q: 'ข้อใด <strong>ไม่ใช่</strong> ข้อจำกัดของ Generative AI ที่ผู้บริหารควรทราบ?',
        opts: [
          'อาจสร้างข้อมูลเท็จที่ดูสมจริง (hallucination)',
          'ความรู้มีขีดจำกัดตามวันที่ training',
          'ไม่สามารถประมวลผลข้อมูลภาษาไทยได้เลย',
          'ผลลัพธ์อาจไม่คงที่ในแต่ละครั้ง',
        ],
        correct: 2,
        explain: 'AI สมัยใหม่รองรับภาษาไทยได้ดี — ทั้ง ChatGPT, Gemini และ Claude ส่วน hallucination, knowledge cutoff และความไม่คงที่ (non-determinism) เป็นข้อจำกัดจริงที่ต้องระวัง',
      },
      {
        q: 'หากต้องการให้ AI สรุปเอกสารยาว 50 หน้าเป็น 5 หัวข้อ ควรระบุอะไรใน Prompt บ้าง?',
        opts: [
          'แค่บอกว่า "สรุปให้หน่อย"',
          'ระบุจำนวนหัวข้อ, รูปแบบ output (bullet/heading), กลุ่มผู้อ่าน, และจุดประสงค์',
          'ส่งเอกสารไปเฉย ๆ',
          'ใช้คำสั่งภาษาอังกฤษเสมอ',
        ],
        correct: 1,
        explain: 'การระบุ output format, audience, purpose และข้อจำกัด (เช่น "5 หัวข้อ") ช่วยให้ได้ผลลัพธ์ที่ใช้งานได้จริง — เป็นหลักการ "Specific Prompting"',
      },
      {
        q: 'องค์กรควรกำกับดูแลการใช้ AI ของพนักงานอย่างไร?',
        opts: [
          'ห้ามใช้ทุกกรณี เพราะมีความเสี่ยง',
          'อนุญาตให้ใช้ได้ทุกอย่างโดยไม่จำกัด',
          'มีนโยบายการใช้ที่ชัดเจน + ห้ามใส่ข้อมูลลับ + ตรวจสอบผลลัพธ์ก่อนใช้',
          'ใช้ AI แทนการตัดสินใจของมนุษย์ในทุกขั้นตอน',
        ],
        correct: 2,
        explain: 'แนวทางที่ดีคือ "Human-in-the-loop" — มีนโยบายชัดเจน ห้ามใส่ PII/ข้อมูลลับ ตรวจสอบ output ก่อนใช้ และให้คนเป็นผู้ตัดสินใจสุดท้ายเสมอ',
      },
    ],
  };

  let quizState = { qi: 0, answers: [], showFeedback: false };

  function renderQuiz() {
    const modal = $('quiz-modal');
    if (quizState.qi >= QUIZ.questions.length) {
      // Result screen
      const correct = quizState.answers.filter((a, i) => a === QUIZ.questions[i].correct).length;
      const pct = Math.round((correct / QUIZ.questions.length) * 100);
      const pass = pct >= 60;
      modal.innerHTML = `
        <div class="quiz-result">
          <div class="badge-big ${pass ? 'pass' : 'fail'}">${pass ? '🎉' : '💪'}</div>
          <h3>${pass ? 'ยินดีด้วย! คุณผ่าน Quiz' : 'ลองอีกครั้งนะ'}</h3>
          <div class="score">คุณตอบถูก <strong>${correct}/${QUIZ.questions.length}</strong> ข้อ · ${pct}%</div>
          <div class="actions">
            <button class="btn btn-outline" onclick="window.lmsRetryQuiz()">ลองทำใหม่</button>
            <button class="btn btn-primary" onclick="window.lmsCloseQuiz()">${pass ? 'เรียนต่อ →' : 'กลับไปเรียน'}</button>
          </div>
        </div>
      `;
      return;
    }
    const q = QUIZ.questions[quizState.qi];
    const userAnswer = quizState.answers[quizState.qi];
    const sf = quizState.showFeedback;
    const pct = ((quizState.qi + (sf ? 1 : 0)) / QUIZ.questions.length) * 100;

    modal.innerHTML = `
      <div class="quiz-head">
        <div>
          <h2>${esc(QUIZ.title)}</h2>
          <div class="meta">${esc(QUIZ.meta)}</div>
        </div>
        <button class="quiz-close" onclick="window.lmsCloseQuiz()" aria-label="ปิด">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="quiz-progress">
        <span>คำถามที่ ${quizState.qi + 1} / ${QUIZ.questions.length}</span>
        <div class="bar"><span style="width:${pct}%"></span></div>
      </div>
      <div class="quiz-body">
        <div class="quiz-q">${q.q}</div>
        <div class="quiz-opts">
          ${q.opts.map((opt, oi) => {
            let cls = '';
            if (sf) {
              if (oi === q.correct) cls = 'correct';
              else if (oi === userAnswer) cls = 'wrong';
              cls += ' locked';
            } else if (oi === userAnswer) {
              cls = 'selected';
            }
            const fbIcon = sf
              ? (oi === q.correct ? '<span class="fb">✓</span>' : (oi === userAnswer ? '<span class="fb">✗</span>' : ''))
              : '';
            return `
              <button class="quiz-opt ${cls}" data-pick="${oi}" ${sf ? 'disabled' : ''}>
                <span class="letter">${String.fromCharCode(65 + oi)}</span>
                <span>${opt}</span>
                ${fbIcon}
              </button>
            `;
          }).join('')}
        </div>
        <div class="quiz-explanation ${sf ? 'show' : ''}">
          <strong>คำอธิบาย:</strong> ${esc(q.explain)}
        </div>
      </div>
      <div class="quiz-foot">
        <button class="skip" onclick="window.lmsCloseQuiz()">ปิด</button>
        <button class="btn btn-primary" onclick="window.lmsQuizNext()" ${userAnswer === undefined && !sf ? 'disabled style="opacity:.4; cursor:not-allowed;"' : ''}>
          ${sf ? (quizState.qi === QUIZ.questions.length - 1 ? 'ดูผล →' : 'ข้อถัดไป →') : 'ตอบ'}
        </button>
      </div>
    `;

    // Attach option clicks
    modal.querySelectorAll('.quiz-opt[data-pick]').forEach(b => {
      b.addEventListener('click', () => {
        if (sf) return;
        quizState.answers[quizState.qi] = parseInt(b.dataset.pick, 10);
        renderQuiz();
      });
    });
  }

  function openQuiz() {
    quizState = { qi: 0, answers: [], showFeedback: false };
    $('quiz-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderQuiz();
  }
  window.lmsCloseQuiz = function() {
    $('quiz-overlay').classList.remove('open');
    document.body.style.overflow = '';
  };
  window.lmsQuizNext = function() {
    if (quizState.answers[quizState.qi] === undefined) return;
    if (!quizState.showFeedback) {
      quizState.showFeedback = true;
    } else {
      quizState.qi++;
      quizState.showFeedback = false;
    }
    renderQuiz();
  };
  window.lmsRetryQuiz = function() {
    quizState = { qi: 0, answers: [], showFeedback: false };
    renderQuiz();
  };

  // Escape closes overlay
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('quiz-overlay').classList.contains('open')) window.lmsCloseQuiz();
  });

})();
