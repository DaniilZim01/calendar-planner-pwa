import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTasks, useToggleTask, useCreateTask, useDeleteTask, useUpdateTask } from '@/lib/hooks';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskModal } from '@/components/tasks/TaskModal';
import { TaskList } from '@/components/tasks/TaskList';

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

        {/* Lists */}
        {tab==='today' && (
          <div className="space-y-2 mb-8">
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
