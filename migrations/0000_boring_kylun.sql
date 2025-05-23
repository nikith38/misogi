CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"related_user_id" integer,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentor_id" integer NOT NULL,
	"day" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"from_id" integer NOT NULL,
	"to_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentor_id" integer NOT NULL,
	"mentee_id" integer NOT NULL,
	"topic" text NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"notes" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"meeting_link" text,
	"created" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentee_id" integer NOT NULL,
	"name" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" text DEFAULT 'mentee' NOT NULL,
	"title" text,
	"organization" text,
	"bio" text,
	"profile_image" text,
	"specialties" json DEFAULT '[]'::json,
	"created" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
