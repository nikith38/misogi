import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link } from "wouter";

interface AuthNavbarProps {
  activeTab: "login" | "register";
  setActiveTab: (tab: "login" | "register") => void;
}

export function AuthNavbar({ activeTab, setActiveTab }: AuthNavbarProps) {
  return (
    <header className="bg-primary dark:bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/auth">
                <span className="text-2xl font-bold cursor-pointer">MentorHub</span>
              </Link>
            </div>
            <nav className="hidden md:ml-10 md:flex space-x-8">
              <a href="#features" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium">Features</a>
              <a href="#how-it-works" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium">How It Works</a>
              <a href="#testimonials" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium">Testimonials</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant={activeTab === "login" ? "secondary" : "ghost"} 
              className="text-white" 
              onClick={() => setActiveTab("login")}
            >
              Log In
            </Button>
            <Button 
              variant={activeTab === "register" ? "secondary" : "ghost"} 
              className="text-white" 
              onClick={() => setActiveTab("register")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
