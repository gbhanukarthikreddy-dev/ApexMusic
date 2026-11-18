import { contours } from 'd3-contour';

export interface ContourRing {
  value: number;
  d: string;
  isHighlight: boolean;
}

export interface SummitData {
  width: number;
  height: number;
  summitX: number;
  summitY: number;
  rings: ContourRing[];
}

/**
 * Deterministic multi-peak alpine heightfield converted to SVG path strings via d3-contour.
 */
export function generateSummitContours(
  cols = 64,
  rows = 64,
  viewWidth = 520,
  viewHeight = 520
): SummitData {
  const values = new Float64Array(cols * rows);

  // Main summit off-center-right, secondary ridge lower-left
  const cx1 = 0.62;
  const cy1 = 0.38;
  const cx2 = 0.34;
  const cy2 = 0.68;

  for (let y = 0; y < rows; y += 1) {
    const ny = y / (rows - 1);
    for (let x = 0; x < cols; x += 1) {
      const nx = x / (cols - 1);

      const dx1 = nx - cx1;
      const dy1 = ny - cy1;
      const mainPeak = Math.exp(-(dx1 * dx1 * 11 + dy1 * dy1 * 14));

      const dx2 = nx - cx2;
      const dy2 = ny - cy2;
      const subRidge = 0.42 * Math.exp(-(dx2 * dx2 * 9 + dy2 * dy2 * 10));

      // Subtle organic ridge undulation
      const wave =
        0.055 * Math.sin(nx * 10.5 + ny * 4.2) +
        0.04 * Math.cos(ny * 12.0 - nx * 5.5);

      values[y * cols + x] = mainPeak + subRidge + wave;
    }
  }

  const thresholds = [0.14, 0.22, 0.3, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.96];
  const generator = contours().size([cols, rows]).thresholds(thresholds);
  const generated = generator(Array.from(values));

  const scaleX = viewWidth / (cols - 1);
  const scaleY = viewHeight / (rows - 1);

  const rings: ContourRing[] = generated.map((poly, idx) => {
    const segments: string[] = [];

    for (const polygon of poly.coordinates) {
      for (const ring of polygon) {
        if (ring.length === 0) continue;
        const pts = ring.map(
          ([px, py], i) =>
            `${i === 0 ? 'M' : 'L'}${(px * scaleX).toFixed(1)},${(py * scaleY).toFixed(1)}`
        );
        segments.push(`${pts.join(' ')} Z`);
      }
    }

    return {
      value: poly.value,
      d: segments.join(' '),
      isHighlight: idx >= thresholds.length - 3,
    };
  });

  return {
    width: viewWidth,
    height: viewHeight,
    summitX: cx1 * viewWidth,
    summitY: cy1 * viewHeight,
    rings,
  };
}
