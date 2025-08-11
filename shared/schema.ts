import { z } from "zod";

// Task schema
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(["work", "personal"]),
  completed: z.boolean().default(false),
  date: z.string(),
  createdAt: z.string(),
});

export const insertTaskSchema = taskSchema.omit({ id: true, createdAt: true });

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Legacy Event schema (used by current UI in calendar page)
export const legacyEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string().optional(),
  date: z.string(),
  time: z.string().optional(),
  endTime: z.string().optional(),
  category: z.enum(["work", "personal", "health", "other"]).default("other"),
  allDay: z.boolean().default(false),
  createdAt: z.string(),
});

export const insertLegacyEventSchema = legacyEventSchema.omit({ id: true, createdAt: true });

export type LegacyEvent = z.infer<typeof legacyEventSchema>;
export type InsertLegacyEvent = z.infer<typeof insertLegacyEventSchema>;

// New Calendar Event schema aligned with calendar_refactoring.md
export const calendarEventSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  startTime: z.string(), // ISO string in UTC
  endTime: z.string(),   // ISO string in UTC, must be > startTime
  timezone: z.string().default(Intl.DateTimeFormat().resolvedOptions().timeZone),
  location: z.string().optional(),
  isAllDay: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const insertCalendarEventSchema = calendarEventSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .refine((val) => {
    const start = Date.parse(val.startTime);
    const end = Date.parse(val.endTime);
    return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
  }, { message: 'endTime must be greater than startTime' });

export const updateCalendarEventSchema = calendarEventSchema
  .partial()
  .pick({
    title: true,
    description: true,
    startTime: true,
    endTime: true,
    timezone: true,
    location: true,
    isAllDay: true,
  })
  .refine((val) => {
    if (!val.startTime || !val.endTime) return true;
    const start = Date.parse(val.startTime);
    const end = Date.parse(val.endTime);
    return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
  }, { message: 'endTime must be greater than startTime' });

export type CalendarEvent = z.infer<typeof calendarEventSchema>;
export type CalendarEventInput = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEventUpdate = z.infer<typeof updateCalendarEventSchema>;

// Wellbeing data schema
export const wellbeingDataSchema = z.object({
  id: z.string(),
  date: z.string(),
  waterIntake: z.number().default(0), // in liters
  sleepHours: z.number().default(0),
  mood: z.string().optional(),
  activity: z.string().optional(),
  createdAt: z.string(),
});

export const insertWellbeingDataSchema = wellbeingDataSchema.omit({ 
  id: true, 
  createdAt: true 
});

export type WellbeingData = z.infer<typeof wellbeingDataSchema>;
export type InsertWellbeingData = z.infer<typeof insertWellbeingDataSchema>;

// Chart data for wellbeing tracking
export const chartDataPointSchema = z.object({
  day: z.string(),
  value: z.number(),
});

export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
