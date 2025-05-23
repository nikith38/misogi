import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Link } from "wouter";
import { CalendarDays, Clock, TrendingUp, BookOpen, Award, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { GlowingStatCard } from "./glowing-stat-card";
import { apiRequest } from "@/lib/queryClient";
import { differenceInDays, parseISO } from "date-fns";

export default function MenteeStatsCard() {
  const { user } = useAuth();

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/mentee", user?.id],
    queryFn: async () => {
      try {
        // In a real app, this would filter by menteeId on the server
        const res = await apiRequest("GET", "/api/sessions");
        const allSessions = await res.json();
        
        // Filter sessions for this mentee
        return allSessions.filter((session: Session) => session.menteeId === user?.id);
      } catch (error) {
        console.error("Error fetching mentee sessions:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Calculate learning streak
  const calculateLearningStreak = () => {
    if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return 0;
    
    // Sort sessions by date (newest first)
    const sortedSessions = [...sessions]
      .filter(s => s.status === 'completed')
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    
    if (sortedSessions.length === 0) return 0;
    
    // Check if the most recent session was within the last 14 days
    const mostRecentSession = sortedSessions[0];
    const mostRecentDate = parseISO(mostRecentSession.date);
    const daysSinceLastSession = differenceInDays(new Date(), mostRecentDate);
    
    if (daysSinceLastSession > 14) {
      // Streak broken if no session in the last 14 days
      return 0;
    }
    
    // Count consecutive sessions with less than 14 days between them
    let streak = 1;
    for (let i = 0; i < sortedSessions.length - 1; i++) {
      const currentSessionDate = parseISO(sortedSessions[i].date);
      const nextSessionDate = parseISO(sortedSessions[i + 1].date);
      
      const daysBetween = differenceInDays(currentSessionDate, nextSessionDate);
      
      if (daysBetween <= 14) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Calculate growth metrics
  const calculateGrowthMetrics = () => {
    if (!sessions || !Array.isArray(sessions)) return { sessionsThisMonth: 0, growthPercentage: 0 };
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    // Count sessions for this month and last month
    const sessionsThisMonth = sessions.filter(session => {
      const sessionDate = parseISO(session.date);
      return sessionDate.getMonth() === thisMonth && sessionDate.getFullYear() === thisYear;
    }).length;
    
    const sessionsLastMonth = sessions.filter(session => {
      const sessionDate = parseISO(session.date);
      return sessionDate.getMonth() === lastMonth && sessionDate.getFullYear() === lastMonthYear;
    }).length;
    
    // Calculate growth percentage
    let growthPercentage = 0;
    if (sessionsLastMonth > 0) {
      growthPercentage = Math.round(((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100);
    } else if (sessionsThisMonth > 0) {
      growthPercentage = 100; // If no sessions last month but some this month, 100% growth
    }
    
    return { sessionsThisMonth, growthPercentage };
  };

  // Calculate total learning hours
  const calculateTotalHours = () => {
    if (!sessions || !Array.isArray(sessions)) return 0;
    
    // Assuming each session is 1 hour
    return sessions.filter(session => session.status === 'completed').length;
  };
  
  // Calculate skills in progress
  const { data: skills, isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/skills/progress", user?.id],
    queryFn: async () => {
      // Simulated data - in a real app would come from an API
      return [
        { name: "JavaScript", progress: 65 },
        { name: "React", progress: 42 },
        { name: "Node.js", progress: 28 },
        { name: "UI/UX Design", progress: 55 }
      ];
    },
    enabled: !!user?.id,
  });
  
  const activeSkillsCount = skills?.length || 0;

  // Calculate metrics
  const learningStreak = calculateLearningStreak();
  const { sessionsThisMonth, growthPercentage } = calculateGrowthMetrics();
  const totalHours = calculateTotalHours();

  if (sessionsLoading || skillsLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-border/40">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-10" />
              </div>
              <Skeleton className="h-12 w-12 rounded-md" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <GlowingStatCard
        icon={<TrendingUp className="h-6 w-6" />}
        title="Learning Growth"
        value={`${growthPercentage >= 0 ? '+' : ''}${growthPercentage}%`}
        footer={<p className="text-sm">{sessionsThisMonth} sessions this month</p>}
        color={growthPercentage >= 0 ? "green" : "pink"}
      />
      <GlowingStatCard
        icon={<Clock className="h-6 w-6" />}
        title="Learning Hours"
        value={totalHours}
        footer={<p className="text-sm">Total mentorship time</p>}
        color="blue"
      />
      <GlowingStatCard
        icon={<BookOpen className="h-6 w-6" />}
        title="Skills in Progress"
        value={activeSkillsCount}
        footer={<Link href="/skills"><a className="text-sm hover:underline">View skill progress →</a></Link>}
        color="purple"
      />
      <GlowingStatCard
        icon={<Award className="h-6 w-6" />}
        title="Learning Streak"
        value={learningStreak}
        footer={
          learningStreak > 0 
            ? <p className="text-sm text-green-700 dark:text-green-300">Keep it up! 🔥</p>
            : <p className="text-sm">Book a session to start your streak</p>
        }
        color="amber"
      />
    </section>
  );
} 