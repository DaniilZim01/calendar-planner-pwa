import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '../hooks/useLocalStorage';
import { Event } from '../types';
import { getMonthName, generateCalendarDates, formatDate } from '../utils/dateUtils';
import EventDialog from '../components/EventDialog';

export default function CalendarPage() {
  const { events, setEvents } = useAppData();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const calendarDates = generateCalendarDates(currentYear, currentMonth);
  const selectedDateString = formatDate(selectedDate, 'yyyy-MM-dd');
  
  const selectedDayEvents = events.filter((event: Event) => 
    event.date === selectedDateString
  );

  const addEvent = (newEvent: Omit<Event, 'id' | 'createdAt'>) => {
    const event: Event = {
      ...newEvent,
      id: Math.random().toString(36),
      createdAt: new Date().toISOString(),
    };
    setEvents((prevEvents: Event[]) => [...prevEvents, event]);
  };

  const hasEventOnDate = (date: Date): boolean => {
    const dateString = formatDate(date, 'yyyy-MM-dd');
    return events.some((event: Event) => event.date === dateString);
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

  const EventItem = ({ event }: { event: Event }) => {
    const getCategoryColor = (category: string) => {
      switch (category) {
        case 'work': return 'bg-accent';
        case 'personal': return 'bg-success';
        case 'health': return 'bg-warning';
        default: return 'bg-muted';
      }
    };

    return (
      <div className="flex items-center gap-3 p-3 card-element">
        <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.category)}`}></div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
          <p className="text-xs text-muted-foreground">
            {event.allDay ? (
              'ВЕСЬ ДЕНЬ'
            ) : (
              <>
                {event.location && <span>{event.location} • </span>}
                <span>{event.time}</span>
                {event.endTime && ` - ${event.endTime}`}
              </>
            )}
          </p>
        </div>
      </div>
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
                  {hasEvent && !isSelected && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
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
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event: Event) => (
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
