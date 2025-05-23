import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Search, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

export function FoodShareStyleHero() {
  const [, navigate] = useLocation();
  
  return (
    <div className="w-full">
      
      {/* Enhanced hero section with gradient background */}
      <div className="w-full bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-accent/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left side content with enhanced typography and spacing */}
          <div className="space-y-8 md:pr-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-3 tracking-tight">
                MentorHub
              </h1>
              <h2 className="text-2xl md:text-3xl font-medium bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                Share Knowledge, Build Careers
              </h2>
            </div>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Connect with mentors to share expertise, reduce uncertainty,
              and strengthen your professional journey in a supportive community.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                className="bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                size="lg"
                onClick={() => navigate("/find-mentors")}
              >
                Find Mentors
              </Button>
              
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 hover:border-primary/80 transition-all hover:-translate-y-1"
                size="lg"
                onClick={() => navigate("/auth")}
              >
                Become a Mentor
              </Button>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground mt-4 bg-foreground/5 py-3 px-4 rounded-full w-fit">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm md:text-base font-medium">2,782 mentors sharing expertise in your field</span>
            </div>
          </div>
          
          {/* Right side image with enhanced styling */}
          <div className="rounded-xl overflow-hidden shadow-2xl transform transition-all hover:scale-[1.02] border-4 border-white dark:border-gray-800">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="Mentorship session" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="w-full bg-background py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How MentorHub Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find the Right Mentor</h3>
              <p className="text-muted-foreground">
                Browse through profiles of experienced professionals and find mentors who match your career goals.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Schedule Sessions</h3>
              <p className="text-muted-foreground">
                Book one-on-one sessions with mentors at times that work for both of you.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Grow Together</h3>
              <p className="text-muted-foreground">
                Receive personalized guidance, build relationships, and accelerate your professional growth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
