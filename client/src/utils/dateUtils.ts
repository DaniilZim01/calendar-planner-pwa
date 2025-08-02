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
