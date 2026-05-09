import * as THREE from 'three';
import { sphereMeshes } from '../mesh/gems.js';
import { resetCamera } from '../core/scene.js';
import { NODES } from '../data/nodes.js';

// ─── App Panel (iframe) ───────────────────────────────────────────────────────
const appOverlay = document.getElementById('app-overlay');
const appPanel   = document.getElementById('app-panel');
const appIframe  = document.getElementById('app-panel-iframe');
const appTitle   = document.getElementById('app-panel-title');
const appClose   = document.getElementById('app-panel-close');

export function openAppPanel(src, title = '') {
  appTitle.textContent = title;
  appIframe.src        = src;
  appOverlay.classList.add('open');
  appPanel.classList.add('open');
}

export function closeAppPanel() {
  appPanel.classList.remove('open');
  appOverlay.classList.remove('open');
  setTimeout(() => { appIframe.src = ''; }, 300);
}

appClose.addEventListener('click', closeAppPanel);
appOverlay.addEventListener('click', closeAppPanel);

// ─── Shared helpers ───────────────────────────────────────────────────────────
const ogCache = new Map();

async function fetchOgImage(url) {
  if (ogCache.has(url)) return ogCache.get(url);
  const gh = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)/);
  let src = null;
  if (gh) {
    src = `https://opengraph.githubassets.com/1/${gh[1]}`;
  } else {
    try {
      const res  = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      src = data?.data?.image?.url ?? null;
    } catch {}
  }
  ogCache.set(url, src);
  return src;
}

async function preloadAllOgImages() {
  const allNodes = [];
  NODES.forEach(n => {
    if (n.jsonFile) allNodes.push(n);
    n.subNodes?.forEach(s => { if (s.jsonFile) allNodes.push(s); });
  });
  await Promise.all(allNodes.map(async node => {
    const jsonData = await loadJson(node.jsonFile);
    const links = Array.isArray(jsonData?.links) ? jsonData.links : [];
    await Promise.all(links.map(e => e.link ? fetchOgImage(e.link) : null));
  }));
}

async function loadImages(folder) {
  const res = await fetch(`/${folder}/images.json`);
  return res.ok ? res.json() : [];
}

async function loadJson(file) {
  const res = await fetch(`/${file}`);
  return res.ok ? res.json() : null;
}

async function fillContent(node, container) {
  node.items?.forEach(item => {
    const el = document.createElement('div');
    el.className = 'panel-item';
    el.innerHTML = `<div class="panel-item-title">${item.title}</div>
                    <div class="panel-item-sub">${item.sub}</div>`;
    container.appendChild(el);
  });

  const jsonData = node.jsonFile ? await loadJson(node.jsonFile) : null;

  const links = Array.isArray(jsonData?.links) ? jsonData.links : [];
  links.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'panel-image-card';
    if (entry.link) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => window.open(entry.link, '_blank'));
      const img = document.createElement('img');
      img.className = 'panel-image';
      img.style.display = 'none';
      card.appendChild(img);
      (entry.ogImage
        ? Promise.resolve(entry.ogImage)
        : fetchOgImage(entry.link)
      ).then(src => { if (src) { img.src = src; img.style.display = ''; } });
    }
    const titleEl = document.createElement('div');
    titleEl.className = 'panel-image-label';
    titleEl.textContent = entry.title;
    const descEl = document.createElement('div');
    descEl.className = 'panel-image-desc';
    descEl.textContent = entry.desc;
    card.appendChild(titleEl);
    card.appendChild(descEl);
    container.appendChild(card);
  });

  if (Array.isArray(jsonData?.timeline)) {
    const tl = document.createElement('div');
    tl.className = 'timeline';
    jsonData.timeline.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'tl-item';
      item.innerHTML = `
        <div class="tl-dot"></div>
        <div class="tl-year">${entry.year}</div>
        <div class="tl-title">${entry.title}</div>
        ${entry.org  ? `<div class="tl-org">${entry.org}</div>` : ''}
        ${entry.desc ? `<div class="tl-desc">${entry.desc}</div>` : ''}
        ${entry.tags?.length ? `<div class="tl-tags">${entry.tags.map(t => `<span class="tl-tag">#${t}</span>`).join('')}</div>` : ''}
      `;
      tl.appendChild(item);
    });
    container.appendChild(tl);
  }

  if (node.folder) {
    const works = (jsonData?.works && typeof jsonData.works === 'object') ? jsonData.works : {};
    const files = await loadImages(node.folder);
    files.forEach(filename => {
      const baseName = filename.replace(/\.[^.]+$/, '');
      const card = document.createElement('div');
      card.className = 'panel-image-card';
      const img = document.createElement('img');
      img.src = `/${node.folder}/thumbs/${encodeURIComponent(filename)}`;
      img.alt = filename;
      img.className = 'panel-image';
      const workTitle = document.createElement('div');
      workTitle.className = 'panel-image-label';
      workTitle.textContent = baseName;
      const workDesc = document.createElement('div');
      workDesc.className = 'panel-image-desc';
      workDesc.textContent = works[baseName] ?? '';
      card.appendChild(img);
      card.appendChild(workTitle);
      card.appendChild(workDesc);
      container.appendChild(card);
    });
  }
}

