import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, UserCircle2, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md border-b border-primary/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-primary font-bold text-xl cursor-pointer drop-shadow-sm">MentorHub</span>
            </Link>
          </div>
          <nav className="hidden md:ml-10 md:flex space-x-6">
            <Link href="/">
              <div className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 ${location === '/' 
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
                Dashboard
              </div>
            </Link>
            {user?.role === "mentee" && (
              <Link href="/find-mentors">
                <div className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 ${location === '/find-mentors' 
                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                  : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
                  Find Mentors
                </div>
              </Link>
            )}
            <Link href="/my-sessions">
              <div className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 ${location === '/my-sessions' 
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
                My Sessions
              </div>
            </Link>
            <Link href="/book-session">
              <div className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 ${location === '/book-session' 
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
                Book Session
              </div>
            </Link>

            {user?.role === 'mentor' && (
              <Link href="/availability">
                <div className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 ${location === '/availability' 
                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                  : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
                  Availability
                </div>
              </Link>
            )}
            <Link href="/feedback">
              <div className={`px-3 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 ${location === '/feedback' 
                ? 'bg-primary text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                : 'text-foreground/80 hover:text-primary hover:bg-primary/10'}`}>
                Feedback
              </div>
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user?.profileImage || undefined} alt={user?.firstName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                      <UserCircle2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src={user?.profileImage || undefined} alt={user?.firstName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                      <UserCircle2 className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="ml-2 font-medium text-sm hidden md:block text-gray-800 dark:text-gray-200">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
