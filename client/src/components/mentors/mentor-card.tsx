import { User } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Star } from "lucide-react";
import BookingModal from "./booking-modal";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface MentorCardProps {
  mentor: User;
}

export default function MentorCard({ mentor }: MentorCardProps) {
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
  console.log("Feedback for mentor", mentor.id, feedback);

  // Calculate average rating and review count
  const reviewCount = feedback?.length || 0;
  const avgRating = reviewCount > 0 ? (feedback.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / reviewCount).toFixed(1) : "0";
  const rating = parseFloat(avgRating); // Convert to number for calculations
  
  return (
    <>
      <Card className="h-full flex flex-col relative overflow-hidden bg-white dark:bg-gray-800/90 border-gray-100 dark:border-gray-700/50">
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
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12 ring-2 ring-gray-100 dark:ring-gray-700/50">
              <AvatarImage src={mentor.profileImage || undefined} alt={`${mentor.firstName} ${mentor.lastName}`} />
              <AvatarFallback className="bg-primary-light/80 dark:bg-primary-dark/80 text-white">
                {mentor.firstName?.[0]}{mentor.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{mentor.firstName} {mentor.lastName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{mentor.title || "Mentor"}</p>
              <div className="flex items-center mt-1">
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {feedbackLoading ? "Loading..." : `${avgRating} (${reviewCount} review${reviewCount === 1 ? "" : "s"})`}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow relative z-10">
          <p className="text-sm mb-3 text-gray-700 dark:text-gray-300">
            {mentor.bio || `${mentor.firstName} is an experienced professional offering mentorship in various areas.`}
          </p>
          
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Specialties</h4>
          <div className="flex flex-wrap gap-1 mb-4">
            {mentor.specialties && Array.isArray(mentor.specialties) && mentor.specialties.length > 0 ? (
              mentor.specialties.map((specialty, index) => (
                <span key={index} className="text-xs bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-light px-2 py-1 rounded-full border border-secondary/20 dark:border-secondary/30">
                  {specialty}
                </span>
              ))
            ) : (
              <>
                <span className="text-xs bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-light px-2 py-1 rounded-full border border-secondary/20 dark:border-secondary/30">
                  Career Growth
                </span>
                <span className="text-xs bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-light px-2 py-1 rounded-full border border-secondary/20 dark:border-secondary/30">
                  Leadership
                </span>
              </>
            )}
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white"
            onClick={handleConnectClick}
          >
            Schedule Session
          </Button>
        </CardContent>
      </Card>
      
      {showModal && (
        <BookingModal
          mentor={mentor}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
    </>
  );
}
