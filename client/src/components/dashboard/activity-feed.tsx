import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Calendar, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileEdit,
  UserPlus,
  BookOpen,
  Eye,
  Shield
} from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO, format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface Activity {
  id: string;
  type: string;
  content: string;
  created: string;
  sessionId?: number;
  rating?: number;
  sessionDetails?: {
    topic: string;
    date: string;
    time: string;
    status: string;
  };
  userDetails?: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "feedback_given":
    case "feedback_received":
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    case "session_confirmed":
    case "session_created":
    case "session_requested":
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.3)]">
          <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
      );
    case "profile_viewed":
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-[0_0_10px_rgba(147,51,234,0.3)]">
          <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
      );
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "feedback_given":
    case "feedback_received":
      return <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    case "session_confirmed":
    case "session_created":
    case "session_requested":
      return <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    case "profile_viewed":
      return <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    default:
      return <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
  }
};

export default function ActivityFeed() {
  const { user } = useAuth();

  // Fetch regular activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: !!user,
  });

  // Fetch feedback activities
  const { data: feedbackActivities, isLoading: feedbackLoading } = useQuery<Activity[]>({
    queryKey: ["/api/feedback"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/feedback");
        const feedbackData = await res.json();
        
        // Transform feedback data into activity format
        return feedbackData.map((feedback: any) => ({
          id: `feedback-${feedback.id}`,
          type: "feedback_received",
          content: `You received feedback from <strong>${feedback.giver?.firstName} ${feedback.giver?.lastName}</strong> for your session <strong>${feedback.session?.topic}</strong>.`,
          created: feedback.created,
          sessionId: feedback.sessionId,
          rating: feedback.rating,
          sessionDetails: feedback.session,
          userDetails: feedback.giver
        }));
      } catch (error) {
        console.error("Error fetching feedback activities:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Combine and sort all activities
  const allActivities = [...(activities || []), ...(feedbackActivities || [])];
  allActivities.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  const isLoading = activitiesLoading || feedbackLoading;

  const formatTime = (date: Date | string) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };
  
  // Format session date and time
  const formatSessionDateTime = (date: string, time: string) => {
    try {
      const dateObj = parseISO(`${date}T${time}`);
      return format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return `${date} at ${time}`;
    }
  };

  if (isLoading) {
    return (
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/5 opacity-30" />
        
        <div className="relative">
          <Card className="col-span-4 md:col-span-2 dark:bg-slate-800/90 backdrop-blur-sm border-purple-200 dark:border-purple-800/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <div className="absolute inset-0">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={2}
              />
            </div>
            
            <CardHeader>
              <CardTitle className="text-foreground dark:text-white flex items-center">
                <span className="relative">Activity Feed</span>
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
              </CardTitle>
              <CardDescription className="text-foreground/80 dark:text-white/80">
                Recent activity in your mentorship journey
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col items-center py-6">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">Loading activities...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/5 opacity-30 dark:opacity-10" />
      
      <div className="relative">
        <Card className="col-span-4 md:col-span-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-purple-200 dark:border-purple-800/30 shadow-[0_0_20px_rgba(168,85,247,0.25)] dark:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <div className="absolute inset-0">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
            />
          </div>
          
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center">
              <span className="relative">Activity Feed</span>
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-ping"></span>
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Recent activity in your mentorship journey
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {allActivities && allActivities.length > 0 ? (
              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-800 scrollbar-track-transparent">
                {allActivities.map((activity, i) => (
                  <div 
                    key={activity.id || i} 
                    className="flex items-start space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 group"
                  >
                    <div className="p-2.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 shadow-sm group-hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all duration-300">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      {/* Activity Content */}
                      <p 
                        className="text-sm text-foreground dark:text-white/90 font-medium" 
                        dangerouslySetInnerHTML={{ __html: activity.content }} 
                      />
                      
                      {/* Session Details for Feedback Activities */}
                      {activity.type === "feedback_received" && activity.sessionDetails && (
                        <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-100 dark:border-purple-800/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {activity.sessionDetails.topic}
                              </p>
                              <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-0.5">
                                {formatSessionDateTime(activity.sessionDetails.date, activity.sessionDetails.time)}
                              </p>
                            </div>
                            <Badge className="text-xs" variant="outline">
                              {activity.sessionDetails.status.charAt(0).toUpperCase() + activity.sessionDetails.status.slice(1)}
                            </Badge>
                          </div>
                          
                          {/* Rating Display */}
                          {activity.rating && (
                            <div className="mt-2 flex items-center">
                              <span className="text-xs text-purple-700 dark:text-purple-300 mr-2">Rating:</span>
                              <div className="flex">
                                {[...Array(5)].map((_, index) => (
                                  <Star 
                                    key={index}
                                    className={cn(
                                      "h-3 w-3", 
                                      index < activity.rating! 
                                        ? "text-amber-500 fill-amber-500" 
                                        : "text-gray-300 dark:text-gray-600"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground dark:text-white/60 mt-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1 inline-block opacity-70" />
                        {formatTime(activity.created)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-primary dark:text-primary/90 py-4 font-medium">No recent activity to display.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
