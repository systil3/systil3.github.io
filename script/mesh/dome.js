import * as THREE from 'three';
import { StlObject } from '../core/SceneObject.js';

const mat = new THREE.MeshStandardMaterial({
  color: 0xaabbff,
  transparent: true,
  opacity: 0.15,
  roughness: 0.9,
  metalness: 0.0,
  side: THREE.DoubleSide,
  depthWrite: false,
});

StlObject.load('model/icosphere.stl', mat)
  .then(obj => obj.normalizeTo(48).setPosition(0, 1, 0).addToScene())
  .catch(err => console.warn('icosphere.stl 로드 실패:', err));
