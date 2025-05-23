import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertAvailabilitySchema, insertSessionSchema, insertFeedbackSchema, insertSkillSchema, insertActivitySchema } from "@shared/schema";
import { ZodError } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is a mentor
const isMentor = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && req.user?.role === "mentor") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Only mentors can access this resource" });
};

// Middleware to check if user is a mentee
const isMentee = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated() && req.user?.role === "mentee") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Only mentees can access this resource" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Debug endpoints - remove in production
  app.get("/api/debug/users", async (req, res) => {
    try {
      const users = Array.from((storage as any).users?.values() || []).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }));
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error: String(error) });
    }
  });

  // Error handler for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  };

  // Profile routes
  app.get("/api/profile/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Don't allow updating role or password through this endpoint
      const { role, password, ...updateData } = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password to client
      const { password: pwd, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Route to fetch multiple user profiles at once
  app.get("/api/users/profiles", isAuthenticated, async (req, res) => {
    try {
      // Get all mentors and mentees
      const allMentors = await storage.getAllMentors();
      const allMentees = await storage.getAllMentees();
      
      // Build a record object with user ID as key
      const userProfiles: Record<number, any> = {};
      
      // Add mentors to the profiles map
      allMentors.forEach(user => {
        // Don't include password
        const { password, ...safeUser } = user;
        userProfiles[user.id] = safeUser;
      });
      
      // Add mentees to the profiles map
      allMentees.forEach(user => {
        if (!userProfiles[user.id]) {
          const { password, ...safeUser } = user;
          userProfiles[user.id] = safeUser;
        }
      });
      
      res.json(userProfiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user profiles" });
    }
  });

  // Mentor routes
  app.get("/api/mentors", isAuthenticated, async (req, res) => {
    try {
      const mentors = await storage.getAllMentors();
      // Remove passwords from response
      const mentorsWithoutPasswords = mentors.map(({ password, ...mentor }) => mentor);
      res.json(mentorsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mentors" });
    }
  });

  // Availability routes
  app.get("/api/mentors/:id/availability", isAuthenticated, async (req, res) => {
    try {
      const mentorId = parseInt(req.params.id);
      const availability = await storage.getAvailabilityForMentor(mentorId);
      res.json(availability);
    } catch (error) {
      res.status(500).json({ message: "Failed to get availability" });
    }
  });

  app.post("/api/availability", isMentor, async (req, res) => {
    try {
      const data = { ...req.body, mentorId: req.user?.id };
      const validatedData = insertAvailabilitySchema.parse(data);
      const availability = await storage.createAvailability(validatedData);
      res.status(201).json(availability);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.delete("/api/availability/:id", isMentor, async (req, res) => {
    try {
      const result = await storage.deleteAvailability(parseInt(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Session routes
  app.get("/api/session-requests", isMentor, async (req, res) => {
    try {
      const mentorId = req.user!.id;
      const pendingRequests = await storage.getPendingSessionRequests(mentorId);
      res.json(pendingRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session requests" });
    }
  });
  
  app.post("/api/sessions/:id/approve", isMentor, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.mentorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only approve your own session requests" });
      }
      
      const updatedSession = await storage.approveSessionRequest(sessionId);
      
      if (!updatedSession) {
        return res.status(400).json({ message: "Unable to approve session request" });
      }
      
      // Get mentee details
      const mentee = await storage.getUser(session.menteeId);
      
      // Create activities for both mentor and mentee
      await storage.createActivity({
        userId: req.user!.id,
        type: "session_approved",
        content: `You approved a session with ${mentee?.firstName} ${mentee?.lastName}`,
        relatedUserId: session.menteeId
      });
      
      await storage.createActivity({
        userId: session.menteeId,
        type: "session_confirmed",
        content: `${req.user!.firstName} ${req.user!.lastName} approved your session request`,
        relatedUserId: req.user!.id
      });
      
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve session request" });
    }
  });
  
  app.post("/api/sessions/:id/reject", isMentor, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.mentorId !== req.user!.id) {
        return res.status(403).json({ message: "You can only reject your own session requests" });
      }
      
      const updatedSession = await storage.rejectSessionRequest(sessionId);
      
      if (!updatedSession) {
        return res.status(400).json({ message: "Unable to reject session request" });
      }
      
      // Get mentee details
      const mentee = await storage.getUser(session.menteeId);
      
      // Create activities for both mentor and mentee
      await storage.createActivity({
        userId: req.user!.id,
        type: "session_rejected",
        content: `You declined a session with ${mentee?.firstName} ${mentee?.lastName}`,
        relatedUserId: session.menteeId
      });
      
      await storage.createActivity({
        userId: session.menteeId,
        type: "session_declined",
        content: `${req.user!.firstName} ${req.user!.lastName} declined your session request`,
        relatedUserId: req.user!.id
      });
      
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject session request" });
    }
  });
  
  app.post("/api/sessions", isMentee, async (req, res) => {
    try {
      const data = { ...req.body, menteeId: req.user?.id, status: "pending" };
      const validatedData = insertSessionSchema.parse(data);
      const session = await storage.createSession(validatedData);
      
      // Get mentor details
      const mentor = await storage.getUser(validatedData.mentorId);
      
      // Create activity for both mentee and mentor
      await storage.createActivity({
        userId: req.user!.id,
        type: "session_created",
        content: `You requested a session with ${mentor?.firstName} ${mentor?.lastName}`,
        relatedUserId: validatedData.mentorId
      });
      
      await storage.createActivity({
        userId: validatedData.mentorId,
        type: "session_requested",
        content: `${req.user!.firstName} ${req.user!.lastName} requested a session with you`,
        relatedUserId: req.user!.id
      });
      
      res.status(201).json(session);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role as "mentor" | "mentee";
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const sessions = await storage.getSessionsForUser(userId, role);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sessions" });
    }
  });

  app.get("/api/sessions/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role as "mentor" | "mentee";
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const sessions = await storage.getUpcomingSessions(userId, role);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get upcoming sessions" });
    }
  });

  app.put("/api/sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSessionById(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if the user is part of this session
      const userId = req.user?.id;
      const userRole = req.user?.role;
      
      if (session.mentorId !== userId && session.menteeId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this session" });
      }
      
      let updatedSession;
      
      // Special handling for approving a session - use approveSessionRequest to assign meeting link
      if (req.body.status === "approved" && session.status !== "approved") {
        console.log(`[DEBUG] Approving session ${sessionId} and assigning meeting link`);
        if (userRole !== "mentor" || session.mentorId !== userId) {
          return res.status(403).json({ 
            message: "Only the assigned mentor can approve this session" 
          });
        }
        
        // Use the approveSessionRequest method which assigns a meeting link
        updatedSession = await storage.approveSessionRequest(sessionId);
        
        // Get mentee details to create activity
        const mentee = await storage.getUser(session.menteeId);
        
        // Create activity for both mentor and mentee
        await storage.createActivity({
          userId: userId,
          type: "session_approved",
          content: `You approved a session with ${mentee?.firstName} ${mentee?.lastName}`,
          relatedUserId: session.menteeId
        });
        
        await storage.createActivity({
          userId: session.menteeId,
          type: "session_approved",
          content: `${req.user?.firstName} ${req.user?.lastName} approved your session request`,
          relatedUserId: userId
        });
      }
      // Special handling for completing a session - only a mentor can mark as completed
      else if (req.body.status === "completed") {
        if (userRole !== "mentor" || session.mentorId !== userId) {
          console.log(`Permission denied: User ${userId} (${userRole}) tried to complete session ${sessionId} created by mentor ${session.mentorId}`);
          return res.status(403).json({ 
            message: "Only the mentor who created this session can mark it as completed" 
          });
        }
        
        // Get mentee details to create activity
        const mentee = await storage.getUser(session.menteeId);
        
        // Create activity for both mentor and mentee
        await storage.createActivity({
          userId: userId,
          type: "session_completed",
          content: `You marked your session with ${mentee?.firstName} ${mentee?.lastName} as completed`,
          relatedUserId: session.menteeId
        });
        
        await storage.createActivity({
          userId: session.menteeId,
          type: "session_completed",
          content: `${req.user?.firstName} ${req.user?.lastName} marked your session as completed. Please leave feedback!`,
          relatedUserId: userId
        });
        
        updatedSession = await storage.updateSession(sessionId, req.body);
      }
      // Handle all other status updates
      else {
        updatedSession = await storage.updateSession(sessionId, req.body);
      }
      
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const { sessionId, toId, rating, comment } = req.body;
      
      // Get the session to verify it's completed
      const session = await storage.getSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if session is completed
      if (session.status !== "completed") {
        return res.status(400).json({ 
          message: "Feedback can only be provided for completed sessions" 
        });
      }
      
      // Check if user is part of the session
      const isUserInSession = session.mentorId === userId || session.menteeId === userId;
      if (!isUserInSession) {
        return res.status(403).json({ 
          message: "You can only provide feedback for sessions you participated in" 
        });
      }
      
      // Validate that toId is the other participant
      const expectedToId = userId === session.mentorId ? session.menteeId : session.mentorId;
      if (toId !== expectedToId) {
        return res.status(400).json({ 
          message: "Invalid recipient for feedback" 
        });
      }
      
      // Check if user already left feedback for this session
      const existingFeedback = await storage.getFeedbackBySessionAndUser(sessionId, userId);
      if (existingFeedback) {
        return res.status(400).json({ 
          message: "You have already provided feedback for this session" 
        });
      }
      
      // Create and save the feedback
      const feedbackData = {
        sessionId,
        fromId: userId,
        toId,
        rating,
        comment: comment || null
      };
      
      const validatedData = insertFeedbackSchema.parse(feedbackData);
      const feedback = await storage.createFeedback(validatedData);
      
      // Get participant name
      const recipient = await storage.getUser(toId);
      const recipientName = recipient ? `${recipient.firstName} ${recipient.lastName}` : "participant";
      
      // Create activity
      await storage.createActivity({
        userId,
        type: "feedback_given",
        content: `You left feedback for your session with ${recipientName}`,
        relatedUserId: toId
      });
      
      // Create activity for the recipient
      await storage.createActivity({
        userId: toId,
        type: "feedback_received",
        content: `${req.user?.firstName} ${req.user?.lastName} left feedback for your session`,
        relatedUserId: userId
      });
      
      res.status(201).json(feedback);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.get("/api/feedback", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Get basic feedback data
      const feedbackItems = await storage.getFeedbackForUser(userId);
      
      // Enhance feedback with session details and user profiles
      const enhancedFeedback = [];
      
      for (const feedback of feedbackItems) {
        // Get session details
        const session = await storage.getSessionById(feedback.sessionId);
        
        // Get user profile of the feedback giver
        const giver = await storage.getUser(feedback.fromId);
        
        // Add enhanced data
        enhancedFeedback.push({
          ...feedback,
          session: session ? {
            id: session.id,
            topic: session.topic,
            date: session.date,
            time: session.time,
            status: session.status
          } : null,
          giver: giver ? {
            id: giver.id,
            firstName: giver.firstName,
            lastName: giver.lastName,
            profileImage: giver.profileImage,
            role: giver.role
          } : null
        });
      }
      
      res.json(enhancedFeedback);
    } catch (error) {
      console.error("Error fetching enhanced feedback:", error);
      res.status(500).json({ message: "Failed to get feedback" });
    }
  });
  
  // Route to get feedback given by the authenticated user
  app.get("/api/feedback/given", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const feedback = await storage.getFeedbackGivenByUser(userId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to get feedback" });
    }
  });
  
  // Route to check if user has already provided feedback for a session
  app.get("/api/feedback/session/:sessionId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      const feedback = await storage.getFeedbackBySessionAndUser(sessionId, userId);
      res.json({ 
        hasFeedback: !!feedback,
        feedback 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check feedback status" });
    }
  });
  
  // Route to get all feedback for a specific session
  app.get("/api/feedback/session/:sessionId/all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ message: "Invalid session ID" });
      }
      
      // Get the session to verify user is part of it
      const session = await storage.getSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Verify user is part of the session
      if (session.mentorId !== userId && session.menteeId !== userId) {
        return res.status(403).json({ message: "You can only view feedback for sessions you participated in" });
      }
      
      // Get all feedback for this session
      const allFeedback = await storage.getFeedbackBySession(sessionId);
      
      // Get user profiles for the feedback givers
      const userIds = Array.from(new Set(allFeedback.map((f: { fromId: number }) => f.fromId)));
      const userProfiles: Record<number, any> = {};
      
      for (const id of userIds) {
        const user = await storage.getUser(id);
        if (user) {
          userProfiles[id] = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImage: user.profileImage,
            role: user.role
          };
        }
      }
      
      res.json({
        feedback: allFeedback,
        userProfiles
      });
    } catch (error) {
      console.error("Error getting session feedback:", error);
      res.status(500).json({ message: "Failed to get session feedback" });
    }
  });

  // Skills routes
  app.get("/api/skills", isMentee, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const skills = await storage.getSkillsForMentee(userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to get skills" });
    }
  });

  app.post("/api/skills", isMentee, async (req, res) => {
    try {
      const data = { ...req.body, menteeId: req.user?.id };
      const validatedData = insertSkillSchema.parse(data);
      const skill = await storage.createSkill(validatedData);
      res.status(201).json(skill);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put("/api/skills/:id", isMentee, async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      const updatedSkill = await storage.updateSkill(skillId, progress);
      if (!updatedSkill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(updatedSkill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  // Activity routes
  app.get("/api/activities", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivitiesForUser(userId, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  // Mentor feedback endpoint
  app.get("/api/mentors/:id/feedback", isAuthenticated, async (req, res) => {
    try {
      const mentorId = parseInt(req.params.id);
      const feedback = await storage.getFeedbackForUser(mentorId);
      console.log("[DEBUG] Mentor feedback endpoint:", { mentorId, feedback });
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mentor feedback" });
    }
  });

  // Create a server
  const httpServer = createServer(app);

  return httpServer;
}
