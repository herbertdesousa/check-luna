import { date, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { CHECKIN_STATUSES, CHECKIN_TYPES } from "../domain/checkin";

export const checkinType = pgEnum("checkin_type", CHECKIN_TYPES);
export const checkinStatus = pgEnum("checkin_status", CHECKIN_STATUSES);

export const checkins = pgTable(
  "tb_checkins",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text().notNull(),
    type: checkinType().notNull(),
    day: date({ mode: "string" }).notNull(),
    status: checkinStatus().notNull().default("review"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("checkins_user_day_type_uq").on(t.userId, t.day, t.type)],
);

export const checkinPictures = pgTable("tb_checkin_pictures", {
  id: uuid().primaryKey().defaultRandom(),
  checkinId: uuid()
    .notNull()
    .references(() => checkins.id, { onDelete: "cascade" }),
  photoUrl: text().notNull(),
});
