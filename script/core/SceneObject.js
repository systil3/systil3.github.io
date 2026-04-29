import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { scene as defaultScene } from './scene.js';

// ─── loadSTL ──────────────────────────────────────────────────────────────────
const stlLoader = new STLLoader();

export function loadSTL(path) {
  return new Promise((resolve, reject) => {
    stlLoader.load(path, geo => {
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      const center = new THREE.Vector3();
      geo.boundingBox.getCenter(center);
      geo.translate(-center.x, -center.y, -center.z);
      resolve(geo);
    }, undefined, reject);
  });
}

// ─── SceneObject ──────────────────────────────────────────────────────────────
export class SceneObject {
  constructor(root, scene = defaultScene) {
    this.root  = root;
    this.scene = scene;
  }

  normalizeTo(targetSize) {
    const box  = new THREE.Box3().setFromObject(this.root);
    const size = new THREE.Vector3();
    box.getSize(size);
    this.root.scale.setScalar(targetSize / Math.max(size.x, size.y, size.z));
    this.root.updateWorldMatrix(true, true);
    return this;
  }

  snapToFloor(groundY = -2.5) {
    const box = new THREE.Box3().setFromObject(this.root);
    this.root.position.y += groundY - box.min.y;
    return this;
  }

  setPosition(x, y, z) {
    this.root.position.set(x, y, z);
    return this;
  }

  addToScene() {
    this.scene.add(this.root);
    return this;
  }
}

// ─── GltfObject ───────────────────────────────────────────────────────────────
const gltfLoader = new GLTFLoader();

export class GltfObject extends SceneObject {
  static load(path, scene = defaultScene) {
    return new Promise((resolve, reject) => {
      gltfLoader.load(path,
        gltf => resolve(new GltfObject(gltf.scene, scene)),
        undefined,
        reject,
      );
    });
  }

  meshes() {
    const out = [];
    this.root.traverse(c => { if (c.isMesh) out.push(c); });
    return out;
  }
}

// ─── StlObject ────────────────────────────────────────────────────────────────
export class StlObject extends SceneObject {
  static load(path, material, scene = defaultScene) {
    return loadSTL(path).then(geo => new StlObject(new THREE.Mesh(geo, material), scene));
  }

  get geometry() { return this.root.geometry; }
}
