import { Button } from "@/components/ui/button";

interface AuthHeroProps {
  setActiveTab: (tab: "login" | "register") => void;
}

export function AuthHero({ setActiveTab }: AuthHeroProps) {
  return (
    <div className="bg-primary/10 dark:bg-gray-800/50 py-12 text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to MentorHub!
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Connect, share, and make a difference in your professional journey!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => setActiveTab("register")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Get Started
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => setActiveTab("login")}
            className="border-primary text-primary hover:bg-primary/10 dark:border-primary-light dark:text-primary-light"
          >
            I Already Have an Account
          </Button>
        </div>
      </div>
    </div>
  );
}
