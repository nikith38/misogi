import React from "react";
import { cn } from "@/lib/utils";
import { Calendar, GraduationCap, Users, MessageSquare, Clock, Award, Star } from "lucide-react";
import { GlowingCard } from "./glowing-card";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function Feature({ icon, title, description, delay = 0 }: FeatureProps) {
  return (
    <div 
      className={cn(
        "transform transition-all duration-500 hover:-translate-y-1",
        "animate-appear opacity-0"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <GlowingCard variant="dark">
        <div className="flex items-start gap-4">
          <div className="mt-1 bg-primary/30 p-3 rounded-lg text-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-primary/20">
            {React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6 text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" })}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 font-montserrat text-white">{title}</h3>
            <p className="text-slate-300 font-inter">{description}</p>
          </div>
        </div>
      </GlowingCard>
    </div>
  );
}

export function FeatureSection() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Mentorship",
      description: "Connect with industry professionals who provide personalized guidance to accelerate your career growth."
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Smart Scheduling",
      description: "Effortlessly book sessions that fit your calendar with our intuitive scheduling system."
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Skill Development Tracking",
      description: "Monitor your progress with detailed analytics and visualizations of your growth journey."
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Structured Feedback",
      description: "Receive actionable insights after each session to continuously improve your skills."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Management",
      description: "Optimize your learning journey with efficient time management tools and reminders."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Achievement Recognition",
      description: "Earn badges and certificates as you reach milestones in your professional development."
    }
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className={cn(
              "text-3xl md:text-4xl font-bold mb-4 font-montserrat",
              "animate-appear"
            )}
          >
            Why Choose <span className="text-primary">MentorHub</span>?
          </h2>
          <p 
            className={cn(
              "text-xl text-muted-foreground max-w-2xl mx-auto font-inter",
              "animate-appear opacity-0",
              "[animation-delay:100ms]"
            )}
          >
            Our platform offers everything you need for effective mentorship and career growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={150 + (index * 100)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
