import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Renderer ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('c');

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.NoToneMapping;

export const RESOLUTION_SCALE = 0.36;

let rtW = Math.floor(window.innerWidth  * RESOLUTION_SCALE);
let rtH = Math.floor(window.innerHeight * RESOLUTION_SCALE);

export const renderTarget = new THREE.WebGLRenderTarget(rtW, rtH, {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  generateMipmaps: false,
});

const crtMat = new THREE.ShaderMaterial({
  depthTest: false, depthWrite: false,
  uniforms: { tDiffuse: { value: renderTarget.texture } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv * 2.0 - 1.0;
      float r2 = dot(uv, uv);
      float r4 = r2 * r2;
      float r6 = r4 * r2;
      uv *= 1.0 + 0.1 * r2 + 0.3 * r4 + 0.2 * r6;
      uv = uv * 0.5 + 0.5;
      vec4 col = texture2D(tDiffuse, clamp(uv, 0.0, 1.0));
      col.rgb = pow(col.rgb, vec3(1.0 / 2.0));
      vec2 over = max(abs(uv * 2.0 - 1.0) - 1.0, 0.0);
      float vignette = min(1.0, 1.3 - smoothstep(0.0, 0.5, length(over)));
      col.rgb *= vignette;
      gl_FragColor = col;
    }
  `,
});

export const quadScene = new THREE.Scene();
export const quadCam   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), crtMat));

export function onResize() {
  rtW = Math.floor(window.innerWidth  * RESOLUTION_SCALE);
  rtH = Math.floor(window.innerHeight * RESOLUTION_SCALE);
  renderTarget.setSize(rtW, rtH);
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ─── Scene & Camera ───────────────────────────────────────────────────────────
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03030a);
scene.fog = new THREE.FogExp2(0x03030a, 0.03);

export const camera = new THREE.PerspectiveCamera(
  55, window.innerWidth / window.innerHeight, 0.1, 100
);

export const CAMERA_INIT_POS    = new THREE.Vector3(Math.sin(Math.PI / 5) * 12, 1, Math.cos(Math.PI / 5) * 12);
export const CAMERA_INIT_TARGET = new THREE.Vector3(0, 1, 0);

camera.position.copy(CAMERA_INIT_POS);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance   = 2;
controls.maxDistance   = 24;
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

// ─── Lights ───────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x111133, 1.2));

const dirLight = new THREE.DirectionalLight(0x8899ff, 0.8);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x4422aa, 0.5);
rimLight.position.set(-5, 3, -5);
scene.add(rimLight);

const centerLight = new THREE.PointLight(0x3344ff, 20, 30, 2);
centerLight.position.set(0, -0.3, -0.4);
scene.add(centerLight);

export const pointLights = [centerLight];

// ─── Camera Focus ─────────────────────────────────────────────────────────────
let camAnimT          = 0;
let camAnimFrom       = null;
let camAnimFromTarget = null;
let resetDestCam      = null;
let resetDestTarget   = null;
let followNode      = null;

const _camOffset = new THREE.Vector3(0, 0.5, 4.5);

function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

export function focusOnNode(sphere) {
  camAnimFrom       = camera.position.clone();
  camAnimFromTarget = controls.target.clone();
  camAnimT          = 0;
  resetDestCam      = null;
  resetDestTarget   = null;
  followNode      = sphere ?? null;
}

export function resetCamera() {
  followNode      = null;
  camAnimFrom       = camera.position.clone();
  camAnimFromTarget = controls.target.clone();
  resetDestCam      = CAMERA_INIT_POS.clone();
  resetDestTarget   = CAMERA_INIT_TARGET.clone();
  camAnimT          = 0;
}

export function clearFollow() {
  followNode = null;
}

export function tickCameraFocus(T = 1) {
  const animating = camAnimT < T;

  if (followNode) {
    const destTarget = followNode.position;
    const destCam    = followNode.position.clone().add(_camOffset);
    if (animating) {
      camAnimT = Math.min(camAnimT + 0.01, T);
      const et = easeInOut(camAnimT / T);
      camera.position.lerpVectors(camAnimFrom, destCam, et);
      controls.target.lerpVectors(camAnimFromTarget, destTarget, et);
    } else {
      const offset = camera.position.clone().sub(controls.target);
      controls.target.copy(destTarget);
      camera.position.copy(destTarget).add(offset);
    }
    return;
  }

  if (resetDestCam && animating) {
    camAnimT = Math.min(camAnimT + 0.01, T);
    const et = easeInOut(camAnimT / T);
    camera.position.lerpVectors(camAnimFrom, resetDestCam, et);
    controls.target.lerpVectors(camAnimFromTarget, resetDestTarget, et);
    if (camAnimT >= T) {
      resetDestCam    = null;
      resetDestTarget = null;
    }
  }
}
