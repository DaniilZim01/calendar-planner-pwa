import React from 'react';

export function ReflectBarChart({ values, labels, max, className }: { values: number[]; labels: string[]; max: number; className?: string }) {
  const safeMax = Math.max(max, 1);
  return (
    <div className={className || ''}>
      <div className="flex items-end gap-2 h-20">
        {values.map((v, i) => {
          const h = Math.max(4, Math.round((v / safeMax) * 72));
          return (
            <div key={i} className="flex flex-col items-center justify-end gap-1">
              <div className="w-5 rounded-md bg-accent/30" style={{ height: `${h}px` }} />
              <div className="text-[10px] text-muted-foreground">{labels[i]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


