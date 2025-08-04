import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  ),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name too long').optional(),
  phone: z.string().optional(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.number().min(1).max(3).default(1), // 1 = low, 2 = medium, 3 = high
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.number().min(1).max(3).optional(),
  completed: z.boolean().optional(),
});

export const taskQuerySchema = z.object({
  filter: z.enum(['all', 'today', 'week', 'completed', 'pending']).default('all'),
  priority: z.number().min(1).max(3).optional(),
  search: z.string().optional(),
});

// Event validation schemas
export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  location: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format').optional(),
  category: z.enum(['work', 'personal', 'health', 'other']).default('other'),
  allDay: z.boolean().default(false),
});

export const updateEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  location: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format').optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format').optional(),
  category: z.enum(['work', 'personal', 'health', 'other']).optional(),
  allDay: z.boolean().optional(),
});

// Wellbeing data validation schemas
export const createWellbeingDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  waterIntake: z.number().min(0).max(10).default(0), // in liters
  sleepHours: z.number().min(0).max(24).default(0),
  mood: z.string().optional(),
  activity: z.string().optional(),
});

export const updateWellbeingDataSchema = z.object({
  waterIntake: z.number().min(0).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  mood: z.string().optional(),
  activity: z.string().optional(),
});

// Period validation schemas
export const createPeriodSchema = z.object({
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  cycleLength: z.number().min(1).max(100).default(28),
});

export const updatePeriodSchema = z.object({
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  cycleLength: z.number().min(1).max(100).optional(),
});

// Common query schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateWellbeingDataInput = z.infer<typeof createWellbeingDataSchema>;
export type UpdateWellbeingDataInput = z.infer<typeof updateWellbeingDataSchema>;
export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodInput = z.infer<typeof updatePeriodSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>; 