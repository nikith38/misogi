"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "./glowing-effect";

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  spread?: number;
  proximity?: number;
  inactiveZone?: number;
  variant?: "default" | "dark";
}

export function GlowingCard({
  children,
  className,
  borderWidth = 2,
  spread = 40,
  proximity = 64,
  inactiveZone = 0.01,
  variant = "default",
}: GlowingCardProps) {
  return (
    <div className={cn("relative rounded-xl", className)}>
      <GlowingEffect
        spread={spread}
        glow={true}
        disabled={false}
        proximity={proximity}
        inactiveZone={inactiveZone}
        borderWidth={borderWidth}
      />
      <div className={cn(
        "relative z-10 rounded-xl border border-border p-6 shadow-sm",
        variant === "default" ? "bg-background/95 backdrop-blur-sm" : "bg-slate-800/95 backdrop-blur-sm text-white"
      )}>
        {children}
      </div>
    </div>
  );
}
