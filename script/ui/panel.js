import * as THREE from 'three';
import { sphereMeshes } from '../mesh/gems.js';
import { resetCamera } from '../core/scene.js';

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

// ─── Node Panel ───────────────────────────────────────────────────────────────
const panel         = document.getElementById('panel');
const panelClose    = document.getElementById('panel-close');
const panelCategory = document.getElementById('panel-category');
const panelTitle    = document.getElementById('panel-title');
const panelDivider  = document.getElementById('panel-divider');
const panelDesc     = document.getElementById('panel-desc');
const panelItems    = document.getElementById('panel-items');
const hint          = document.getElementById('hint');

async function loadImages(folder) {
  const res = await fetch(`/${folder}/images.json`);
  return res.ok ? res.json() : [];
}

async function loadJson(file) {
  const res = await fetch(`/${file}`);
  return res.ok ? res.json() : null;
}

export async function openPanel(node, wide = false) {
  panel.classList.toggle('wide', wide);
  panelCategory.textContent     = 'works';
  panelTitle.textContent        = node.label;
  panelDivider.style.background = node.glowColor;
  panelDesc.textContent         = node.desc;
  panelItems.innerHTML          = '';

  node.items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'panel-item';
    el.innerHTML = `<div class="panel-item-title">${item.title}</div>
                    <div class="panel-item-sub">${item.sub}</div>`;
    panelItems.appendChild(el);
  });

  const jsonPath = node.jsonFile ?? `links/${node.id}.json`;
  const jsonData = await loadJson(jsonPath);

  const links = Array.isArray(jsonData?.links) ? jsonData.links : [];
  links.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'panel-image-card' + (entry.link ? ' panel-item-link' : '');
    if (entry.link) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => window.open(entry.link, '_blank'));
      const img = document.createElement('img');
      img.className = 'panel-image';
      img.style.display = 'none';
      card.appendChild(img);
      fetch(`/api/og?url=${encodeURIComponent(entry.link)}`)
        .then(r => r.json())
        .then(({ url }) => { if (url) { img.src = url; img.style.display = 'block'; } })
        .catch(() => {});
    }
    const titleEl = document.createElement('div');
    titleEl.className = 'panel-image-label';
    titleEl.textContent = entry.title;
    const descEl = document.createElement('div');
    descEl.className = 'panel-image-desc';
    descEl.textContent = entry.desc;
    card.appendChild(titleEl);
    card.appendChild(descEl);
    panelItems.appendChild(card);
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
    panelItems.appendChild(tl);
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
      panelItems.appendChild(card);
    });
  }

  panel.style.setProperty('--node-color', node.glowColor);
  panel.classList.add('open');
  hint.style.opacity = '0';
}

export function closePanel() {
  panel.classList.remove('open', 'wide');
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
  const addPlain = text         => lines.push({ type: 'plain', text });
  const addSep   = ()           => addPlain('-'.repeat(cols));
  const addField = (label, value) => {
    const prefix  = '* ' + label + ' ';
    const suffix  = ' ' + value;
    const hyphens = Math.max(2, cols - visualWidth(prefix) - visualWidth(suffix));
    lines.push({ type: 'field', prefix, hyphens: '-'.repeat(hyphens), suffix });
  };

  if (data.bio) { addPlain(data.bio); addPlain(''); }
  addSep(); addPlain('');
  for (const f of (data.fields ?? []))  addField(f.label, f.value);
  if (data.education?.length) {
    addPlain(''); addSep(); addPlain('');
    for (const e of data.education)     addField(e.label, e.value);
  }
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
