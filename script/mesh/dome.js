import * as THREE from 'three';
import { scene } from '../core/scene.js';
import { loadSTL } from '../core/loadSTL.js';

const mat = new THREE.MeshStandardMaterial({
  color: 0xaabbff,
  transparent: true,
  opacity: 0.15,
  roughness: 0.9,
  metalness: 0.0,
  side: THREE.DoubleSide,
  depthWrite: false,
});

loadSTL('model/icosphere.stl').then(geo => {
  geo.computeBoundingBox();
  const size = new THREE.Vector3();
  geo.boundingBox.getSize(size);
  const dome = new THREE.Mesh(geo, mat);
  dome.scale.setScalar(48 / Math.max(size.x, size.y, size.z));
  dome.position.set(0, 1, 0);
  scene.add(dome);
}).catch(err => console.warn('icosphere.stl 로드 실패:', err));
