import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { Event } from '../types';
import { getCurrentDateString } from '../utils/dateUtils';

interface EventDialogProps {
  onAddEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  selectedDate?: string;
  children?: React.ReactNode;
}

export default function EventDialog({ onAddEvent, selectedDate, children }: EventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(selectedDate || getCurrentDateString());
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [category, setCategory] = useState<'work' | 'personal' | 'health' | 'other'>('other');
  const [categoryColor, setCategoryColor] = useState<string>(() => {
    const map = JSON.parse(localStorage.getItem('event_category_colors') || '{}');
    return map[category] || '#93B69C';
  });
  const [allDay, setAllDay] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title: title.trim(),
      location: location.trim() || undefined,
      date,
      time: allDay ? undefined : time || undefined,
      endTime: allDay ? undefined : endTime || undefined,
      category,
      category_color: categoryColor,
      allDay,
    });

    // Reset form
    setTitle('');
    setLocation('');
    setDate(selectedDate || getCurrentDateString());
    setTime('');
    setEndTime('');
    setCategory('other');
    setCategoryColor('#93B69C');
    setAllDay(false);
    setOpen(false);
  };

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
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-light text-foreground">
              Категория
            </Label>
            <Select value={category} onValueChange={(value: 'work' | 'personal' | 'health' | 'other') => setCategory(value)}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Работа</SelectItem>
                <SelectItem value="personal">Личное</SelectItem>
                <SelectItem value="health">Здоровье</SelectItem>
                <SelectItem value="other">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-light text-foreground">Цвет категории</Label>
            <div className="flex flex-wrap gap-2">
              {[
                '#7FB9D6', // Sky Blue
                '#E9A7B6', // Blush Pink
                '#93B69C', // Sage Green
                '#E9C46A', // Warm Honey
                '#5873A6', // Indigo Blue
                '#B296C7', // Lavender Plum
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCategoryColor(c);
                    const map = JSON.parse(localStorage.getItem('event_category_colors') || '{}');
                    map[category] = c;
                    localStorage.setItem('event_category_colors', JSON.stringify(map));
                  }}
                  aria-label={`Выбрать цвет ${c}`}
                  className={`w-6 h-6 rounded-full border ${categoryColor === c ? 'ring-2 ring-accent' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
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