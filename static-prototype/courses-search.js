(function () {
  'use strict';

  // ─── State ───────────────────────────────────────────────────
  let allCourses = [];
  let filteredCourses = [];
  let currentPage = 1;
  let currentQuery = '';
  let currentPlatform = '';
  const PAGE_SIZE = 24;

  // ─── Platform colours ────────────────────────────────────────
  const PLATFORM_GRAD = {
    'CU MOOC':          'linear-gradient(135deg,#7A0040 0%,#9E0056 100%)',
    'Degree+':          'linear-gradient(135deg,#0369A1 0%,#1E3A8A 100%)',
    'MyCourseVille':    'linear-gradient(135deg,#5B21B6 0%,#8B5CF6 100%)',
    'Google Sites':     'linear-gradient(135deg,#0F766E 0%,#06B6D4 100%)',
    'CU Neuron':        'linear-gradient(135deg,#1E3A8A 0%,#5B21B6 100%)',
    'MedUMore':         'linear-gradient(135deg,#DC2626 0%,#F59E0B 100%)',
    'CBS Academy':      'linear-gradient(135deg,#047857 0%,#1E3A8A 100%)',
    'Lifelong Learning':'linear-gradient(135deg,#7C2D12 0%,#EAB308 100%)',
    'External':         'linear-gradient(135deg,#374151 0%,#6B7280 100%)',
  };

  function platformGrad(platform) {
    return PLATFORM_GRAD[platform] || 'linear-gradient(135deg,#1E3A8A 0%,#5B21B6 100%)';
  }

  function esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ─── Card renderer ───────────────────────────────────────────
  function courseCardHtml(c) {
    const grad = platformGrad(c.platform);
    const initial = (c.platform || 'C').charAt(0);
    // Strip "Platform — " prefix from section (e.g. "MedUMore — ทั่วไป" → "ทั่วไป")
    const rawSection = c.section || '';
    const section = esc(rawSection.replace(/^[^—]+—\s*/, ''));
    const title = esc(c.title || '');
    const base = parseFloat((c.price && c.price.base) || 0) || 0;
    const sale = parseFloat((c.price && c.price.sale) || 0) || 0;
    const isFree = base === 0 && sale === 0;
    const instructor = c.instructors && c.instructors[0] ? esc(c.instructors[0].name) : '';
    const href = esc(c.href || '#');
    const imgHtml = c.coverImageUrl
      ? `<img class="cover-img" src="${esc(c.coverImageUrl)}" alt="" loading="lazy" onerror="this.style.display='none'" />`
      : '';
    const priceLabel = isFree ? 'ฟรี' : `${(sale || base).toLocaleString()} ฿`;

    return `
      <a href="${href}" target="_blank" rel="noopener" class="course-card">
        <div class="course-cover" style="background:${grad}">
          ${imgHtml}
          <button class="cover-bookmark" onclick="event.preventDefault();event.stopPropagation();this.classList.toggle('active')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h12v17l-6-3.5L6 21z"/></svg>
          </button>
        </div>
        <div class="course-body">
          <div class="course-partner"><span class="pf-mark">${initial}</span> ${esc(c.platform || '')}</div>
          <div class="course-title">${title}</div>
          <div class="course-meta">
            ${section ? `<span>${section}</span>` : ''}
            ${section ? '<span class="dot-sep"></span>' : ''}
            <span style="color:${isFree ? '#047857' : 'inherit'};font-weight:${isFree ? '700' : '500'}">${priceLabel}</span>
          </div>
          ${instructor ? `<div class="course-instructor">${instructor}</div>` : ''}
          <div class="course-foot">
            <div class="course-price${isFree ? ' free' : ''}">${priceLabel}</div>
            <span class="course-cta-mini">ดูคอร์ส →</span>
          </div>
        </div>
      </a>`;
  }

  // ─── Filter logic ────────────────────────────────────────────
  function applyFilter(query, platform) {
    const q = query.trim().toLowerCase();
    return allCourses.filter(c => {
      if (platform && c.platform !== platform) return false;
      if (!q) return true;
      return (
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.section && c.section.toLowerCase().includes(q)) ||
        (c.platform && c.platform.toLowerCase().includes(q)) ||
        (c.description && c.description.replace(/<[^>]*>/g, '').slice(0, 300).toLowerCase().includes(q))
      );
    });
  }

  // ─── Render ──────────────────────────────────────────────────
  function render() {
    const grid   = document.getElementById('all-courses-grid');
    const countEl = document.getElementById('courses-count-badge');
    const paginEl = document.getElementById('all-courses-pagination');
    const emptyEl = document.getElementById('all-courses-empty');
    if (!grid) return;

    const total      = filteredCourses.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    currentPage      = Math.max(1, Math.min(currentPage, totalPages));

    const start = (currentPage - 1) * PAGE_SIZE;
    const items = filteredCourses.slice(start, start + PAGE_SIZE);

    if (countEl) countEl.textContent = total.toLocaleString() + ' คอร์ส';

    if (items.length === 0) {
      grid.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      grid.innerHTML = items.map(courseCardHtml).join('');
    }

    if (paginEl) renderPagination(paginEl, totalPages);
  }

  function renderPagination(el, totalPages) {
    if (totalPages <= 1) { el.innerHTML = ''; return; }

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }

    const btnClass = (p) =>
      `class="page-btn${p === currentPage ? ' active' : ''}"` +
      ` onclick="window.__courseSearch.goPage(${p})"`;

    el.innerHTML = `<div class="pagination">
      <button class="page-btn" onclick="window.__courseSearch.goPage(${currentPage - 1})"
        ${currentPage <= 1 ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      ${pages.map(p => p === '…'
        ? `<span class="page-ellipsis">…</span>`
        : `<button ${btnClass(p)}>${p}</button>`
      ).join('')}
      <button class="page-btn" onclick="window.__courseSearch.goPage(${currentPage + 1})"
        ${currentPage >= totalPages ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
    </div>`;
  }

  // ─── Public API ──────────────────────────────────────────────
  function search(query, platform) {
    if (query !== undefined) {
      currentQuery = query;
      const inp = document.getElementById('browse-search-input');
      if (inp) inp.value = query;
    }
    if (platform !== undefined) currentPlatform = platform;
    currentPage = 1;
    filteredCourses = applyFilter(currentQuery, currentPlatform);
    render();

    if (currentQuery) {
      const section = document.getElementById('browse-all');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function goPage(page) {
    currentPage = page;
    render();
    const section = document.getElementById('browse-all');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.__courseSearch = { search, goPage };
  window.searchAllCourses = (q) => search(q);

  // ─── Wire-up ─────────────────────────────────────────────────
  function wirePlatformTabs() {
    document.querySelectorAll('#browse-all [data-platform]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#browse-all [data-platform]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        search(currentQuery, btn.dataset.platform);
      });
    });
  }

  function wireHeroSearch() {
    const heroForm = document.querySelector('.hero-search');
    if (!heroForm) return;
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      const q = (heroForm.querySelector('input') || {}).value || '';
      search(q);
    });

    document.querySelectorAll('.hero-suggest .chip').forEach(chip => {
      chip.addEventListener('click', e => {
        e.preventDefault();
        search(chip.textContent.trim());
      });
    });
  }

  function wireBrowseSearch() {
    const inp = document.getElementById('browse-search-input');
    if (!inp) return;
    let timer;
    inp.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => search(inp.value), 300);
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { clearTimeout(timer); search(inp.value); }
    });

    const clearBtn = document.getElementById('browse-search-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => { inp.value = ''; search(''); inp.focus(); });
    }
  }

  // ─── Nav search live suggestions ─────────────────────────────
  function wireNavSearch() {
    const navInput = document.querySelector('.nav-search input');
    if (!navInput) return;

    const sfSection = document.getElementById('sf-search-results');
    if (!sfSection) return;

    let timer;
    navInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const q = navInput.value.trim();
        if (!q || allCourses.length === 0) {
          sfSection.style.display = 'none';
          return;
        }
        const hits = applyFilter(q, '').slice(0, 6);
        if (hits.length === 0) {
          sfSection.style.display = 'none';
          return;
        }
        sfSection.style.display = 'block';
        sfSection.innerHTML = `
          <div class="sf-label">ผลการค้นหา "${esc(q)}"</div>
          <div class="sf-search-hits">
            ${hits.map(c => `
              <a href="${esc(c.href || '#')}" target="_blank" rel="noopener" class="sf-hit">
                <div class="sf-hit-img" style="background:${platformGrad(c.platform)}">
                  ${c.coverImageUrl ? `<img src="${esc(c.coverImageUrl)}" alt="" onerror="this.style.display='none'" />` : ''}
                </div>
                <div class="sf-hit-body">
                  <div class="sf-hit-title">${esc(c.title)}</div>
                  <div class="sf-hit-meta">${esc(c.platform)}${c.section ? ' · ' + esc(c.section) : ''}</div>
                </div>
              </a>`).join('')}
          </div>
          <button class="sf-see-all" data-query="${esc(q)}">
            ดูผลทั้งหมด →
          </button>`;
      }, 250);
    });

    navInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        clearTimeout(timer);
        const q = navInput.value.trim();
        if (q) search(q);
      }
    });

    // "See all" button inside sfSection (rendered dynamically)
    sfSection.addEventListener('click', e => {
      const btn = e.target.closest('.sf-see-all');
      if (!btn) return;
      const q = btn.dataset.query || '';
      if (q) search(q);
    });
  }

  // ─── Init ────────────────────────────────────────────────────
  async function init() {
    const loadingEl = document.getElementById('all-courses-loading');
    try {
      const res = await fetch('./courses.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allCourses = data.courses || [];
      filteredCourses = allCourses;

      if (loadingEl) loadingEl.style.display = 'none';

      wirePlatformTabs();
      wireHeroSearch();
      wireBrowseSearch();
      wireNavSearch();
      render();
    } catch (err) {
      console.error('[courses-search] load failed:', err);
      if (loadingEl) loadingEl.innerHTML = '<p style="color:var(--ink-500)">ไม่สามารถโหลดข้อมูลคอร์สได้</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
