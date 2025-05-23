import { useAuth } from "@/hooks/use-auth";
import MenteeStatsCard from "@/components/dashboard/mentee-stats-card";
import UpcomingSessions from "@/components/dashboard/upcoming-sessions";
import SkillsProgress from "@/components/dashboard/skills-progress";
import ActivityFeed from "@/components/dashboard/activity-feed";
import RecommendedMentors from "@/components/dashboard/recommended-mentors";
import MenteeSessionsChart from "@/components/dashboard/mentee-sessions-chart";
import { cn, getStaggeredDelay } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DashboardCalendar } from "@/components/ui/dashboard-calendar";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import CalendarBookingModal from "@/components/mentors/calendar-booking-modal";

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recommended mentor for calendar booking
  const { data: recommendedMentor } = useQuery<User>({
    queryKey: ["/api/mentors/recommended"],
    queryFn: async () => {
      // Fetch all mentors and get the first one for simplicity
      // In a real app, you'd have an endpoint for recommended mentors
      const res = await apiRequest("GET", "/api/mentors");
      const mentors = await res.json();
      return mentors?.filter((m: User) => m.role === "mentor")[0]; // Return the first mentor
    },
    enabled: !!user,
  });
  
  const handleBookNowClick = () => {
    if (recommendedMentor) {
      setSelectedMentorId(recommendedMentor.id);
      setShowBookingModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <MenteeStatsCard />
        
        {/* Analytics Chart */}
        <div 
          className="grid grid-cols-1 gap-6 mb-6"
          style={{ transitionDelay: getStaggeredDelay(1) }}
        >
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <MenteeSessionsChart />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <div 
              className={cn(
                "transition-all duration-300 transform-gpu",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: getStaggeredDelay(2) }}
            >
              <UpcomingSessions />
            </div>
          </div>
          <div className="md:col-span-1">
            <div 
              className={cn(
                "transition-all duration-300 transform-gpu",
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: getStaggeredDelay(3) }}
            >
              <RecommendedMentors />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(4) }}
          >
            <SkillsProgress />
          </div>
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(5) }}
          >
            <DashboardCalendar 
              title="Your Mentorship Calendar"
              subtitle="Track your upcoming and completed sessions"
              buttonText="Book New Session"
              onBookNowClick={handleBookNowClick}
              menteeId={user?.id}
            />
          </div>
        </div>
        
        <div 
          className={cn(
            "transition-all duration-300 transform-gpu",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: getStaggeredDelay(6) }}
        >
          <ActivityFeed />
        </div>
        
        {selectedMentorId && recommendedMentor && (
          <CalendarBookingModal
            mentor={recommendedMentor}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </div>
    </div>
  );
}