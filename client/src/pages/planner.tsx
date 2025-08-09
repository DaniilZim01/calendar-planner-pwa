import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Event } from '../types';
import { formatTime, getCurrentDateString } from '../utils/dateUtils';
import { useTasks, useToggleTask, useCreateTask, useDeleteTask, useUpdateTask } from '@/lib/hooks';
import { TaskForm } from '@/components/tasks/TaskForm';
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
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const todayEvents = events.filter((event: Event) => 
    event.date === getCurrentDateString()
  ).sort((a: Event, b: Event) => {
    if (!a.time || !b.time) return 0;
    return a.time.localeCompare(b.time);
  });

  const EventItem = ({ event }: { event: Event }) => (
    <div className="flex items-start gap-4 p-4 card-element">
      <div className="text-center min-w-16">
        {event.time ? (
          <>
            <div className="text-lg font-medium text-foreground">
              {event.time.split(':')[0]}:{event.time.split(':')[1]}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatTime(event.time).split(' ')[1]}
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">ВЕСЬ ДЕНЬ</div>
        )}
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-foreground mb-1">{event.title}</h3>
        {event.location && (
          <p className="text-sm text-muted-foreground">{event.location}</p>
        )}
        {event.endTime && (
          <p className="text-xs text-muted-foreground mt-1">
            {event.time} - {event.endTime}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="text-center mb-8">
          <h1 className="text-lg font-extralight text-muted-foreground mb-2 tracking-wide">
            ДОБРО ПОЖАЛОВАТЬ В
          </h1>
          <h2 className="text-3xl font-thin text-foreground tracking-tight">Today</h2>
        </div>

        {/* Tabs */}
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
          <div className="ml-auto">
            <Button onClick={() => { setIsCreating(true); setEditingId(null); }} className="bg-accent hover:bg-accent/90 text-white">+ Задача</Button>
          </div>
        </div>

        {/* Create/Edit form */}
        {isCreating && (
          <div className="mb-4 p-4 card-element">
            <TaskForm
              onSubmit={async (v) => { await createTask.mutateAsync(v); setIsCreating(false); }}
              onCancel={() => setIsCreating(false)}
              submitLabel="Добавить"
            />
          </div>
        )}

        {editingId && (
          <div className="mb-4 p-4 card-element">
            <TaskForm
              initialValues={(tasksAll||[]).find(t=>t.id===editingId) ? {
                title: (tasksAll||[]).find(t=>t.id===editingId)!.title,
                description: (tasksAll||[]).find(t=>t.id===editingId)!.description ?? undefined,
                dueDate: (tasksAll||[]).find(t=>t.id===editingId)!.due_date ?? undefined,
                priority: (tasksAll||[]).find(t=>t.id===editingId)!.priority,
              } : undefined}
              onSubmit={async (v) => { await updateTask.mutateAsync({ id: editingId!, input: v }); setEditingId(null); }}
              onCancel={() => setEditingId(null)}
              submitLabel="Сохранить"
            />
          </div>
        )}

        {/* Lists */}
        {tab==='today' && (
          <div className="space-y-2 mb-8">
            {isLoadingTasksToday ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : (
              <TaskList
                items={tasksToday||[]}
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
                items={tasksWeek||[]}
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
                items={tasksAll||[]}
                onToggle={(id)=>toggleTask.mutate(id)}
                onEdit={(id)=>{ setEditingId(id); setIsCreating(false); }}
                onDelete={(id)=>deleteTask.mutate(id)}
              />
            )}
          </div>
        )}

        {/* События на сегодня */}
        <div className="space-y-4 mb-8">
          {todayEvents.length > 0 ? (
            todayEvents.map((event: Event) => (
              <EventItem key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <p className="text-lg font-medium mb-2">Нет событий на сегодня</p>
                <p className="text-sm">Отличный день для планирования нового!</p>
              </div>
            </div>
          )}
        </div>

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
