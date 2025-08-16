import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { api, type ApiEvent } from '@/lib/api';
import { useDeleteEvent, useUpdateEvent } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function EventPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const del = useDeleteEvent();
  const upd = useUpdateEvent();
  const [isDeleting, setIsDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  // Local editable fields
  const [titleEdit, setTitleEdit] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [locationEdit, setLocationEdit] = useState('');
  const [categoryEdit, setCategoryEdit] = useState<'work'|'personal'|'health'|'other'>('other');
  const [timeError, setTimeError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get<{ success: boolean; data: ApiEvent }>(`/api/events/${id}`);
        if (!ignore) setEvent(data.data);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (id) load();
    return () => { ignore = true; };
  }, [id]);

  if (loading) return <div className="app-container"><div className="screen-container"><div className="text-sm text-muted-foreground">Загрузка…</div></div></div>;
  if (!event) return <div className="app-container"><div className="screen-container"><div className="text-sm text-muted-foreground">Событие не найдено</div></div></div>;

  const start = new Date((event.start_time || '') + 'Z');
  const end = new Date((event.end_time || '') + 'Z');
  const dateStr = start.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  const fmt = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const timeStr = event.is_all_day ? 'ВЕСЬ ДЕНЬ' : `${fmt.format(start)} — ${fmt.format(end)}`;

  const categoryLabel = useMemo(() => {
    try {
      const map = JSON.parse(localStorage.getItem('event_category_by_id') || '{}');
      return map[event.id]?.category || '—';
    } catch { return '—'; }
  }, [event.id]);

  function beginEdit() {
    setEditing(true);
    setTitleEdit(event.title);
    const pad = (n: number) => String(n).padStart(2, '0');
    setDateStart(`${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`);
    setDateEnd(`${end.getFullYear()}-${pad(end.getMonth()+1)}-${pad(end.getDate())}`);
    setTimeStart(`${pad(start.getHours())}:${pad(start.getMinutes())}`);
    setTimeEnd(`${pad(end.getHours())}:${pad(end.getMinutes())}`);
    setLocationEdit(event.location || '');
    try {
      const map = JSON.parse(localStorage.getItem('event_category_by_id') || '{}');
      setCategoryEdit(map[event.id]?.category || 'other');
    } catch { setCategoryEdit('other'); }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    // Validate
    const s = new Date(`${dateStart}T${timeStart || '00:00'}:00`);
    const en = new Date(`${dateEnd || dateStart}T${timeEnd || timeStart || '00:00'}:00`);
    if (en.getTime() <= s.getTime()) {
      setTimeError('Время окончания должно быть позже начала');
      return;
    }
    setTimeError('');
    try {
      await upd.mutateAsync({ id: event.id, input: {
        title: titleEdit.trim(),
        startTime: s.toISOString(),
        endTime: en.toISOString(),
        location: locationEdit || null,
      }} as any);
      // Save category locally by id
      try {
        const map = JSON.parse(localStorage.getItem('event_category_by_id') || '{}');
        map[event.id] = { category: categoryEdit };
        localStorage.setItem('event_category_by_id', JSON.stringify(map));
      } catch {}
      toast({ title: 'Сохранено', description: 'Событие обновлено' });
      setEditing(false);
      // reload
      setEvent({ ...event, title: titleEdit.trim(), start_time: s.toISOString().replace('Z',''), end_time: en.toISOString().replace('Z',''), location: locationEdit || null } as any);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  }

  async function handleDelete() {
    if (!event) return;
    setIsDeleting(true);
    try {
      await del.mutateAsync(event.id);
      toast({ title: 'Удалено', description: 'Событие удалено' });
      // small fade-out then back
      setTimeout(() => history.back(), 180);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
      setIsDeleting(false);
    }
  }

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container space-y-4">
        <h1 className="text-2xl font-thin text-foreground">{event.title}</h1>
        {editing ? (
          <form onSubmit={saveEdit} className="card-element rounded-lg p-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-sm">Название</Label>
              <Input value={titleEdit} onChange={(e)=>setTitleEdit(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">Дата начала</Label>
                <Input type="date" value={dateStart} onChange={(e)=>setDateStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Дата окончания</Label>
                <Input type="date" value={dateEnd} min={dateStart} onChange={(e)=>setDateEnd(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Время начала</Label>
                <Input type="time" value={timeStart} onChange={(e)=>setTimeStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Время окончания</Label>
                <Input type="time" value={timeEnd} onChange={(e)=>setTimeEnd(e.target.value)} />
                {timeError && <div className="text-xs text-red-500">{timeError}</div>}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Локация</Label>
              <Input value={locationEdit} onChange={(e)=>setLocationEdit(e.target.value)} placeholder="Адрес или онлайн" />
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Категория</Label>
              <select className="h-10 px-3 rounded-md border bg-input" value={categoryEdit} onChange={(e)=>setCategoryEdit(e.target.value as any)}>
                <option value="work">Работа</option>
                <option value="personal">Личное</option>
                <option value="health">Здоровье</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={()=>setEditing(false)}>Отмена</Button>
              <Button type="submit" className="flex-1 bg-accent text-white">Сохранить</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="card-element rounded-lg p-4 space-y-2" onClick={beginEdit} role="button">
              <div className="text-sm text-muted-foreground">Дата и время</div>
              <div className="text-foreground">{dateStr}</div>
              <div className="text-foreground">{timeStr}</div>
            </div>
            {event.location && (
              <div className="card-element rounded-lg p-4 space-y-2" onClick={beginEdit} role="button">
                <div className="text-sm text-muted-foreground">Локация</div>
                <div className="text-foreground">{event.location}</div>
              </div>
            )}
            <div className="card-element rounded-lg p-4 space-y-2" onClick={beginEdit} role="button">
              <div className="text-sm text-muted-foreground">Категория</div>
              <div className="text-foreground">{categoryLabel}</div>
            </div>
          </>
        )}
        {event.description && (
          <div className="card-element rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Описание</div>
            <div className="text-foreground whitespace-pre-wrap">{event.description}</div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => history.back()}>Назад</Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Удаляю…' : 'Удалить'}
          </Button>
        </div>
      </div>
    </div>
  );
}


