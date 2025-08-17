import React from 'react';

type Props = {
  values: number[]; // length N
  max: number; // y-axis max
  className?: string;
  highlightIndex?: number; // index to fill
  yTicks?: number[]; // values to label on Y axis
};

// Simple responsive line chart with connected points for last N days.
export function ReflectLineChart({ values, max, className, highlightIndex, yTicks }: Props) {
  const safeMax = Math.max(1, max);
  const pointsCount = Array.isArray(values) ? values.length : 0;
  const width = Math.max(1, (pointsCount - 1) * 36 + 48); // spacing 36, plus room for y labels
  const height = 96;
  const leftPad = 28; // space for Y labels
  const rightPad = 8;
  const stepX = pointsCount > 1 ? (width - leftPad - rightPad) / (pointsCount - 1) : 0;

  const toY = (v: number) => {
    const clamped = Math.max(0, Math.min(safeMax, v));
    return height - Math.round((clamped / safeMax) * height);
  };

  const coords = values.map((v, i) => [leftPad + i * stepX, toY(v)] as const);
  const poly = coords.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className={className || ''}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="112">
        {/* y grid + labels */}
        {(yTicks && yTicks.length ? yTicks : [0, safeMax]).map((t, idx) => {
          const y = toY(t);
          return (
            <g key={idx}>
              <line x1={leftPad} y1={y} x2={width - rightPad} y2={y} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.15} />
              <text x={leftPad - 6} y={y + 4} fontSize="10" textAnchor="end" fill="hsl(var(--muted-foreground))">{t}</text>
            </g>
          );
        })}
        {/* line */}
        {coords.length > 1 && (
          <polyline points={poly} fill="none" stroke="hsl(var(--accent))" strokeWidth={2} />
        )}
        {/* points */}
        {coords.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={3} fill={i === highlightIndex ? 'hsl(var(--accent))' : 'white'} stroke="hsl(var(--accent))" strokeWidth={2} />
          </g>
        ))}
      </svg>
    </div>
  );
}


