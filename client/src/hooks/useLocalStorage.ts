import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

import { demoTasks, demoEvents, demoWellbeingData } from '../data/demoData';

export function useAppData() {
  const [tasks, setTasks] = useLocalStorage('incharge_tasks', demoTasks);
  const [events, setEvents] = useLocalStorage('incharge_events', demoEvents);
  const [wellbeingData, setWellbeingData] = useLocalStorage('incharge_wellbeing', demoWellbeingData);

  return {
    tasks,
    setTasks,
    events,
    setEvents,
    wellbeingData,
    setWellbeingData,
  };
}