// ─── Sub Panel ────────────────────────────────────────────────────────────────
const subPanel    = document.getElementById('sub-panel');
const subCategory = document.getElementById('sub-panel-category');
const subTitle    = document.getElementById('sub-panel-title');
const subDivider  = document.getElementById('sub-panel-divider');
const subDesc     = document.getElementById('sub-panel-desc');
const subItems    = document.getElementById('sub-panel-items');

async function openSubPanel(subNode, parentLabel = 'works') {
  subCategory.textContent     = parentLabel.toLowerCase();
  subTitle.textContent        = subNode.label;
  subDivider.style.background = subNode.glowColor;
  subDesc.textContent         = subNode.desc;
  subItems.innerHTML          = '';
  subPanel.style.setProperty('--node-color', subNode.glowColor);
  subPanel.classList.add('open');
  await fillContent(subNode, subItems);
}

function closeSubPanel() {
  subPanel.classList.remove('open');
}

// ─── Node Panel ───────────────────────────────────────────────────────────────
const panel         = document.getElementById('panel');
const panelClose    = document.getElementById('panel-close');
const panelCategory = document.getElementById('panel-category');
const panelTitle    = document.getElementById('panel-title');
const panelDivider  = document.getElementById('panel-divider');
const panelDesc     = document.getElementById('panel-desc');
const panelItems    = document.getElementById('panel-items');
const hint          = document.getElementById('hint');

export async function openPanel(node) {
  closeSubPanel();
  panelCategory.textContent     = node.subNodes ? node.id : 'works';
  panelTitle.textContent        = node.label;
  panelDivider.style.background = node.glowColor;
  panelDesc.textContent         = node.desc;
  panelItems.innerHTML          = '';

  if (node.subNodes) {
    if (node.embedFile || node.embed) {
      const embedDiv = document.createElement('div');
      embedDiv.className = 'panel-embed';
      if (node.embedFile) {
        const res = await fetch(`/${node.embedFile}`);
        if (res.ok) embedDiv.innerHTML = await res.text();
      } else {
        embedDiv.innerHTML = node.embed;
      }
      panelItems.appendChild(embedDiv);
    }
    node.subNodes.forEach(sub => {
      const card = document.createElement('div');
      card.className = 'panel-item';
      card.style.borderColor = sub.glowColor + '44';
      card.innerHTML = `<div class="panel-item-title">${sub.label}</div>
                        <div class="panel-item-sub">${sub.desc}</div>`;
      card.addEventListener('click', () => openSubPanel(sub, node.label));
      panelItems.appendChild(card);
    });
  } else if (node.type === 'text') {
    const jsonData = node.jsonFile ? await loadJson(node.jsonFile) : null;
    (jsonData?.items ?? []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'panel-item';
      card.style.marginBottom = '16px';
      card.innerHTML = `<div class="panel-item-title" style="font-size:22px;margin-bottom:8px;line-height:1.2">${item.title}</div>
                        <div class="panel-item-sub" style="font-size:18px;line-height:1.2">${item.desc ?? ''}</div>`;
      panelItems.appendChild(card);
    });
  } else {
    await fillContent(node, panelItems);
  }

  panel.style.setProperty('--node-color', node.glowColor);
  panel.classList.add('open');
  hint.style.opacity = '0';
}

