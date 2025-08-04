import { pgTable, uuid, varchar, text, timestamp, boolean, integer, date, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  phoneIdx: index('phone_idx').on(table.phone),
}));

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  completed: boolean('completed').default(false),
  priority: integer('priority').default(1), // 1 = low, 2 = medium, 3 = high
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  dueDateIdx: index('due_date_idx').on(table.dueDate),
  completedIdx: index('completed_idx').on(table.completed),
}));

// User tasks junction table (many-to-many relationship)
export const userTasks = pgTable('user_tasks', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: index('user_tasks_pk').on(table.userId, table.taskId),
}));

// Periods table for future functionality
export const periods = pgTable('periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dateStart: date('date_start').notNull(),
  dateEnd: date('date_end').notNull(),
  cycleLength: integer('cycle_length').default(28),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('periods_user_id_idx').on(table.userId),
  dateRangeIdx: index('date_range_idx').on(table.dateStart, table.dateEnd),
}));

// Events table (extended from existing schema)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  date: date('date').notNull(),
  time: varchar('time', { length: 10 }), // HH:MM format
  endTime: varchar('end_time', { length: 10 }), // HH:MM format
  category: varchar('category', { length: 50 }).default('other'),
  allDay: boolean('all_day').default(false),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('events_user_id_idx').on(table.userId),
  dateIdx: index('events_date_idx').on(table.date),
}));

// Wellbeing data table
export const wellbeingData = pgTable('wellbeing_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  waterIntake: integer('water_intake').default(0), // in milliliters
  sleepHours: integer('sleep_hours').default(0),
  mood: varchar('mood', { length: 50 }),
  activity: varchar('activity', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('wellbeing_user_id_idx').on(table.userId),
  dateIdx: index('wellbeing_date_idx').on(table.date),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  events: many(events),
  wellbeingData: many(wellbeingData),
  periods: many(periods),
  userTasks: many(userTasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  userTasks: many(userTasks),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
}));

export const wellbeingDataRelations = relations(wellbeingData, ({ one }) => ({
  user: one(users, {
    fields: [wellbeingData.userId],
    references: [users.id],
  }),
}));

export const periodsRelations = relations(periods, ({ one }) => ({
  user: one(users, {
    fields: [periods.userId],
    references: [users.id],
  }),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type WellbeingData = typeof wellbeingData.$inferSelect;
export type NewWellbeingData = typeof wellbeingData.$inferInsert;
export type Period = typeof periods.$inferSelect;
export type NewPeriod = typeof periods.$inferInsert;

// Zod schemas for validation
export const userSchema = createSelectSchema(users);
export const newUserSchema = createInsertSchema(users);
export const taskSchema = createSelectSchema(tasks);
export const newTaskSchema = createInsertSchema(tasks);
export const eventSchema = createSelectSchema(events);
export const newEventSchema = createInsertSchema(events);
export const wellbeingDataSchema = createSelectSchema(wellbeingData);
export const newWellbeingDataSchema = createInsertSchema(wellbeingData);
export const periodSchema = createSelectSchema(periods);
export const newPeriodSchema = createInsertSchema(periods); 