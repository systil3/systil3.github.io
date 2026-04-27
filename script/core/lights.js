import * as THREE from 'three';
import { scene } from './scene.js';

// 기본 환경광 (매우 어둡게 유지)
scene.add(new THREE.AmbientLight(0x111133,1.2));

// 방향광
const dirLight = new THREE.DirectionalLight(0x8899ff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x4422aa, 0.5);
rimLight.position.set(-5, 3, -5);
scene.add(rimLight);

// 중앙 바닥 포인트 라이트 (보석별 라이트는 mesh/gems.js에서 개별 추가)
const centerLight = new THREE.PointLight(0x3344ff, 20, 30, 2);
centerLight.position.set(0, -0.3, -0.4);
scene.add(centerLight);

export const pointLights = [centerLight];
