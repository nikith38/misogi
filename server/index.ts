import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Seed function to create test users if none exist
async function seedTestUsers() {
  const { storage } = await import("./storage");
  const { hashPassword } = await import("./auth");
  const { eq } = await import("drizzle-orm");
  const { db } = await import("./db");
  const { users } = await import("@shared/schema");
  
  try {
    // Check if we have any users using the database
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log("No users found. Seeding test users...");
      
      // Check if mentee user already exists
      const existingMentee = await storage.getUserByUsername("mentee");
      if (!existingMentee) {
        // Create a test mentee user
        await storage.createUser({
          username: "mentee",
          password: await hashPassword("password"),
          email: "mentee@example.com",
          firstName: "Mentee",
          lastName: "User",
          role: "mentee",
          title: "Student",
          organization: "University",
          bio: "Looking to learn new skills",
          profileImage: null,
          specialties: null
        });
        console.log("Created mentee test user");
      }
      
      // Check if mentor user already exists
      const existingMentor = await storage.getUserByUsername("mentor");
      if (!existingMentor) {
        // Create a test mentor user
        await storage.createUser({
          username: "mentor",
          password: await hashPassword("password"),
          email: "mentor@example.com",
          firstName: "Mentor",
          lastName: "Expert",
          role: "mentor",
          title: "Senior Developer",
          organization: "Tech Company",
          bio: "Experienced developer ready to help",
          profileImage: null,
          specialties: ["JavaScript", "React", "Node.js"]
        });
        console.log("Created mentor test user");
      }
      
      console.log("Test users created or already exist");
    } else {
      console.log(`Database already has ${existingUsers.length} users, skipping seeding`);
    }
  } catch (error) {
    console.error("Error seeding test users:", error);
  }
}

(async () => {
  // Seed test users before registering routes
  await seedTestUsers();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use the PORT environment variable provided by Render or default to 5001
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5001;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
