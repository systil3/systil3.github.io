// PS1 스타일 HUD 업데이터

const hudCoords = document.getElementById('hud-coords');
const hudStatus = document.getElementById('hud-status');

let blinkOn = true;
setInterval(() => { blinkOn = !blinkOn; }, 600);

export function tickHud(camera) {
  const p = camera.position;
  hudCoords.textContent =
    `X:${p.x.toFixed(1).padStart(6)} Y:${p.y.toFixed(1).padStart(6)} Z:${p.z.toFixed(1).padStart(6)}`;

  hudStatus.style.opacity = blinkOn ? '1' : '0';
}
