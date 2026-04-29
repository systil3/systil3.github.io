import { generateTerrain }  from './algorithm.js';
import { normalize, boxBlur, trimLast } from './postprocess.js';
import { renderTerrain }      from './canvas-renderer.js';
import { uniqueNamesGenerator, adjectives, animals } 
  from 'https://esm.sh/unique-names-generator@4';

const canvas   = document.getElementById('canvas');
const statusEl = document.getElementById('status');
let cached = null;
let customName = null;

function readControls() {
  return {
    n:         (2 ** +document.getElementById('seg').value),
    roughness: +document.getElementById('rough').value,
    denoise:   +document.getElementById('denoise').value,
    scheme:    document.getElementById('scheme').value,
  };
}

function generate() {
  const { n, roughness, denoise, scheme } = readControls();
  const cells = n - 1;
  statusEl.textContent = 'generating…';

  setTimeout(() => {
    const t0  = performance.now();
    const g   = n + 1;  // grid size: 2^v + 1 
    const mat = generateTerrain(g, roughness);
    let terrain = normalize(mat, g * g); 
    if (denoise > 0)
      terrain = boxBlur(terrain, g, g, Math.max(1, denoise * 0.15 | 0));

    const trimmed = trimLast(g, terrain); // g×g → n×n
    cached = { terrain: trimmed, cells: n };
    renderTerrain(canvas, trimmed, n, scheme);
    statusEl.textContent = `${n}×${n}  •  ${(performance.now() - t0).toFixed(0)} ms`;
  }, 10);

  customName = uniqueNamesGenerator ({
      dictionaries: [adjectives, animals], // 사전 설정
      length: 2,
      separator: '_',
  })
}

function bindSlider(sliderId, labelId, fmt = v => v) {
  const slider = document.getElementById(sliderId);
  const label  = document.getElementById(labelId);
  slider.addEventListener('input', () => { label.textContent = fmt(slider.value); });
}

function fitCanvas() {
  const wrap = canvas.parentElement;
  const { width, height } = wrap.getBoundingClientRect();
  const size = Math.min(width, height) - 20;
  if (size > 0) {
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';
  }
}

export function initUI() {
  new ResizeObserver(fitCanvas).observe(canvas.parentElement);
  fitCanvas();
  bindSlider('seg',    'seg-val',    v => (2 ** v));
  bindSlider('rough',  'rough-val');
  bindSlider('denoise','denoise-val');

  const rc = readControls();
  document.getElementById('scheme').addEventListener('change', () => {
    if (cached) renderTerrain(canvas, cached.terrain, cached.cells, rc.scheme);
  });

  document.getElementById('gen-btn').addEventListener('click', generate);

  document.getElementById('save-btn').addEventListener('click', () => {
    if (!cached) return;

    const a  = document.createElement('a');
    a.download = `${customName}_n=${rc.n}_rough=${rc.roughness}_denoise=${rc.denoise}.png`;
    a.href     = canvas.toDataURL(`${customName}_${rc.scheme}_n=${rc.n}_rough=${rc.roughness}_denoise=${rc.denoise}`);
    a.click();
  });
}
