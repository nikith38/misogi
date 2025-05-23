# MentorMatchPro

## Scenario
Junior developers often need one-on-one advice, but scheduling ad-hoc mentoring sessions with peers or seniors is chaotic. MentorMatchPro solves this by providing a structured platform for mentorship, scheduling, and feedback.

## 🎯 Objective
Build a platform where users sign up as Mentors or Mentees, request and schedule video chat sessions, and leave post-session feedback.

---

## 👥 User Roles
- **Mentees:**
  - Browse mentors
  - Request sessions
  - View their own sessions and feedback
  - Rate mentors after sessions
- **Mentors:**
  - Approve/decline session requests
  - Set availability
  - Manage and schedule sessions
  - View and collect feedback
  - Rate mentees after sessions

---

## 🔐 Authentication & Authorization
- **Email/password login** with secure session management
- **Role-based access:**
  - Mentees can only request sessions
  - Mentors can only manage their own requests
- **Data privacy:**
  - Users can only view their own sessions and feedback

---

## 🧱 Core Functional Modules

### Profile & Availability
- Users select their role (Mentor or Mentee) during registration
- Mentors can set and update weekly availability slots
- Profile includes bio, specialties, and profile image

### Session Requests
- Mentees browse mentors and select a time slot from available mentor slots
- Mentees submit a session request with an optional note/topic
- Mentors receive incoming requests and can approve or decline them

### Scheduling & Calendar
- Approved sessions appear on both mentor and mentee dashboards/calendars
- **Timezone-aware display:** All session times are shown in the user's local timezone
- **Video Link Integration:**
  - On approval, a unique (mocked) Google Meet link is assigned to the session
  - Links are randomly selected from a curated list for simulation
- **Session Card Actions:**
  - "Join Session" button opens the Google Meet link in a new tab
  - "End Session" and "Cancel" options for session management

### Post-Session Feedback
- After a session, mentees rate mentors (1–5 stars) and leave comments
- Mentors can also rate mentees and leave feedback
- Feedback is stored and displayed on mentor/mentee profiles

### Analytics & Match Insights
- **Mentor Dashboard:**
  - Shows average rating and total number of sessions
  - Displays feedback and review count
- **Mentee Dashboard:**
  - Shows list of mentors they've had sessions with, including ratings
- **Dashboard Graph:**
  - Visualizes sessions per week for user engagement tracking

---

## 🛠️ Technical Implementation

### Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Neon), Drizzle ORM
- **Authentication:** Express-session, secure cookies
- **State Management:** React Query
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Date Handling:** date-fns

### Key Architectural Points
- **Monorepo structure:** Separate `client`, `frontend`, and `server` directories
- **API-first design:** RESTful endpoints for all core actions (sessions, feedback, users)
- **Role-based access control:** Enforced at both API and UI levels
- **Session management:** Secure, persistent sessions using PostgreSQL-backed store
- **Availability & booking:** Mentor availability is stored and queried for real-time slot selection
- **Feedback system:** Feedback is linked to sessions and users, with average ratings calculated dynamically
- **Google Meet integration:**
  - On session approval, a random link from `meet collection.txt` is assigned
  - "Join Session" button uses this link for redirection
- **Timezone support:** All times are stored in UTC and displayed in the user's local timezone
- **Analytics:** Dashboard graphs and stats are generated from session and feedback data

---

## 🚀 Setup & Usage

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd MentorMatchPro
   ```
2. **Install dependencies:**
   ```sh
   npm install
   cd frontend && npm install
   cd ../client && npm install
   cd ../server && npm install
   ```
3. **Configure environment variables:**
   - Create a `.env` file in the root and backend with your database URL and session secret
4. **Database setup:**
   - Run Drizzle ORM migrations to set up the schema
5. **Start the servers:**
   - Backend: `npm run dev` (in `/server`)
   - Frontend: `npm run dev` (in `/frontend` or `/client`)
6. **Access the app:**
   - Open [http://localhost:5000](http://localhost:5000) in your browser

---

## 📁 File Structure (Key Parts)
- `/frontend` - React frontend (UI, components, pages)
- `/client` - Additional client-side logic/components
- `/server` - Express backend, API, business logic
- `/MentorMatchPro/meet collection.txt` - List of Google Meet links for simulation

---

## 📝 Feature Walkthrough

### 1. Registration & Login
- Users register with email, password, and select their role
- Secure login with session management

### 2. Mentor Profile & Availability
- Mentors set up their profile and weekly availability
- Mentees can view mentor profiles and available slots

### 3. Booking & Session Requests
- Mentees select a mentor and book a session from available slots
- Mentors receive requests and can approve/decline
- Approved sessions are visible to both parties

### 4. Video Meeting Integration
- On approval, a random Google Meet link is assigned to the session
- "Join Session" button opens the link in a new tab

### 5. Feedback & Ratings
- After a session, both parties can leave feedback and ratings
- Ratings are averaged and displayed on profiles

### 6. Analytics & Dashboard
- Mentors see their average rating, review count, and session stats
- Mentees see their session history and mentor ratings
- Sessions per week graph visualizes engagement

---

## 🧩 Extensibility & Future Improvements
- Email notifications for session reminders
- Mobile-responsive UI improvements
- Advanced analytics and reporting

