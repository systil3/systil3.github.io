import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from '../core/scene.js';

export let centerMesh  = null;
export let centerBaseY = 0;

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

export const centerReadyPromise = new Promise((resolve) => {
  new GLTFLoader().load('model/center.glb', gltf => {
    const root = gltf.scene;

    // flatShading 적용
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0, roughness: 0.1, metalness: 0.0,
      emissive: new THREE.Color(0xf0f0f0), emissiveIntensity: 111.5,
      flatShading: true, side: THREE.DoubleSide,
    });

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3a3880, roughness: 0.4, metalness: 0.1,
      emissive: new THREE.Color(0x3a3880), emissiveIntensity: 0.6,
      flatShading: true, side: THREE.DoubleSide,
    });

    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x1a2460, roughness: 0.4, metalness: 0.0,
      emissive: new THREE.Color(0x1a2460), emissiveIntensity: 0.7,
      flatShading: true, side: THREE.DoubleSide,
    });


    root.traverse(child => {
      if (!child.isMesh) return;
      if (/cone/i.test(child.name)) {
        child.material = eyeMat;
      } else if (child.name === 'Cube001') {
        child.material = capeMat;
      } else if (child.name === 'Cube' || child.name === 'Cube002') {
        child.material = bodyMat;
      } else {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => {
          m.flatShading = true;
          m.side = THREE.DoubleSide;
          m.needsUpdate = true;
        });
      }
      child.castShadow = child.receiveShadow = true;
    });

    // 크기 정규화
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = 6 / Math.max(size.x, size.y, size.z);
    root.scale.setScalar(scale);

    // 바닥에 붙이기
    const box2 = new THREE.Box3().setFromObject(root);
    root.position.y = -box2.min.y - 2.5;

    const box3 = new THREE.Box3().setFromObject(root);
    const gap  = box3.min.y - (-2.5);
    root.position.y -= gap;

    centerBaseY = root.position.y;
    centerMesh  = root;

    scene.add(root);
    resolve(gap);
  }, undefined, err => {
    console.error('center.glb 로드 실패:', err);
    resolve(0);
  });
});
