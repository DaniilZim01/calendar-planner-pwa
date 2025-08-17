import React from 'react';

type Props = {
  values: number[]; // length N
  max: number; // y-axis max
  className?: string;
  highlightIndex?: number; // index to fill
};

// Simple responsive line chart with connected points for last N days.
export function ReflectLineChart({ values, max, className, highlightIndex }: Props) {
  const safeMax = Math.max(1, max);
  const pointsCount = Array.isArray(values) ? values.length : 0;
  const width = Math.max(1, (pointsCount - 1) * 28 + 16); // spacing 28, margin 8 each side
  const height = 80;
  const leftPad = 8;
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
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="96">
        {/* baseline */}
        <line x1={0} y1={height} x2={width} y2={height} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.2} />
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


