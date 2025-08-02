import { ChartDataPoint } from '../types';

interface SleepChartProps {
  data: ChartDataPoint[];
}

export default function SleepChart({ data }: SleepChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 10); // Минимум 10 часов для масштаба
  
  const getYPosition = (value: number) => {
    return 45 - (value / maxValue) * 30; // Масштабируем от 45 до 15
  };

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 280;
    const y = getYPosition(point.value);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-lg p-3 mb-3">
      <svg width="100%" height="60" viewBox="0 0 280 60" className="overflow-visible">
        {/* Сетка */}
        <g className="opacity-20">
          <line x1="0" y1="15" x2="280" y2="15" stroke="hsl(28, 26%, 53%)" strokeWidth="0.5"/>
          <line x1="0" y1="30" x2="280" y2="30" stroke="hsl(28, 26%, 53%)" strokeWidth="0.5"/>
          <line x1="0" y1="45" x2="280" y2="45" stroke="hsl(28, 26%, 53%)" strokeWidth="0.5"/>
        </g>
        
        {/* Линия графика */}
        <polyline points={points} className="chart-line"/>
        
        {/* Точки */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 280;
          const y = getYPosition(point.value);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              className="chart-point"
            />
          );
        })}
      </svg>
    </div>
  );
}