export function closePanel() {
  panel.classList.remove('open');
  closeSubPanel();
  resetCamera();
  sphereMeshes.forEach(({ gem, node: n }) => {
    gem.material.emissive.set(new THREE.Color(n.color).multiplyScalar(0.6));
    gem.scale.setScalar(gem.userData.baseScale);
  });
}

panelClose.addEventListener('click', closePanel);

// ─── About Panel ──────────────────────────────────────────────────────────────
const aboutPanel  = document.getElementById('about-panel');
const aboutClose  = document.getElementById('about-close');
const aboutScreen = document.getElementById('about-screen');
const ruler       = document.getElementById('about-ruler');

function visualWidth(str) {
  let w = 0;
  for (const ch of str) {
    w += /[가-힣ᄀ-ᇿ㄰-㆏]/.test(ch) ? 2 : 1;
  }
  return w;
}

function calcCols() {
  const charW   = ruler.getBoundingClientRect().width;
  const screenW = aboutScreen.clientWidth
                - parseFloat(getComputedStyle(aboutScreen).paddingLeft)
                - parseFloat(getComputedStyle(aboutScreen).paddingRight);
  return Math.floor(screenW / charW) - 1;
}

function buildLines(data, cols) {
  const lines    = [];
  const addPlain = text           => lines.push({ type: 'plain', text });
  const addField = (label, value) => {
    const prefix  = '* ' + label + ' ';
    const suffix  = ' ' + value;
    const hyphens = Math.max(2, cols - visualWidth(prefix) - visualWidth(suffix));
    lines.push({ type: 'field', prefix, hyphens: '-'.repeat(hyphens), suffix });
  };
  const addHeader = label => {
    const inner = ' ' + label + ' ';
    const pad   = Math.max(0, cols - visualWidth(inner));
    const left  = Math.floor(pad / 2);
    const right = pad - left;
    addPlain('-'.repeat(left) + inner + '-'.repeat(right));
  };

  if (data.bio) { addPlain(data.bio); addPlain(''); }
  Object.entries(data).forEach(([key, items], i) => {
    if (key === 'bio' || !Array.isArray(items)) return;
    if (i > 0) addPlain('');
    addHeader(key); addPlain('');
    for (const item of items) addField(item.label, item.value);
  });
  addPlain('');
  return lines;
}

let animating = false;

async function typeText(node, text, delay) {
  for (const ch of text) {
    if (!animating) return;
    node.textContent += ch;
    await new Promise(r => setTimeout(r, delay));
  }
}

async function typeLines(lines) {
  aboutScreen.innerHTML = '';
  for (const line of lines) {
    if (!animating) return;
    if (line.type === 'plain') {
      const span = document.createElement('span');
      span.className = 'ab-plain';
      aboutScreen.appendChild(span);
      await typeText(span, line.text, 2);
    } else {
      const pre = document.createElement('span'); pre.className = 'ab-bold';
      const hyp = document.createElement('span'); hyp.className = 'ab-dim';
      const suf = document.createElement('span'); suf.className = 'ab-plain';
      aboutScreen.appendChild(pre);
      await typeText(pre, line.prefix, 2);
      aboutScreen.appendChild(hyp);
      await typeText(hyp, line.hyphens, 1);
      aboutScreen.appendChild(suf);
      await typeText(suf, line.suffix, 2);
    }
    aboutScreen.appendChild(document.createTextNode('\n'));
    await new Promise(r => setTimeout(r, line.text === '' ? 10 : 6));
  }

  if (animating) {
    const cursor = document.createTextNode('█');
    aboutScreen.appendChild(cursor);
    const blink = setInterval(() => {
      if (!animating) { clearInterval(blink); cursor.textContent = ''; return; }
      cursor.textContent = cursor.textContent === '█' ? ' ' : '█';
    }, 500);
  }
}

async function runAnimation() {
  const data = await fetch('/links/about.json').then(r => r.ok ? r.json() : {}).catch(() => ({}));
  typeLines(buildLines(data, calcCols()));
}

export function openAbout() {
  if (animating || aboutPanel.classList.contains('open')) return;
  aboutPanel.classList.add('open');
  animating = true;
  requestAnimationFrame(() => requestAnimationFrame(() => runAnimation()));
}

export function closeAbout() {
  animating = false;
  aboutPanel.classList.remove('open');
}

aboutClose.addEventListener('click', closeAbout);

preloadAllOgImages();
