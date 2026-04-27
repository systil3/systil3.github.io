import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { scene } from '../core/scene.js';

const STAR_COUNT    = 24;
const NODE_R        = 6.0;
const R_MIN         = NODE_R * 0.5;
const R_MAX         = NODE_R * 3;
const STAR_COLOR    = 0xffe8a0;
const STAR_EMISSIVE = 0xffcc44;

const starParams = Array.from({ length: STAR_COUNT }, () => ({
  radius: R_MIN + Math.random() * (R_MAX - R_MIN),
  speed:  0.3 + Math.random() * 0.7,
  phase:  Math.random() * Math.PI * 2,
  tiltX:  THREE.MathUtils.degToRad((Math.random() - 0.5) * 60),
  tiltZ:  THREE.MathUtils.degToRad((Math.random() - 0.5) * 60),
  rotSpeedX: (Math.random() - 0.5) * 0.06,
  rotSpeedY: (Math.random() - 0.5) * 0.06,
  rotSpeedZ: (Math.random() - 0.5) * 0.06,
}));

const stars = [];

new OBJLoader().load('model/star.obj', obj => {
  let geo = null;
  obj.traverse(child => { if (!geo && child.isMesh) geo = child.geometry; });
  if (!geo) { console.warn('star.obj geometry 없음'); return; }

  geo.computeVertexNormals();
  geo.computeBoundingBox();
  const center = new THREE.Vector3();
  geo.boundingBox.getCenter(center);
  geo.translate(-center.x, -center.y, -center.z);

  // Z-up → Y-up 보정
  const fixMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
  geo.applyMatrix4(fixMatrix);

  geo.computeBoundingBox();
  const size = new THREE.Vector3();
  geo.boundingBox.getSize(size);
  const norm = 0.2 / Math.max(size.x, size.y, size.z);
  geo.scale(norm, norm, norm);

  starParams.forEach(p => {
    const mat = new THREE.MeshStandardMaterial({
      color: STAR_COLOR,
      emissive: new THREE.Color(STAR_EMISSIVE),
      emissiveIntensity: 3.5,
      roughness: 0.3,
      metalness: 0.6,
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    scene.add(mesh);
    stars.push({ mesh, params: p });
  });
}, undefined, err => console.warn('star.obj 로드 실패:', err));

export function tickStarOrbits(centerPos, t) {
  stars.forEach(({ mesh, params }) => {
    const a = t * params.speed + params.phase;

    const px = Math.cos(a) * params.radius;
    const pz = Math.sin(a) * params.radius;

    const py_x = pz * Math.sin(params.tiltX);
    const pz_x = pz * Math.cos(params.tiltX);

    const px_z = px * Math.cos(params.tiltZ) - py_x * Math.sin(params.tiltZ);
    const py_z = px * Math.sin(params.tiltZ) + py_x * Math.cos(params.tiltZ);

    mesh.position.set(
      centerPos.x + px_z,
      centerPos.y + py_z,
      centerPos.z + pz_x,
    );

    mesh.rotation.x += params.rotSpeedX;
    mesh.rotation.y += params.rotSpeedY;
    mesh.rotation.z += params.rotSpeedZ;
  });
}
