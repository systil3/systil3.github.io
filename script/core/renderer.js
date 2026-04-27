import * as THREE from 'three';

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

      // 왜곡 범위 밖으로 나간 정도에 따라 비네팅
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
