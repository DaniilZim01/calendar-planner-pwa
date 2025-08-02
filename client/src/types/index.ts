export * from '@shared/schema';

export interface AppState {
  tasks: Task[];
  events: Event[];
  wellbeingData: WellbeingData[];
}

export interface TaskCounts {
  today: number;
  overdue: number;
  total: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

import type { Task, Event, WellbeingData } from '@shared/schema';
