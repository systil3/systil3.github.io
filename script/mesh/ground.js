import * as THREE from 'three';
import { scene } from '../core/scene.js';

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(100, 64),
  new THREE.MeshStandardMaterial({ color: 0x0e0a22, roughness: 0.85, metalness: 0.5, flatShading: true })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.5;
ground.receiveShadow = true;
scene.add(ground);
