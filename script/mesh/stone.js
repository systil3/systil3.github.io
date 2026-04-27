import * as THREE from 'three';
import { scene } from '../core/scene.js';
import { loadSTL } from '../core/loadSTL.js';

export const stoneMeshes = [];

const GROUND_Y = -2.5;
const SPACING  = 2.0;
const FRONT_Z  = 3.6;

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

  // 정규화 (1.05 단위 크기)
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
    const x = startX + i * SPACING;
    const stoneY = GROUND_Y + stoneHalfH;

    const mat = new THREE.MeshStandardMaterial({
      color: 0x778899,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    const stone = new THREE.Mesh(geo, mat);
    stone.position.set(x, stoneY, FRONT_Z);
    stone.userData = { platform, url };
    scene.add(stone);
    stoneMeshes.push(stone);

    const tex = await loadIconTexture(platform);
    if (tex) {
      tex.colorSpace = THREE.SRGBColorSpace;
      const iconMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const icon = new THREE.Sprite(iconMat);
      icon.scale.set(0.55, 0.55, 1);
      icon.position.set(x, stoneY, FRONT_Z + stoneHalfD + 0.05);
      scene.add(icon);
    }
  }
}).catch(err => console.warn('stone.stl 로드 실패:', err));
