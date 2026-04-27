import * as THREE from 'three';
import { scene } from '../core/scene.js';

export const PARTICLE_COUNT = 300;
export const origins = new Float32Array(PARTICLE_COUNT * 3);
export const positions = new Float32Array(PARTICLE_COUNT * 3);

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const x = (Math.random() - 0.5) * 50;
  const y = (Math.random() - 0.5) * 30 + 5;
  const z = (Math.random() - 0.5) * 50;
  origins[i * 3]     = positions[i * 3]     = x;
  origins[i * 3 + 1] = positions[i * 3 + 1] = y;
  origins[i * 3 + 2] = positions[i * 3 + 2] = z;
}

export const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

scene.add(new THREE.Points(particleGeo, new THREE.PointsMaterial({
  color: 0x888899, size: 0.06, transparent: true, opacity: 0.4,
})));
