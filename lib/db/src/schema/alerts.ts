import { pgTable, text, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const alertsTable = pgTable("alerts", {
  id: text("id").primaryKey(),
  sign_id: text("sign_id").notNull(),
  route_id: text("route_id").notNull(),
  sign_name: text("sign_name").notNull(),
  route_name: text("route_name").notNull(),
  severity: text("severity").notNull().default("warning"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  current_value: real("current_value"),
  required_value: real("required_value"),
  resolved: boolean("resolved").default(false).notNull(),
  resolved_at: timestamp("resolved_at"),
  resolved_by: text("resolved_by"),
  resolution_note: text("resolution_note"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlertSchema = createInsertSchema(alertsTable).omit({ created_at: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type AlertRecord = typeof alertsTable.$inferSelect;
