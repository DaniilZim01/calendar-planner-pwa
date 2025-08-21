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

  return (
    <div className={className || ''}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="120">
        {/* y axis vertical */}
        <line x1={leftAxisX} y1={topPad} x2={leftAxisX} y2={height - bottomPad} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.25} />
        {/* y grid + labels */}
        {(yTicks && yTicks.length ? yTicks : [safeMax]).map((t, idx) => {
          const y = toY(t);
          return (
            <g key={idx}>
              <line x1={leftPad} y1={y} x2={width - rightPad} y2={y} stroke="hsl(var(--muted-foreground))" strokeWidth={1} opacity={0.2} />
              <text x={leftPad - 10} y={y + 4} fontSize="10" textAnchor="end" fill="hsl(var(--muted-foreground))">{yTickFormatter ? yTickFormatter(t) : t}</text>
            </g>
          );
        })}
        {/* line */}
        {coords.length > 1 && (
          <polyline points={poly} fill="none" stroke="hsl(var(--accent))" strokeWidth={1.25} />
        )}
        {/* points */}
        {coords.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={3}
              fill={i === todayIndex ? 'black' : 'hsl(var(--accent))'}
              stroke="hsl(var(--accent))"
              strokeWidth={i === todayIndex ? 0 : 1.5}
            />
          </g>
        ))}
        {typeof overlayIndex === 'number' && typeof overlayValue === 'number' && overlayIndex >= 0 && overlayIndex < coords.length && (
          <circle cx={leftPad + overlayIndex * stepX} cy={toY(overlayValue)} r={4} fill={'hsl(var(--accent))'} />
        )}
        {/* x labels */}
        {Array.isArray(xLabels) && xLabels.length === pointsCount && xLabels.map((label, i) => (
          <text key={`xl-${i}`} x={leftPad + i * stepX} y={height - 6} fontSize="10" textAnchor="middle" fill="hsl(var(--muted-foreground))">{label}</text>
        ))}
      </svg>
    </div>
  );
}


