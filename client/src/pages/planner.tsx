import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTasks, useToggleTask, useCreateTask, useDeleteTask, useUpdateTask, useEvents, useCreateEvent } from '@/lib/hooks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskModal } from '@/components/tasks/TaskModal';
import { TaskList } from '@/components/tasks/TaskList';
import EventDialog from '@/components/EventDialog';
import type { ApiEvent } from '@/lib/api';

export default function PlannerPage() {
  const { data: tasksToday, isLoading: isLoadingTasksToday } = useTasks('today');
  const { data: tasksWeek, isLoading: isLoadingTasksWeek } = useTasks('week');
  const { data: tasksAll, isLoading: isLoadingTasksAll } = useTasks();
  const toggleTask = useToggleTask();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [tab, setTab] = useState<'today' | 'week' | 'all'>('today');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'priority' | 'due'>('priority');
  
  // Events: Today range (local day → ISO)
  const todayRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, []);
  const { data: eventsToday = [], isLoading: isLoadingEventsToday } = useEvents({ from: todayRange.from, to: todayRange.to });
  const createEvent = useCreateEvent({ from: todayRange.from, to: todayRange.to });

  const applySortFilter = (items?: any[]) => {
    const base = (items || []).filter(t =>
      query ? (t.title?.toLowerCase().includes(query.toLowerCase()) || t.description?.toLowerCase().includes(query.toLowerCase())) : true
    );
    if (sort === 'priority') {
      return [...base].sort((a,b)=> (b.priority||0)-(a.priority||0));
    }
    return [...base].sort((a,b)=> (a.due_date||'').localeCompare(b.due_date||''));
  };

  const todayFiltered = useMemo(()=>applySortFilter(tasksToday), [tasksToday, query, sort]);
  const weekFiltered = useMemo(()=>applySortFilter(tasksWeek), [tasksWeek, query, sort]);
  const allFiltered = useMemo(()=>applySortFilter(tasksAll), [tasksAll, query, sort]);
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
    createEvent.mutate({
      title: newEvent.title,
      description: null,
      startTime: start,
      endTime: end,
      timezone: tz,
      location: newEvent.location || null,
      isAllDay: Boolean(newEvent.allDay),
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

        {/* Row 1: search/sort (left) + add task (right) */}
        <div className="flex items-center justify-between mb-2">
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
          <Button onClick={() => { setIsCreating(true); setEditingId(null); }} className="bg-accent hover:bg-accent/90 text-white">+ Задача</Button>
        </div>

        {/* Row 2: tabs */}
        <div className="flex items-center gap-2 mb-4">
          {(['today','week','all'] as const).map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-3 py-1.5 rounded-full border text-sm ${tab===k ? 'bg-accent text-white border-accent' : 'border-border text-foreground'}`}
            >
              {k==='today'?'Сегодня':k==='week'?'Неделя':'Все'}
            </button>
          ))}
        </div>

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

        {/* Today: Events + Tasks */}
        {tab==='today' && (
          <div className="space-y-6 mb-8">
            {/* Events section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-light text-foreground">События</h3>
                <EventDialog onAddEvent={handleAddEvent} selectedDate={new Date().toISOString().slice(0,10)}>
                  <Button className="bg-accent hover:bg-accent/90 text-white px-3 py-1 h-8">+ Добавить</Button>
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
                      <div key={ev.id} className="flex items-center gap-3 p-3 card-element rounded-lg">
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
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Нет событий на сегодня</div>
              )}
            </div>

            {/* Tasks section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-light text-foreground">Задачи</h3>
                <Button onClick={() => { setIsCreating(true); setEditingId(null); }} className="bg-accent hover:bg-accent/90 text-white px-3 py-1 h-8">+ Задача</Button>
              </div>
              {isLoadingTasksToday ? (
                <div className="text-sm text-muted-foreground">Загрузка...</div>
              ) : (
                <TaskList
                  items={todayFiltered||[]}
                  onToggle={(id)=>toggleTask.mutate(id)}
                  onEdit={(id)=>{ setEditingId(id); setIsCreating(false); }}
                  onDelete={(id)=>deleteTask.mutate(id)}
                />
              )}
            </div>
          </div>
        )}
        {tab==='week' && (
          <div className="space-y-2 mb-8">
            {isLoadingTasksWeek ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : (
              <TaskList
                items={weekFiltered||[]}
                onToggle={(id)=>toggleTask.mutate(id)}
                onEdit={(id)=>{ setEditingId(id); setIsCreating(false); }}
                onDelete={(id)=>deleteTask.mutate(id)}
              />
            )}
          </div>
        )}
        {tab==='all' && (
          <div className="space-y-2 mb-8">
            {isLoadingTasksAll ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : (
              <TaskList
                items={allFiltered||[]}
                onToggle={(id)=>toggleTask.mutate(id)}
                onEdit={(id)=>{ setEditingId(id); setIsCreating(false); }}
                onDelete={(id)=>deleteTask.mutate(id)}
              />
            )}
          </div>
        )}

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
            
            alert(message);
          }}
        >
          Начать день
        </Button>
      </div>
    </div>
  );
}
