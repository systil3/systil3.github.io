import * as THREE from 'three';
import { sphereMeshes } from '../mesh/gems.js';
import { resetCamera } from '../core/cameraFocus.js';

const panel         = document.getElementById('panel');
const panelClose    = document.getElementById('panel-close');
const panelCategory = document.getElementById('panel-category');
const panelTitle    = document.getElementById('panel-title');
const panelDivider  = document.getElementById('panel-divider');
const panelDesc     = document.getElementById('panel-desc');
const panelItems    = document.getElementById('panel-items');
const hint          = document.getElementById('hint');

async function loadImages(folder) {
  const res = await fetch(`/api/images/${folder}`);
  return res.ok ? res.json() : [];
}

// 전체 JSON 객체 반환 (없으면 null)
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

  // 링크 카드
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

  // 타임라인
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

  // 이미지 카드 — works 맵에서 설명 조회
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
