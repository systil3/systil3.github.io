export function generateTerrain(n, roughness) {
  const mat = new Float64Array(n * n); // corners stay at 0 (= seed)
  let step = n - 1;
  const persistence = 0.3 + (roughness / 20) * 0.7; // 1→0.36, 20→0.95
  let r = 1.0;

  while (step > 1) {
    const half = step >> 1;

    // Diamond step — set each square's center
    for (let row = 0; row < n - 1; row += step) {
      for (let col = 0; col < n - 1; col += step) {
        const avg = (
          mat[row       * n + col] +
          mat[row       * n + (col + step)] +
          mat[(row + step) * n + col] +
          mat[(row + step) * n + (col + step)]
        ) / 4;
        mat[(row + half) * n + (col + half)] = avg + (Math.random() * 2 - 1) * r;
      }
    }

    // Square step — set each edge midpoint using already-computed diamond values
    for (let row = 0; row < n; row += half) {
      for (let col = (row + half) % step; col < n; col += step) {
        let sum = 0, cnt = 0;
        if (row - half >= 0) { sum += mat[(row - half) * n + col]; cnt++; }
        if (row + half <  n) { sum += mat[(row + half) * n + col]; cnt++; }
        if (col - half >= 0) { sum += mat[row * n + (col - half)]; cnt++; }
        if (col + half <  n) { sum += mat[row * n + (col + half)]; cnt++; }
        mat[row * n + col] = sum / cnt + (Math.random() * 2 - 1) * r;
      }
    }

    r *= persistence;
    step = half;
  }

  return mat;
}
