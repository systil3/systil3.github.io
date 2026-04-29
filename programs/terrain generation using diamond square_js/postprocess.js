export function normalize(arr, len) {
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < len; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }
  const range = max - min || 1;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++)
    out[i] = ((arr[i] - min) * 255 / range) | 0;
  return out;
}

// Separable box blur — approximates cv2.fastNlMeansDenoising
export function boxBlur(src, w, h, radius) {
  if (radius < 1) return src;
  const r = radius | 0;
  const tmp = new Uint8Array(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, cnt = 0;
      for (let dx = -r; dx <= r; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < w) { sum += src[y * w + nx]; cnt++; }
      }
      tmp[y * w + x] = (sum / cnt + 0.5) | 0;
    }
  }

  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, cnt = 0;
      for (let dy = -r; dy <= r; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < h) { sum += tmp[ny * w + x]; cnt++; }
      }
      out[y * w + x] = (sum / cnt + 0.5) | 0;
    }
  }
  return out;
}

export function trimLast(n, arr) {
  const cells = n - 1;
  const out = new Uint8Array(cells * cells);
  for (let i = 0; i < cells; i++)
    for (let j = 0; j < cells; j++)
      out[i * cells + j] = arr[i * n + j];
  return out;
}
