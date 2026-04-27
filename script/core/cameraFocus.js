import * as THREE from 'three';
import { camera, controls, CAMERA_INIT_POS, CAMERA_INIT_TARGET } from './scene.js';

let camAnimT          = 0;
let camAnimFrom       = null;
let camAnimFromTarget = null;
let resetDestCam      = null; // resetCamera 전용 카메라 목적지
let resetDestTarget   = null; // resetCamera 전용 controls.target 목적지
let followSphere      = null;

const _camOffset = new THREE.Vector3(0, 0.5, 3.5);

function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

export function focusOnSphere(sphere) {
  camAnimFrom       = camera.position.clone();
  camAnimFromTarget = controls.target.clone();
  camAnimT          = 0;
  resetDestCam      = null;
  resetDestTarget   = null;
  followSphere      = sphere ?? null;
}

export function resetCamera() {
  followSphere      = null;
  camAnimFrom       = camera.position.clone();
  camAnimFromTarget = controls.target.clone();
  resetDestCam      = CAMERA_INIT_POS.clone();
  resetDestTarget   = CAMERA_INIT_TARGET.clone();
  camAnimT          = 0;
}

export function clearFollow() {
  followSphere = null;
}

export function tickCameraFocus(T = 2) {
  const animating = camAnimT < T;

  if (followSphere) {
    const destTarget = followSphere.position;
    const destCam    = followSphere.position.clone().add(_camOffset);

    if (animating) {
      camAnimT = Math.min(camAnimT + 0.01, T);
      const et = easeInOut(camAnimT / T);
      camera.position.lerpVectors(camAnimFrom, destCam, et);
      controls.target.lerpVectors(camAnimFromTarget, destTarget, et);
    } else {
      controls.target.copy(destTarget);
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
