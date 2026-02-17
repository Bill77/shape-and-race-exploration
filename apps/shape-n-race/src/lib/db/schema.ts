import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const cars = sqliteTable('cars', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  imageUrls: text('imageUrls').notNull(), // JSON array of 3 image URLs - stored as JSON string
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const voteCriteria = sqliteTable('vote_criteria', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  order: integer('order').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const votes = sqliteTable('votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  carId: integer('carId')
    .notNull()
    .references(() => cars.id, { onDelete: 'cascade' }),
  criterionId: integer('criterionId')
    .notNull()
    .references(() => voteCriteria.id, { onDelete: 'cascade' }),
  sessionId: text('sessionId'), // Optional session identifier
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const heats = sqliteTable('heats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  label: text('label'), // Optional label
  order: integer('order').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const heatResults = sqliteTable('heat_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  heatId: integer('heatId')
    .notNull()
    .references(() => heats.id, { onDelete: 'cascade' }),
  place: integer('place').notNull(), // 1-4 for 4-lane race
  carId: integer('carId')
    .notNull()
    .references(() => cars.id, { onDelete: 'cascade' }),
  lane: integer('lane'), // Optional lane number (1-4)
  timeMs: integer('timeMs'), // Optional time in milliseconds
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Type exports for use in API routes
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type VoteCriterion = typeof voteCriteria.$inferSelect;
export type NewVoteCriterion = typeof voteCriteria.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
export type Heat = typeof heats.$inferSelect;
export type NewHeat = typeof heats.$inferInsert;
export type HeatResult = typeof heatResults.$inferSelect;
export type NewHeatResult = typeof heatResults.$inferInsert;
