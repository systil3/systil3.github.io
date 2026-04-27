import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const loader = new STLLoader();

/**
 * STL 파일을 로드하고, 버텍스 노멀 계산 + 원점 중심 정렬된 geometry를 반환합니다.
 * @param {string} path
 * @returns {Promise<THREE.BufferGeometry>}
 */
export function loadSTL(path) {
  return new Promise((resolve, reject) => {
    loader.load(path, geo => {
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      const center = new THREE.Vector3();
      geo.boundingBox.getCenter(center);
      geo.translate(-center.x, -center.y, -center.z);
      resolve(geo);
    }, undefined, reject);
  });
}
