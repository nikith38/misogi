import { useAuth } from "@/hooks/use-auth";
import StatsOverview from "@/components/dashboard/stats-card";
import ActivityFeed from "@/components/dashboard/activity-feed";
import SessionsChart from "@/components/dashboard/sessions-chart";
import { cn, getStaggeredDelay } from "@/lib/utils";
import { Calendar, BookOpen, Users, Lightbulb, Bell, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Component to display pending session requests
function PendingSessionRequests({ userId }: { userId?: number }) {
  const { data: pendingRequests, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/session-requests"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/session-requests");
        return await res.json();
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        return [];
      }
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <div className="text-center py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
        <Clock className="h-8 w-8 mx-auto text-blue-500 opacity-70 mb-2" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          No pending session requests at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingRequests.map((request) => (
        <div 
          key={request.id} 
          className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30 flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
              <span className="text-sm font-medium">{request.topic}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {format(parseISO(request.date), "MMM d")} at {format(parseISO(`2021-01-01T${request.time}`), "h:mm a")}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.location.href = "/my-sessions"}
          >
            Review
          </Button>
        </div>
      ))}
    </div>
  );
}

export default function MentorDashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Extracted the availability component for easier placement
  const AvailabilitySection = (
    <div 
      className={cn(
        "bg-card dark:bg-gray-800/50 rounded-lg shadow transition-all duration-300",
        "hover:shadow-md hover:scale-[1.02] border border-border/40",
        "transform-gpu p-6 mb-6",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: getStaggeredDelay(3) }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-1 font-montserrat flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Your Availability</span>
          </h2>
          <p className="text-sm text-muted-foreground font-inter">
            Manage when you're available for mentorship sessions.
          </p>
        </div>
      </div>
      
      <Button
        className="w-full font-medium"
        onClick={() => window.location.href = "/profile#availability"}
      >
        Manage Availability
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 py-8">
        <StatsOverview />
      
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
          <SessionsChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={cn(
              "bg-card dark:bg-gray-800/50 rounded-lg shadow transition-all duration-300",
              "hover:shadow-md hover:scale-[1.02] border border-border/40",
              "transform-gpu p-6 mb-6",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(2) }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold mb-1 font-montserrat flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Pending Session Requests</span>
                </h2>
                <p className="text-sm text-muted-foreground font-inter">
                  Review and manage your pending session requests.
                </p>
              </div>
            </div>
            
            <PendingSessionRequests userId={user?.id} />
            
            <Button
              className="w-full font-medium mt-4"
              onClick={() => window.location.href = "/my-sessions"}
            >
              View All Sessions
            </Button>
          </div>
          
          {/* Availability section */}
          {AvailabilitySection}
          
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(4) }}
          >
            <ActivityFeed />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div 
            className={cn(
              "bg-card dark:bg-gray-800/50 rounded-lg shadow transition-all duration-300",
              "hover:shadow-md hover:scale-[1.02] border border-border/40",
              "transform-gpu p-6 mb-6",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(5) }}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold font-montserrat flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Mentor Resources</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-blue-100 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/20 rounded-md transition-transform duration-200 hover:translate-y-[-2px]">
                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 font-montserrat flex items-center gap-1.5">
                  <Users className="h-4 w-4 flex-shrink-0" />
                  Effective Mentoring Guide
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-2 font-inter">
                  Learn best practices for guiding mentees toward their goals.
                </p>
                <a href="#" className="text-sm font-medium text-primary hover:underline flex items-center">
                  Read guide
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 animate-pulse-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
              
              <div className="p-4 border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/20 rounded-md transition-transform duration-200 hover:translate-y-[-2px]">
                <h3 className="font-medium text-purple-800 dark:text-purple-300 mb-2 font-montserrat flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 flex-shrink-0" />
                  Communication Templates
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400 mb-2 font-inter">
                  Helpful templates for common mentorship situations.
                </p>
                <a href="#" className="text-sm font-medium text-primary hover:underline flex items-center">
                  View templates
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 animate-pulse-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
              
              <div className="p-4 border border-green-100 dark:border-green-900/30 bg-green-50 dark:bg-green-900/20 rounded-md transition-transform duration-200 hover:translate-y-[-2px]">
                <h3 className="font-medium text-green-800 dark:text-green-300 mb-2 font-montserrat flex items-center gap-1.5">
                  <svg className="h-4 w-4 flex-shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.8 14L12.1 7.4L15.4 14M9.5 18H14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Success Stories
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-2 font-inter">
                  See how other mentors have made an impact.
                </p>
                <a href="#" className="text-sm font-medium text-primary hover:underline flex items-center">
                  Read stories
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 animate-pulse-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}