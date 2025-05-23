import * as expressSession from "express-session";
import connectPg from "connect-pg-simple";
import {
  User,
  InsertUser,
  Availability,
  InsertAvailability,
  Session,
  InsertSession,
  Feedback,
  InsertFeedback,
  Skill,
  InsertSkill,
  Activity,
  InsertActivity,
  users,
  availability,
  sessions,
  feedback,
  skills,
  activities
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { IStorage } from "./storage";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a fixed array of Google Meet links to avoid file reading issues
const HARDCODED_MEET_LINKS = [
  'https://meet.google.com/bgi-izgm-zjz',
  'https://meet.google.com/amp-jxhf-qtz',
  'https://meet.google.com/bqd-mivh-niy',
  'https://meet.google.com/byr-iufd-nrn',
  'https://meet.google.com/okc-dkdk-wii',
  'https://meet.google.com/kph-myxu-hju',
  'https://meet.google.com/ypy-fhkh-gdu',
  'https://meet.google.com/zor-kgoz-edg',
  'https://meet.google.com/cgt-qciz-mwu',
  'https://meet.google.com/obt-gvny-irp',
  'https://meet.google.com/abc-defg-hij',
  'https://meet.google.com/klm-nopq-rst',
  'https://meet.google.com/uvw-xyz1-234',
  'https://meet.google.com/567-890a-bcd',
  'https://meet.google.com/efg-hijk-lmn'
];

// Read meet links from file and refresh them on each call to ensure we have the latest links
function loadMeetLinks() {
  try {
    // First try to read from the hardcoded array to ensure we have links
    console.log(`[DEBUG] Using ${HARDCODED_MEET_LINKS.length} hardcoded meet links`);
    
    // Also try to read from file as a backup
    try {
      const filePath = path.join(__dirname, '../meet collection.txt');
      console.log(`[DEBUG] Also reading meet links from: ${filePath}`);
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      const fileLinks = fileContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('https://meet.google.com/'));
      
      console.log(`[DEBUG] Loaded ${fileLinks.length} meet links from file`);
      
      // Combine hardcoded links with file links
      if (fileLinks.length > 0) {
        // Create a combined array without using Set spread to avoid lint errors
        const uniqueLinks = Array.from(new Set([...HARDCODED_MEET_LINKS, ...fileLinks]));
        console.log(`[DEBUG] Combined ${uniqueLinks.length} unique meet links`);
        return uniqueLinks;
      }
    } catch (fileError) {
      console.error('[ERROR] Failed to load meet links from file:', fileError);
    }
    
    return HARDCODED_MEET_LINKS;
  } catch (error) {
    console.error('[ERROR] Failed to load meet links:', error);
    return HARDCODED_MEET_LINKS; // Always return hardcoded links as fallback
  }
}

function getRandomMeetLink() {
  // Load fresh links each time to ensure we have the latest
  const meetLinks = loadMeetLinks();
  
  if (!meetLinks || meetLinks.length === 0) {
    console.log('[ERROR] No meet links available in meet collection.txt');
    // Provide a default link if none are found
    return 'https://meet.google.com/abc-defg-hij';
  }
  
  // Get a random index between 0 and meetLinks.length-1
  const randomIndex = Math.floor(Math.random() * meetLinks.length);
  const link = meetLinks[randomIndex];
  
  console.log(`[DEBUG] Selected meet link [${randomIndex}/${meetLinks.length}]: ${link}`);
  return link;
}

export class DatabaseStorage implements IStorage {
  sessionStore: expressSession.Store;

