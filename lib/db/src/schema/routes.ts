import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const routesTable = pgTable("routes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  highway_number: text("highway_number").notNull(),
  start_chainage: text("start_chainage"),
  end_chainage: text("end_chainage"),
  length_km: real("length_km"),
  lane_count: integer("lane_count").default(4),
  type: text("type").notNull().default("four_lane"),
  status: text("status").notNull().default("active"),
  last_inspected_at: timestamp("last_inspected_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertRouteSchema = createInsertSchema(routesTable).omit({ created_at: true });
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routesTable.$inferSelect;
