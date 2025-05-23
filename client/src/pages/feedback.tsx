import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import FeedbackHistory from "@/components/profile/feedback-history";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export default function Feedback() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Feedback History | MentorHub</title>
        <meta name="description" content="View feedback from your mentorship sessions on MentorHub." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-neutral-default dark:text-white">Feedback History</h1>
              <p className="text-neutral dark:text-gray-300 mt-1">
                {user?.role === "mentor" 
                  ? "View feedback received from your mentees."
                  : "View feedback from your mentorship sessions."}
              </p>
            </div>

            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-600/5 opacity-30" />
              
              <div className="relative">
                <Card className="border-indigo-200 dark:border-indigo-800/30 shadow-[0_0_20px_rgba(99,102,241,0.25)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
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
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="text-foreground dark:text-white flex items-center">
                      <span className="relative">Session Feedback</span>
                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    </CardTitle>
                    <CardDescription className="text-foreground/80 dark:text-white/80">
                      {user?.role === "mentor"
                        ? "Review feedback and ratings from your mentorship sessions."
                        : "Review feedback from your completed mentorship sessions."}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <FeedbackHistory />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
