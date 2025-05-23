import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import MentorDashboard from "@/components/dashboard/mentor-dashboard";
import MenteeDashboard from "@/components/dashboard/mentee-dashboard";
import { Helmet } from "react-helmet";
import { Loader2, LayoutDashboard, Calendar, User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { cn, getStaggeredDelay } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  useEffect(() => {
    // Set mounted to true after initial render for animations
    setMounted(true);
    
    // Set active tab based on location
    if (location === "/") {
      setActiveTab("dashboard");
    } else if (location === "/my-sessions") {
      setActiveTab("sessions");
    } else if (location === "/profile") {
      setActiveTab("profile");
    }
  }, [location]);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  // Loading skeleton for dashboard
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen relative">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 10 L 40 10 M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40 M 0 20 L 40 20 M 0 30 L 40 30" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        <Header />
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-background relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse-subtle"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse-subtle"></div>
                  <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse-subtle"></div>
                </div>
              </div>
              <div className="w-full md:w-auto flex mt-4 md:mt-0">
                <div className="h-10 w-72 md:w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse-subtle"></div>
              </div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow animate-pulse-subtle">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
            
            {/* Chart skeleton */}
            <div className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow mb-6 animate-pulse-subtle">
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow animate-pulse-subtle">
                    <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1 space-y-6">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-card dark:bg-slate-800 p-6 rounded-lg shadow animate-pulse-subtle">
                    <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | MentorHub</title>
        <meta 
          name="description" 
          content={user?.role === "mentor" 
            ? "Manage your mentorship sessions and track your impact as a mentor." 
            : "Track your progress and connect with mentors to achieve your goals."
          } 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen relative">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0 10 L 40 10 M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40 M 0 20 L 40 20 M 0 30 L 40 30" stroke="currentColor" strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-background relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome banner with avatar and navigation tabs */}
            <div className={cn(
              "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4",
              "transition-opacity duration-500 ease-in-out",
              mounted ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/20 animate-fade-in">
                  <AvatarImage src={user?.profileImage || undefined} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold font-montserrat text-foreground animate-slide-up" style={{ animationDelay: '100ms' }}>
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-muted-foreground font-inter animate-slide-up" style={{ animationDelay: '150ms' }}>
                    {user?.role === "mentor" 
                      ? "Manage your mentorship sessions and track your impact." 
                      : "Track your progress and connect with mentors to achieve your goals."
                    }
                  </p>
                </div>
              </div>
              
              <Tabs value={activeTab} className="w-full md:w-auto mt-4 md:mt-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <TabsList className="bg-muted w-full md:w-auto border border-primary/20 p-1">
                  <TabsTrigger 
                    value="dashboard" 
                    onClick={() => navigate("/")}
                    className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sessions" 
                    onClick={() => navigate("/my-sessions")}
                    className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Sessions</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profile" 
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Dashboard content with staggered animations */}
            <div className={cn(
              "transition-opacity duration-500 ease-in-out",
              mounted ? "opacity-100" : "opacity-0"
            )}>
              {user?.role === "mentor" ? (
                <MentorDashboard />
              ) : (
                <MenteeDashboard />
              )}
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
