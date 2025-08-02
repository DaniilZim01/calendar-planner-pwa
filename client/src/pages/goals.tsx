import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppData } from '../hooks/useLocalStorage';
import { Task, TaskCounts } from '../types';
import { isTaskToday, isTaskOverdue } from '../utils/dateUtils';
import TaskDialog from '../components/TaskDialog';

export default function GoalsPage() {
  const { tasks, setTasks } = useAppData();
  const [workExpanded, setWorkExpanded] = useState(true);
  const [personalExpanded, setPersonalExpanded] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue'>('all');

  const filterTasks = (taskList: Task[]) => {
    switch (filter) {
      case 'today':
        return taskList.filter((task: Task) => !task.completed && isTaskToday(task.date));
      case 'overdue':
        return taskList.filter((task: Task) => !task.completed && isTaskOverdue(task.date));
      default:
        return taskList;
    }
  };

  const allTasks = tasks.filter((task: Task) => filterTasks([task]).length > 0);
  const workTasks = filterTasks(tasks.filter((task: Task) => task.category === 'work'));
  const personalTasks = filterTasks(tasks.filter((task: Task) => task.category === 'personal'));

  const getTaskCounts = (): TaskCounts => {
    const today = tasks.filter((task: Task) => !task.completed && isTaskToday(task.date)).length;
    const overdue = tasks.filter((task: Task) => !task.completed && isTaskOverdue(task.date)).length;
    const total = tasks.length;
    return { today, overdue, total };
  };

  const counts = getTaskCounts();

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36),
      createdAt: new Date().toISOString(),
    };
    setTasks((prevTasks: Task[]) => [...prevTasks, task]);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task: Task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center gap-3 p-3 card-element">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => toggleTask(task.id)}
        className="w-5 h-5 border-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
      />
      <span 
        className={`flex-1 text-sm ${task.completed ? 'line-through opacity-60' : ''}`}
      >
        {task.title}
      </span>
      <span 
        className={`text-xs ${
          isTaskOverdue(task.date) ? 'text-destructive' : 'text-muted-foreground'
        }`}
      >
        {task.date}
      </span>
    </div>
  );

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="mb-6">
          <h1 className="text-2xl font-thin text-foreground mb-2">Цели</h1>
          <p className="text-sm text-muted-foreground font-light">
            Управляйте своими задачами и целями
          </p>
        </div>

        {/* Счетчики задач */}
        <div className="flex gap-3 mb-6">
          <button 
            onClick={() => setFilter('today')}
            className={`flex-1 card-soft text-center transition-colors ${filter === 'today' ? 'ring-2 ring-accent' : ''}`}
          >
            <div className="text-2xl font-bold text-accent">{counts.today}</div>
            <div className="text-xs text-muted-foreground">Сегодня</div>
          </button>
          <button 
            onClick={() => setFilter('overdue')}
            className={`flex-1 text-center transition-colors rounded-xl p-4 ${filter === 'overdue' ? 'ring-2 ring-destructive' : ''}`}
            style={{ background: 'rgba(179, 138, 138, 0.2)' }}
          >
            <div className="text-2xl font-bold text-destructive">{counts.overdue}</div>
            <div className="text-xs text-muted-foreground">Просроченные</div>
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 card-soft text-center transition-colors ${filter === 'all' ? 'ring-2 ring-accent' : ''}`}
          >
            <div className="text-2xl font-bold text-foreground">{counts.total}</div>
            <div className="text-xs text-muted-foreground">Всего</div>
          </button>
        </div>

        {/* Категория РАБОТА */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <h3 className="font-light text-foreground">РАБОТА</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWorkExpanded(!workExpanded)}
              className="text-accent p-1"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${workExpanded ? '' : '-rotate-90'}`} />
            </Button>
          </div>
          
          {workExpanded && (
            <div className="space-y-3 animate-slide-up">
              {workTasks.map((task: Task) => (
                <TaskItem key={task.id} task={task} />
              ))}
              {workTasks.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Нет рабочих задач
                </div>
              )}
            </div>
          )}
        </div>

        {/* Категория ЛИЧНОЕ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <h3 className="font-light text-foreground">ЛИЧНОЕ</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPersonalExpanded(!personalExpanded)}
              className="text-accent p-1"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${personalExpanded ? '' : '-rotate-90'}`} />
            </Button>
          </div>
          
          {personalExpanded && (
            <div className="space-y-3 animate-slide-up">
              {personalTasks.map((task: Task) => (
                <TaskItem key={task.id} task={task} />
              ))}
              {personalTasks.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Нет личных задач
                </div>
              )}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <TaskDialog onAddTask={addTask}>
            <Button className="flex-1 bg-accent hover:bg-accent/90 text-white touch-target">
              <Plus className="w-4 h-4 mr-2" />
              Новая цель
            </Button>
          </TaskDialog>
          <Button 
            variant="secondary"
            className="flex-1 touch-target"
            onClick={() => {
              const listName = prompt('Введите название списка:');
              if (listName?.trim()) {
                // Можно добавить логику создания списка
                console.log('Creating list:', listName);
              }
            }}
          >
            Создать список
          </Button>
        </div>
      </div>
    </div>
  );
}
