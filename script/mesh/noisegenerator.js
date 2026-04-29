import * as THREE from 'three';
import { GltfObject } from '../core/SceneObject.js';

export const noiseChildren = [];

GltfObject.load('model/noisegenerator.glb')
  .then(obj => {
    obj.normalizeTo(2.5).snapToFloor(-2.5);
    obj.root.position.x -= 12;
    obj.root.position.z += 3;
    obj.addToScene();

    obj.meshes().forEach(child => {
      const mat = child.material;
      if (!mat || Array.isArray(mat)) { noiseChildren.push(child); return; }

      if (mat.emissiveMap) {
        // gradient lives in the emission channel — white emissive lets the map show through
        mat.emissive = new THREE.Color(1, 1, 1);
        mat.emissiveIntensity = 1;
        mat.needsUpdate = true;
      } else if (mat.map) {
        // image-textured meshes: swap to unlit so the texture shows at full brightness
        child.material = new THREE.MeshBasicMaterial({
          map:         mat.map,
          transparent: mat.transparent,
          alphaTest:   mat.alphaTest,
          side:        mat.side ?? THREE.FrontSide,
        });
      }
      noiseChildren.push(child);
    });
  })
  .catch(err => console.warn('noisegenerator.glb 로드 실패:', err));
