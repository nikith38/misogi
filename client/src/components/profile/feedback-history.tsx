import { useQuery } from "@tanstack/react-query";
import { Feedback, User, Session } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Calendar, Clock, Video, MessageSquare, BookOpen } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function FeedbackHistory() {
  const { user } = useAuth();
  
  // Define enhanced feedback type with session details
  interface EnhancedFeedback extends Feedback {
    session?: {
      id: number;
      topic: string;
      date: string;
      time: string;
      status: string;
    } | null;
    giver?: {
      id: number;
      firstName: string;
      lastName: string;
      profileImage?: string;
      role: string;
    } | null;
  }
  
  // Following privacy requirements - users can only see feedback they received
  // Get enhanced feedback received by the user (includes session details)
  const { data: feedbackReceived, isLoading } = useQuery<EnhancedFeedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!user,
  });

  const formatDate = (created: string | Date | null) => {
    if (!created) return "";
    const date = typeof created === "string" ? parseISO(created) : created;
    return format(date, "MMMM d, yyyy");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-4 w-4 ${
              value <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-neutral-200 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
        <div className="h-24 bg-neutral-100 dark:bg-gray-700/50 rounded-md animate-pulse" />
        <div className="h-24 bg-neutral-100 dark:bg-gray-700/50 rounded-md animate-pulse" />
      </div>
    );
  }

  const hasNoFeedback = !feedbackReceived || feedbackReceived.length === 0;

  // Get status badge style based on session status
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "approved":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "canceled":
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300";
    }
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

  // Render individual feedback item with enhanced session details
  const renderFeedbackItem = (feedback: EnhancedFeedback) => {
    // Get giver profile from the enhanced feedback
    const giver = feedback.giver;
    
    // Create initials for avatar fallback
    const initials = giver ? 
      `${giver.firstName[0]}${giver.lastName[0]}` : 
      "??";

    // Get session details
    const session = feedback.session;

    return (
      <Card key={feedback.id} className="overflow-hidden bg-white/90 dark:bg-gray-800/90 border-indigo-100 dark:border-indigo-800/30 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Session details header */}
        {session && (
          <CardHeader className="pb-0 pt-4 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-base font-medium">{session.topic}</CardTitle>
                <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatSessionDateTime(session.date, session.time)}
                </p>
              </div>
              <Badge className={cn("text-xs", getStatusBadgeStyle(session.status))}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)} Session
              </Badge>
            </div>
          </CardHeader>
        )}
        
        <CardContent className="p-4">
          <Separator className="my-3" />
          
          {/* Feedback content */}
          <div className="flex">
            <div className="mr-4">
              <Avatar className="h-10 w-10 ring-2 ring-indigo-100 dark:ring-indigo-800/30">
                <AvatarImage 
                  src={giver?.profileImage || undefined} 
                  alt={`${giver?.firstName} ${giver?.lastName}`} 
                />
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    {giver?.firstName || 'User'} {giver?.lastName || ''}
                    {giver?.role && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {giver.role.charAt(0).toUpperCase() + giver.role.slice(1)}
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">
                    Feedback given on {formatDate(feedback.created)}
                  </p>
                </div>
                <div>
                  {renderStars(feedback.rating)}
                </div>
              </div>
              
              {feedback.comment && (
                <div className="mt-3 text-sm bg-neutral-50 dark:bg-gray-700/50 p-3 rounded-md border border-neutral-100 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                  <p className="font-medium text-xs text-neutral-600 dark:text-gray-300 mb-1 flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" /> Feedback Comment:
                  </p>
                  {feedback.comment}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-4 text-gray-900 dark:text-white flex items-center justify-center">
        <span>Session Feedback History</span>
        <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
      </h3>
      <p className="text-sm text-center text-neutral-500 dark:text-gray-400 mb-6">
        <BookOpen className="inline-block h-4 w-4 mr-1 mb-1" />
        Detailed feedback from your completed mentorship sessions
      </p>
      
      {hasNoFeedback ? (
        <Card className="bg-neutral-50 dark:bg-gray-800/50 border-dashed border-neutral-200 dark:border-gray-700/50">
          <CardContent className="pt-6 text-center text-neutral-500 dark:text-gray-400">
            <p>You haven't received any feedback yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbackReceived?.map(renderFeedbackItem)}
        </div>
      )}
    </div>
  );
}