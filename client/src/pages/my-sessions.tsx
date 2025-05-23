import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Session } from "@shared/schema";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import SessionCard from "@/components/sessions/session-card";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, CalendarRange, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export default function MySessions() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Get sessions specific to this user's role
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    // This route will return only sessions related to the current user in their role
    // The backend filters by user ID and role (mentor/mentee)
  });

  if (!sessions && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="mb-8">Failed to load your sessions. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Filter sessions based on their status
  const upcomingSessions = sessions?.filter(
    (session) => session.status === "approved" || session.status === "pending"
  ) || [];
  
  const completedSessions = sessions?.filter(
    (session) => session.status === "completed"
  ) || [];
  
  const canceledSessions = sessions?.filter(
    (session) => session.status === "canceled" || session.status === "rejected"
  ) || [];

  // Sort sessions by date (most recent first for upcoming, most recent last for completed)
  const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
  
  const sortedCompleted = [...completedSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });
  
  const sortedCanceled = [...canceledSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <>
      <Helmet>
        <title>My Sessions | MentorHub</title>
        <meta name="description" content="View and manage your upcoming, completed, and canceled mentorship sessions." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-neutral-default dark:text-white">My Sessions</h1>
                <p className="text-neutral dark:text-gray-300 mt-1">
                  Manage your pending, approved, completed, and canceled sessions.
                </p>
              </div>
              
              {user?.role === "mentee" && (
                <div className="mt-4 sm:mt-0">
                  <Button onClick={() => navigate("/find-mentors")}>
                    Find New Mentor
                  </Button>
                </div>
              )}
            </div>

            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/30 dark:data-[state=active]:text-white dark:text-gray-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upcoming ({upcomingSessions.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/30 dark:data-[state=active]:text-white dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completed ({completedSessions.length})
                </TabsTrigger>
                <TabsTrigger value="canceled" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:bg-primary/30 dark:data-[state=active]:text-white dark:text-gray-300">
                  <XCircle className="w-4 h-4 mr-2" />
                  Canceled ({canceledSessions.length})
                </TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-12 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-primary dark:text-primary/90 font-medium">Loading sessions...</span>
                </div>
              ) : (
                <>
                  <TabsContent value="upcoming">
                    {sortedUpcoming.length > 0 ? (
                      sortedUpcoming.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))
                    ) : (
                      <div className="relative rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 opacity-30" />
                        
                        <div className="relative">
                          <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.25)] border border-blue-200 dark:border-blue-800/30">
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
                            <CalendarRange className="h-16 w-16 mx-auto text-blue-500 dark:text-blue-400 opacity-80 mb-4" />
                            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">No upcoming sessions</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                              You don't have any scheduled sessions at the moment.
                            </p>
                            {user?.role === "mentee" && (
                              <Button 
                                onClick={() => navigate("/find-mentors")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Find a Mentor
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    {sortedCompleted.length > 0 ? (
                      sortedCompleted.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))
                    ) : (
                      <div className="relative rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/5 opacity-30" />
                        
                        <div className="relative">
                          <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.25)] border border-green-200 dark:border-green-800/30">
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
                            <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 dark:text-green-400 opacity-80 mb-4" />
                            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">No completed sessions</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              You haven't completed any sessions yet.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="canceled">
                    {sortedCanceled.length > 0 ? (
                      sortedCanceled.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))
                    ) : (
                      <div className="relative rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-red-600/5 opacity-30" />
                        
                        <div className="relative">
                          <div className="text-center py-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] border border-amber-200 dark:border-amber-800/30">
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
                            <XCircle className="h-16 w-16 mx-auto text-amber-500 dark:text-amber-400 opacity-80 mb-4" />
                            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">No canceled sessions</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              You don't have any canceled sessions.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
