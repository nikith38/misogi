import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Glow } from "@/components/ui/glow";

interface CTASectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export function CTASection({ onGetStarted, onLearnMore }: CTASectionProps) {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto bg-card dark:bg-slate-800/80 rounded-2xl p-12 shadow-xl border border-border/10">
        <div className="text-center mb-8">
          <h2 
            className={cn(
              "text-3xl md:text-4xl font-bold mb-4 font-montserrat",
              "animate-appear"
            )}
          >
            Ready to Transform Your Career?
          </h2>
          <p 
            className={cn(
              "text-xl text-muted-foreground max-w-2xl mx-auto font-inter",
              "animate-appear opacity-0",
              "[animation-delay:100ms]"
            )}
          >
            Join thousands of professionals who are accelerating their growth through personalized mentorship
          </p>
        </div>
        
        <div 
          className={cn(
            "flex flex-col sm:flex-row gap-4 justify-center",
            "animate-appear opacity-0",
            "[animation-delay:200ms]"
          )}
        >
          <Button 
            size="lg" 
            className={cn(
              "bg-gradient-to-b from-brand to-brand/90 dark:from-brand/90 dark:to-brand/80",
              "hover:from-brand/95 hover:to-brand/85 dark:hover:from-brand/80 dark:hover:to-brand/70",
              "text-white shadow-lg",
              "transition-all duration-300",
              "text-lg px-8"
            )}
            onClick={onGetStarted}
          >
            Get Started Now
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className={cn(
              "text-foreground/80 dark:text-foreground/70",
              "transition-all duration-300",
              "text-lg px-8"
            )}
            onClick={onLearnMore}
          >
            Learn More
          </Button>
        </div>
      </div>
      
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Glow
          variant="center"
          className="animate-appear-zoom opacity-0 [animation-delay:300ms]"
        />
      </div>
    </section>
  );
}
