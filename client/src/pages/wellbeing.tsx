import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Droplets, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getCurrentDateString, getWeekDays } from '../utils/dateUtils';
import { ReflectLineChart } from '@/components/reflect/ReflectLineChart';
import { useReflectDay, useReflectRange, usePatchReflect, useSaveReflect, useEvents } from '@/lib/hooks';
import { toast } from '@/hooks/use-toast';
import { Smile1, Smile2, Smile3, Smile4, Smile5 } from '@/components/icons/Smiles';

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
    return dates.map(date => map.get(date) || { date, water: 0, sleep: 0, steps: 0, mood: null });
  }, [range.data, rangeFrom]);
  const waterValues = useMemo(() => filledRange.map(d => d.water ?? 0), [filledRange]);
  const sleepValues = useMemo(() => filledRange.map(d => d.sleep ?? 0), [filledRange]);
  const stepsValues = useMemo(() => filledRange.map(d => d.steps ?? 0), [filledRange]);
  const highlightIndex = useMemo(() => filledRange.findIndex(d => d.date === selectedDate), [filledRange, selectedDate]);

  // Динамические подписи оси X по дням недели для текущего 7-дневного диапазона
  const xLabels = useMemo(() => {
    const names = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return filledRange.map((d) => {
      const dt = new Date(d.date);
      return names[dt.getDay()];
    });
  }, [filledRange]);

  // Helper to ensure DB upsert: if записи нет — создаём (POST), иначе частично обновляем (PATCH)
  const persistReflect = (partial: Partial<{ water: number; sleep: number; steps: number; mood: number; journal: string | null }>) => {
    const payload = { date: selectedDate, ...partial } as any;
    if (day.data) {
      patch.mutate(payload);
    } else {
      save.mutate(payload);
    }
  };
  const currentDay = day.data || { water: 0, sleep: 0, steps: 0, mood: null, journal: null } as any;

  // Local editable state
  const [waterEdit, setWaterEdit] = useState<number>(Number(currentDay.water || 0));
  const [sleepEdit, setSleepEdit] = useState<number>(Number(currentDay.sleep || 0));
  const [stepsEdit, setStepsEdit] = useState<number>(Number(currentDay.steps || 0));
  const [openWater, setOpenWater] = useState(false);
  const [openSleep, setOpenSleep] = useState(false);
  const [openSteps, setOpenSteps] = useState(false);

  // Sync local state when selected day data changes
  useEffect(() => {
    setWaterEdit(Number(currentDay.water || 0));
    setSleepEdit(Number(currentDay.sleep || 0));
    setStepsEdit(Number(currentDay.steps || 0));
  }, [selectedDate, day.data?.water, day.data?.sleep, day.data?.steps]);

  // Календарь для выбора дня — унифицированный с Today
  const renderMiniCalendar = () => {
    const weekStartLocal = (() => {
      const d = new Date(selectedDate);
      const day = d.getDay();
      const diff = (day === 0 ? -6 : 1) - day;
      d.setDate(d.getDate() + diff);
      d.setHours(0,0,0,0);
      return d;
    })();
    // События недели для точек
    const weekFromIso = new Date(weekStartLocal).toISOString();
    const weekEnd = new Date(weekStartLocal); weekEnd.setDate(weekEnd.getDate() + 6); weekEnd.setHours(23,59,59,999);
    const weekToIso = weekEnd.toISOString();
    // Хуки нельзя вызывать внутри функции рендера мини‑календаря — перенесём наружу ниже
    const days: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStartLocal);
      d.setDate(d.getDate() + i);
      return d;
    });
    return (
      <div className="mb-4 card-soft rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <button
            className="p-1 text-muted-foreground hover:text-accent"
            aria-label="Предыдущая неделя"
            onClick={() => {
              const prevStart = new Date(weekStartLocal);
              prevStart.setDate(prevStart.getDate() - 7);
              const prevEnd = new Date(prevStart);
              prevEnd.setDate(prevStart.getDate() + 6);
              setSelectedDate(prevEnd.toISOString().slice(0,10));
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center text-foreground font-light">
            {new Date(selectedDate).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
          </div>
          <button
            className="p-1 text-muted-foreground hover:text-accent"
            aria-label="Следующая неделя"
            onClick={() => {
              const nextStart = new Date(weekStartLocal);
              nextStart.setDate(nextStart.getDate() + 7);
              const nextEnd = new Date(nextStart);
              nextEnd.setDate(nextStart.getDate() + 6);
              setSelectedDate(nextEnd.toISOString().slice(0,10));
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
            <div key={d} className="text-[11px] text-muted-foreground">{d}</div>
          ))}
          {days.map((d) => {
            const isSelected = d.toISOString().slice(0,10) === selectedDate;
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const isoDay = `${yyyy}-${mm}-${dd}`;
            const hasEvents = eventDaysSet.has(isoDay);
            return (
              <button
                key={d.toISOString()}
                onClick={() => setSelectedDate(new Date(d).toISOString().slice(0,10))}
                className={`mt-1 aspect-square flex items-center justify-center rounded-full text-sm transition-colors ${isSelected ? 'bg-accent text-white' : 'text-foreground hover:bg-secondary/30'}`}
              >
                <div className="flex flex-col items-center justify-center leading-none">
                  <span>{d.getDate()}</span>
                  {hasEvents ? <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-accent" /> : <span className="mt-0.5 h-1.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ВЫЧИСЛЕНИЕ НЕДЕЛИ И СОБЫТИЙ ДЛЯ ТОЧЕК (вне функции рендера)
  const weekStartForSelected = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  }, [selectedDate]);
  const eventsWeekRange = useMemo(() => {
    const start = new Date(weekStartForSelected);
    const end = new Date(weekStartForSelected); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, [weekStartForSelected]);
  const { data: eventsWeek = [] } = useEvents({ from: eventsWeekRange.from, to: eventsWeekRange.to });
  const eventDaysSet = useMemo(() => {
    const s = new Set<string>();
    (eventsWeek as any[]).forEach((ev) => {
      if (!ev?.start_time) return;
      const dt = new Date(String(ev.start_time) + 'Z');
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      s.add(`${yyyy}-${mm}-${dd}`);
    });
    return s;
  }, [eventsWeek]);

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
          <ReflectLineChart values={waterValues.length ? waterValues : new Array(7).fill(0)} max={5} className="mb-2" highlightIndex={highlightIndex} yTicks={[1,2,3,4,5]} overlayIndex={highlightIndex} overlayValue={waterEdit} todayIndex={highlightIndex} xLabels={xLabels} />
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
          <ReflectLineChart values={sleepValues.length ? sleepValues : new Array(7).fill(0)} max={15} className="mb-2" highlightIndex={highlightIndex} yTicks={[3,6,9,12,15]} overlayIndex={highlightIndex} overlayValue={sleepEdit} todayIndex={highlightIndex} xLabels={xLabels} />
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

        {/* ШАГИ */}
        <div className="card-element p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-light text-foreground tracking-wide">ШАГИ</h3>
            <Button variant="ghost" size="sm" className="text-accent p-1"><Edit3 className="h-4 w-4" /></Button>
          </div>
          <div className="text-2xl font-bold text-accent mb-1">{Number(stepsEdit).toFixed(0)} шагов</div>
          <div className="text-xs text-muted-foreground mb-4">Сколько шагов вы прошли сегодня?</div>
          <ReflectLineChart
            values={stepsValues.length ? stepsValues : new Array(7).fill(0)}
            max={35000}
            className="mb-2"
            highlightIndex={highlightIndex}
            yTicks={[5000,10000,15000,20000,25000,30000,35000]}
            yTickFormatter={(v) => `${Math.round(v/1000)}k`}
            overlayIndex={highlightIndex}
            overlayValue={stepsEdit}
            todayIndex={highlightIndex}
            xLabels={xLabels}
          />
          <div className="mt-3 flex gap-2">
            <Dialog open={openSteps} onOpenChange={setOpenSteps}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">Заполнить</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Шаги</DialogTitle>
                </DialogHeader>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Количество</div>
                  <div className="text-4xl font-semibold my-2">{stepsEdit.toFixed(0)}</div>
                </div>
                <div className="mt-2">
                  <input type="range" min={0} max={35000} step={500} value={stepsEdit} onChange={(e)=> setStepsEdit(parseInt(e.target.value,10))} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    {[0,5000,10000,15000,20000,25000,30000,35000].map(n => <span key={n}>{n/1000}k</span>)}
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-accent text-white w-full" onClick={() => { persistReflect({ steps: Number.isFinite(stepsEdit) ? stepsEdit : 0 }); setOpenSteps(false); toast({ title: 'Сохранено', description: 'Шаги обновлены' }); }}>Сохранить</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* НАСТРОЕНИЕ */}
        <div className="card-element p-4 mb-4">
          <h3 className="font-medium text-foreground mb-2">Настроение</h3>
          <div className="flex items-center justify-between gap-1">
            {[0,1,2,3,4].map(m => {
              const Icon = [Smile1, Smile2, Smile3, Smile4, Smile5][m];
              const isActive = day.data?.mood === m;
              return (
                <button
                  key={m}
                  aria-label={`Настроение ${m+1}`}
                  onClick={() => { persistReflect({ mood: m }); toast({ title: 'Сохранено', description: 'Настроение обновлено' }); }}
                  className={`w-16 h-12 rounded-md border flex items-center justify-center ${isActive ? 'bg-accent text-white border-accent' : 'bg-background text-foreground'}`}
                >
                  <Icon className="w-8 h-8" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ДНЕВНИК */}
        <div className="card-element p-4">
          <h3 className="font-medium text-foreground mb-2">Дневник</h3>
          <Textarea
            placeholder="Запишите мысли, итоги и заметки за день..."
            className="min-h-[140px] text-sm"
            defaultValue={day.data?.journal ?? ''}
            onBlur={(e) => {
              const value = e.target.value || '';
              persistReflect({ journal: value });
              if (value.trim()) toast({ title: 'Сохранено', description: 'Дневник обновлен' });
            }}
          />
          <div className="text-xs text-muted-foreground mt-2">Сохраняется при уходе с поля</div>
        </div>
      </div>
    </div>
  );
}
