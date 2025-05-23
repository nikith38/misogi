import { useQuery } from "@tanstack/react-query";
import { Session, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { format, isTomorrow, isToday, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingSessions({ excludePending = false }: { excludePending?: boolean }) {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState<number | null>(null);
  
  // Get only sessions for the current user's role (mentor/mentee)
  // The backend API filters based on user ID and role
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/upcoming"]
  });
  
  // Filter out pending sessions if the excludePending flag is true
  // This prevents duplicate display of pending sessions when used with SessionRequests component
  const filteredSessions = excludePending && sessions 
    ? sessions.filter(session => session.status !== "pending") 
    : sessions;
  
  const { data: mentors, isLoading: mentorsLoading } = useQuery<User[]>({
    queryKey: ["/api/mentors"],
    enabled: user?.role === "mentee",
  });
  
  // For mentors viewing mentee details
  const uniqueMenteeIds = sessions?.map(s => s.menteeId).filter((v, i, a) => a.indexOf(v) === i) || [];
  
  // Use a custom hook to fetch mentee data
  const { data: menteesData } = useQuery<Record<number, User>>({
    queryKey: ["/api/profile/batch", uniqueMenteeIds],
    enabled: user?.role === "mentor" && uniqueMenteeIds.length > 0,
    queryFn: async () => {
      // Create an object to store mentee data by ID
      const menteeMap: Record<number, User> = {};
      
      // Fetch each mentee in parallel
      await Promise.all(
        uniqueMenteeIds.map(async (id) => {
          try {
            const response = await fetch(`/api/profile/${id}`);
            if (response.ok) {
              const data = await response.json();
              menteeMap[id] = data;
            }
          } catch (error) {
            console.error(`Error fetching mentee ${id}:`, error);
          }
        })
      );
      
      return menteeMap;
    }
  });

  const formatSessionDate = (date: string, time: string) => {
    const fullDate = parseISO(`${date}T${time}`);
    
    if (isToday(fullDate)) {
      return `Today, ${format(fullDate, "h:mm a")}`;
    }
    if (isTomorrow(fullDate)) {
      return `Tomorrow, ${format(fullDate, "h:mm a")}`;
    }
    return format(fullDate, "EEE, MMM d, h:mm a");
  };

  const handleJoinSession = (sessionId: number) => {
    setMeetingId(sessionId);
    
    // Find the session that matches the ID
    const session = sessions?.find(s => s.id === sessionId);
    
    if (session?.meetingLink) {
      // Format the Google Meet URL correctly if needed
      let meetingUrl = session.meetingLink;
      if (!meetingUrl.startsWith('http')) {
        // Handle just the meeting code
        if (meetingUrl.includes('meet.google.com')) {
          // The URL might already contain the domain but no protocol
          meetingUrl = `https://${meetingUrl}`;
        } else {
          // It's likely just the meeting code
          meetingUrl = `https://meet.google.com/${meetingUrl}`;
        }
      }
      
      // Open in a new tab
      window.open(meetingUrl, "_blank");
    }
    
    // Reset the loading state after a delay
    setTimeout(() => {
      setMeetingId(null);
    }, 1500);
  };

  // Get participant details based on user role and privacy requirements
  const getParticipantDetails = (session: Session) => {
    // For privacy reasons, we follow these rules:
    // 1. Full mentee names should only be visible after completed sessions
    // 2. Mentor details can be visible to maintain mentor discovery
    const isSessionCompleted = session.status === "completed";
    
    if (user?.role === "mentee") {
      // For mentees, show the mentor's details (mentors have public profiles)
      const mentor = mentors?.find(m => m.id === session.mentorId);
      return {
        id: mentor?.id || 0,
        name: mentor ? `${mentor.firstName} ${mentor.lastName}` : "Unknown Mentor",
        initials: mentor ? `${mentor.firstName[0]}${mentor.lastName[0]}` : "UM",
        profileImage: mentor?.profileImage,
        color: "bg-primary-light",
      };
    } else {
      // For mentors, get the mentee details but apply privacy rules
      const mentee = menteesData?.[session.menteeId];
      
      if (mentee) {
        // Only show full name if the session is completed
        const name = isSessionCompleted ? 
          `${mentee.firstName} ${mentee.lastName}` : 
          "Mentee";
          
        const initials = isSessionCompleted ? 
          `${mentee.firstName[0]}${mentee.lastName[0]}` : 
          "ME";
          
        return {
          id: mentee.id,
          name: name,
          initials: initials,
          // Only show profile image for completed sessions
          profileImage: isSessionCompleted ? mentee.profileImage : null,
          color: "bg-purple-500",
        };
      } else {
        // Fallback if mentee data is not loaded yet
        return {
          id: session.menteeId,
          name: "Mentee",
          initials: "ME",
          profileImage: null,
          color: "bg-purple-500",
        };
      }
    }
  };

  if (isLoading || mentorsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row border-b border-gray-200 py-4 last:border-0 last:pb-0 first:pt-0 items-start sm:items-center">
            <Skeleton className="h-12 w-12 rounded-full mb-3 sm:mb-0" />
            <div className="sm:ml-4 flex-grow">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-9 w-16 mt-3 sm:mt-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/90 rounded-lg shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h2>
        <a href="/my-sessions" className="text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary-lighter">View all</a>
      </div>
      
      {filteredSessions && filteredSessions.length > 0 ? (
        filteredSessions.map(session => {
          const participant = getParticipantDetails(session);
          return (
            <div key={session.id} className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700/50 py-4 last:border-0 last:pb-0 first:pt-0 items-start sm:items-center">
              <div className="sm:flex-shrink-0 mb-3 sm:mb-0">
                <Avatar className="h-12 w-12 ring-2 ring-gray-100 dark:ring-gray-700/50">
                  <AvatarImage src={participant.profileImage || undefined} alt={participant.name} />
                  <AvatarFallback className={participant.color}>{participant.initials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="sm:ml-4 flex-grow">
                <div className="flex items-center">
                  <p className="font-medium text-gray-900 dark:text-white">{participant.name}</p>
                  {session.status === "pending" && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-orange-400 dark:border-orange-500/50 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-300">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{session.topic}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatSessionDate(session.date, session.time)}</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-0">
                {session.status === "approved" ? (
                  <Button 
                    onClick={() => handleJoinSession(session.id)}
                    disabled={meetingId === session.id}
                  >
                    {meetingId === session.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join"
                    )}
                  </Button>
                ) : session.status === "pending" ? (
                  <Button variant="outline" disabled>
                    Pending
                  </Button>
                ) : (
                  <Button disabled>
                    Join
                  </Button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/30 my-2">
          <p className="text-gray-600 dark:text-gray-300">No upcoming sessions scheduled.</p>
          {user?.role === "mentee" && (
            <Button className="mt-4 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary" asChild>
              <a href="/find-mentors">Find a mentor</a>
            </Button>
          )}
          {user?.role === "mentor" && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Mentees will be able to book sessions based on your availability.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
