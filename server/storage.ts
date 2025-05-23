import { 
  User, InsertUser, 
  Availability, InsertAvailability,
  Session, InsertSession,
  Feedback, InsertFeedback,
  Skill, InsertSkill,
  Activity, InsertActivity
} from "@shared/schema";
import createMemoryStore from "memorystore";
import * as expressSession from "express-session";

const MemoryStore = createMemoryStore(expressSession);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllMentors(): Promise<User[]>;
  getAllMentees(): Promise<User[]>;
  
  // Availability methods
  getAvailabilityForMentor(mentorId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  deleteAvailability(id: number): Promise<boolean>;
  
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSessionById(id: number): Promise<Session | undefined>;
  getSessionsForUser(userId: number, role: "mentor" | "mentee"): Promise<Session[]>;
  getUpcomingSessions(userId: number, role: "mentor" | "mentee"): Promise<Session[]>;
  getPendingSessionRequests(mentorId: number): Promise<Session[]>;
  approveSessionRequest(sessionId: number): Promise<Session | undefined>;
  rejectSessionRequest(sessionId: number): Promise<Session | undefined>;
  updateSession(id: number, data: Partial<Session>): Promise<Session | undefined>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackForUser(userId: number): Promise<Feedback[]>;
  getFeedbackGivenByUser(userId: number): Promise<Feedback[]>;
  getFeedbackBySessionAndUser(sessionId: number, userId: number): Promise<Feedback | undefined>;
  
  // Skills methods
  getSkillsForMentee(menteeId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, progress: number): Promise<Skill | undefined>;
  
  // Activity methods
  getActivitiesForUser(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Session store
  sessionStore: expressSession.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private availability: Map<number, Availability>;
  private sessions: Map<number, Session>;
  private feedback: Map<number, Feedback>;
  private skills: Map<number, Skill>;
  private activities: Map<number, Activity>;
  
  private userCurrentId: number;
  private availabilityCurrentId: number;
  private sessionCurrentId: number;
  private feedbackCurrentId: number;
  private skillCurrentId: number;
  private activityCurrentId: number;
  
  sessionStore: expressSession.Store;

  constructor() {
    this.users = new Map();
    this.availability = new Map();
    this.sessions = new Map();
    this.feedback = new Map();
    this.skills = new Map();
    this.activities = new Map();
    
    this.userCurrentId = 1;
    this.availabilityCurrentId = 1;
    this.sessionCurrentId = 1;
    this.feedbackCurrentId = 1;
    this.skillCurrentId = 1;
    this.activityCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 1 day
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllMentors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "mentor");
  }
  
  async getAllMentees(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "mentee");
  }

  // Availability methods
  async getAvailabilityForMentor(mentorId: number): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(
      avail => avail.mentorId === mentorId
    );
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.availabilityCurrentId++;
    const availability: Availability = { ...insertAvailability, id };
    this.availability.set(id, availability);
    return availability;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    return this.availability.delete(id);
  }

  // Session methods
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionCurrentId++;
    const session: Session = { ...insertSession, id };
    this.sessions.set(id, session);
    return session;
  }

  async getSessionById(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsForUser(userId: number, role: "mentor" | "mentee"): Promise<Session[]> {
    // Strictly filter sessions based on the user's role
    // Return only sessions specifically assigned to this user in their role
    return Array.from(this.sessions.values()).filter(
      session => role === "mentor" ? session.mentorId === userId : session.menteeId === userId
    );
  }

  async getUpcomingSessions(userId: number, role: "mentor" | "mentee"): Promise<Session[]> {
    const today = new Date();
    return Array.from(this.sessions.values())
      .filter(session => {
        // Strictly filter by the user's role - either mentor or mentee
        const isUserSession = role === "mentor" ? session.mentorId === userId : session.menteeId === userId;
        const sessionDate = new Date(`${session.date}T${session.time}`);
        // Only return approved sessions that are upcoming
        return isUserSession && sessionDate >= today && session.status === "approved";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }
  
  async getPendingSessionRequests(mentorId: number): Promise<Session[]> {
    const today = new Date();
    return Array.from(this.sessions.values())
      .filter(session => {
        // Strictly filter for the specific mentor's pending requests
        const sessionDate = new Date(`${session.date}T${session.time}`);
        return session.mentorId === mentorId && 
               sessionDate >= today && 
               session.status === "pending";
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }
  
  async approveSessionRequest(sessionId: number): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "pending") return undefined;
    
    // Use a simple static mocked meeting URL instead of generating one
    const meetingLink = "https://meet.google.com/mentormatch-session";
    
    const updatedSession = { 
      ...session, 
      status: "approved", 
      meetingLink 
    };
    
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }
  
  async rejectSessionRequest(sessionId: number): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== "pending") return undefined;
    
    const updatedSession = { 
      ...session, 
      status: "rejected"
    };
    
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async updateSession(id: number, data: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...data };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Feedback methods
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackCurrentId++;
    const feedback: Feedback = { ...insertFeedback, id };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async getFeedbackForUser(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(
      feedback => feedback.toId === userId
    );
  }
  
  async getFeedbackGivenByUser(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedback.values()).filter(
      feedback => feedback.fromId === userId
    );
  }
  
  async getFeedbackBySessionAndUser(sessionId: number, userId: number): Promise<Feedback | undefined> {
    return Array.from(this.feedback.values()).find(
      feedback => feedback.sessionId === sessionId && feedback.fromId === userId
    );
  }

  // Skills methods
  async getSkillsForMentee(menteeId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      skill => skill.menteeId === menteeId
    );
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.skillCurrentId++;
    const skill: Skill = { ...insertSkill, id, updated: new Date() };
    this.skills.set(id, skill);
    return skill;
  }

  async updateSkill(id: number, progress: number): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, progress, updated: new Date() };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  // Activity methods
  async getActivitiesForUser(userId: number, limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => {
        if (a.created instanceof Date && b.created instanceof Date) {
          return b.created.getTime() - a.created.getTime();
        }
        return 0;
      })
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityCurrentId++;
    const activity: Activity = { ...insertActivity, id, created: new Date() };
    this.activities.set(id, activity);
    return activity;
  }
}

// Import our DatabaseStorage implementation
import { DatabaseStorage } from './db-storage';

// Switch to PostgreSQL database storage
export const storage = new DatabaseStorage();
