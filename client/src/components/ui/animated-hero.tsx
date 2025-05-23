import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const [, navigate] = useLocation();
  
  const titles = useMemo(
    () => ["growth", "success", "guidance", "expertise", "excellence"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 pt-16">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">

          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-regular">
              <span className="text-primary">Accelerate your</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Connect with experienced mentors who can guide you through your professional journey with personalized advice and feedback.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button 
              size="lg" 
              className="gap-4" 
              variant="outline"
              onClick={() => navigate("/find-mentors")}
            >
              Find Mentors <Users className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              className="gap-4"
              onClick={() => navigate("/auth")}
            >
              Get Started <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
