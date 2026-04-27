import * as THREE from 'three';
import { scene } from '../core/scene.js';
import { loadSTL } from '../core/loadSTL.js';
import { NODE_R_EXPORT as NODE_R } from '../data/nodes.js';

const COUNT    = 0;
const R_MIN    = NODE_R * 1.2;
const R_MAX    = NODE_R * 2.2;
const GROUND_Y = -2.5;
const TILT_MAX = THREE.MathUtils.degToRad(20);

loadSTL('model/obst.stl').then(geo => {
  // Z-up → Y-up 보정
  geo.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  // 기준 크기 정규화 (1.0 단위)
  geo.computeBoundingBox();
  const size = new THREE.Vector3();
  geo.boundingBox.getSize(size);
  const baseNorm = 1.0 / Math.max(size.x, size.y, size.z);
  geo.scale(baseNorm, baseNorm, baseNorm);

  geo.computeBoundingBox();
  const scaledSize = new THREE.Vector3();
  geo.boundingBox.getSize(scaledSize);
  const halfH = scaledSize.y / 2;

  const mat = new THREE.MeshStandardMaterial({
    color: 0x556677,
    roughness: 0.9,
    metalness: 0.05,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < COUNT; i++) {
    const angle  = Math.random() * Math.PI * 2;
    const radius = R_MIN + Math.random() * (R_MAX - R_MIN);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const scale = 0.5 + Math.random() * 2.0;

    const mesh = new THREE.Mesh(geo, mat.clone());
    mesh.scale.setScalar(scale);
    mesh.position.set(x, GROUND_Y + halfH * scale, z);

    // Y축: 전방향 회전
    mesh.rotation.y = Math.random() * Math.PI * 2;
    // X/Z축: ±20도 랜덤 기울기
    mesh.rotation.x += (Math.random() - 0.5) * 2 * TILT_MAX;
    mesh.rotation.z += (Math.random() - 0.5) * 2 * TILT_MAX;

    mesh.frustumCulled = false;
    scene.add(mesh);
  }
}).catch(err => console.warn('obst.stl 로드 실패:', err));
