import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { renderer, onResize } from './renderer.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a14);
scene.fog = new THREE.FogExp2(0x0a0a14, 0.03);

export const camera = new THREE.PerspectiveCamera(
  55, window.innerWidth / window.innerHeight, 0.1, 100
);

export const CAMERA_INIT_POS    = new THREE.Vector3(Math.sin(Math.PI / 5) * 11, 1, Math.cos(Math.PI / 5) * 11);
export const CAMERA_INIT_TARGET = new THREE.Vector3(0, 1, 0);

camera.position.copy(CAMERA_INIT_POS);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance   = 4;
controls.maxDistance   = 35;
controls.target.copy(CAMERA_INIT_TARGET);
controls.mouseButtons  = {
  LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN,
};

renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  onResize();
});
