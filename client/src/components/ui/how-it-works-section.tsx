import React from "react";
import { cn } from "@/lib/utils";
import { Search, Calendar, Video, MessageSquare, Star } from "lucide-react";
import { GlowingCard } from "./glowing-card";

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  number: number;
  delay?: number;
}

function Step({ icon, title, description, number, delay = 0 }: StepProps) {
  return (
    <div 
      className={cn(
        "animate-appear opacity-0"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <GlowingCard className="overflow-visible" variant="dark">
        <div className="relative flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-primary/30">
                {React.cloneElement(icon as React.ReactElement, { className: "h-8 w-8 drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]" })}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.7)] border border-white/20">
                {number}
              </div>
            </div>
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

export function HowItWorksSection() {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Find Your Perfect Mentor",
      description: "Browse our curated network of industry professionals and filter by expertise, experience, and availability to find your ideal mentor match.",
      number: 1
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Schedule Your Sessions",
      description: "Use our intuitive scheduling system to book mentorship sessions that fit perfectly into both your calendar and your mentor's availability.",
      number: 2
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Connect and Learn",
      description: "Meet with your mentor via our integrated video platform for personalized guidance, career advice, and skill development.",
      number: 3
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Get Structured Feedback",
      description: "Receive detailed feedback after each session to track your progress and identify areas for continued growth and improvement.",
      number: 4
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Grow and Achieve",
      description: "Apply your learnings, track your progress, and celebrate your achievements as you advance in your professional journey.",
      number: 5
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
            How MentorHub Works
          </h2>
          <p 
            className={cn(
              "text-xl text-muted-foreground max-w-2xl mx-auto font-inter",
              "animate-appear opacity-0",
              "[animation-delay:100ms]"
            )}
          >
            A simple, effective process to connect with mentors and accelerate your career growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Step 
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              number={step.number}
              delay={150 + (index * 100)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
