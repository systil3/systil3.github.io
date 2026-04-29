import * as THREE from 'three';

// ─── 코어 ─────────────────────────────────────────────────
import { renderer, renderTarget, quadScene, quadCam, scene, camera, controls, tickCameraFocus, pointLights } from './script/core/scene.js';

// ─── 메시 ─────────────────────────────────────────────────
import './script/mesh/dome.js';
import './script/mesh/obstacles.js';
import './script/mesh/board.js';
import './script/mesh/noisegenerator.js';
import { stoneMeshes, tickStones } from './script/mesh/stone.js';
import { centerMesh, centerBaseY, centerReadyPromise, centerLabelText } from './script/mesh/center.js';
import { sphereMeshes, labelScene, gemsReadyPromise } from './script/mesh/gems.js';
labelScene.add(centerLabelText);
import { particleGeo, positions, PARTICLE_COUNT } from './script/mesh/particles.js';
import { tickStarOrbits } from './script/mesh/starOrbit.js';

// ─── UI ───────────────────────────────────────────────────
import './script/ui/interaction.js';
import { tickHud } from './script/ui/hud.js';

// 캐릭터 + 보석 모두 로드된 후 보석 Y 위치 보정
Promise.all([centerReadyPromise, gemsReadyPromise]).then(([gap]) => {
  if (gap === 0) return;
  sphereMeshes.forEach(({ sphere, gem, glow, pointLightBot, pointLightTop, labelText, node }) => {
    node.pos.y              -= gap;
    sphere.position.y        = node.pos.y;
    gem.position.y           = node.pos.y;
    glow.position.y          = node.pos.y;
    pointLightBot.position.y = node.pos.y;
    pointLightTop.position.y = node.pos.y;
    labelText.position.y     = node.pos.y;
  });
});

const clock = new THREE.Clock();

(function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  const ORBIT_SPEED = 0.08;

  sphereMeshes.forEach(({ sphere, gem, glow, pointLightBot, pointLightTop, labelText, node }, i) => {
    const angle = node.angle + t * ORBIT_SPEED;
    const x = node.r * Math.cos(angle);
    const z = node.r * Math.sin(angle);

    const bob = Math.sin(t * 1.1 + i * 1.3) * 0.2;
    const y   = node.pos.y + bob;

    sphere.position.set(x, y, z);
    gem.position.set(x, y, z);
    glow.position.set(x, y, z);
    pointLightBot.position.set(x, y - 0.9, z);
    pointLightTop.position.set(x, y + 0.7, z);
    labelText.position.set(x, y + 1.2, z);

    gem.rotation.z += 0.004;

    const dist = camera.position.distanceTo(sphere.position);
    labelText.material.opacity = THREE.MathUtils.clamp(1 - (dist - 4) / 10, 0.1, 1);
    glow.material.opacity   = 0.23 + Math.sin(t * 1.5 + i) * 0.04;
  });

  if (centerMesh) {
    centerMesh.position.y = centerBaseY + Math.sin(t * 0.8) * 0.15;
    centerLabelText.position.set(0, centerMesh.position.y + 4.0, 0);
  }

  const posAttr = particleGeo.getAttribute('position');
  const PARTICLE_SPEED = [0.002, -0.003, 0.002];
  const BOUND = 25;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     += PARTICLE_SPEED[0];
    positions[i * 3 + 1] += PARTICLE_SPEED[1];
    positions[i * 3 + 2] += PARTICLE_SPEED[2];
    if (positions[i * 3]     >  BOUND) positions[i * 3]     = -BOUND;
    if (positions[i * 3]     < -BOUND) positions[i * 3]     =  BOUND;
    if (positions[i * 3 + 1] >  BOUND) positions[i * 3 + 1] = -BOUND;
    if (positions[i * 3 + 1] < -BOUND) positions[i * 3 + 1] =  BOUND;
    if (positions[i * 3 + 2] >  BOUND) positions[i * 3 + 2] = -BOUND;
    if (positions[i * 3 + 2] < -BOUND) positions[i * 3 + 2] =  BOUND;
    posAttr.setXYZ(i, positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
  }
  posAttr.needsUpdate = true;

  pointLights.forEach((light, i) => {
    light.intensity = 4.5 + Math.sin(t * 0.9 + i * 1.1) * 1.5;
  });

  if (centerMesh) tickStarOrbits(centerMesh.position, t);
  tickStones(t);
  tickCameraFocus();
  tickHud(camera);
  controls.update();

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(quadScene, quadCam);
  renderer.autoClear = false;
  renderer.render(labelScene, camera);
  renderer.autoClear = true;
})();
