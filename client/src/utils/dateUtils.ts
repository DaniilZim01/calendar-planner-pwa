import { format, isToday, isPast, startOfDay, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date: Date | string, formatStr: string = 'dd.MM.yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ru });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const period = hour < 12 ? 'УТР' : hour < 18 ? 'ДНЯ' : 'ВЕЧ';
  return `${hours}:${minutes} ${period}`;
};

export const isTaskToday = (taskDate: string): boolean => {
  if (taskDate === 'Сегодня') return true;
  try {
    const date = parseISO(taskDate);
    return isToday(date);
  } catch {
    return false;
  }
};

export const isTaskOverdue = (taskDate: string): boolean => {
  if (taskDate === 'Сегодня') return false;
  try {
    const date = parseISO(taskDate);
    return isPast(startOfDay(date)) && !isToday(date);
  } catch {
    return false;
  }
};

export const getWeekDays = (): string[] => {
  return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[monthIndex];
};

export const getCurrentDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const generateCalendarDates = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);
  
  // Adjust to start from Monday
  const dayOfWeek = (firstDay.getDay() + 6) % 7;
  startDate.setDate(startDate.getDate() - dayOfWeek);
  
  // Adjust to end on Sunday
  const endDayOfWeek = (lastDay.getDay() + 6) % 7;
  endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
  
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Helpers for timezone-safe calendar event conversion
export function toUtcIso(localDateTimeIso: string, timeZone: string): string {
  // localDateTimeIso is ISO string interpreted in provided IANA timeZone
  // Convert to UTC ISO
  const date = new Date(localDateTimeIso);
  // Create formatter offset by timezone
  const tzDate = new Date(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    })
      .formatToParts(date)
      .reduce((acc: any, p) => { acc[p.type] = p.value; return acc; }, {} as Record<string, string>)
  );
  return new Date(Date.UTC(
    Number((tzDate as any).getUTCFullYear?.() ?? date.getUTCFullYear()),
    Number((tzDate as any).getUTCMonth?.() ?? date.getUTCMonth()),
    Number((tzDate as any).getUTCDate?.() ?? date.getUTCDate()),
    Number((tzDate as any).getUTCHours?.() ?? date.getUTCHours()),
    Number((tzDate as any).getUTCMinutes?.() ?? date.getUTCMinutes()),
    Number((tzDate as any).getUTCSeconds?.() ?? date.getUTCSeconds())
  )).toISOString();
}

export function fromUtcIsoToTz(utcIso: string, timeZone: string): string {
  const date = new Date(utcIso);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(date).reduce((acc: any, p) => { acc[p.type] = p.value; return acc; }, {} as Record<string, string>);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}