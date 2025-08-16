import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCurrentDateString, getWeekDays } from '../utils/dateUtils';
import { ReflectBarChart } from '@/components/reflect/ReflectBarChart';
import { useReflectDay, useReflectRange, usePatchReflect, useSaveReflect } from '@/lib/hooks';

export default function WellbeingPage() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const day = useReflectDay(selectedDate);
  const save = useSaveReflect();
  const patch = usePatchReflect();
  const weekLabels = getWeekDays();
  const end = new Date(selectedDate);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  const rangeFrom = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
  const rangeTo = selectedDate;
  const range = useReflectRange(rangeFrom, rangeTo);
  const waterValues = useMemo(() => (range.data || []).map(d => d.water ?? 0), [range.data]);
  const sleepValues = useMemo(() => (range.data || []).map(d => d.sleep ?? 0), [range.data]);
  const currentDay = day.data || { water: 0, sleep: 0, steps: 0, mood: 0, journal: null } as any;

  // Календарь для выбора дня
  const renderMiniCalendar = () => {
    const today = new Date();
    const currentWeek = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      currentWeek.push(date);
    }

    return (
      <div className="card-soft mb-6">
        <div className="flex justify-center gap-4 mb-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-foreground">Январь 2025</span>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          {currentWeek.map((date, index) => {
            const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            const isToday = index === 3;
            
            return (
              <div key={index} className="text-center p-2">
                <div className="text-xs text-muted-foreground mb-1">
                  {dayNames[date.getDay()]}
                </div>
                <div className={`w-8 h-8 flex items-center justify-center text-sm rounded-full ${
                  isToday ? 'bg-accent text-white' : ''
                }`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="mb-6">
          <h1 className="text-2xl font-thin text-foreground mb-2">Reflect</h1>
          <p className="text-sm text-muted-foreground font-light">
            Отслеживайте свое самочувствие
          </p>
        </div>

        {renderMiniCalendar()}

        {/* Трекер воды */}
        <div className="card-element p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-light text-foreground tracking-wide">ВОДА</h3>
            <Button variant="ghost" size="sm" className="text-accent p-1">
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {(currentDay.water ?? 0).toFixed ? (currentDay.water as number).toFixed(1) : Number(currentDay.water||0).toFixed(1)} литра
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Сколько воды вы выпили на этой неделе?
          </div>
          
          <ReflectBarChart values={waterValues} labels={weekLabels} max={4} />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {getWeekDays().map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-3">
            <Input
              type="number"
              step="0.1"
              min={0}
              max={10}
              defaultValue={currentDay.water ?? 0}
              onBlur={(e) => patch.mutate({ date: selectedDate, water: Number(e.target.value||0) })}
              className="w-full bg-white rounded-lg text-sm border-0"
            />
          </div>
        </div>

        {/* Трекер сна */}
        <div className="card-element p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-light text-foreground tracking-wide">СОН</h3>
            <Button variant="ghost" size="sm" className="text-accent p-1">
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {(currentDay.sleep ?? 0).toFixed ? (currentDay.sleep as number).toFixed(1) : Number(currentDay.sleep||0).toFixed(1)} часов
          </div>
          <div className="text-xs text-muted-foreground mb-4">
            Сколько часов вы спали на этой неделе?
          </div>
          
          <ReflectBarChart values={sleepValues} labels={weekLabels} max={10} />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {getWeekDays().map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-3">
            <Input
              type="number"
              step="0.1"
              min={0}
              max={24}
              defaultValue={currentDay.sleep ?? 0}
              onBlur={(e) => patch.mutate({ date: selectedDate, sleep: Number(e.target.value||0) })}
              className="w-full bg-white rounded-lg text-sm border-0"
            />
          </div>
        </div>

        {/* Настроение и активность */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-element p-4">
            <h3 className="font-medium text-foreground mb-2">Настроение</h3>
            <div className="flex items-center gap-3">
              {[0,1,2,3,4].map(m => (
                <button key={m} onClick={() => patch.mutate({ date: selectedDate, mood: m })} className={`w-9 h-9 rounded-full border ${day.data?.mood===m?'bg-accent text-white border-accent':'bg-background'}`}>
                  {['😞','🙁','😐','🙂','😄'][m]}
                </button>
              ))}
            </div>
          </div>
          <div className="card-element p-4">
            <h3 className="font-medium text-foreground mb-2">Шаги</h3>
            <Input
              type="number"
              min={0}
              max={100000}
              placeholder="Количество шагов"
              defaultValue={day.data?.steps ?? 0}
              onBlur={(e) => patch.mutate({ date: selectedDate, steps: Number(e.target.value||0) })}
              className="w-full bg-white rounded-lg text-sm border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
