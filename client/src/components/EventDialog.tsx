import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { getCurrentDateString } from '../utils/dateUtils';

interface EventDialogProps {
  onAddEvent: (event: {
    title: string;
    location?: string;
    date: string;
    endDate?: string;
    time?: string;
    endTime?: string;
    category: 'work' | 'personal' | 'health' | 'other';
    allDay: boolean;
  }) => void;
  selectedDate?: string;
  children?: React.ReactNode;
}

export default function EventDialog({ onAddEvent, selectedDate, children }: EventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(selectedDate || getCurrentDateString());
  const [endDate, setEndDate] = useState(selectedDate || getCurrentDateString());
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'other'>('other');
  const [categoryColor, setCategoryColor] = useState<string>('#93B69C');
  const [allDay, setAllDay] = useState(false);
  const [timeError, setTimeError] = useState<string>('');

  // Подставлять сохранённый цвет при смене категории
  useEffect(() => {
    try {
      const map = JSON.parse(localStorage.getItem('event_category_colors') || '{}');
      if (map[category]) setCategoryColor(map[category]);
    } catch {}
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate time range when not all-day
    if (!allDay) {
      const startIso = new Date(`${date}T${time || '00:00'}:00`).toISOString();
      const endIso = new Date(`${endDate || date}T${endTime || time || '00:00'}:00`).toISOString();
      if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
        setTimeError('Время окончания должно быть позже времени начала');
        return;
      }
    }
    setTimeError('');

    onAddEvent({
      title: title.trim(),
      location: location.trim() || undefined,
      date,
      endDate,
      time: allDay ? undefined : time || undefined,
      endTime: allDay ? undefined : endTime || undefined,
      category,
      allDay,
    });

    // Reset form
    setTitle('');
    setLocation('');
    setDate(selectedDate || getCurrentDateString());
    setTime('');
    setEndTime('');
    setEndDate(selectedDate || getCurrentDateString());
    setCategory('other');
    setCategoryColor('#93B69C');
    setAllDay(false);
    setOpen(false);
  };

  // Keep endDate >= date
  useEffect(() => {
    if (endDate < date) {
      setEndDate(date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // When start time changes, default end time to +1h if empty or not later than start
  useEffect(() => {
    if (allDay) return;
    if (!time) return;
    const [sh, sm] = time.split(':').map((v) => parseInt(v || '0', 10));
    let eh = sh + 1;
    let em = sm;
    let nextEndDate = endDate;
    if (eh >= 24) {
      eh = eh - 24;
      // bump end date by +1 day if currently equal to start date
      const d0 = new Date(date);
      const d1 = new Date(endDate);
      if (d1 <= d0) {
        const bump = new Date(d0);
        bump.setDate(bump.getDate() + 1);
        nextEndDate = bump.toISOString().slice(0, 10);
      }
    }
    const suggested = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    const endComparable = new Date(`${endDate}T${endTime || '00:00'}:00`).getTime();
    const startComparable = new Date(`${date}T${time || '00:00'}:00`).getTime();
    if (!endTime || endComparable <= startComparable) {
      setEndTime(suggested);
      setEndDate(nextEndDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full bg-accent hover:bg-accent/90 text-white touch-target">
            <Plus className="w-4 h-4 mr-2" />
            Добавить событие
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-light text-foreground">Новое событие</DialogTitle>
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
              placeholder="Введите название события"
              className="bg-input border-border focus:ring-accent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-light text-foreground">
              Место
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Введите место проведения"
              className="bg-input border-border focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-light text-foreground">
                Дата начала
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-input border-border focus:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-light text-foreground">
                Дата окончания
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={date}
                className="bg-input border-border focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={allDay}
              onCheckedChange={(checked) => setAllDay(checked as boolean)}
              className="border-border data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <Label htmlFor="allDay" className="text-sm font-light text-foreground">
              Весь день
            </Label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm font-light text-foreground">
                  Время начала
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-input border-border focus:ring-accent"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-light text-foreground">
                  Время окончания
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-input border-border focus:ring-accent"
                />
                {timeError && (
                  <div className="text-xs text-red-500">{timeError}</div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-light text-foreground">
              Категория
            </Label>
            <div className="flex items-center gap-3">
              <Select value={category} onValueChange={(value: 'work' | 'personal' | 'health' | 'other') => setCategory(value)}>
                <SelectTrigger className="bg-input border-border flex-1 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Работа</SelectItem>
                  <SelectItem value="personal">Личное</SelectItem>
                  <SelectItem value="health">Здоровье</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                </SelectContent>
              </Select>
              {/* Временный: индикатор будет перемещён позднее — сейчас не влияет на данные */}
              <div className="w-10 h-10 rounded-full border" style={{ backgroundColor: categoryColor }} />
            </div>
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