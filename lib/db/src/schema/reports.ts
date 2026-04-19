import { pgTable, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  route_id: text("route_id"),
  route_name: text("route_name"),
  type: text("type").notNull().default("inspection"),
  status: text("status").notNull().default("ready"),
  period_start: timestamp("period_start"),
  period_end: timestamp("period_end"),
  total_signs: integer("total_signs"),
  compliance_rate: real("compliance_rate"),
  critical_findings: integer("critical_findings").default(0),
  generated_by: text("generated_by"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ created_at: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
