function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360 - 1;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r, g, b;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [(r + m) * 255 | 0, (g + m) * 255 | 0, (b + m) * 255 | 0];
}

export function grayToRgb(gray, scheme) {
  if (scheme === 'grayscale') return [gray, gray, gray];

  const t = gray / 255;
  const h = 240 * (1 - t);   // 120°=green (low) → 0°=red (high)
  const s = 0.50 + 0.45 * t;
  const v = 0.85;
  return hsvToRgb(h, s, v);
}
