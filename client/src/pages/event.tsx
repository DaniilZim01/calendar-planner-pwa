import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { api, type ApiEvent } from '@/lib/api';
import { useDeleteEvent } from '@/lib/hooks';

export default function EventPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const del = useDeleteEvent();

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

  const start = new Date(event.start_time);
  const end = new Date(event.end_time);
  const dateStr = start.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = event.is_all_day
    ? 'ВЕСЬ ДЕНЬ'
    : `${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')} — ${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container space-y-4">
        <h1 className="text-2xl font-thin text-foreground">{event.title}</h1>
        <div className="card-element rounded-lg p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Дата и время</div>
          <div className="text-foreground">{dateStr}</div>
          <div className="text-foreground">{timeStr}</div>
        </div>
        {event.location && (
          <div className="card-element rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Локация</div>
            <div className="text-foreground">{event.location}</div>
          </div>
        )}
        {event.description && (
          <div className="card-element rounded-lg p-4 space-y-2">
            <div className="text-sm text-muted-foreground">Описание</div>
            <div className="text-foreground whitespace-pre-wrap">{event.description}</div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          {/* Редактирование добавим позже (модалка) */}
          <Button variant="outline" className="flex-1" onClick={() => history.back()}>Назад</Button>
          <Button variant="destructive" className="flex-1" onClick={() => del.mutate(event.id)}>Удалить</Button>
        </div>
      </div>
    </div>
  );
}


