import { GltfObject } from '../core/SceneObject.js';

export const boardChildren = [];

GltfObject.load('model/board.glb')
  .then(obj => {
    obj.normalizeTo(2);
    obj.snapToFloor(-2.5);
    obj.root.position.x += 4.5 - 12;
    obj.root.position.z += 3;

    obj.meshes().forEach(child => {
      child.castShadow = true;
      boardChildren.push(child);
    });

    //obj.addToScene();
  })
  .catch(err => console.warn('board.glb 로드 실패:', err));
