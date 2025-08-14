import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTasks, useToggleTask, useCreateTask, useDeleteTask, useUpdateTask, useEvents, useCreateEvent } from '@/lib/hooks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskModal } from '@/components/tasks/TaskModal';
import { TaskList } from '@/components/tasks/TaskList';
import EventDialog from '@/components/EventDialog';
import type { ApiEvent } from '@/lib/api';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from '@/hooks/use-toast';

export default function PlannerPage() {
  // Загружаем все задачи и фильтруем по выбранной дате локально
  const { data: tasksAll, isLoading: isLoadingTasksAll } = useTasks();
  const toggleTask = useToggleTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'priority' | 'due'>('priority');
  
  // Выбранная дата и 7‑дневная полоса
  const getWeekStart = (d: Date) => {
    const copy = new Date(d);
    const day = copy.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // сдвиг к понедельнику
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0,0,0,0);
    return copy;
  };
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const weekDays: Date[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // Events: диапазон = выбранный день
  const dayRange = useMemo(() => {
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, [selectedDate]);
  const { data: eventsToday = [], isLoading: isLoadingEventsToday } = useEvents({ from: dayRange.from, to: dayRange.to });
  const createEvent = useCreateEvent({ from: dayRange.from, to: dayRange.to });

  const applySortFilter = (items?: any[]) => {
    const base = (items || []).filter(t =>
      query ? (t.title?.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase())) : true
    );
    if (sort === 'priority') {
      return [...base].sort((a,b)=> (b.priority||0)-(a.priority||0));
    }
    return [...base].sort((a,b)=> (a.due_date||'').localeCompare(b.due_date||''));
  };

  // Список задач на выбранную дату
  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.getDate()).padStart(2, '0');
  const selectedDayIso = `${y}-${m}-${d}`;
  const tasksForSelectedDay = useMemo(() => {
    const list = (tasksAll || []).filter((t: any) => (t.due_date || '').slice(0,10) === selectedDayIso);
    return applySortFilter(list);
  }, [tasksAll, selectedDayIso, query, sort]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add event (from EventDialog local shape → API shape)
  const handleAddEvent = (newEvent: any) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [y, m, d] = String(newEvent.date).split('-').map((v: string) => parseInt(v, 10));
    const parseHM = (t?: string) => {
      if (!t) return { hh: 0, mm: 0 };
      const [hh, mm] = t.split(':').map((v: string) => parseInt(v, 10));
      return { hh: hh || 0, mm: mm || 0 };
    };
    const { hh: sh, mm: sm } = parseHM(newEvent.allDay ? '00:00' : newEvent.time);
    const { hh: eh, mm: em } = parseHM(newEvent.allDay ? '23:59' : (newEvent.endTime || newEvent.time));
    const start = new Date(y, (m || 1) - 1, d || 1, sh, sm, 0, 0).toISOString();
    const end = new Date(y, (m || 1) - 1, d || 1, eh, em, 0, 0).toISOString();
    const map = JSON.parse(localStorage.getItem('event_category_colors') || '{}');
    const color = map[newEvent.category] || undefined;
    createEvent.mutate({
      title: newEvent.title,
      description: null,
      startTime: start,
      endTime: end,
      timezone: tz,
      location: newEvent.location || null,
      isAllDay: Boolean(newEvent.allDay),
      category: newEvent.category || null,
      category_color: newEvent.category_color || color || null,
    });
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="text-center mb-8">
          <h1 className="text-lg font-extralight text-muted-foreground mb-2 tracking-wide">
            ДОБРО ПОЖАЛОВАТЬ В
          </h1>
          <h2 className="text-3xl font-thin text-foreground tracking-tight">Today</h2>
        </div>

        {/* Row 1: Сегодня слева, поиск/сортировка справа */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <Button
              variant="outline"
              className="h-8 px-3"
              onClick={() => {
                const today = new Date();
                setSelectedDate(today);
                setWeekStart(getWeekStart(today));
              }}
            >
              Сегодня
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Поиск"
              className="w-8 h-8 rounded-full border flex items-center justify-center text-muted-foreground hover:text-accent"
              onClick={() => {
                const q = prompt('Поиск по задачам:') || '';
                setQuery(q);
              }}
            >
              <span className="w-3.5 h-3.5 rounded-full border mr-0.5 inline-block" />
              <span className="w-2 h-0.5 bg-current inline-block rotate-45 -ml-2 mt-2" />
            </button>
            <button
              aria-label="Сортировка"
              className="w-8 h-8 rounded-full border flex items-center justify-center text-muted-foreground hover:text-accent"
              onClick={() => setSort((s)=> s==='priority'?'due':'priority')}
            >
              <span className="text-[10px]">{sort==='priority'?'P':'D'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: 7‑дневный календарь */}
        <div className="mb-4 card-soft rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              className="p-1 text-muted-foreground hover:text-accent"
              aria-label="Предыдущая неделя"
              onClick={() => {
                const prev = new Date(weekStart);
                prev.setDate(prev.getDate() - 7);
                setWeekStart(prev);
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center text-foreground font-light">
              {selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </div>
            <button
              className="p-1 text-muted-foreground hover:text-accent"
              aria-label="Следующая неделя"
              onClick={() => {
                const next = new Date(weekStart);
                next.setDate(next.getDate() + 7);
                setWeekStart(next);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map((d) => (
              <div key={d} className="text-[11px] text-muted-foreground">{d}</div>
            ))}
            {weekDays.map((d) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelectedDate(new Date(d))}
                  className={`mt-1 aspect-square flex items-center justify-center rounded-full text-sm transition-colors ${isSelected ? 'bg-accent text-white' : 'text-foreground hover:bg-secondary/30'}`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* tabs скрыты по макету; см. документацию как вернуть */}

        {/* Create/Edit modals */}
        <TaskModal
          open={isCreating}
          title="Новая задача"
          submitLabel="Добавить"
          onClose={() => setIsCreating(false)}
          onSubmit={async (v) => { await createTask.mutateAsync(v); setIsCreating(false); }}
        />
        <TaskModal
          open={Boolean(editingId)}
          title="Редактировать задачу"
          initialValues={(tasksAll||[]).find(t=>t.id===editingId) ? {
            title: (tasksAll||[]).find(t=>t.id===editingId)!.title,
            description: (tasksAll||[]).find(t=>t.id===editingId)!.description ?? undefined,
            dueDate: (tasksAll||[]).find(t=>t.id===editingId)!.due_date ?? undefined,
            priority: (tasksAll||[]).find(t=>t.id===editingId)!.priority,
          } : undefined}
          submitLabel="Сохранить"
          onClose={() => setEditingId(null)}
          onSubmit={async (v) => { await updateTask.mutateAsync({ id: editingId!, input: v }); setEditingId(null); }}
        />

        {/* Events + Tasks for selected day */}
        <div className="space-y-6 mb-8">
          {/* Events section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-light text-foreground">События</h3>
              <EventDialog onAddEvent={handleAddEvent} selectedDate={new Date(selectedDate).toISOString().slice(0,10)}>
                <Button aria-label="Добавить событие" className="bg-accent hover:bg-accent/90 text-white w-8 h-8 p-0 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </Button>
              </EventDialog>
            </div>
            {isLoadingEventsToday ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : (eventsToday as ApiEvent[]).length > 0 ? (
              <div className="space-y-2">
                {(eventsToday as ApiEvent[]).map((ev) => {
                  const start = new Date(ev.start_time);
                  const time = `${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`;
                  return (
                    <Link href={`/event/${ev.id}`} key={ev.id} className="flex items-center gap-3 p-3 card-element rounded-lg cursor-pointer hover:bg-accent/10 active:bg-accent/20 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{ev.title}</span>
                          <span className="text-xs text-muted-foreground">{ev.is_all_day ? 'ВЕСЬ ДЕНЬ' : time}</span>
                        </div>
                        {ev.description ? (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ev.description}</div>
                        ) : null}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-card-element flex items-center justify-center text-muted-foreground">
                        <span className="inline-block rotate-0">›</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Нет событий на выбранную дату</div>
            )}
          </div>

          {/* Tasks section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-light text-foreground">Задачи</h3>
              <Button aria-label="Добавить задачу" onClick={() => { setIsCreating(true); setEditingId(null); }} className="bg-accent hover:bg-accent/90 text-white w-8 h-8 p-0 rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {isLoadingTasksAll ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : (
              <TaskList
                items={tasksForSelectedDay||[]}
                onToggle={(id)=>toggleTask.mutate(id)}
                onEdit={(id)=>{ setEditingId(id); setIsCreating(false); }}
                onDelete={(id)=>deleteTask.mutate(id)}
              />
            )}
          </div>
        </div>

        {/* Блок пустых событий временно скрыт */}

        {/* Кнопка "Начать день" */}
        <Button 
          className="w-full bg-accent hover:bg-accent/90 text-white py-4 text-lg touch-target"
          onClick={() => {
            const now = new Date();
            const message = now.getHours() < 12 
              ? 'Доброе утро! Отличный день для достижения целей!'
              : now.getHours() < 18
              ? 'Добрый день! Продолжаем работать над задачами!'
              : 'Добрый вечер! Время подводить итоги дня!';

            toast({ title: 'Начать день', description: message });
          }}
        >
          Начать день
        </Button>
      </div>
    </div>
  );
}
