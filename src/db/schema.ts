import { integer, pgTable } from "drizzle-orm/pg-core";

export const counter = pgTable("counter", {
  id: integer().primaryKey(),
  value: integer().notNull().default(0),
});
