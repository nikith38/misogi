import React from "react";
import { cn } from "@/lib/utils";
import { Star, Heart } from "lucide-react";
import { GlowingCard } from "./glowing-card";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  rating?: number;
  delay?: number;
}

function Testimonial({ quote, author, role, avatar, rating = 5, delay = 0 }: TestimonialProps) {
  return (
    <div 
      className={cn(
        "transform transition-all duration-500",
        "animate-appear opacity-0"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <GlowingCard variant="dark">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.7)]" />
          ))}
        </div>
        <blockquote className="text-lg mb-6 text-white font-inter italic">"{quote}"</blockquote>
        <div className="flex items-center gap-4">
          <img 
            src={avatar} 
            alt={author} 
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
          <div>
            <div className="font-semibold font-montserrat text-white">{author}</div>
            <div className="text-sm text-slate-300">{role}</div>
          </div>
        </div>
      </GlowingCard>
    </div>
  );
}

export function TestimonialSection() {
  const testimonials = [
    {
      quote: "MentorHub completely transformed my career path. The mentorship I received helped me land my dream job in tech within just 3 months.",
      author: "Sarah Johnson",
      role: "Frontend Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    },
    {
      quote: "As a mentor, I've found MentorHub to be the perfect platform to give back to the community. The scheduling and feedback tools are exceptional.",
      author: "Michael Chen",
      role: "Senior Software Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    },
    {
      quote: "The structured approach to mentorship on MentorHub has accelerated my learning curve. I've gained more practical knowledge in weeks than I did in years of formal education.",
      author: "Priya Patel",
      role: "Data Scientist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className={cn(
              "text-3xl md:text-4xl font-bold mb-4 font-montserrat flex items-center justify-center gap-2",
              "animate-appear"
            )}
          >
            Success Stories <Heart className="w-12 h-12 text-red-500 fill-red-500 animate-pulse -mt-1" />
          </h2>
          <p 
            className={cn(
              "text-xl text-muted-foreground max-w-2xl mx-auto font-inter",
              "animate-appear opacity-0",
              "[animation-delay:100ms]"
            )}
          >
            Hear from professionals who have transformed their careers with MentorHub
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
              delay={150 + (index * 100)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
