import { pgTable, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const signsTable = pgTable("signs", {
  id: text("id").primaryKey(),
  route_id: text("route_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("traffic_sign"),
  location_description: text("location_description"),
  chainage: text("chainage"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default("unknown"),
  last_measured_at: timestamp("last_measured_at"),
  last_value: real("last_value"),
  installed_at: timestamp("installed_at"),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertSignSchema = createInsertSchema(signsTable).omit({ created_at: true });
export type InsertSign = z.infer<typeof insertSignSchema>;
export type Sign = typeof signsTable.$inferSelect;
