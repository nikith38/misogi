import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Link } from "wouter";
import { CalendarDays, Clock, Users, Star, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { GlowingStatCard } from "./glowing-stat-card";

// Old StatsCard component is replaced by GlowingStatCard

export default function StatsOverview() {
  const { user } = useAuth();

  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/upcoming"],
  });

  const { data: sessions, isLoading: allSessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Get enhanced feedback with session details
  const { data: feedback, isLoading: feedbackLoading } = useQuery<any[]>({
    queryKey: ["/api/feedback"],
    enabled: !!user,
  });

  const { data: mentors, isLoading: mentorsLoading } = useQuery({
    queryKey: ["/api/mentors"],
    enabled: user?.role === "mentee",
  });

  // Calculate stats
  const upcomingSessionsCount = upcomingSessions?.length || 0;
  const totalHours = (sessions && Array.isArray(sessions) ? sessions.length : 0) * 1; // Assuming 1 hour per session
  const activeMentorsCount = user?.role === "mentee" ? (mentors && Array.isArray(mentors) ? mentors.length : 0) : 0;
  
  // Calculate feedback metrics
  let avgRating = 0;
  let recentFeedbackCount = 0;
  let highRatingCount = 0; // Count of ratings 4 or above
  
  if (feedback && Array.isArray(feedback) && feedback.length > 0) {
    // Calculate average rating
    const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
    avgRating = Math.round((totalRating / feedback.length) * 10) / 10;
    
    // Count recent feedback (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    recentFeedbackCount = feedback.filter(item => {
      const feedbackDate = new Date(item.created);
      return feedbackDate >= thirtyDaysAgo;
    }).length;
    
    // Count high ratings (4 or 5)
    highRatingCount = feedback.filter(item => item.rating >= 4).length;
  }

  if (sessionsLoading || allSessionsLoading || feedbackLoading || (user?.role === "mentee" && mentorsLoading)) {
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
        icon={<CalendarDays className="h-6 w-6" />}
        title="Upcoming Sessions"
        value={upcomingSessionsCount}
        footer={<Link href="/my-sessions"><a className="text-sm hover:underline">View schedule →</a></Link>}
        color="blue"
      />
      <GlowingStatCard
        icon={<Clock className="h-6 w-6" />}
        title="Total Hours"
        value={totalHours}
        footer={<p className="text-sm">{Math.floor(totalHours / 2)} hours this month</p>}
        color="green"
      />
      {user?.role === "mentee" ? (
        <GlowingStatCard
          icon={<Users className="h-6 w-6" />}
          title="Active Mentors"
          value={activeMentorsCount}
          footer={<Link href="/find-mentors"><a className="text-sm hover:underline">Manage connections →</a></Link>}
          color="purple"
        />
      ) : (
        <GlowingStatCard
          icon={<Users className="h-6 w-6" />}
          title="Active Mentees"
          value={upcomingSessionsCount > 0 ? upcomingSessionsCount : 0}
          footer={<p className="text-sm">Mentees you're guiding</p>}
          color="purple"
        />
      )}
      <GlowingStatCard
        icon={<Star className="h-6 w-6" />}
        title="Feedback Score"
        value={avgRating ? `${avgRating}/5` : "No ratings"}
        footer={
          <div className="space-y-1">
            <p className="text-sm">Based on {feedback && Array.isArray(feedback) ? feedback.length : 0} sessions</p>
            {recentFeedbackCount > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {recentFeedbackCount} new feedback{recentFeedbackCount !== 1 ? 's' : ''} in the last 30 days
              </p>
            )}
            {highRatingCount > 0 && (
              <p className="text-xs text-green-700 dark:text-green-300">
                {highRatingCount} high rating{highRatingCount !== 1 ? 's' : ''} (4-5 stars)
              </p>
            )}
          </div>
        }
        color="amber"
      />
    </section>
  );
}
