import * as THREE from 'three';

const FLAME_PER_STONE = 3;
const FLAME_COLOR     = new THREE.Color(0x778899);

let flamePosAttr  = null;
let flameColAttr  = null;
let stoneRefs     = null;
const flameParticles = [];

function spawnParticle(p) {
  const stone  = stoneRefs[p.si].stone;
  const radius = 0.36;
  const angle  = Math.random() * Math.PI * 2;
  const r      = Math.random() * radius;
  const i3     = p.idx * 3;
  flamePosAttr.array[i3]     = stone.position.x + Math.cos(angle) * r;
  flamePosAttr.array[i3 + 1] = stone.position.y + Math.random() * 0.08 - 0.6;
  flamePosAttr.array[i3 + 2] = stone.position.z + Math.sin(angle) * r;
  p.vx   = (Math.random() - 0.5) * 0.01;
  p.vy   = -(0.016 + Math.random() * 0.016);
  p.vz   = (Math.random() - 0.5) * 0.01;
  p.life = Math.random();
}

export function initFlameParticles(stoneEntries, scene) {
  stoneRefs       = stoneEntries;
  const total     = stoneEntries.length * FLAME_PER_STONE;
  const positions = new Float32Array(total * 3);
  const colors    = new Float32Array(total * 3);

  const geo = new THREE.BufferGeometry();
  flamePosAttr = new THREE.BufferAttribute(positions, 3);
  flameColAttr = new THREE.BufferAttribute(colors,    3);
  geo.setAttribute('position', flamePosAttr);
  geo.setAttribute('color',    flameColAttr);

  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })));

  for (let si = 0; si < stoneEntries.length; si++) {
    for (let j = 0; j < FLAME_PER_STONE; j++) {
      const p = { idx: si * FLAME_PER_STONE + j, si, life: 0, vx: 0, vy: 0, vz: 0 };
      flameParticles.push(p);
      spawnParticle(p);
    }
  }
}

export function tickFlameParticles() {
  if (!flamePosAttr) return;

  flameParticles.forEach(p => {
    p.life -= 0.022;
    if (p.life <= 0) { spawnParticle(p); return; }

    const i3 = p.idx * 3;
    flamePosAttr.array[i3]     += p.vx + (Math.random() - 0.5) * 0.004;
    flamePosAttr.array[i3 + 1] += p.vy;
    flamePosAttr.array[i3 + 2] += p.vz + (Math.random() - 0.5) * 0.004;

    flameColAttr.array[i3]     = FLAME_COLOR.r * p.life;
    flameColAttr.array[i3 + 1] = FLAME_COLOR.g * p.life;
    flameColAttr.array[i3 + 2] = FLAME_COLOR.b * p.life;
  });

  flamePosAttr.needsUpdate = true;
  flameColAttr.needsUpdate = true;
}
