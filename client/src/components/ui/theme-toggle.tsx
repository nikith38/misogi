"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme as useNextTheme } from "next-themes"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)
  
  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Determine if dark mode is active
  const isDark = mounted ? resolvedTheme === "dark" : true
  
  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  // Return empty div with same dimensions to avoid layout shift during hydration
  if (!mounted) {
    return <div className={cn("flex w-16 h-8", className)} />
  }

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark 
          ? "bg-primary/20 border border-primary/30" 
          : "bg-amber-100 border border-amber-200",
        className
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 shadow-md",
            isDark 
              ? "transform translate-x-0 bg-primary" 
              : "transform translate-x-8 bg-amber-400"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-4 h-4 text-white" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-4 h-4 text-amber-900" 
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark 
              ? "bg-transparent" 
              : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun 
              className="w-4 h-4 text-primary/60" 
              strokeWidth={1.5}
            />
          ) : (
            <Moon 
              className="w-4 h-4 text-amber-600" 
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  )
}
