import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { getMonthName, generateCalendarDates, formatDate } from '../utils/dateUtils';
import EventDialog from '../components/EventDialog';
import { useCreateEvent, useEvents } from '@/lib/hooks';
import type { ApiEvent } from '@/lib/api';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calendarDates = generateCalendarDates(currentYear, currentMonth);
  const gridStart = calendarDates[0];
  const gridEnd = calendarDates[calendarDates.length - 1];
  const range = useMemo(() => {
    const start = new Date(gridStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(gridEnd);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }, [gridStart, gridEnd]);

  const { data: events = [], isLoading } = useEvents({ from: range.from, to: range.to });
  const createEventMutation = useCreateEvent({ from: range.from, to: range.to });
  const selectedDateString = formatDate(selectedDate, 'yyyy-MM-dd');
  
  const selectedDayEvents: ApiEvent[] = useMemo(() => {
    return (events || []).filter((ev: ApiEvent) => {
      const tz = ev.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const local = new Date(ev.start_time);
      // Получаем локальную дату пользователя для сравнения по дню
      const y = local.getFullYear();
      const m = String(local.getMonth() + 1).padStart(2, '0');
      const d = String(local.getDate()).padStart(2, '0');
      const dayStr = `${y}-${m}-${d}`;
      return dayStr === selectedDateString;
    });
  }, [events, selectedDateString]);

  const addEvent = (newEvent: any) => {
    // newEvent: { title, location?, date: 'yyyy-MM-dd', time?, endTime?, category, allDay }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const [y, m, d] = String(newEvent.date).split('-').map((v: string) => parseInt(v, 10));
    const parseHM = (t?: string) => {
      if (!t) return { hh: 0, mm: 0 };
      const [hh, mm] = t.split(':').map((v: string) => parseInt(v, 10));
      return { hh: hh || 0, mm: mm || 0 };
    };
    const { hh: sh, mm: sm } = parseHM(newEvent.allDay ? '00:00' : newEvent.time);
    const { hh: eh, mm: em } = parseHM(newEvent.allDay ? '23:59' : (newEvent.endTime || newEvent.time));
    const start = new Date(y, (m || 1) - 1, d || 1, sh, sm, 0, 0).toISOString();
    const end = new Date(y, (m || 1) - 1, d || 1, eh, em, 0, 0).toISOString();
    createEventMutation.mutate({
      title: newEvent.title,
      description: null,
      startTime: start,
      endTime: end,
      timezone: tz,
      location: newEvent.location || null,
      isAllDay: Boolean(newEvent.allDay),
    });
  };

  const hasEventOnDate = (date: Date): boolean => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;
    return (events || []).some((ev: ApiEvent) => {
      const local = new Date(ev.start_time);
      const ly = local.getFullYear();
      const lm = String(local.getMonth() + 1).padStart(2, '0');
      const ld = String(local.getDate()).padStart(2, '0');
      return `${ly}-${lm}-${ld}` === dateString;
    });
  };

  const colorsForDate = (date: Date): string[] => {
    return hasEventOnDate(date) ? ['#B9A989'] : [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth;
  };

  const EventItem = ({ event }: { event: ApiEvent }) => {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    const time = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
    const timeEnd = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    return (
      <Link href={`/event/${event.id}`} className="flex items-center gap-3 p-3 card-element rounded-lg cursor-pointer hover:bg-accent/10 active:bg-accent/20 transition-colors">
        <div className="w-3 h-3 rounded-full bg-accent"></div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
          <p className="text-xs text-muted-foreground">
            {event.is_all_day ? (
              'ВЕСЬ ДЕНЬ'
            ) : (
              <>
                {event.location && <span>{event.location} • </span>}
                <span>{time}</span>
                {event.end_time && ` - ${timeEnd}`}
              </>
            )}
          </p>
        </div>
        <div className="w-7 h-7 rounded-full bg-card-element flex items-center justify-center text-muted-foreground">
          <span className="inline-block rotate-0">›</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="mb-6">
          {/* Заголовок с навигацией */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="text-muted-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-light text-foreground tracking-tight">
              {getMonthName(currentMonth)} {currentYear}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="text-muted-foreground"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Заголовки дней недели */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="text-center py-2 text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Календарная сетка */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDates.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isTodayDate = isToday(date);
              const isCurrentMonthDate = isCurrentMonth(date);
              const hasEvent = hasEventOnDate(date);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors relative touch-target ${
                    isSelected
                      ? 'bg-accent text-white'
                      : isTodayDate
                      ? 'bg-accent/20 text-accent font-medium'
                      : isCurrentMonthDate
                      ? 'text-foreground hover:bg-secondary/30'
                      : 'text-muted-foreground/50'
                  }`}
                >
                  {date.getDate()}
                  {!isSelected && colorsForDate(date).length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {colorsForDate(date).map((c, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* События выбранного дня */}
        <div className="mb-4">
          <h3 className="font-medium text-foreground mb-3">
            События на {formatDate(selectedDate, 'd MMMM')}
          </h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Загрузка…</div>
            ) : selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event: ApiEvent) => (
                <EventItem key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Нет событий на этот день</p>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка добавления события */}
        <EventDialog 
          onAddEvent={addEvent}
          selectedDate={selectedDateString}
        >
          <Button className="w-full bg-accent hover:bg-accent/90 text-white touch-target">
            <Plus className="w-4 h-4 mr-2" />
            Добавить событие
          </Button>
        </EventDialog>
      </div>
    </div>
  );
}
