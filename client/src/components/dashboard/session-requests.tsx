import { useQuery, useMutation } from "@tanstack/react-query";
import { Session, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Calendar, Clock, User as UserIcon } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/use-auth";

export default function SessionRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use specific query settings to ensure data is always fetched fresh on component mount
  const { data: sessionRequests, isLoading, error } = useQuery<Session[]>({
    queryKey: ["/api/session-requests"],
    refetchInterval: 10000, // Refresh more frequently (every 10 seconds)
    refetchOnMount: true, // Always refetch when component mounts
    staleTime: 0, // Always consider the data stale
    retry: 2, // Retry failed requests
    // Only run this query if we have a user and they're a mentor
    enabled: !!user && user.role === "mentor",
  });
  
  const { data: menteeUsers } = useQuery<Record<number, User>>({
    queryKey: ["/api/users-by-id"],
    enabled: !!sessionRequests?.length,
    queryFn: async () => {
      if (!sessionRequests?.length) return {};
      
      // Get unique mentee IDs
      const menteeIds = Array.from(new Set(sessionRequests.map(req => req.menteeId)));
      
      // Fetch all needed users in one go
      const users: Record<number, User> = {};
      
      for (const id of menteeIds) {
        try {
          const res = await fetch(`/api/profile/${id}`);
          if (res.ok) {
            const user = await res.json();
            users[id] = user;
          }
        } catch (err) {
          console.error(`Failed to fetch user ${id}`, err);
        }
      }
      
      return users;
    }
  });
  
  // Approve session request
  const approveMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/approve`);
      return await res.json() as Session;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/session-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Session approved",
        description: "You have approved the session request.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to approve session",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Reject session request
  const rejectMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("POST", `/api/sessions/${sessionId}/reject`);
      return await res.json() as Session;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/session-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Session declined",
        description: "You have declined the session request.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to decline session",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>Failed to load session requests</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!sessionRequests || sessionRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Requests</CardTitle>
          <CardDescription>You don't have any pending session requests. When mentees book a session with you, it will appear here for your approval.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Session Requests</CardTitle>
        <CardDescription>Review and respond to session requests from mentees.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionRequests.map((request) => {
          const mentee = menteeUsers?.[request.menteeId];
          const sessionDate = new Date(`${request.date}T${request.time}`);
          
          return (
            <Card key={request.id} className="overflow-hidden border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {mentee ? `${mentee.firstName} ${mentee.lastName}` : 'Loading...'}
                    </CardTitle>
                    <CardDescription>{request.topic}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{format(sessionDate, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>{format(sessionDate, 'h:mm a')}</span>
                  </div>
                </div>
                
                {request.notes && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-muted-foreground">Notes:</p>
                    <p className="text-sm mt-1">{request.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-slate-50 border-t flex justify-end gap-2 p-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => rejectMutation.mutate(request.id)}
                  disabled={rejectMutation.isPending}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Decline
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => approveMutation.mutate(request.id)}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
}