import * as THREE from 'three';
import { camera, renderer, focusOnSphere } from '../core/scene.js';
import { sphereMeshes } from '../mesh/gems.js';
import { stoneMeshes } from '../mesh/stone.js';
import { openPanel, openAppPanel, openAbout } from './panel.js';
import { centerMesh } from '../mesh/center.js';
import { noiseChildren } from '../mesh/noisegenerator.js';


const raycaster       = new THREE.Raycaster();
const pointer         = new THREE.Vector2();
let pointerDownPos    = null;
const CLICK_THRESHOLD = 5;

renderer.domElement.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  pointerDownPos = { x: e.clientX, y: e.clientY };
});

renderer.domElement.addEventListener('pointerup', e => {
  if (e.button !== 0 || !pointerDownPos) return;
  const dx = e.clientX - pointerDownPos.x;
  const dy = e.clientY - pointerDownPos.y;
  pointerDownPos = null;
  if (Math.sqrt(dx * dx + dy * dy) > CLICK_THRESHOLD) return;

  pointer.x =  (e.clientX / window.innerWidth)  * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  // 중앙 캐릭터 클릭
  if (centerMesh) {
    const centerHits = raycaster.intersectObject(centerMesh, true);
    if (centerHits.length > 0) {
      openAbout();
      return;
    }
  }

  // 노이즈 제너레이터 클릭
  if (noiseChildren.length > 0) {
    const noiseHits = raycaster.intersectObjects(noiseChildren);
    if (noiseHits.length > 0) {
      const src = encodeURI('programs/terrain generation using diamond square_js/index.html');
      openAppPanel(src, 'terrain generator');
      return;
    }
  }

  // 소셜 돌 클릭 확인
  const stoneHits = raycaster.intersectObjects(stoneMeshes);
  if (stoneHits.length > 0) {
    const { url } = stoneHits[0].object.userData;
    if (url) window.open(url, '_blank', 'noopener');
    return;
  }

  const hits = raycaster.intersectObjects(sphereMeshes.map(s => s.sphere));
  if (hits.length === 0) return;

  const hit  = hits[0].object;
  const node = hit.userData.node;

  // 이전 선택 리셋
  sphereMeshes.forEach(({ gem, node: n }) => {
    gem.material.emissive.set(new THREE.Color(n.color).multiplyScalar(0.6));
    gem.scale.setScalar(gem.userData.baseScale);
  });

  // 선택 강조
  const entry = sphereMeshes.find(s => s.sphere === hit);
  if (entry) {
    entry.gem.material.emissive.set(new THREE.Color(node.color).multiplyScalar(1.0));
    entry.gem.scale.setScalar(entry.gem.userData.baseScale * 1.25);
  }

  focusOnSphere(hit);
  openPanel(node);
});
