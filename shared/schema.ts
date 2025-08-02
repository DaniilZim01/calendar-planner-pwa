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

// Event schema
export const eventSchema = z.object({
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

export const insertEventSchema = eventSchema.omit({ id: true, createdAt: true });

export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;

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
