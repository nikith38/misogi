import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Session, User, Feedback, insertFeedbackSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Star, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  
  // Define types for feedback data
  interface FeedbackStatus {
    hasFeedback: boolean;
    feedback?: Feedback;
  }
  
  interface SessionFeedbackData {
    feedback: Feedback[];
    userProfiles: Record<number, {
      id: number;
      firstName: string;
      lastName: string;
      profileImage?: string;
      role: string;
    }>;
  }
  
  // Query to check if user has already provided feedback for this session
  const { data: feedbackStatus } = useQuery<FeedbackStatus>({
    queryKey: [`/api/feedback/session/${session.id}`],
    enabled: !!session.id && session.status === "completed",
  });
  
  // Query to get all feedback for this session (both from mentor and mentee)
  const { data: sessionFeedback, refetch: refetchSessionFeedback } = useQuery<SessionFeedbackData>({
    queryKey: [`/api/feedback/session/${session.id}/all`],
    enabled: !!session.id && session.status === "completed",
  });

  // Strictly verify session ownership based on user's role
  const isOwnSession = user?.role === "mentor" 
    ? session.mentorId === user?.id 
    : session.menteeId === user?.id;

  const isMentor = user?.role === "mentor";
  const participantId = isMentor ? session.menteeId : session.mentorId;
  
  // Log the session data for debugging
  console.log(`[DEBUG] Session data:`, {
    id: session.id,
    status: session.status,
    meetingLink: session.meetingLink,
    mentorId: session.mentorId,
    menteeId: session.menteeId
  });
  
  const { data: participant } = useQuery<User>({
    queryKey: [`/api/profile/${participantId}`],
    enabled: !!participantId,
  });
  
  // Check if the user has already provided feedback for this session
  const { data: userFeedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback/given"],
    enabled: session.status === "completed" && isOwnSession,
  });
  
  // Determine if the user has already left feedback for this session
  const hasLeftFeedback = userFeedback?.some(
    feedback => feedback.sessionId === session.id && feedback.fromId === user?.id
  ) || false;

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, { status });
      return await res.json();
    },
    onSuccess: (_: any, variables: { id: number; status: string }) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      // Show appropriate toast messages based on the new status
      if (variables.status === "completed") {
        toast({
          title: "Session marked as completed",
          description: isMentor 
            ? "Mentee will now be able to leave feedback." 
            : "The mentor has ended this session. Please leave your feedback.",
        });
      } else if (variables.status === "canceled") {
        toast({
          title: "Session canceled",
          description: "The session has been canceled successfully.",
        });
      } else {
        toast({
          title: `Session ${variables.status}`,
          description: `The session has been ${variables.status} successfully.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: z.infer<typeof insertFeedbackSchema>) => {
      const res = await apiRequest("POST", "/api/feedback", feedbackData);
      return await res.json();
    },
    onSuccess: () => {
      setShowFeedbackModal(false);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Invalidate all relevant feedback queries
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/given"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string, time: string) => {
    const dateObj = parseISO(`${date}T${time}`);
    // Format with the user's local timezone automatically included
    return format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm a (z)");
  };

  const handleJoinSession = () => {
    // Log that we're joining the meeting
    console.log('[JOIN MEETING] Joining meeting for session:', session.id);
    
    // Always use the specified Google Meet URL
    const meetingLink = 'https://meet.google.com/ajv-jyxk-eak';
    
    try {
      console.log('[JOIN MEETING] Opening URL:', meetingLink);
      
      // Open in a new tab
      const newWindow = window.open(meetingLink, "_blank");
      
      // Check if the window was successfully opened
      if (newWindow) {
        toast({
          title: "Joining meeting",
          description: "Opening Google Meet in a new tab...",
        });
      } else {
        // If window.open returns null, it might have been blocked by a popup blocker
        console.error('[JOIN MEETING] Popup blocked');
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to join meetings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[JOIN MEETING] Error opening meeting link:', error);
      toast({
        title: "Error joining meeting",
        description: "There was a problem opening the meeting link.",
        variant: "destructive"
      });
    }
  };

  const handleAccept = () => {
    // Ensure the user is the mentor for this session
    if (session.mentorId !== user?.id) {
      toast({
        title: "Permission Denied",
        description: "Only the assigned mentor can accept session requests.",
        variant: "destructive"
      });
      return;
    }
    
    updateSessionMutation.mutate({ id: session.id, status: "approved" });
  };

  const handleReject = () => {
    // Ensure the user is the mentor for this session
    if (session.mentorId !== user?.id) {
      toast({
        title: "Permission Denied",
        description: "Only the assigned mentor can reject session requests.",
        variant: "destructive"
      });
      return;
    }
    
    updateSessionMutation.mutate({ id: session.id, status: "rejected" });
  };

  const handleCancel = () => {
    // Ensure the user is part of this session
    if (session.mentorId !== user?.id && session.menteeId !== user?.id) {
      toast({
        title: "Permission Denied",
        description: "You can only cancel sessions that you are a part of.",
        variant: "destructive"
      });
      return;
    }
    
    updateSessionMutation.mutate({ id: session.id, status: "canceled" });
  };

  const handleLeaveFeedback = () => {
    setShowFeedbackModal(true);
  };

  const submitFeedback = () => {
    const feedbackData = {
      sessionId: session.id,
      fromId: user!.id,
      toId: isMentor ? session.menteeId : session.mentorId,
      rating,
      comment,
    };
    submitFeedbackMutation.mutate(feedbackData);
  };

  // Session card status styling
  const getStatusBadgeStyle = () => {
    switch (session.status) {
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50";
      case "approved":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50";
      case "completed":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50";
      case "canceled":
      case "rejected":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50";
      default:
        return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };
  
  // Get gradient background based on status
  const getGradientBackground = () => {
    switch (session.status) {
      case "pending":
        return "from-yellow-500/10 to-amber-600/5";
      case "approved":
        return "from-blue-500/10 to-indigo-600/5";
      case "completed":
        return "from-green-500/10 to-emerald-600/5";
      case "canceled":
      case "rejected":
        return "from-red-500/10 to-rose-600/5";
      default:
        return "from-gray-500/10 to-slate-600/5";
    }
  };
  
  // Get shadow color based on status
  const getShadowStyle = () => {
    switch (session.status) {
      case "pending":
        return "shadow-[0_0_20px_rgba(245,158,11,0.15)]";
      case "approved":
        return "shadow-[0_0_20px_rgba(59,130,246,0.15)]";
      case "completed":
        return "shadow-[0_0_20px_rgba(34,197,94,0.15)]";
      case "canceled":
      case "rejected":
        return "shadow-[0_0_20px_rgba(239,68,68,0.15)]";
      default:
        return "shadow-sm";
    }
  };
  
  // Get border color based on status
  const getBorderStyle = () => {
    switch (session.status) {
      case "pending":
        return "border-yellow-200 dark:border-yellow-800/30";
      case "approved":
        return "border-blue-200 dark:border-blue-800/30";
      case "completed":
        return "border-green-200 dark:border-green-800/30";
      case "canceled":
      case "rejected":
        return "border-red-200 dark:border-red-800/30";
      default:
        return "border-gray-200 dark:border-gray-700/50";
    }
  };

  // Always show the participant name when available
  const participantName = participant 
    ? `${participant.firstName} ${participant.lastName}`
    : `${isMentor ? 'Mentee' : 'Mentor'}`;

  return (
    <>
      <div className="relative rounded-xl overflow-hidden mb-4">
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradientBackground()} opacity-30`} />
        
        <div className="relative">
          <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl ${getShadowStyle()} border ${getBorderStyle()}`}>
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
            
            <div className="p-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeStyle()}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{session.topic}</h3>
                  <div className="flex items-center text-neutral-500 mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDate(session.date, session.time)}</span>
                  </div>
                  <div className="flex items-center text-neutral-500">
                    <Video className="h-4 w-4 mr-2" />
                    <span className="text-sm">Video meeting with {participantName}</span>
                  </div>
                  {session.notes && (
                    <p className="mt-3 text-sm bg-neutral-50 p-3 rounded-md border border-neutral-200">
                      <span className="font-medium">Session notes:</span> {session.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 md:ml-4 md:w-36">
                  {/* Show accept/reject buttons for mentors with pending sessions */}
                  {isMentor && session.mentorId === user?.id && session.status === "pending" && (
                    <div className="flex flex-col space-y-4">
                      <Button 
                        className="w-full bg-green-700 hover:bg-green-800 text-white" 
                        onClick={handleAccept}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white" 
                        onClick={handleReject}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  {/* Show join meeting button for approved sessions */}
                  {session.status === "approved" && (
                    <Button 
                      className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white" 
                      onClick={handleJoinSession}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                  )}
                  
                  {/* Show complete button for approved sessions (only for mentors) */}
                  {session.status === "approved" && session.mentorId === user?.id && (
                    <Button 
                      className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white" 
                      onClick={() => updateSessionMutation.mutate({ id: session.id, status: "completed" })}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  )}
                  
                  {/* Show feedback button for completed sessions (for both mentors and mentees) */}
                  {session.status === "completed" && (session.mentorId === user?.id || session.menteeId === user?.id) && (
                    <Button 
                      className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white" 
                      onClick={handleLeaveFeedback}
                      size="sm"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      {feedbackStatus?.hasFeedback ? "View Feedback" : "Leave Feedback"}
                    </Button>
                  )}
                  
                  {/* Only show cancel button for sessions that are not already completed or canceled */}
                  {(session.mentorId === user?.id || session.menteeId === user?.id) && 
                   session.status !== "completed" && 
                   session.status !== "canceled" && 
                   session.status !== "rejected" && 
                   session.status !== "pending" && (
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">Session Feedback</DialogTitle>
            <DialogDescription className="text-center">
              {feedbackStatus?.hasFeedback 
                ? "View and manage feedback for this session" 
                : `Share your experience about the session with ${participantName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1">
            {/* Session participants */}
            <div className="flex items-start gap-4 mb-6 p-4 bg-neutral-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex-shrink-0">
                {participant && (
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 dark:ring-primary/10">
                    <AvatarImage src={participant.profileImage || undefined} alt={participantName} />
                    <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary/90">
                      {participant.firstName?.[0]}{participant.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-medium">{participantName}</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {participant?.role.charAt(0).toUpperCase() + participant?.role.slice(1)}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Session on {formatDate(session.date, session.time)}
                </p>
              </div>
            </div>
            
            {/* Existing feedback section */}
            {sessionFeedback?.feedback && sessionFeedback.feedback.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Feedback for this session:</h3>
                <div className="space-y-4">
                  {sessionFeedback.feedback.map((fb) => {
                    // Use optional chaining and provide fallback for userProfiles
                    const giver = sessionFeedback?.userProfiles?.[fb.fromId] || {
                      firstName: 'User',
                      lastName: '',
                      profileImage: undefined
                    };
                    
                    return (
                      <div key={fb.id} className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={giver.profileImage || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {giver.firstName?.[0]}{giver.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{giver.firstName} {giver.lastName}</p>
                            <p className="text-xs text-neutral-500">{format(new Date(fb.created || new Date()), "MMM d, yyyy")}</p>
                          </div>
                          <div className="ml-auto flex">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <Star 
                                key={value}
                                className={`h-4 w-4 ${value <= fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        {fb.comment && (
                          <div className="text-sm mt-2 pl-11">
                            {fb.comment}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Leave feedback form - only show if user hasn't left feedback yet */}
            {!feedbackStatus?.hasFeedback && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={`p-1 rounded-full transition-colors ${value <= rating ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600'}`}
                      >
                        <Star className={`h-6 w-6 ${value <= rating ? 'fill-yellow-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium mb-2">Comments</label>
                  <Textarea
                    id="feedback"
                    placeholder="Share your thoughts about the session..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>Cancel</Button>
                  <Button 
                    className="bg-green-700 hover:bg-green-800 text-white"
                    onClick={submitFeedback}
                    disabled={submitFeedbackMutation.isPending}
                  >
                    {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </div>
            )}
            
            {/* If user has already left feedback, show a message */}
            {feedbackStatus?.hasFeedback && !sessionFeedback?.feedback?.length && (
              <div className="mt-6 p-4 border border-dashed rounded-md text-center">
                <p className="text-neutral-500">You've already provided feedback for this session.</p>
              </div>
            )}
            
            {/* Close button if user has already left feedback */}
            {feedbackStatus?.hasFeedback && (
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>Close</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
