import React from 'react';
import { isTaskOverdue, isTaskToday } from '../utils/dateUtils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks, useCreateTask, useUpdateTask, useToggleTask, useDeleteTask } from '@/lib/hooks';
import type { ApiTask } from '@/lib/api';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskModal } from '@/components/tasks/TaskModal';

export default function GoalsPage() {
  const [filter, setFilter] = React.useState<'all' | 'today' | 'overdue'>('today');
  const [isCreating, setIsCreating] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const { data: allTasks = [], isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const toggleTaskMut = useToggleTask();
  const deleteTask = useDeleteTask();

  const filtered = allTasks.filter((t: ApiTask) => {
    if (filter === 'today') return !t.completed && (t.due_date ? isTaskToday(t.due_date) : false);
    if (filter === 'overdue') return !t.completed && (t.due_date ? isTaskOverdue(t.due_date) : false);
    return true;
  });

  const counts = {
    today: allTasks.filter((t) => !t.completed && (t.due_date ? isTaskToday(t.due_date) : false)).length,
    overdue: allTasks.filter((t) => !t.completed && (t.due_date ? isTaskOverdue(t.due_date) : false)).length,
    total: allTasks.length,
  };

  const TaskItem = ({ task }: { task: ApiTask }) => (
    <div
      className="flex items-center gap-3 p-3 card-element cursor-pointer select-none rounded-lg transition-colors hover:bg-accent/10"
      onClick={() => toggleTaskMut.mutate(task.id)}
      role="button"
      aria-pressed={task.completed}
      tabIndex={0}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => toggleTaskMut.mutate(task.id)}
        onClick={(e) => e.stopPropagation()}
        className="w-5 h-5 rounded-full border-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
      />
      <span className={`flex-1 text-sm ${task.completed ? 'line-through opacity-60' : ''}`}>{task.title}</span>
      {task.due_date && (
        <span className={`text-xs ${isTaskOverdue(task.due_date) ? 'text-destructive' : 'text-muted-foreground'}`}>{task.due_date}</span>
      )}
    </div>
  );

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="mb-6">
          <h1 className="text-2xl font-thin text-foreground mb-2">Цели</h1>
          <p className="text-sm text-muted-foreground font-light">Управляйте своими задачами и целями</p>
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setFilter('today')} className={`flex-1 card-soft text-center transition-colors ${filter === 'today' ? 'ring-2 ring-accent' : ''}`}>
            <div className="text-2xl font-bold text-accent">{counts.today}</div>
            <div className="text-xs text-muted-foreground">Сегодня</div>
          </button>
          <button onClick={() => setFilter('overdue')} className={`flex-1 text-center transition-colors rounded-xl p-4 ${filter === 'overdue' ? 'ring-2 ring-destructive' : ''}`} style={{ background: 'rgba(179, 138, 138, 0.2)' }}>
            <div className="text-2xl font-bold text-destructive">{counts.overdue}</div>
            <div className="text-xs text-muted-foreground">Просроченные</div>
          </button>
          <button onClick={() => setFilter('all')} className={`flex-1 card-soft text-center transition-colors ${filter === 'all' ? 'ring-2 ring-accent' : ''}`}>
            <div className="text-2xl font-bold text-foreground">{counts.total}</div>
            <div className="text-xs text-muted-foreground">Всего</div>
          </button>
        </div>

        <div className="mb-6">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Загрузка...</div>
          ) : (
            <div className="space-y-3 animate-slide-up">
              {filtered.map((task: ApiTask) => (
                <div key={task.id} className="flex items-center gap-3">
                  <TaskItem task={task} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(task.id); setIsCreating(false); }}>Изм.</Button>
                    <Button variant="outline" size="sm" onClick={() => deleteTask.mutate(task.id)}>Удал.</Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="p-4 text-center text-muted-foreground text-sm">Задач нет</div>}
            </div>
          )}
        </div>

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
          initialValues={(() => { const t = allTasks.find(x=>x.id===editingId); return t ? { title: t.title, description: t.description ?? undefined, dueDate: t.due_date ?? undefined, priority: t.priority } : undefined; })()}
          submitLabel="Сохранить"
          onClose={() => setEditingId(null)}
          onSubmit={async (v) => { await updateTask.mutateAsync({ id: editingId!, input: v }); setEditingId(null); }}
        />

        <div className="flex gap-3">
          <Button className="flex-1 bg-accent hover:bg-accent/90 text-white touch-target" onClick={() => { setIsCreating(true); setEditingId(null); }}>
            <Plus className="w-4 h-4 mr-2" />
            Новая задача
          </Button>
          <Button variant="secondary" className="flex-1 touch-target" onClick={() => {}}>
            Создать список
          </Button>
        </div>
      </div>
    </div>
  );
}
