import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Task } from '../types';
import { getCurrentDateString } from '../utils/dateUtils';

interface TaskDialogProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  children?: React.ReactNode;
}

export default function TaskDialog({ onAddTask, children }: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'work' | 'personal'>('work');
  const [date, setDate] = useState(getCurrentDateString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      category,
      completed: false,
      date,
    });

    setTitle('');
    setCategory('work');
    setDate(getCurrentDateString());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex-1 bg-accent hover:bg-accent/90 text-white touch-target">
            <Plus className="w-4 h-4 mr-2" />
            Новая цель
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border border-border max-h-[85svh] overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle className="font-light text-foreground">Новая цель</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-light text-foreground">
              Название
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название цели"
              className="bg-input border-border focus:ring-accent"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-light text-foreground">
              Категория
            </Label>
            <Select value={category} onValueChange={(value: 'work' | 'personal') => setCategory(value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Работа</SelectItem>
                <SelectItem value="personal">Личное</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-light text-foreground">
              Дата
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-input border-border focus:ring-accent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-accent hover:bg-accent/90 text-white"
            >
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}