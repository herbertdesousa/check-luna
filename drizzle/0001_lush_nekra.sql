CREATE TABLE "tb_prize_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prizeId" uuid NOT NULL,
	"type" "checkin_type" NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_prizes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photoUrl" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tb_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"prizeId" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tb_prize_requirements" ADD CONSTRAINT "tb_prize_requirements_prizeId_tb_prizes_id_fk" FOREIGN KEY ("prizeId") REFERENCES "public"."tb_prizes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tb_purchases" ADD CONSTRAINT "tb_purchases_prizeId_tb_prizes_id_fk" FOREIGN KEY ("prizeId") REFERENCES "public"."tb_prizes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_user_prize_uq" ON "tb_purchases" USING btree ("userId","prizeId");