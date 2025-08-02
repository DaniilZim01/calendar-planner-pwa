import { Task, Event, WellbeingData } from '../types';
import { getCurrentDateString } from '../utils/dateUtils';

export const demoTasks: Task[] = [
  {
    id: '1',
    title: 'Завершить презентацию',
    category: 'work',
    completed: false,
    date: getCurrentDateString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Отправить отчет клиенту',
    category: 'work',
    completed: false,
    date: '2025-01-01',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Прочитать книгу',
    category: 'personal',
    completed: false,
    date: getCurrentDateString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Записаться к врачу',
    category: 'personal',
    completed: true,
    date: getCurrentDateString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Планирование недели',
    category: 'work',
    completed: true,
    date: getCurrentDateString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Купить продукты',
    category: 'personal',
    completed: false,
    date: getCurrentDateString(),
    createdAt: new Date().toISOString(),
  },
];

export const demoEvents: Event[] = [
  {
    id: '1',
    title: 'Завтрак с Матвеем',
    location: 'Paddock Bakery',
    date: getCurrentDateString(),
    time: '08:00',
    category: 'personal',
    allDay: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Тренировка',
    location: 'F45 Burleigh',
    date: getCurrentDateString(),
    time: '10:00',
    category: 'health',
    allDay: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Обед с Эммой',
    location: 'Дом',
    date: getCurrentDateString(),
    time: '13:30',
    category: 'personal',
    allDay: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Командная встреча',
    location: 'Zoom Link',
    date: getCurrentDateString(),
    time: '16:30',
    endTime: '17:30',
    category: 'work',
    allDay: false,
    createdAt: new Date().toISOString(),
  },
];

export const demoWellbeingData: WellbeingData[] = [
  {
    id: '1',
    date: getCurrentDateString(),
    waterIntake: 2.3,
    sleepHours: 7.5,
    mood: 'Хорошо',
    activity: 'Тренировка',
    createdAt: new Date().toISOString(),
  },
];