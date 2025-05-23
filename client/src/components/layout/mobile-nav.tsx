import { Link, useLocation } from "wouter";
import { Home, Search, Calendar, User, Clock, Star, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMentee = user?.role === "mentee";

  const NavItem = ({ href, icon: Icon, label, active }: { 
    href: string; 
    icon: typeof Home; 
    label: string; 
    active: boolean; 
  }) => (
    <Link href={href}>
      <div className={cn(
        "flex flex-col items-center py-2 px-3 relative font-inter transition-all duration-200",
        "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2",
        "after:w-1 after:h-1 after:rounded-full after:transition-all after:duration-300",
        active 
          ? "text-primary after:bg-primary after:w-6" 
          : "text-muted-foreground after:bg-transparent hover:text-foreground"
      )}>
        <div className="relative">
          <Icon className={cn(
            "h-6 w-6 transition-transform duration-200",
            active ? "scale-110" : "scale-100"
          )} />
          {active && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse-subtle" />
          )}
        </div>
        <span className={cn(
          "text-xs mt-1 transition-all duration-200",
          active ? "font-medium" : "font-normal"
        )}>
          {label}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-card dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border-t border-border/40 z-50">
      <div className="flex justify-around">
        <NavItem 
          href="/" 
          icon={Home} 
          label="Home" 
          active={location === '/'} 
        />
        
        {isMentee && (
          <NavItem 
            href="/find-mentors" 
            icon={Search} 
            label="Find Mentors" 
            active={location === '/find-mentors'} 
          />
        )}
        
        <NavItem 
          href="/my-sessions" 
          icon={Calendar} 
          label="Sessions" 
          active={location === '/my-sessions'} 
        />
        
        <NavItem 
          href="/book-session" 
          icon={BookOpen} 
          label="Book" 
          active={location === '/book-session'} 
        />
        
        {!isMentee && (
          <NavItem 
            href="/availability" 
            icon={Clock} 
            label="Availability" 
            active={location === '/availability'} 
          />
        )}
        
        <NavItem 
          href="/feedback" 
          icon={Star} 
          label="Feedback" 
          active={location === '/feedback'} 
        />
      </div>
    </div>
  );
}
