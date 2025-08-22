import React from 'react';

type Props = {
  values: number[]; // length N
  max: number; // y-axis max
  className?: string;
  highlightIndex?: number; // index to fill
  yTicks?: number[]; // values to label on Y axis
  yTickFormatter?: (value: number) => string; // optional label formatter
  overlayIndex?: number;
  overlayValue?: number;
  todayIndex?: number; // index of today's value to color black
  xLabels?: string[]; // weekday labels rendered inside SVG to ensure alignment
};

// Simple responsive line chart with connected points for last N days.
export function ReflectLineChart({ values, max, className, highlightIndex, yTicks, yTickFormatter, overlayIndex, overlayValue, todayIndex, xLabels }: Props) {
  const safeMax = Math.max(1, max);
  const pointsCount = Array.isArray(values) ? values.length : 0;
  const width = Math.max(1, (pointsCount - 1) * 36 + 64); // spacing 36, more room for y labels
  const height = 104;
  const leftAxisX = 12; // draw Y axis slightly inside container
  const leftPad = 40; // start of plot after labels
  const rightPad = 8;
  const topPad = 8;
  const bottomPad = 24; // more space for x labels
  const plotHeight = Math.max(1, height - topPad - bottomPad);
  const stepX = pointsCount > 1 ? (width - leftPad - rightPad) / (pointsCount - 1) : 0;

  const toY = (v: number) => {
    const clamped = Math.max(0, Math.min(safeMax, v));
    return topPad + (plotHeight - Math.round((clamped / safeMax) * plotHeight));
  };

  const coords = values.map((v, i) => [leftPad + i * stepX, toY(v)] as const);
  const poly = coords.map(([x, y]) => `${x},${y}`).join(' ');

  // Build smooth cubic Bezier path using Catmull-Rom to Bezier conversion
  const buildSmoothPath = (points: ReadonlyArray<readonly [number, number]>, tension: number = 0.5): string => {
    if (!points.length) return '';
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
    if (points.length === 2) return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]}`;
    const path: string[] = [];
    const p0 = points[0];
    path.push(`M ${p0[0]} ${p0[1]}`);
    for (let i = 0; i < points.length - 1; i++) {
      const p_1 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const c1x = p1[0] + ((p2[0] - p_1[0]) / 6) * tension;
      const c1y = p1[1] + ((p2[1] - p_1[1]) / 6) * tension;
      const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
      const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
      path.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`);
    }
    return path.join(' ');
  };
  const smoothPath = buildSmoothPath(coords);

  return (
    <div className={className || ''}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="120">
        {/* y grid + labels */}
        {(yTicks && yTicks.length ? yTicks : [safeMax]).map((t, idx) => {
          const y = toY(t);
          return (
            <g key={idx}>
              <line x1={leftPad} y1={y} x2={width - rightPad} y2={y} stroke="var(--muted-foreground)" strokeWidth={1} opacity={0.2} />
              <text x={leftPad - 10} y={y + 4} fontSize="10" textAnchor="end" fill="var(--muted-foreground)">{yTickFormatter ? yTickFormatter(t) : t}</text>
            </g>
          );
        })}
        {/* baseline at y=0 */}
        <line x1={leftPad} y1={toY(0)} x2={width - rightPad} y2={toY(0)} stroke="var(--muted-foreground)" strokeWidth={1} opacity={0.3} />
        {/* line */}
        {coords.length > 1 && (
          <path d={smoothPath} fill="none" stroke="var(--accent)" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* points */}
        {coords.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={3}
              fill={'var(--accent)'}
              stroke={'var(--accent)'}
              strokeWidth={1.5}
            />
          </g>
        ))}
        {typeof overlayIndex === 'number' && typeof overlayValue === 'number' && overlayIndex >= 0 && overlayIndex < coords.length && (
          <circle cx={leftPad + overlayIndex * stepX} cy={toY(overlayValue)} r={4} fill={'var(--accent)'} />
        )}
        {/* x labels */}
        {Array.isArray(xLabels) && xLabels.length === pointsCount && xLabels.map((label, i) => (
          <text key={`xl-${i}`} x={leftPad + i * stepX} y={height - 6} fontSize="10" textAnchor="middle" fill="var(--muted-foreground)">{label}</text>
        ))}
      </svg>
    </div>
  );
}


