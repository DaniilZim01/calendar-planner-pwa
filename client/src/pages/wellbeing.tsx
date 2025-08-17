import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Droplets, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { getCurrentDateString, getWeekDays } from '../utils/dateUtils';
import { ReflectLineChart } from '@/components/reflect/ReflectLineChart';
import { useReflectDay, useReflectRange, usePatchReflect, useSaveReflect } from '@/lib/hooks';
import { toast } from '@/hooks/use-toast';

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
  const filledRange = useMemo(() => {
    // build 7-day array [from..to]
    const dates: string[] = [];
    const startDate = new Date(rangeFrom);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate); d.setDate(startDate.getDate() + i);
      dates.push(d.toISOString().slice(0,10));
    }
    const map = new Map<string, any>((range.data || []).map(d => [d.date, d] as const));
    return dates.map(date => map.get(date) || { date, water: 0, sleep: 0, steps: 0, mood: 0 });
  }, [range.data, rangeFrom]);
  const waterValues = useMemo(() => filledRange.map(d => d.water ?? 0), [filledRange]);
  const sleepValues = useMemo(() => filledRange.map(d => d.sleep ?? 0), [filledRange]);
  const highlightIndex = useMemo(() => filledRange.findIndex(d => d.date === selectedDate), [filledRange, selectedDate]);

  // Helper to ensure DB upsert: if записи нет — создаём (POST), иначе частично обновляем (PATCH)
  const persistReflect = (partial: Partial<{ water: number; sleep: number; steps: number; mood: number; journal: string | null }>) => {
    const payload = { date: selectedDate, ...partial } as any;
    if (day.data) {
      patch.mutate(payload);
    } else {
      save.mutate(payload);
    }
  };
  const currentDay = day.data || { water: 0, sleep: 0, steps: 0, mood: 0, journal: null } as any;

  // Local editable state
  const [waterEdit, setWaterEdit] = useState<number>(Number(currentDay.water || 0));
  const [sleepEdit, setSleepEdit] = useState<number>(Number(currentDay.sleep || 0));
  const [stepsEdit, setStepsEdit] = useState<number>(Number(currentDay.steps || 0));
  const [openWater, setOpenWater] = useState(false);
  const [openSleep, setOpenSleep] = useState(false);

  // Sync local state when selected day data changes
  useEffect(() => {
    setWaterEdit(Number(currentDay.water || 0));
    setSleepEdit(Number(currentDay.sleep || 0));
    setStepsEdit(Number(currentDay.steps || 0));
  }, [selectedDate, day.data?.water, day.data?.sleep, day.data?.steps]);

  // Календарь для выбора дня
  const renderMiniCalendar = () => {
    const base = new Date(selectedDate);
    const currentWeek = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(base);
      date.setDate(base.getDate() + i);
      currentWeek.push(date);
    }
    return (
      <div className="card-soft mb-6">
        <div className="flex justify-center gap-4 mb-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => {
            const d = new Date(selectedDate); d.setDate(d.getDate() - 7); setSelectedDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-foreground">{new Date(selectedDate).toLocaleDateString(undefined,{ month:'long', year:'numeric' })}</span>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => {
            const d = new Date(selectedDate); d.setDate(d.getDate() + 7); setSelectedDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-center gap-2">
          {currentWeek.map((date, index) => {
            const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            const isSelected = date.toISOString().slice(0,10) === selectedDate;
            return (
              <button key={index} className="text-center p-2" onClick={() => setSelectedDate(date.toISOString().slice(0,10))}>
                <div className="text-xs text-muted-foreground mb-1">{dayNames[date.getDay()]}</div>
                <div className={`w-8 h-8 flex items-center justify-center text-sm rounded-full ${isSelected ? 'bg-accent text-white' : ''}`}>{date.getDate()}</div>
              </button>
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
          <p className="text-sm text-muted-foreground font-light">Отслеживайте свое самочувствие</p>
        </div>

        {renderMiniCalendar()}

        {/* ВОДА */}
        <div className="card-element p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-light text-foreground tracking-wide">ВОДА</h3>
            <Button variant="ghost" size="sm" className="text-accent p-1"><Edit3 className="h-4 w-4" /></Button>
          </div>
          <div className="text-2xl font-bold text-accent mb-1">{Number(waterEdit).toFixed(2)} литра</div>
          <div className="text-xs text-muted-foreground mb-4">Сколько воды вы выпили сегодня?</div>
          <ReflectLineChart values={waterValues.length ? waterValues : new Array(7).fill(0)} max={5} className="mb-2" highlightIndex={highlightIndex} yTicks={[1,2,3,4,5]} overlayIndex={highlightIndex} overlayValue={waterEdit} todayIndex={highlightIndex} />
          <div className="flex justify-between text-xs text-muted-foreground">
            {filledRange.map((_, i) => (
              <span key={`water-${i}`} style={{ width: '36px', textAlign: 'center' }}>{weekLabels[i]}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Dialog open={openWater} onOpenChange={setOpenWater}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2"><Droplets className="h-4 w-4" />Заполнить</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Вода</DialogTitle>
                </DialogHeader>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Литры</div>
                  <div className="text-4xl font-semibold my-2">{waterEdit.toFixed(2)}</div>
                </div>
                <div className="mt-2">
                  <input type="range" min={0} max={5} step={0.25} value={waterEdit} onChange={(e)=> setWaterEdit(Number(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    {[0,1,2,3,4,5].map(n => <span key={n}>{n.toFixed(0)}{n===5?'.00':''}</span>)}
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-accent text-white w-full" onClick={() => { persistReflect({ water: Number(waterEdit || 0) }); setOpenWater(false); toast({ title: 'Сохранено', description: 'Значение воды обновлено' }); }}>Сохранить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* СОН */}
        <div className="card-element p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-light text-foreground tracking-wide">СОН</h3>
            <Button variant="ghost" size="sm" className="text-accent p-1"><Edit3 className="h-4 w-4" /></Button>
          </div>
          <div className="text-2xl font-bold text-accent mb-1">{Number(sleepEdit).toFixed(0)} часов</div>
          <div className="text-xs text-muted-foreground mb-4">Сколько часов вы спали сегодня?</div>
          <ReflectLineChart values={sleepValues.length ? sleepValues : new Array(7).fill(0)} max={15} className="mb-2" highlightIndex={highlightIndex} yTicks={[3,6,9,12,15]} overlayIndex={highlightIndex} overlayValue={sleepEdit} todayIndex={highlightIndex} />
          <div className="flex justify-between text-xs text-muted-foreground">
            {filledRange.map((_, i) => (
              <span key={`sleep-${i}`} style={{ width: '36px', textAlign: 'center' }}>{weekLabels[i]}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Dialog open={openSleep} onOpenChange={setOpenSleep}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2"><Moon className="h-4 w-4" />Заполнить</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Сон</DialogTitle>
                </DialogHeader>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Часы</div>
                  <div className="text-4xl font-semibold my-2">{sleepEdit.toFixed(0)}</div>
                </div>
                <div className="mt-2">
                  <input type="range" min={0} max={14} step={1} value={sleepEdit} onChange={(e)=> setSleepEdit(parseInt(e.target.value,10))} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    {[0,2,4,6,8,10,12,14].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-accent text-white w-full" onClick={() => { persistReflect({ sleep: Number.isFinite(sleepEdit) ? sleepEdit : 0 }); setOpenSleep(false); toast({ title: 'Сохранено', description: 'Значение сна обновлено' }); }}>Сохранить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* НАСТРОЕНИЕ */}
        <div className="card-element p-4 mb-4">
          <h3 className="font-medium text-foreground mb-2">Настроение</h3>
          <div className="flex items-center justify-between gap-1">
            {[0,1,2,3,4].map(m => (
              <button
                key={m}
                onClick={() => { persistReflect({ mood: m }); toast({ title: 'Сохранено', description: 'Настроение обновлено' }); }}
                className={`w-16 h-10 rounded-md border flex items-center justify-center text-2xl ${day.data?.mood===m?'bg-accent text-white border-accent':'bg-background'}`}
              >
                {['﹀','﹃','—','﹄','︿'][m]}
              </button>
            ))}
          </div>
        </div>

        {/* ШАГИ */}
        <div className="card-element p-4">
          <h3 className="font-medium text-foreground mb-2">Шаги</h3>
          <div className="flex gap-2">
            <Input type="number" min={0} max={100000} placeholder="Количество шагов" value={stepsEdit} onChange={(e) => setStepsEdit(parseInt(e.target.value || '0', 10))} className="w-full bg-white rounded-lg text-sm border-0" />
            <Button className="bg-accent text-white" onClick={() => { persistReflect({ steps: Number.isFinite(stepsEdit) ? stepsEdit : 0 }); toast({ title: 'Сохранено', description: 'Шаги обновлены' }); }}>Сохранить</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
