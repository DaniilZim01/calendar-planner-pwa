import { Button } from '@/components/ui/button';
import { useAppData } from '../hooks/useLocalStorage';
import { Event } from '../types';
import { formatTime, getCurrentDateString } from '../utils/dateUtils';

export default function PlannerPage() {
  const { events } = useAppData();
  
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
