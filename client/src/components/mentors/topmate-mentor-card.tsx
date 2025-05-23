import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Calendar, ExternalLink, Star, Verified } from "lucide-react";
import CalendarBookingModal from "./calendar-booking-modal";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopmateMentorCardProps {
  mentor: User;
}

export default function TopmateMentorCard({ mentor }: TopmateMentorCardProps) {
  const [showModal, setShowModal] = useState(false);
  
  const handleConnectClick = () => {
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

  // Fetch real feedback for this mentor
  const { data: feedback, isLoading: feedbackLoading } = useQuery({
    queryKey: ["/api/mentors", mentor.id, "feedback"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/mentors/${mentor.id}/feedback`);
      return await res.json();
    },
    enabled: !!mentor.id,
  });

  // Fetch availability for this mentor
  const { data: availability } = useQuery({
    queryKey: ["/api/mentors", mentor.id, "availability"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/mentors/${mentor.id}/availability`);
      return await res.json();
    },
    enabled: !!mentor.id,
  });

  // Calculate average rating and review count
  const reviewCount = feedback?.length || 0;
  const avgRating = reviewCount > 0 ? (feedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / reviewCount).toFixed(1) : "0";
  const rating = parseFloat(avgRating);
  
  // Get next available slot (simplified)
  const getNextAvailableSlot = () => {
    if (!availability || availability.length === 0) {
      return "Contact to schedule";
    }
    
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = dayNames[today.getDay()];
    
    const availableToday = availability.find((slot: any) => slot.day === todayName);
    if (availableToday) {
      return `Today, ${availableToday.startTime}`;
    }
    
    // Find next available day
    const nextAvailable = availability[0];
    return `${nextAvailable.day}, ${nextAvailable.startTime}`;
  };
  
  return (
    <>
      <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 hover:shadow-lg transition-shadow duration-300">
        {/* Top gradient banner - Topmate style */}
        <div className="h-3 bg-gradient-to-r from-primary via-primary-light to-secondary"></div>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Profile info */}
            <div className="md:w-2/5">
              <div className="flex flex-col items-center text-center mb-4">
                <Avatar className="h-24 w-24 mb-3 ring-4 ring-primary/10 dark:ring-primary-dark/20">
                  <AvatarImage src={mentor.profileImage || undefined} alt={`${mentor.firstName} ${mentor.lastName}`} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {mentor.firstName} {mentor.lastName}
                    </h3>
                    <Verified className="h-4 w-4 text-primary" />
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300">{mentor.title || "Mentor"}</p>
                  
                  {mentor.organization && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {mentor.organization}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center mt-3">
                  <div className="flex mr-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4", 
                          i < Math.round(rating) 
                            ? "fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300" 
                            : "text-gray-300 dark:text-gray-600"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {feedbackLoading ? "Loading..." : `${avgRating} (${reviewCount})`}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4">
                    {mentor.bio || `${mentor.firstName} is an experienced professional offering mentorship in various areas.`}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.specialties && Array.isArray(mentor.specialties) && mentor.specialties.length > 0 ? (
                      mentor.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="bg-secondary/10 hover:bg-secondary/20 text-secondary">
                          {specialty}
                        </Badge>
                      ))
                    ) : (
                      <>
                        <Badge variant="secondary" className="bg-secondary/10 hover:bg-secondary/20 text-secondary">
                          Career Growth
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary/10 hover:bg-secondary/20 text-secondary">
                          Leadership
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Session info */}
            <div className="md:w-3/5 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
              <div className="space-y-5">
                {/* Next available */}
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Next available: {getNextAvailableSlot()}</span>
                </div>
                
                {/* Testimonial preview */}
                {feedback && feedback.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Feedback</h4>
                    <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 italic text-sm text-gray-600 dark:text-gray-400">
                      "{feedback[0]?.comment || "Great mentor, very helpful!"}"
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="space-y-2 pt-2">
                  <Button 
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                    onClick={handleConnectClick}
                  >
                    Book a Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showModal && (
        <CalendarBookingModal
          mentor={mentor}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
    </>
  );
}
