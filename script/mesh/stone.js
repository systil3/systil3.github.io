import * as THREE from 'three';
import { scene } from '../core/scene.js';
import { loadSTL } from '../core/SceneObject.js';
import { initFlameParticles, tickFlameParticles } from './flameParticles.js';

export const stoneMeshes = [];

const GROUND_Y  = -2.5;
const SPACING   = 2.0;
const FRONT_Z   = 3.6;
const BOB_SPEED = 1.2;
const BOB_AMP   = 0.15;

const stoneEntries = []; // { stone, sprite, baseY, phase }

async function loadSocialEntries() {
  const data = await fetch('links/social.json').then(r => r.json());
  return Object.entries(data).map(([platform, url]) => ({ platform, url }));
}

function loadIconTexture(platform) {
  return new Promise(resolve => {
    new THREE.TextureLoader().load(
      `icons/${platform}.png`,
      tex => resolve(tex),
      undefined,
      () => resolve(null),
    );
  });
}

loadSTL('model/stone.stl').then(async geo => {
  geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  geo.applyMatrix4(new THREE.Matrix4().makeRotationY(-Math.PI / 2));

  geo.computeBoundingBox();
  const geoSize = new THREE.Vector3();
  geo.boundingBox.getSize(geoSize);
  const norm = 1.05 / Math.max(geoSize.x, geoSize.y, geoSize.z);
  geo.scale(norm, norm, norm);

  geo.computeBoundingBox();
  const scaledSize = new THREE.Vector3();
  geo.boundingBox.getSize(scaledSize);
  const stoneHalfH = scaledSize.y / 2;
  const stoneHalfD = scaledSize.z / 2;

  const entries = await loadSocialEntries();
  const count   = entries.length;
  const startX  = -((count - 1) / 2) * SPACING;

  for (let i = 0; i < count; i++) {
    const { platform, url } = entries[i];
    const x     = startX + i * SPACING;
    const baseY = GROUND_Y + stoneHalfH;
    const phase = Math.random() * Math.PI * 2;

    const stone = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: 0x778899, roughness: 0.85, metalness: 0.05, flatShading: true,
    }));
    stone.position.set(x, baseY, FRONT_Z);
    stone.userData = { platform, url };
    scene.add(stone);
    stoneMeshes.push(stone);

    const entry = { stone, sprite: null, baseY, phase };
    stoneEntries.push(entry);

    const tex = await loadIconTexture(platform);
    if (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      const icon = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthWrite: false, sizeAttenuation: true,
      }));
      icon.scale.set(0.55, 0.55, 1);
      icon.position.set(x, baseY, FRONT_Z + stoneHalfD + 0.05);
      scene.add(icon);
      entry.sprite = icon;
    }
  }

  initFlameParticles(stoneEntries, scene);
}).catch(err => console.warn('stone.stl 로드 실패:', err));

export function tickStones(t) {
  stoneEntries.forEach(({ stone, sprite, baseY, phase }) => {
    const bob = Math.sin(t * BOB_SPEED + phase) * BOB_AMP;
    stone.position.y          = baseY + bob;
    if (sprite) sprite.position.y = baseY + bob;
  });
  tickFlameParticles();
}
