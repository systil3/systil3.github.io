import * as THREE from 'three';
import { scene } from '../core/scene.js';
import { GltfObject } from '../core/SceneObject.js';

export let centerMesh  = null;
export let centerBaseY = 0;
export const centerChildren = [];

function makeTitleLabel() {
  const cv = document.createElement('canvas');
  cv.width = 768; cv.height = 144;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.font = '72px "VCR OSD Mono", monospace';
  ctx.fillStyle = '#ccd6ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#04167f';
  ctx.shadowBlur = 12;
  ctx.fillText('systile', cv.width / 2, cv.height / 2);
  const tex = new THREE.CanvasTexture(cv);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.2, 0.78, 1);
  return sprite;
}

export const centerLabelText = makeTitleLabel();

const eyeMat = new THREE.MeshStandardMaterial({
  color: 0xf0f0f0, roughness: 0.1, metalness: 0.0,
  emissive: new THREE.Color(0xf0f0f0), emissiveIntensity: 111.5,
  flatShading: true, side: THREE.DoubleSide,
});
const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x3080ff, roughness: 0.4, metalness: 0.1,
  emissive: new THREE.Color(0x3a3880), emissiveIntensity: 0.6,
  flatShading: true, side: THREE.DoubleSide,
});
const capeMat = new THREE.MeshStandardMaterial({
  color: 0x1a2460, roughness: 0.4, metalness: 0.0,
  emissive: new THREE.Color(0x1a2460), emissiveIntensity: 0.7,
  flatShading: true, side: THREE.DoubleSide,
});

export const wireframeMat = new THREE.MeshBasicMaterial({
  color: 0x4488ff,
  wireframe: true,
  transparent: true,
  opacity: 0.35,
  depthWrite: false,
});

export const centerReadyPromise = new Promise(resolve => {
  GltfObject.load('model/center.glb', scene)
    .then(obj => {
      const centerChildren = [];
      obj.root.traverse(child => {
        if (!child.isMesh) return;
        if (/cone/i.test(child.name)) {
          child.material = eyeMat;
        } else if (child.name === 'Cube001') {
          child.material = capeMat;
        } else if (child.name === 'Cube' || child.name === 'Cube002') {
          child.material = bodyMat;
        } else {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => { m.flatShading = true; m.side = THREE.DoubleSide; m.needsUpdate = true; });
        }
        child.castShadow = child.receiveShadow = true;
        centerChildren.push(child);
      });

      centerChildren.forEach(child => {
        if (/cone/i.test(child.name)) return;
        const overlay = new THREE.Mesh(child.geometry, wireframeMat);
        overlay.renderOrder = 999;
        child.add(overlay);
      });

      obj.normalizeTo(6).snapToFloor(-2.5);

      centerBaseY = obj.root.position.y;
      centerMesh  = obj.root;
      obj.addToScene();
      resolve(0);
    })
    .catch(err => {
      console.error('center.glb 로드 실패:', err);
      resolve(0);
    });
});
