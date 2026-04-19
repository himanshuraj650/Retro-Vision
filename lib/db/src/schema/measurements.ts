import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const measurementsTable = pgTable("measurements", {
  id: text("id").primaryKey(),
  sign_id: text("sign_id").notNull(),
  route_id: text("route_id").notNull(),
  value: real("value").notNull(),
  condition: text("condition").notNull().default("day_dry"),
  method: text("method").notNull().default("vehicle_mounted"),
  status: text("status").notNull().default("unknown"),
  irc_standard: text("irc_standard").notNull().default("IRC_67"),
  min_required: real("min_required").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  image_url: text("image_url"),
  notes: text("notes"),
  recorded_by: text("recorded_by"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertMeasurementSchema = createInsertSchema(measurementsTable).omit({ created_at: true });
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Measurement = typeof measurementsTable.$inferSelect;
