import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { LandingPage } from "@/components/landing-page";

export default function AuthPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <Helmet>
        <title>MentorHub - Connect with Mentors & Accelerate Your Career</title>
        <meta 
          name="description" 
          content="MentorHub connects you with industry professionals for personalized mentorship. Book sessions, track your progress, and advance your career with expert guidance." 
        />
      </Helmet>
      
      <LandingPage />
    </>
  );
}