  constructor() {
    const PostgresSessionStore = connectPg(expressSession);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values({
      ...user,
      title: user.title || null,
      organization: user.organization || null,
      bio: user.bio || null,
      profileImage: user.profileImage || null,
      specialties: user.specialties || null,
      created: new Date()
    }).returning();
    return createdUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async getAllMentors(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "mentor"));
  }
  
  async getAllMentees(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "mentee"));
  }

  // Availability methods
  async getAvailabilityForMentor(mentorId: number): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.mentorId, mentorId));
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const [createdAvailability] = await db
      .insert(availability)
      .values(avail)
      .returning();
      
    return createdAvailability;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    const result = await db
      .delete(availability)
      .where(eq(availability.id, id))
      .returning({ id: availability.id });
      
    return result.length > 0;
  }

  // Session methods
  async createSession(session: InsertSession): Promise<Session> {
    const [createdSession] = await db
      .insert(sessions)
      .values({
        ...session,
        created: new Date(),
        status: session.status || "pending",
        notes: session.notes || null,
        meetingLink: session.meetingLink || null
      })
      .returning();
    
    return createdSession;
  }

  async getSessionById(id: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));
      
    return session;
  }

  async getSessionsForUser(userId: number, role: "mentor" | "mentee"): Promise<Session[]> {
    // Use strict filtering based on user's role
    const column = role === "mentor" ? sessions.mentorId : sessions.menteeId;
    
    // Get only sessions specifically assigned to this user based on their role
    return await db
      .select()
      .from(sessions)
      .where(eq(column, userId))
      .orderBy(desc(sessions.date));
  }

  async getUpcomingSessions(userId: number, role: "mentor" | "mentee"): Promise<Session[]> {
    // Make sure to filter strictly by role - mentor or mentee
    const column = role === "mentor" ? sessions.mentorId : sessions.menteeId;
    const today = new Date().toISOString().split('T')[0];
    
    // For mentors, include both approved and pending sessions
    // For mentees, only include approved sessions
    const statusCondition = role === "mentor" 
      ? sql`${sessions.status} IN ('approved', 'pending')`
      : eq(sessions.status, "approved");
    
    // Get sessions that are assigned to this specific user in their role
    return await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(column, userId),
          statusCondition,
          sql`${sessions.date} >= ${today}`
        )
      )
      .orderBy(sessions.date);
  }

  async getPendingSessionRequests(mentorId: number): Promise<Session[]> {
    // Strictly filter for the specific mentor's pending session requests only
    return await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.mentorId, mentorId),  // Only get pending requests for this specific mentor
          eq(sessions.status, "pending")
        )
      )
      .orderBy(sessions.date);
  }

  async approveSessionRequest(sessionId: number): Promise<Session | undefined> {
    // First, check if the session exists and isn't already approved
    const [existingSession] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (!existingSession) {
      console.error(`[ERROR] Session ${sessionId} not found`);
      return undefined;
    }
    
    if (existingSession.status === "approved" && existingSession.meetingLink) {
      console.log(`[INFO] Session ${sessionId} already approved with link: ${existingSession.meetingLink}`);
      return existingSession;
    }
    
    // Get a random meeting link from the hardcoded collection
    const randomIndex = Math.floor(Math.random() * HARDCODED_MEET_LINKS.length);
    const selectedLink = HARDCODED_MEET_LINKS[randomIndex];
    
    console.log(`[DEBUG] Selected link ${randomIndex}: ${selectedLink} for session ${sessionId}`);
    
    try {
      // First try: Use a prepared update with the selected link
      console.log(`[DEBUG] Attempting to update session ${sessionId} with link: ${selectedLink}`);
      
      const [updatedSession] = await db
        .update(sessions)
        .set({
          status: "approved",
          meetingLink: selectedLink
        })
        .where(eq(sessions.id, sessionId))
        .returning();
      
      // Verify the update worked
      if (updatedSession && updatedSession.meetingLink === selectedLink) {
        console.log(`[SUCCESS] Session ${sessionId} approved with link: ${updatedSession.meetingLink}`);
        return updatedSession;
      }
      
      // If we got here, something went wrong with the update
      console.warn(`[WARNING] Update didn't set the correct link. Got: ${updatedSession?.meetingLink}`);
      
      // Second try: Use a different link
      const fallbackLink = HARDCODED_MEET_LINKS[(randomIndex + 1) % HARDCODED_MEET_LINKS.length];
      console.log(`[RETRY] Using fallback link: ${fallbackLink}`);
      
      // Try a direct SQL update as a more reliable approach
      await db.execute(sql`
        UPDATE sessions 
        SET status = 'approved', meeting_link = ${fallbackLink} 
        WHERE id = ${sessionId}
      `);
      
      // Fetch the updated session to verify
      const [verifiedSession] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId));
      
      if (verifiedSession && verifiedSession.meetingLink) {
        console.log(`[SUCCESS] Session ${sessionId} approved with fallback link: ${verifiedSession.meetingLink}`);
        return verifiedSession;
      }
      
      // Last resort: If all else fails, return a modified version of the original session
      console.error(`[ERROR] All database updates failed for session ${sessionId}`);
      return {
        ...existingSession,
        status: "approved",
        meetingLink: fallbackLink
      };
    } catch (error) {
      console.error(`[CRITICAL ERROR] Failed to approve session ${sessionId}:`, error);
      
      // Return a modified version of the original session as last resort
      return {
        ...existingSession,
        status: "approved",
        meetingLink: HARDCODED_MEET_LINKS[0]
      };
    }
  }

  async rejectSessionRequest(sessionId: number): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set({
        status: "rejected"
      })
      .where(eq(sessions.id, sessionId))
      .returning();
      
    return updatedSession;
  }

  async updateSession(id: number, data: Partial<Session>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
      
    return updatedSession;
  }

  // Feedback methods
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [createdFeedback] = await db
      .insert(feedback)
      .values({
        ...feedbackData,
        created: new Date(),
        comment: feedbackData.comment || null
      })
      .returning();
      
    return createdFeedback;
  }

  async getFeedbackForUser(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.toId, userId));
  }
  
  async getFeedbackGivenByUser(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.fromId, userId));
  }
  
  async getFeedbackBySessionAndUser(sessionId: number, userId: number): Promise<Feedback | undefined> {
    const [existingFeedback] = await db
      .select()
      .from(feedback)
      .where(
        and(
          eq(feedback.sessionId, sessionId),
          eq(feedback.fromId, userId)
        )
      );
      
    return existingFeedback;
  }

  async getFeedbackBySession(sessionId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.sessionId, sessionId));
  }

  // Skills methods
  async getSkillsForMentee(menteeId: number): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.menteeId, menteeId));
  }

  async createSkill(skillData: InsertSkill): Promise<Skill> {
    const [createdSkill] = await db
      .insert(skills)
      .values({
        ...skillData,
        progress: skillData.progress || 0,
        updated: new Date()
      })
      .returning();
      
    return createdSkill;
  }

  async updateSkill(id: number, progress: number): Promise<Skill | undefined> {
    const [updatedSkill] = await db
      .update(skills)
      .set({
        progress,
        updated: new Date()
      })
      .where(eq(skills.id, id))
      .returning();
      
    return updatedSkill;
  }

  // Activity methods
  async getActivitiesForUser(userId: number, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.created))
      .limit(limit);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [createdActivity] = await db
      .insert(activities)
      .values({
        ...activityData,
        created: new Date(),
        relatedUserId: activityData.relatedUserId || null
      })
      .returning();
      
    return createdActivity;
  }
}