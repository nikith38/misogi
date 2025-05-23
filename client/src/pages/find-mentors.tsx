import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import TopmateMentorCard from "@/components/mentors/topmate-mentor-card";
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
import { Briefcase, Filter, Loader2, Search, Sparkles } from "lucide-react";

export default function FindMentors() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
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
                  <TopmateMentorCard key={mentor.id} mentor={mentor} />
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
    </>
  );
}
