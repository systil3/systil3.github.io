import * as THREE from 'three';
import { scene } from '../core/scene.js';
import { NODES } from '../data/nodes.js';
import { loadSTL } from '../core/loadSTL.js';

// 라벨만 담는 별도 씬 — 풀해상도로 렌더
export const labelScene = new THREE.Scene();

export const sphereMeshes = [];

let gemsReadyResolve;
export const gemsReadyPromise = new Promise(r => { gemsReadyResolve = r; });

const glowGeo = new THREE.SphereGeometry(0.55, 24, 24);

function darkenHex(hex, factor) {
  const c = new THREE.Color(hex);
  c.r *= factor; c.g *= factor; c.b *= factor;
  return '#' + c.getHexString();
}

function makeLabel(text, color) {
  const darkColor = darkenHex(color, 0.3);
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 96;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 512, 96);
  ctx.font = '48px "VCR OSD Mono", monospace';
  ctx.fillStyle = darkColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = darkColor;
  ctx.shadowBlur = 6;
  ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(cv);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const labelText = new THREE.Sprite(mat);
  labelText.scale.set(2.8, 0.52, 1);
  return labelText;
}

function spawnGemNode(node, geo) {
  const mat = new THREE.MeshStandardMaterial({
    color: node.color,
    roughness: 0.0,
    metalness: 0.3,
    emissive: new THREE.Color(node.color).multiplyScalar(0.6),
    emissiveIntensity: 2.2,
    side: THREE.DoubleSide,
    flatShading: true,
  });
  const gem = new THREE.Mesh(geo, mat);

  const box = new THREE.Box3().setFromObject(gem);
  const size = new THREE.Vector3();
  box.getSize(size);
  const baseScale = 1.8 / Math.max(size.x, size.y, size.z);
  gem.scale.setScalar(baseScale);
  gem.userData.baseScale = baseScale;

  gem.position.copy(node.pos);
  gem.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
  gem.rotation.z = Math.random() * Math.PI * 2;
  gem.userData.nodeId = node.id;
  gem.userData.node   = node;
  gem.castShadow = true;
  scene.add(gem);

  const glowMat = new THREE.MeshBasicMaterial({
    color: node.color, transparent: true, opacity: 0.18,
    depthWrite: false, side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.copy(node.pos);
  scene.add(glow);

  const labelText = makeLabel(node.label, node.glowColor);
  labelScene.add(labelText);

  const pointLightBot = new THREE.PointLight(node.color, 12, 4, 4);
  pointLightBot.position.copy(node.pos);
  pointLightBot.position.y -= 1;
  scene.add(pointLightBot);

  const pointLightTop = new THREE.PointLight(node.color, 12, 4, 4);
  pointLightTop.position.copy(node.pos);
  pointLightTop.position.y += 0.7;
  scene.add(pointLightTop);

  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitSphere.position.copy(node.pos);
  hitSphere.userData = { nodeId: node.id, node };
  scene.add(hitSphere);

  sphereMeshes.push({ sphere: hitSphere, gem, glow, pointLightBot, pointLightTop, labelText, node });
}

loadSTL('model/gem.stl').then(geo => {
  NODES.forEach(node => spawnGemNode(node, geo));
  gemsReadyResolve();
}).catch(err => console.error('gem.stl 로드 실패', err));
