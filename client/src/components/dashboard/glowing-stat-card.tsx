import React from "react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface GlowingStatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  footer: React.ReactNode;
  color: "blue" | "green" | "purple" | "amber" | "pink";
  className?: string;
}

const colorVariants = {
  blue: {
    background: "from-blue-500/20 to-blue-600/5",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    shadow: "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    border: "border-blue-200 dark:border-blue-800/30",
    gradient: `radial-gradient(circle, #60a5fa 10%, #60a5fa00 20%),
               radial-gradient(circle at 40% 40%, #3b82f6 5%, #3b82f600 15%),
               radial-gradient(circle at 60% 60%, #2563eb 10%, #2563eb00 20%)`
  },
  green: {
    background: "from-green-500/20 to-green-600/5",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    shadow: "shadow-[0_0_20px_rgba(34,197,94,0.25)]",
    border: "border-green-200 dark:border-green-800/30",
    gradient: `radial-gradient(circle, #4ade80 10%, #4ade8000 20%),
               radial-gradient(circle at 40% 40%, #22c55e 5%, #22c55e00 15%),
               radial-gradient(circle at 60% 60%, #16a34a 10%, #16a34a00 20%)`
  },
  purple: {
    background: "from-purple-500/20 to-purple-600/5",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    shadow: "shadow-[0_0_20px_rgba(147,51,234,0.25)]",
    border: "border-purple-200 dark:border-purple-800/30",
    gradient: `radial-gradient(circle, #c084fc 10%, #c084fc00 20%),
               radial-gradient(circle at 40% 40%, #a855f7 5%, #a855f700 15%),
               radial-gradient(circle at 60% 60%, #9333ea 10%, #9333ea00 20%)`
  },
  amber: {
    background: "from-amber-500/20 to-amber-600/5",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    shadow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    border: "border-amber-200 dark:border-amber-800/30",
    gradient: `radial-gradient(circle, #fbbf24 10%, #fbbf2400 20%),
               radial-gradient(circle at 40% 40%, #f59e0b 5%, #f59e0b00 15%),
               radial-gradient(circle at 60% 60%, #d97706 10%, #d9770600 20%)`
  },
  pink: {
    background: "from-pink-500/20 to-pink-600/5",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    shadow: "shadow-[0_0_20px_rgba(236,72,153,0.25)]",
    border: "border-pink-200 dark:border-pink-800/30",
    gradient: `radial-gradient(circle, #f472b6 10%, #f472b600 20%),
               radial-gradient(circle at 40% 40%, #ec4899 5%, #ec489900 15%),
               radial-gradient(circle at 60% 60%, #db2777 10%, #db277700 20%)`
  }
};

export function GlowingStatCard({ 
  icon, 
  title, 
  value, 
  footer, 
  color, 
  className 
}: GlowingStatCardProps) {
  const colorStyle = colorVariants[color];
  
  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] transform-gpu",
      className
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30",
        colorStyle.background
      )} />
      
      <div className="relative z-10">
        <div className={cn(
          "relative rounded-xl border p-6",
          "bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm",
          colorStyle.border,
          colorStyle.shadow
        )}>
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
            variant="default"
          />
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-foreground/80 dark:text-white/80 text-sm font-medium">{title}</p>
              <p className="text-2xl font-bold mt-1 text-foreground dark:text-white">{value}</p>
            </div>
            <div className={cn(
              "p-3 rounded-md flex items-center justify-center",
              colorStyle.iconBg,
              "shadow-[0_0_10px_rgba(99,102,241,0.3)]"
            )}>
              {React.cloneElement(icon as React.ReactElement, { 
                className: cn("h-6 w-6", colorStyle.iconColor, "drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]") 
              })}
            </div>
          </div>
          
          <div className="mt-4 text-primary dark:text-primary/90 font-medium">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
