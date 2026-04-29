import { grayToRgb } from './colorScheme.js';

export function renderTerrain(canvas, terrain, cells, scheme) {
  const SIZE    = canvas.width; // CSS size와 분리된 실제 픽셀 해상도 사용
  const ctx     = canvas.getContext('2d');
  const sq      = (SIZE / cells) | 0;
  const imgData = ctx.createImageData(SIZE, SIZE);
  const px      = imgData.data;

  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      const [r, g, b] = grayToRgb(terrain[i * cells + j], scheme);
      const y0 = sq * i, y1 = sq * (i + 1);
      const x0 = sq * j, x1 = sq * (j + 1);
      for (let py = y0; py < y1; py++) {
        for (let qx = x0; qx < x1; qx++) {
          const idx   = (py * SIZE + qx) * 4;
          px[idx]     = r;
          px[idx + 1] = g;
          px[idx + 2] = b;
          px[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
