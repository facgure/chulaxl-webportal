#!/usr/bin/env node
/**
 * ChulaxL + CU MOOC Course Scraper
 * Retrieves all courses, instructors, details, cover images from:
 *   - chulaxl.chula.ac.th  (via Firebase Remote Config + Skooldio GraphQL)
 *   - mooc.chula.ac.th     (via HTML scraping, ~279 courses)
 *
 * Output:
 *   output/courses.json        — all courses combined
 *   output/images/             — cover images
 *   output/images/instructors/ — instructor profile photos
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import crypto from 'crypto';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// ─── Config ──────────────────────────────────────────────────────────────────

const FIREBASE_API_KEY      = 'AIzaSyD5463QF11A7JeweohPvYZBoYmQr_4Shlc';
const FIREBASE_APP_ID       = '1:977886627531:web:b9b34af24739a06591bd4e';
const FIREBASE_PROJECT_ID   = 'lifelong-learning-platform-cu';
const FIREBASE_PROJECT_NUM  = '977886627531';
const SITE_ORIGIN           = 'https://chulaxl.chula.ac.th';
const STORE_GRAPHQL_URL     = 'https://api.degree.plus/store/graphql';
const MOOC_BASE_URL         = 'https://mooc.chula.ac.th';
const MEDUMORE_BASE_URL     = 'https://www.medumore.org';
const MEDUMORE_CORE_URL     = 'https://core.medumore.org';
const OUTPUT_DIR            = path.join(process.cwd(), 'output');
const IMAGES_DIR            = path.join(OUTPUT_DIR, 'images');
const DOWNLOAD_CONCURRENCY  = 8;
const REQUEST_DELAY_MS      = 80;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms));

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function logProgress(current, total, label = '') {
  const pct = Math.round((current / total) * 100);
  process.stdout.write(`\r  [${pct.toString().padStart(3)}%] ${current}/${total} ${label}    `);
  if (current === total) process.stdout.write('\n');
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function graphql(url, query, variables = {}, headers = {}) {
  return fetchJSON(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: SITE_ORIGIN, ...headers },
    body: JSON.stringify({ query, variables }),
  });
}

// Sanitise a string for use as a filename
function safeFilename(str) {
  return str.replace(/[^a-zA-Z0-9-_\.]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 100);
}

// Hash a URL to a short 8-char hex for dedup/fallback
function urlHash(url) {
  return crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
}

// Derive a stable local image filename from a URL (uses URL hash to avoid collisions)
function imageFilename(imageUrl) {
  if (!imageUrl) return null;
  const cleanUrl = imageUrl.split('?')[0].split('#')[0];
  const ext = (cleanUrl.match(/\.([a-zA-Z0-9]{2,5})$/) || [])[1] || 'jpg';
  // Use last path segment (decoded) + hash for uniqueness
  const urlPath = cleanUrl.split('/').pop() || '';
  let baseName = safeFilename(decodeURIComponent(urlPath).replace(/\.[^.]+$/, ''));
  if (!baseName || baseName.length < 3) baseName = 'img';
  return `${baseName}_${urlHash(imageUrl)}.${ext}`;
}

// Download a single file
async function downloadFile(url, destPath) {
  if (!url) return null;
  const decodedUrl = url.includes('%') ? decodeURIComponent(url) : url;
  const protocol = decodedUrl.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    const req = protocol.get(decodedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve(null);
      }
      const out = createWriteStream(destPath);
      pipeline(res, out).then(() => resolve(destPath)).catch(reject);
    });
    req.on('error', () => resolve(null));
    req.setTimeout(15000, () => { req.destroy(); resolve(null); });
  });
}

// Run async tasks with max concurrency
async function concurrent(tasks, limit) {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = task().then(r => { executing.delete(p); return r; });
    executing.add(p);
    results.push(p);
    if (executing.size >= limit) await Promise.race(executing);
  }
  return Promise.all(results);
}

// ─── Step 1: Firebase Installation Token ─────────────────────────────────────

async function getFirebaseInstallToken() {
  log('\n[1/4] Getting Firebase installation token...');
  const res = await fetchJSON(
    `https://firebaseinstallations.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/installations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': FIREBASE_API_KEY,
      },
      body: JSON.stringify({
        appId: FIREBASE_APP_ID,
        authVersion: 'FIS_v2',
        sdkVersion: 'w:0.6.4',
      }),
    }
  );
  const token = res?.authToken?.token;
  if (!token) throw new Error('Failed to get Firebase installation token');
  log(`  ✓ Got token (FID: ${res.fid})`);
  return token;
}

// ─── Step 2: Firebase Remote Config ──────────────────────────────────────────

async function fetchRemoteConfig(fisToken) {
  log('\n[2/4] Fetching Firebase Remote Config...');
  const res = await fetchJSON(
    `https://firebaseremoteconfig.googleapis.com/v1/projects/${FIREBASE_PROJECT_NUM}/namespaces/firebase:fetch?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_instance_id: 'scraper-instance',
        app_instance_id_token: fisToken,
        app_id: FIREBASE_APP_ID,
        language_code: 'th',
      }),
    }
  );
  const entries = res?.entries || {};
  log(`  ✓ Got ${Object.keys(entries).length} config entries`);
  return entries;
}

// ─── Step 3: Extract Courses from Sections ───────────────────────────────────

function parseRemoteConfigCourses(entries) {
  log('\n[3/4] Extracting courses from Remote Config sections...');

  const sections = JSON.parse(entries.sections || '[]');
  const courseProviders = JSON.parse(entries.courseProviders || '[]');

  const providerMap = Object.fromEntries(courseProviders.map(p => [p.name, p.url]));
  log(`  Course providers: ${courseProviders.map(p => p.name).join(', ')}`);

  const allCourses = [];
  let sectionIndex = 0;

  for (const section of sections) {
    if (section.type !== 'EXTERNAL_COURSES') continue;
    sectionIndex++;
    const sectionTitle = section.title || `Section ${sectionIndex}`;

    for (const course of section.courses || []) {
      allCourses.push({
        id: null,                               // will be filled if fetched from GraphQL
        title: course.title || '',
        description: course.description || '',
        coverImageUrl: course.coverImageUrl || '',
        coverImageLocal: null,                  // will be filled after download
        href: course.href || '',
        status: course.status || '',
        duration: course.duration || '',
        price: {
          base: course.price?.basePrice ?? null,
          sale: course.price?.salePrice ?? null,
        },
        category: {
          parentTitle: course.category?.parentCategoryTitle || '',
          type: course.category?.categoryType || '',
        },
        instructors: (course.instructors || []).map(i => ({
          name: i.displayName || i.name || '',
          permalink: i.permalink || '',
          profileImageUrl: i.profileImageUrl || '',
          profileImageLocal: null,
        })),
        section: sectionTitle,
        platform: derivePlatform(course.href),
        related: [],
      });
    }
  }

  log(`  ✓ Found ${allCourses.length} courses across ${sectionIndex} sections`);
  return allCourses;
}

function derivePlatform(href) {
  if (!href) return 'unknown';
  if (href.includes('mooc.chula.ac.th'))     return 'CU MOOC';
  if (href.includes('cuneuron.chula.ac.th'))  return 'CU Neuron';
  if (href.includes('store.degree.plus'))     return 'Degree+';
  if (href.includes('mycourseville.com'))     return 'MyCourseVille';
  if (href.includes('cbs-academy.com'))       return 'CBS Academy';
  if (href.includes('medumore.org'))          return 'MedUMore';
  if (href.includes('lifelong.chula.ac.th'))  return 'Lifelong Learning';
  if (href.includes('sites.google.com'))      return 'Google Sites';
  return 'External';
}

// ─── Step 4 (optional): Enrich Degree+ courses via GraphQL ───────────────────

const SF_COURSE_FRAGMENT = `
  fragment CourseFields on SFFoProductOnlineCourse {
    id
    title
    subTitle
    SKUCode
    SKUCategory
    SKUStatus
    courseCode
    permalink
    instructors {
      name
      permalink
      position
      profileImage { key bucket }
      profileImageUrl
    }
    duration
    ratings { avg }
    categories {
      parent { title permalink }
      categories { title permalink }
    }
    coverImage { key bucket }
    coverImageUrl
    cardImageUrl
    priceInclVAT_value
    salePriceInclVAT_value
    creditPrice
    parentOnlineCourse { id permalink }
  }
`;

async function enrichDegreePlusCourses(courses) {
  const dpCourses = courses.filter(c => c.platform === 'Degree+' && c.href);
  if (dpCourses.length === 0) return;

  log(`\n  Enriching ${dpCourses.length} Degree+ courses via GraphQL...`);

  const skuCodes = [...new Set(dpCourses.map(c => {
    const m = c.href.match(/\/courses\/([^/?#]+)/);
    return m ? m[1] : null;
  }).filter(Boolean))];

  for (let i = 0; i < skuCodes.length; i++) {
    const skuCode = skuCodes[i];
    logProgress(i + 1, skuCodes.length, skuCode);
    try {
      const res = await graphql(STORE_GRAPHQL_URL,
        `query GetCourse($SKUCode: String!) {
          sfFoProductOnlineCourseBySKUCode(SKUCode: $SKUCode) {
            ...CourseFields
          }
        }
        ${SF_COURSE_FRAGMENT}`,
        { SKUCode: skuCode },
        { Origin: SITE_ORIGIN }
      );
      const data = res?.data?.sfFoProductOnlineCourseBySKUCode;
      if (data) {
        for (const c of courses) {
          if (c.href && c.href.includes(`/courses/${skuCode}`)) {
            c.id = data.id;
            if (data.subTitle) c.subTitle = data.subTitle;
            if (data.SKUCode)  c.SKUCode = data.SKUCode;
            c.permalink = data.permalink;
            if (data.ratings?.avg) c.rating = data.ratings.avg;
            if (data.creditPrice)  c.creditPrice = data.creditPrice;
            if (data.coverImageUrl) c.coverImageUrl = data.coverImageUrl;
            // Enrich instructors
            if (data.instructors?.length) {
              c.instructors = data.instructors.map(ins => ({
                name: ins.name || '',
                position: ins.position || '',
                permalink: ins.permalink || '',
                profileImageUrl: ins.profileImageUrl || '',
                profileImageLocal: null,
              }));
            }
            // Enrich categories
            if (data.categories?.length) {
              c.category = data.categories.map(cat => ({
                parentTitle: cat.parent?.title || '',
                parentPermalink: cat.parent?.permalink || '',
                categories: (cat.categories || []).map(sub => ({
                  title: sub.title,
                  permalink: sub.permalink,
                })),
              }));
            }
          }
        }
      }
    } catch (e) {
      // GraphQL enrich is best-effort; continue on error
    }
    await sleep(REQUEST_DELAY_MS);
  }
}

// ─── Step 5: Download Images ──────────────────────────────────────────────────

async function downloadImages(courses) {
  log('\n[4/4] Downloading cover images...');

  const toDownload = [];

  for (const course of courses) {
    if (course.coverImageUrl) {
      const fname = imageFilename(course.coverImageUrl);
      const destPath = path.join(IMAGES_DIR, fname);
      toDownload.push({ url: course.coverImageUrl, destPath, course, field: 'coverImageLocal', fname });
    }
    for (const ins of course.instructors || []) {
      if (ins.profileImageUrl) {
        const fname = imageFilename(ins.profileImageUrl);
        const destPath = path.join(IMAGES_DIR, 'instructors', fname);
        toDownload.push({ url: ins.profileImageUrl, destPath, obj: ins, field: 'profileImageLocal', fname });
      }
    }
  }

  // Create instructor subfolder
  fs.mkdirSync(path.join(IMAGES_DIR, 'instructors'), { recursive: true });

  let done = 0;
  const tasks = toDownload.map(item => async () => {
    try {
      const result = await downloadFile(item.url, item.destPath);
      if (result) {
        const relPath = path.relative(OUTPUT_DIR, item.destPath);
        if (item.course) item.course.coverImageLocal = relPath;
        if (item.obj)    item.obj.profileImageLocal = relPath;
      }
    } catch (_) {}
    done++;
    logProgress(done, toDownload.length);
  });

  await concurrent(tasks, DOWNLOAD_CONCURRENCY);
  log(`  ✓ Downloaded images to ${IMAGES_DIR}`);
}

// ─── CU MOOC Scraper ─────────────────────────────────────────────────────────

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChulaCourseScraper/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractAttr(html, attr) {
  const m = html.match(new RegExp(`${attr}=["']([^"']+)["']`, 'i'));
  return m ? m[1] : null;
}

async function getMoocCourseIds() {
  log(`\n[MOOC] Collecting course IDs from ${MOOC_BASE_URL}/course-all...`);
  const allIds = new Set();
  for (let page = 1; ; page++) {
    const url = page === 1
      ? `${MOOC_BASE_URL}/course-all`
      : `${MOOC_BASE_URL}/course-all?page=${page}`;
    try {
      const html = await fetchHtml(url);
      const ids = [...html.matchAll(/course-detail\/(\d+)/g)].map(m => parseInt(m[1]));
      if (ids.length === 0) break;
      ids.forEach(id => allIds.add(id));
      process.stdout.write(`\r  Page ${page}: ${allIds.size} unique IDs so far   `);
    } catch (e) {
      break;
    }
    await sleep(REQUEST_DELAY_MS);
  }
  process.stdout.write('\n');
  const sorted = [...allIds].sort((a, b) => a - b);
  log(`  ✓ Found ${sorted.length} unique course IDs (${Math.min(...sorted)}–${Math.max(...sorted)})`);
  return sorted;
}

function parseMoocDetailPage(html, courseId) {
  // Title
  const titleM = html.match(/course-infoPKbox[\s\S]*?<h4>([\s\S]*?)<\/h4>/);
  const title = titleM ? stripTags(titleM[1]) : '';

  // Instructor (โดย)
  const instrM = html.match(/<strong>โดย\s*:\s*<\/strong>\s*([\s\S]*?)<\/li>/);
  const instructorName = instrM ? stripTags(instrM[1]) : '';

  // Course code (รหัส)
  const codeM = html.match(/<strong>รหัส\s*:\s*<\/strong>\s*([\s\S]*?)<\/li>/);
  const courseCode = codeM ? stripTags(codeM[1]) : '';

  // Category
  const catM = html.match(/cate-tag[^>]+>\s*([\s\S]*?)\s*<\/div>/);
  const category = catM ? stripTags(catM[1]) : '';

  // Cover image — first img/upload URL
  const imgM = html.match(/src=["'](https:\/\/mooc\.chula\.ac\.th\/img\/upload\/[^"']+)["']/);
  const coverImageUrl = imgM ? imgM[1] : '';

  // YouTube embed URL
  const ytM = html.match(/youtube\.com\/embed\/([^"'?]+)/);
  const youtubeId = ytM ? ytM[1] : '';

  // Registration links
  const regSection = html.match(/register-button([\s\S]*?)<\/ul>/);
  const registrationLinks = [];
  if (regSection) {
    const links = [...regSection[1].matchAll(/href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)];
    for (const [, href, label] of links) {
      registrationLinks.push({ label: stripTags(label), href });
    }
  }

  // Main content section (after .pinkBG header)
  const contentM = html.match(/content-padding">([\s\S]*?)<footer/);
  const contentText = contentM ? stripTags(contentM[1]) : '';

  // Extract structured fields from content text
  const lessonM   = contentText.match(/เนื้อหา\s+([\d,]+)\s*บทเรียน/);
  const hoursM    = contentText.match(/([\d]+)\s*ชั่วโมง(?:\s*([\d]+)\s*นาที)?/);
  const targetM   = contentText.match(/กลุ่มเป้าหมาย\s+([^\n]{5,200}?)(?:\s{2,}|\d{1,3}[,\d]*\s*คน)/);
  const platformM = contentText.match(/แพลตฟอร์ม\s+(myCourseVille|Coursera|edX[^\s]*)/i);
  const criteriaM = contentText.match(/เกณฑ์การเรียนจบ\s+([\s\S]*?)(?=จำนวน|แพลตฟอร์ม|$)/);

  // Description block — text after "เกี่ยวกับรายวิชา"
  const aboutIdx = contentText.indexOf('เกี่ยวกับรายวิชา');
  let description = '';
  if (aboutIdx >= 0) {
    const afterAbout = contentText.slice(aboutIdx + 'เกี่ยวกับรายวิชา'.length).trim();
    // Cut at the next section header
    const nextSection = afterAbout.search(/เนื้อหารายวิชา|วัตถุประสงค์|เกณฑ์การวัด|คอร์สแนะนำ/);
    description = (nextSection > 0 ? afterAbout.slice(0, nextSection) : afterAbout.slice(0, 1500)).trim();
  }

  // Course period info — text before "เกี่ยวกับรายวิชา"
  const periodBlock = aboutIdx > 0 ? contentText.slice(0, aboutIdx) : '';

  // Related course IDs from "คอร์สแนะนำ" section
  const relatedIds = [...html.matchAll(/course-detail\/(\d+)/g)]
    .map(m => parseInt(m[1]))
    .filter(id => id !== courseId);
  const uniqueRelatedIds = [...new Set(relatedIds)].slice(0, 5);

  const duration = hoursM
    ? `${hoursM[1]} ชั่วโมง${hoursM[2] ? ` ${hoursM[2]} นาที` : ''}`
    : '';

  return {
    id: `mooc-${courseId}`,
    moocId: courseId,
    title,
    description,
    coverImageUrl,
    coverImageLocal: null,
    href: `${MOOC_BASE_URL}/course-detail/${courseId}`,
    status: 'SELLING',
    duration,
    lessons: lessonM ? parseInt(lessonM[1].replace(',', '')) : null,
    platform: 'CU MOOC',
    platformName: platformM ? platformM[1] : 'myCourseVille',
    price: { base: 0, sale: 0 },
    category: {
      parentTitle: '',
      type: category,
    },
    courseCode,
    youtubeId,
    registrationLinks,
    targetAudience: targetM ? targetM[1].trim() : '',
    completionCriteria: criteriaM ? stripTags(criteriaM[1]).trim().slice(0, 300) : '',
    periodInfo: periodBlock.trim().slice(0, 500),
    instructors: instructorName
      ? [{ name: instructorName, permalink: '', profileImageUrl: '', profileImageLocal: null }]
      : [],
    section: `CU MOOC — ${category || 'ทั่วไป'}`,
    source: 'mooc.chula.ac.th',
    _relatedMoocIds: uniqueRelatedIds,
    related: [],
  };
}

async function scrapeMoocCourses() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(' Scraping mooc.chula.ac.th');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const ids = await getMoocCourseIds();
  const courses = [];
  let done = 0;

  log(`\n[MOOC] Fetching ${ids.length} course detail pages...`);

  const tasks = ids.map(id => async () => {
    try {
      const html = await fetchHtml(`${MOOC_BASE_URL}/course-detail/${id}`);
      const course = parseMoocDetailPage(html, id);
      courses.push(course);
    } catch (e) {
      // skip failed pages silently
    }
    done++;
    logProgress(done, ids.length, `id=${ids[done-1]}`);
    await sleep(REQUEST_DELAY_MS);
  });

  await concurrent(tasks, DOWNLOAD_CONCURRENCY);
  log(`\n  ✓ Scraped ${courses.length} courses from CU MOOC`);

  // Resolve related courses by moocId
  const byMoocId = Object.fromEntries(courses.map(c => [c.moocId, c]));
  for (const course of courses) {
    course.related = course._relatedMoocIds
      .map(id => byMoocId[id])
      .filter(Boolean)
      .map(c => ({ title: c.title, href: c.href, platform: 'CU MOOC' }));
    delete course._relatedMoocIds;
  }

  return courses;
}

// ─── CU Neuron Scraper ───────────────────────────────────────────────────────

const NEURON_BASE_URL = 'https://cuneuron.chula.ac.th';

async function getNeuronCsrfToken() {
  const html = await fetchHtml(NEURON_BASE_URL);
  const m = html.match(/_token=([a-zA-Z0-9]+)/);
  return m ? m[1] : '';
}

async function getNeuronCourseIds(csrfToken) {
  log(`\n[Neuron] Collecting course IDs from ${NEURON_BASE_URL}/course-online...`);
  const allIds = new Set();
  for (let page = 1; ; page++) {
    const url = page === 1
      ? `${NEURON_BASE_URL}/course-online`
      : `${NEURON_BASE_URL}/course-online?_token=${csrfToken}&type=&list=&page=${page}`;
    try {
      const html = await fetchHtml(url);
      const ids = [...html.matchAll(/course-detail\/(\d+)/g)].map(m => parseInt(m[1]));
      if (ids.length === 0) break;
      ids.forEach(id => allIds.add(id));
      process.stdout.write(`\r  Page ${page}: ${allIds.size} unique IDs so far   `);
    } catch (e) { break; }
    await sleep(REQUEST_DELAY_MS);
  }
  process.stdout.write('\n');
  const sorted = [...allIds].sort((a, b) => a - b);
  log(`  ✓ Found ${sorted.length} course IDs (${Math.min(...sorted)}–${Math.max(...sorted)})`);
  return sorted;
}

function parseCuNeuronDetailPage(html, courseId) {
  const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  // ── Top info block ──────────────────────────────────────────────────────────
  const topBlock = (html.match(/course-imgBox">([\s\S]*?)(?=content-padding|<footer)/) || [])[1] || '';

  const titleM    = topBlock.match(/course-name[\s\S]*?<p>([\s\S]*?)<\/p>/);
  const title     = titleM ? decode(stripTags(titleM[1])) : '';

  const teacherM  = topBlock.match(/class="teacher"[\s\S]*?<p>([\s\S]*?)<\/p>/);
  const teacherShort = teacherM ? decode(stripTags(teacherM[1])) : '';

  const facultyM  = topBlock.match(/class="faculty"[\s\S]*?<p>([\s\S]*?)<\/p>/);
  const faculty   = facultyM ? decode(stripTags(facultyM[1])) : '';

  const catM      = topBlock.match(/category-type[^>]*>([\s\S]*?)<\/div>/);
  const category  = catM ? stripTags(catM[1]).trim() : '';

  const ratingM   = topBlock.match(/class="average">([\d.]+)<\/div>/);
  const rating    = ratingM ? parseFloat(ratingM[1]) : null;

  const coverM    = topBlock.match(/src="(https:\/\/cuneuron\.chula\.ac\.th\/img\/upload\/[^"]+)"/);
  const coverImageUrl = coverM ? coverM[1] : '';

  const priceM    = topBlock.match(/class="price"[^>]*>([\s\S]*?)<\/div>/);
  const priceText = priceM ? stripTags(priceM[1]).trim() : '';
  const priceNum  = priceText.match(/[\d,]+/) ? parseInt(priceText.replace(/,/g, '')) : 0;

  // ── Content block ───────────────────────────────────────────────────────────
  const contentBlock = (html.match(/content-padding foot-pad">([\s\S]*?)(?=<footer|คอร์สแนะนำ)/) || [])[1] || '';
  const contentText  = decode(stripTags(contentBlock)).replace(/\s+/g, ' ');

  const regM      = contentText.match(/ลงทะเบียน\s+([^\s]{5,80})/);
  const periodM   = contentText.match(/เวลาเรียน\s+([^\s].*?)(?=\s{2,}|เนื้อหา)/);
  const lessonM   = contentText.match(/เนื้อหา\s+([\d,]+)\s*บทเรียน/);
  const videoM    = contentText.match(/วิดีโอ\s+([\d,]+)\s*วีดีโอ/);
  const durationM = contentText.match(/ระยะเวลา\s+([\d]+\s*ชั่วโมง(?:\s*[\d]+\s*นาที)?)/);
  const certM     = contentText.match(/ประกาศนียบัตร\s+([\w฀-๿ ]+)/);
  const targetM   = contentText.match(/กลุ่มเป้าหมาย\s+([\s\S]*?)(?=แนะนำรายวิชา|เกี่ยวกับรายวิชา|$)/);
  const criteriaM = contentText.match(/เกณฑ์เรียนจบ\s+([\s\S]*?)(?=ประกาศนียบัตร|กลุ่มเป้าหมาย|$)/);

  // Description from เกี่ยวกับรายวิชา block
  const aboutIdx  = contentText.indexOf('เกี่ยวกับรายวิชา');
  let description = '';
  if (aboutIdx >= 0) {
    const after = contentText.slice(aboutIdx + 'เกี่ยวกับรายวิชา'.length).trim();
    const cut = after.search(/วัตถุประสงค์|เกณฑ์การวัด|เนื้อหาหลักสูตร|อาจารย์ผู้สอน|เสียงจากผู้เรียน/);
    description = (cut > 0 ? after.slice(0, cut) : after.slice(0, 1500)).trim();
  }

  // ── Teacher list ────────────────────────────────────────────────────────────
  const teacherListBlock = (html.match(/teacher-list">([\s\S]*?)<\/ul>/) || [])[1] || '';
  const instructors = [];
  const teacherItems = [...teacherListBlock.matchAll(/teacher-profile">([\s\S]*?)(?=<\/div>\s*<\/li>)/g)];
  for (const [, block] of teacherItems) {
    const imgM2  = block.match(/src="(https:\/\/cuneuron\.chula\.ac\.th\/img\/upload\/[^"]+)"/);
    const nameM  = block.match(/profile-name">([\s\S]*?)<\/div>/);
    const bioM   = block.match(/txt-content[\s\S]*?<p>([\s\S]*?)<\/p>/);
    const posM   = block.match(/<li>([\s\S]*?)<\/li>.*?<li>([\s\S]*?)<\/li>/s);
    instructors.push({
      name: nameM ? decode(stripTags(nameM[1])).trim() : '',
      position: posM ? decode(stripTags(posM[2])).trim() : '',
      bio: bioM ? decode(stripTags(bioM[1])).trim() : '',
      profileImageUrl: imgM2 ? imgM2[1] : '',
      profileImageLocal: null,
    });
  }
  // Fallback: use the short teacher name from top if no teacher-list entries
  if (instructors.length === 0 && teacherShort) {
    instructors.push({ name: teacherShort, position: '', bio: '', profileImageUrl: '', profileImageLocal: null });
  }

  // ── Related course IDs ──────────────────────────────────────────────────────
  const relatedSection = (html.match(/คอร์สแนะนำ([\s\S]*?)(?=<footer)/) || [])[1] || '';
  const relatedIds = [...new Set(
    [...relatedSection.matchAll(/course-detail\/(\d+)/g)].map(m => parseInt(m[1])).filter(id => id !== courseId)
  )].slice(0, 5);

  return {
    id: `neuron-${courseId}`,
    neuronId: courseId,
    title,
    description,
    coverImageUrl,
    coverImageLocal: null,
    href: `${NEURON_BASE_URL}/course-detail/${courseId}`,
    status: 'SELLING',
    duration: durationM ? durationM[1].trim() : '',
    lessons: lessonM ? parseInt(lessonM[1].replace(',', '')) : null,
    videos: videoM ? parseInt(videoM[1].replace(',', '')) : null,
    platform: 'CU Neuron',
    faculty,
    price: { base: priceNum, sale: priceNum },
    rating,
    certificate: certM ? certM[1].trim() : '',
    category: { parentTitle: '', type: category },
    registrationDate: regM ? regM[1].trim() : '',
    studyPeriod: periodM ? periodM[1].trim() : '',
    completionCriteria: criteriaM ? criteriaM[1].trim().slice(0, 300) : '',
    targetAudience: targetM ? targetM[1].trim().slice(0, 300) : '',
    instructors,
    section: `CU Neuron — ${category || 'ทั่วไป'}`,
    source: 'cuneuron.chula.ac.th',
    _relatedNeuronIds: relatedIds,
    related: [],
  };
}

async function scrapeCuNeuronCourses() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(' Scraping cuneuron.chula.ac.th');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const csrfToken = await getNeuronCsrfToken();
  const ids = await getNeuronCourseIds(csrfToken);
  const courses = [];
  let done = 0;

  log(`\n[Neuron] Fetching ${ids.length} course detail pages...`);

  const tasks = ids.map(id => async () => {
    try {
      const html = await fetchHtml(`${NEURON_BASE_URL}/course-detail/${id}`);
      const course = parseCuNeuronDetailPage(html, id);
      if (course.title) courses.push(course);
    } catch (_) {}
    done++;
    logProgress(done, ids.length, `id=${ids[done-1]}`);
    await sleep(REQUEST_DELAY_MS);
  });

  await concurrent(tasks, DOWNLOAD_CONCURRENCY);
  log(`\n  ✓ Scraped ${courses.length} courses from CU Neuron`);

  // Resolve related
  const byId = Object.fromEntries(courses.map(c => [c.neuronId, c]));
  for (const course of courses) {
    course.related = course._relatedNeuronIds
      .map(id => byId[id])
      .filter(Boolean)
      .map(c => ({ title: c.title, href: c.href, platform: 'CU Neuron' }));
    delete course._relatedNeuronIds;
  }

  return courses;
}

// ─── MedUMore Scraper ────────────────────────────────────────────────────────

function medumoreDuration(seconds) {
  if (!seconds || seconds === 99999) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h} ชั่วโมง ${m} นาที`;
  if (h > 0) return `${h} ชั่วโมง`;
  if (m > 0) return `${m} นาที`;
  return `${seconds} วินาที`;
}

function medumoreLevel(levelId) {
  const map = { 1: 'Beginner', 2: 'Advanced', 4: 'Intermediate' };
  return map[levelId] || '';
}

async function getMedumoreAllPages() {
  log(`\n[MedUMore] Fetching page 1 to get total page count...`);
  const data = await fetchJSON(`${MEDUMORE_CORE_URL}/api/mdcu/getCourseFilter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': MEDUMORE_BASE_URL,
      'Referer': `${MEDUMORE_BASE_URL}/category/course`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({ page: 1 }),
  });
  const totalPages = data.all_page || 1;
  log(`  ✓ Total pages: ${totalPages}`);
  return totalPages;
}

function extractMedumoreCourses(data) {
  const seen = new Set();
  const courses = [];
  for (const group of data.course_data || []) {
    for (const c of group.data || []) {
      if (!seen.has(c.id)) {
        seen.add(c.id);
        courses.push(c);
      }
    }
  }
  return courses;
}

function parseMedumoreRaw(c) {
  const slug = c.slug || String(c.id);
  const instructors = (c.speaker || []).map(s => ({
    name: s.title || s.name || '',
    position: s.position || '',
    profileImageUrl: s.image || s.avatar || '',
    profileImageLocal: null,
  }));

  const detailsText = c.details
    ? c.details.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : (c.subtitle || '');

  return {
    id: `medumore-${c.id}`,
    medumore_id: c.id,
    title: c.title || '',
    description: detailsText,
    subtitle: c.subtitle || '',
    coverImageUrl: c.image || c.banner || '',
    coverImageLocal: null,
    href: `${MEDUMORE_BASE_URL}/course/${slug}`,
    status: c.status === 1 ? 'SELLING' : 'INACTIVE',
    duration: medumoreDuration(c.duration || c.course_duration),
    lessons: c.lesson || null,
    platform: 'MedUMore',
    price: {
      base: c.price ?? 0,
      sale: c.pro_price ?? c.price ?? 0,
    },
    isFree: c.is_free === 1,
    rating: c.rate || null,
    ratingCount: c.rating || 0,
    level: medumoreLevel(c.level),
    department: c.department || '',
    groupCode: c.group_code || '',
    isCertificate: c.is_cert === 1,
    isCme: c.is_cme === 1,
    startedDate: c.started_date || '',
    instructors,
    section: `MedUMore — ${c.department || 'ทั่วไป'}`,
    source: 'medumore.org',
    related: [],
  };
}

async function scrapeMedumoreCourses() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(' Scraping medumore.org');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const totalPages = await getMedumoreAllPages();
  const seenIds = new Set();
  const raw = [];

  const headers = {
    'Content-Type': 'application/json',
    'Origin': MEDUMORE_BASE_URL,
    'Referer': `${MEDUMORE_BASE_URL}/category/course`,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  log(`\n[MedUMore] Fetching ${totalPages} pages...`);

  for (let page = 1; page <= totalPages; page++) {
    try {
      const data = await fetchJSON(`${MEDUMORE_CORE_URL}/api/mdcu/getCourseFilter`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ page }),
      });
      const pageCourses = extractMedumoreCourses(data);
      for (const c of pageCourses) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id);
          raw.push(c);
        }
      }
    } catch (e) {
      log(`  ⚠ Page ${page} failed: ${e.message}`);
    }
    logProgress(page, totalPages, `${seenIds.size} courses`);
    await sleep(REQUEST_DELAY_MS);
  }

  const courses = raw.map(parseMedumoreRaw);
  log(`\n  ✓ Scraped ${courses.length} courses from MedUMore`);
  return courses;
}

// ─── Step 6: Build Related Courses ───────────────────────────────────────────

function buildRelated(courses) {
  // Simple related: courses in the same section, excluding self
  for (const course of courses) {
    course.related = courses
      .filter(c => c !== course && c.section === course.section)
      .map(c => ({ title: c.title, href: c.href, platform: c.platform }))
      .slice(0, 5);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('═══════════════════════════════════════════════════');
  log(' ChulaxL + CU MOOC + CU Neuron + MedUMore Scraper');
  log('═══════════════════════════════════════════════════');

  // Prepare output directories
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  // ── Part A: chulaxl.chula.ac.th (Firebase Remote Config) ──
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(' Scraping chulaxl.chula.ac.th');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const fisToken = await getFirebaseInstallToken();
  const entries  = await fetchRemoteConfig(fisToken);
  const chulaxlCourses = parseRemoteConfigCourses(entries);
  await enrichDegreePlusCourses(chulaxlCourses);
  buildRelated(chulaxlCourses);

  // ── Part B: mooc.chula.ac.th (HTML scraping) ──
  const moocCourses = await scrapeMoocCourses();

  // ── Part C: cuneuron.chula.ac.th (HTML scraping) ──
  const neuronCourses = await scrapeCuNeuronCourses();

  // ── Part D: medumore.org (JSON API) ──
  const medumoreCourses = await scrapeMedumoreCourses();

  // ── Merge ──
  const allCourses = [...chulaxlCourses, ...moocCourses, ...neuronCourses, ...medumoreCourses];

  // ── Download all images ──
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(' Downloading all images');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await downloadImages(allCourses);

  // ── Summary stats ──
  const byPlatform = {};
  for (const c of allCourses) byPlatform[c.platform] = (byPlatform[c.platform] || 0) + 1;

  const bySource = {
    'chulaxl.chula.ac.th': chulaxlCourses.length,
    'mooc.chula.ac.th': moocCourses.length,
    'cuneuron.chula.ac.th': neuronCourses.length,
    'medumore.org': medumoreCourses.length,
  };

  const output = {
    meta: {
      sources: [
        'https://chulaxl.chula.ac.th',
        'https://mooc.chula.ac.th',
        'https://cuneuron.chula.ac.th',
        'https://www.medumore.org',
      ],
      scrapedAt: new Date().toISOString(),
      totalCourses: allCourses.length,
      bySource,
      byPlatform,
    },
    courses: allCourses,
  };

  const jsonPath = path.join(OUTPUT_DIR, 'courses.json');
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

  log('\n═══════════════════════════════════════════════════');
  log(` ✓ Done! ${allCourses.length} total courses saved to:`);
  log(`   ${jsonPath}`);
  log(` ✓ Images saved to: ${IMAGES_DIR}`);
  log('\n Source breakdown:');
  for (const [src, count] of Object.entries(bySource)) {
    log(`   ${String(count).padStart(3)} — ${src}`);
  }
  log('\n Platform breakdown:');
  for (const [platform, count] of Object.entries(byPlatform).sort((a, b) => b[1] - a[1])) {
    log(`   ${String(count).padStart(3)} — ${platform}`);
  }
  log('═══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n✗ Fatal error:', err.message);
  process.exit(1);
});
