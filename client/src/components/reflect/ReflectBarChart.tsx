import React from 'react';

export function ReflectBarChart({ values, labels, max, className, showDotAtEnd }: { values: number[]; labels: string[]; max: number; className?: string; showDotAtEnd?: boolean }) {
  const safeMax = Math.max(max, 1);
  const barArea = 72; // px height for bars
  return (
    <div className={className || ''}>
      <div className="flex items-end gap-2 h-20">
        {values.map((v, i) => {
          const h = Math.max(4, Math.round((v / safeMax) * barArea));
          const top = Math.max(0, barArea - h);
          return (
            <div key={i} className="flex flex-col items-center justify-end gap-1 w-6">
              <div style={{ height: `${top}px` }} />
              {showDotAtEnd && i === values.length - 1 ? (
                <div className="w-2 h-2 rounded-full bg-accent mb-1" />
              ) : (
                <div className="w-2 h-2 mb-1" />
              )}
              <div className="w-5 rounded-md bg-accent/30" style={{ height: `${h}px` }} />
              <div className="text-[10px] text-muted-foreground">{labels[i] ?? ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


