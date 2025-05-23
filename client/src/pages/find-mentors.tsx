import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Calendar, Filter, Loader2, Search, Sparkles, Star, Verified } from "lucide-react";
import CalendarBookingModal from "@/components/mentors/calendar-booking-modal";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

export default function FindMentors() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const { data: mentors, isLoading } = useQuery<User[]>({
    queryKey: ["/api/mentors"],
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredMentors = mentors?.filter(mentor => {
    if (mentor.role !== "mentor") return false;

    // Combine all searchable fields
    const fields = [
      mentor.firstName,
      mentor.lastName,
      mentor.title || "",
      mentor.organization || "",
      mentor.bio || "",
      ...(Array.isArray(mentor.specialties) ? mentor.specialties : [])
    ].join(" ").toLowerCase();

    return fields.includes(normalizedQuery);
  });

  // Sort mentors
  const sortedMentors = [...(filteredMentors || [])].sort((a, b) => {
    if (sortBy === "name") {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    } else if (sortBy === "organization") {
      return (a.organization || "").localeCompare(b.organization || "");
    }
    return 0;
  });
  
  const handleBookSession = (mentor: User) => {
    setSelectedMentor(mentor);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedMentor(null);
  };

  if (user?.role !== "mentee") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p className="mb-8">This page is only accessible to mentees. As a mentor, you provide mentorship rather than seeking it.</p>
            <Button onClick={() => window.location.href = "/"}>Return to Dashboard</Button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Find Mentors | MentorHub</title>
        <meta name="description" content="Browse and connect with professional mentors that match your career goals and interests." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-gray-50 dark:bg-gray-900">
          {/* Hero section with gradient background - Topmate style */}
          <div className="bg-gradient-to-r from-primary/90 via-primary to-primary-dark dark:from-primary-dark dark:to-primary text-white py-10 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Mentor</h1>
                <p className="text-white/90 text-lg mb-6">
                  Connect with experienced professionals who can guide you through your career journey.
                </p>
                
                <div className="bg-white/10 backdrop-blur-sm p-1 rounded-lg flex flex-col sm:flex-row gap-2 max-w-2xl">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-white/70" />
                    <Input
                      placeholder="Search by name, expertise, or organization..."
                      className="pl-10 h-12 bg-white/20 border-transparent placeholder-white/70 text-white w-full focus:bg-white/30 focus:border-white/30"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="h-12 px-6 bg-white text-primary hover:bg-white/90 hover:text-primary-dark"
                  >
                    Find Mentors
                  </Button>
                </div>
                
                {/* Popular categories */}
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="text-sm text-white/80 mr-2 pt-1">Popular:</span>
                  {["Career Growth", "Leadership", "Tech", "Product", "Marketing"].map((category) => (
                    <Badge 
                      key={category}
                      className="bg-white/20 hover:bg-white/30 text-white border-transparent cursor-pointer"
                      onClick={() => setSearchQuery(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters and sorting */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-gray-200 dark:border-gray-700 cursor-pointer">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Organization</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-gray-200 dark:border-gray-700 cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Expertise</span>
                </Badge>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 px-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="name" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Sort by Name</SelectItem>
                    <SelectItem value="organization" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Sort by Organization</SelectItem>
                    <SelectItem value="rating" className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700">Sort by Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-light" />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Loading mentors...</span>
              </div>
            ) : sortedMentors && sortedMentors.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedMentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} onBook={handleBookSession} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800/90 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700/50">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No mentors found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchQuery
                    ? `No mentors match your search for "${searchQuery}"`
                    : "There are no mentors available at this time."}
                </p>
                {searchQuery && (
                  <Button 
                    onClick={() => setSearchQuery("")}
                    className="bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary text-white"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>
        
        <MobileNav />
      </div>
      
      {showModal && selectedMentor && (
        <CalendarBookingModal
          mentor={selectedMentor}
          isOpen={showModal}
          onClose={closeModal}
        />
      )}
    </>
  );
}

interface MentorCardProps {
  mentor: User;
  onBook: (mentor: User) => void;
}

function MentorCard({ mentor, onBook }: MentorCardProps) {
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
                    mentor.specialties.map((specialty: string, index: number) => (
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
          
          {/* Right column - Bio and feedback info */}
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
              
              {/* Bio excerpt - if not already shown in the left column */}
              {mentor.bio && mentor.bio.length > 150 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">More About {mentor.firstName}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {mentor.bio.substring(0, 200)}...
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <Button 
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                  onClick={() => onBook(mentor)}
                >
                  Book a Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
