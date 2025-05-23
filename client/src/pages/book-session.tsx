import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Calendar } from "@/components/ui/calendar";
import CalendarBookingModal from "@/components/mentors/calendar-booking-modal";

export default function BookSession() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Get mentor ID from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mentorId = params.get("mentorId");
    if (mentorId) {
      setSelectedMentorId(parseInt(mentorId, 10));
    }
  }, []);

  // Fetch mentor details if a mentor ID is provided
  const { data: mentor, isLoading: mentorLoading } = useQuery<User>({
    queryKey: ["/api/mentors", selectedMentorId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/mentors/${selectedMentorId}`);
      return await res.json();
    },
    enabled: !!selectedMentorId,
  });

  // Fetch all mentors if no specific mentor is selected
  const { data: mentors, isLoading: mentorsLoading } = useQuery<User[]>({
    queryKey: ["/api/mentors"],
    enabled: !selectedMentorId,
  });

  // Get initials for avatar fallback
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "M";
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  const handleBookNowClick = () => {
    if (selectedMentorId && mentor) {
      setShowBookingModal(true);
    } else {
      // If no mentor is selected, redirect to the mentor list
      setActiveTab("calendar");
    }
  };
  
  const handleDateSelection = (date: Date) => {
    if (selectedMentorId && mentor) {
      setShowBookingModal(true);
    }
  };

  return (
    <>
      <Helmet>
        <title>Book a Session | MentorHub</title>
        <meta 
          name="description" 
          content="Schedule a mentorship session with experienced professionals on MentorHub." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-16 pb-16 md:pb-6 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Book a Mentorship Session</h1>
              <p className="text-muted-foreground mt-2">
                Schedule time with a mentor to get personalized guidance and support
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column - Mentor info and session details */}
              <div className="lg:col-span-1 space-y-6">
                {selectedMentorId && mentor ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20">
                          <AvatarImage src={mentor.profileImage || undefined} alt={`${mentor.firstName} ${mentor.lastName}`} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(mentor.firstName, mentor.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">{mentor.firstName} {mentor.lastName}</h2>
                          <p className="text-muted-foreground">{mentor.title || "Mentor"}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mt-6">
                        <h3 className="text-lg font-medium text-foreground">Session Types</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                            <div>
                              <h4 className="font-medium text-foreground">Quick Question</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>15 min</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-foreground">Free</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                            <div>
                              <h4 className="font-medium text-foreground">Career Guidance</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>30 min</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-foreground">$40</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                            <div>
                              <h4 className="font-medium text-foreground">Deep Dive</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>60 min</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-foreground">$75</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4 mt-6">
                        <h3 className="text-lg font-medium text-foreground">Meeting Options</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                            <Video className="h-5 w-5 mr-3 text-primary" />
                            <div>
                              <h4 className="font-medium text-foreground">Video Call</h4>
                              <p className="text-xs text-muted-foreground">Zoom or Google Meet</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                            <MapPin className="h-5 w-5 mr-3 text-primary" />
                            <div>
                              <h4 className="font-medium text-foreground">In Person</h4>
                              <p className="text-xs text-muted-foreground">If you're in the same location</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-foreground mb-4">Select a Mentor</h2>
                      {mentorsLoading ? (
                        <p className="text-muted-foreground">Loading mentors...</p>
                      ) : (
                        <div className="space-y-4">
                          {mentors?.filter(m => m.role === "mentor").map((mentor) => (
                            <div 
                              key={mentor.id}
                              className="flex items-center space-x-3 p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                              onClick={() => navigate(`/book-session?mentorId=${mentor.id}`)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={mentor.profileImage || undefined} alt={`${mentor.firstName} ${mentor.lastName}`} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {getInitials(mentor.firstName, mentor.lastName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-foreground">{mentor.firstName} {mentor.lastName}</h4>
                                <p className="text-xs text-muted-foreground">{mentor.title || "Mentor"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Right column - Calendar and booking options */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Calendar</span>
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Session Details</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="calendar" className="mt-0">
                    <Calendar 
                      title={mentor ? `Book a session with ${mentor.firstName}` : "Select a mentor to book a session"}
                      subtitle={mentor ? `Choose a date and time that works for you` : "Browse available mentors and their schedules"}
                      buttonText={mentor ? "Book Session" : "View Mentors"}
                      onBookNowClick={handleBookNowClick}
                      mentorId={selectedMentorId || undefined}
                      onSelectDate={handleDateSelection}
                    />
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-0">
                    <Card>
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Session Details</h2>
                        
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-2">What to expect</h3>
                            <p className="text-muted-foreground">
                              During your mentorship session, you'll have the opportunity to discuss your goals, 
                              challenges, and questions with your mentor. Come prepared with specific topics 
                              you'd like to cover to make the most of your time.
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Preparation</h3>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                              <li>Prepare specific questions or topics</li>
                              <li>Have relevant materials ready to share</li>
                              <li>Find a quiet space with good internet connection</li>
                              <li>Be ready 5 minutes before your scheduled time</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium text-foreground mb-2">Cancellation Policy</h3>
                            <p className="text-muted-foreground">
                              You can reschedule or cancel your session up to 24 hours before the scheduled time. 
                              Late cancellations may be subject to fees.
                            </p>
                          </div>
                          
                          <Button 
                            className="w-full mt-4"
                            onClick={() => setActiveTab("calendar")}
                          >
                            Back to Calendar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>

      {/* Booking Modal */}
      {selectedMentorId && mentor && (
        <CalendarBookingModal
          mentor={mentor}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  );
}
