CREATE TYPE "public"."checkin_status" AS ENUM('review', 'approved', 'denied');--> statement-breakpoint
CREATE TYPE "public"."checkin_type" AS ENUM('water', 'food', 'gym', 'cardio', 'super');--> statement-breakpoint
CREATE TABLE "tb_checkin_pictures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkinId" uuid NOT NULL,
	"photoUrl" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"type" "checkin_type" NOT NULL,
	"day" date NOT NULL,
	"status" "checkin_status" DEFAULT 'review' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tb_checkin_pictures" ADD CONSTRAINT "tb_checkin_pictures_checkinId_tb_checkins_id_fk" FOREIGN KEY ("checkinId") REFERENCES "public"."tb_checkins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "checkins_user_day_type_uq" ON "tb_checkins" USING btree ("userId","day","type");