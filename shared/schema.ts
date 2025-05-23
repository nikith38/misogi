import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("mentee"), // 'mentor' or 'mentee'
  title: text("title"),
  organization: text("organization"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  specialties: json("specialties").default([]),
  created: timestamp("created").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  title: true,
  organization: true,
  bio: true,
  profileImage: true,
  specialties: true,
});

// Availability table for mentors
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").notNull(),
  day: text("day").notNull(), // 'monday', 'tuesday', etc.
  startTime: text("start_time").notNull(), // '09:00', '14:30', etc.
  endTime: text("end_time").notNull(), // '10:00', '16:30', etc.
});

export const insertAvailabilitySchema = createInsertSchema(availability).pick({
  mentorId: true,
  day: true,
  startTime: true,
  endTime: true,
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  mentorId: integer("mentor_id").notNull(),
  menteeId: integer("mentee_id").notNull(),
  topic: text("topic").notNull(),
  date: text("date").notNull(), // '2023-09-15'
  time: text("time").notNull(), // '14:00'
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'completed', 'canceled', 'rejected'
  meetingLink: text("meeting_link"),
  created: timestamp("created").defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  mentorId: true,
  menteeId: true,
  topic: true,
  date: true,
  time: true,
  notes: true,
  status: true,
  meetingLink: true,
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  fromId: integer("from_id").notNull(),
  toId: integer("to_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created: timestamp("created").defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  sessionId: true,
  fromId: true,
  toId: true,
  rating: true,
  comment: true,
});

// Skills for mentees to track
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  menteeId: integer("mentee_id").notNull(),
  name: text("name").notNull(),
  progress: integer("progress").notNull().default(0), // 0-100
  updated: timestamp("updated").defaultNow(),
});

export const insertSkillSchema = createInsertSchema(skills).pick({
  menteeId: true,
  name: true,
  progress: true,
});

// Activity feed
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'feedback', 'session_confirmed', 'profile_viewed', etc.
  content: text("content").notNull(),
  relatedUserId: integer("related_user_id"),
  created: timestamp("created").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  userId: true,
  type: true,
  content: true,
  relatedUserId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
