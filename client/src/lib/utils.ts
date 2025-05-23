import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Apply staggered animation delay to children based on their index
 * @param index Element index
 * @param baseDelay Base delay in ms
 * @returns CSS delay value in ms
 */
export function getStaggeredDelay(index: number, baseDelay: number = 50): string {
  return `${index * baseDelay}ms`
}

/**
 * Format a date string to a more readable format
 * @param dateString Date string in format YYYY-MM-DD
 * @returns Formatted date string (e.g., "Mar 15, 2023")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format a time string to a more readable format
 * @param timeString Time string in format HH:MM
 * @returns Formatted time string (e.g., "3:30 PM")
 */
export function formatTime(timeString: string): string {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":")
  const hour = parseInt(hours, 10)
  const period = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${period}`
}

/**
 * Apply ripple effect to an element on click
 * @param event Click event
 */
export function applyRippleEffect(event: React.MouseEvent<HTMLElement>): void {
  const button = event.currentTarget
  const ripple = document.createElement("span")
  const rect = button.getBoundingClientRect()
  
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.classList.add("ripple-effect")
  
  const existingRipple = button.querySelector(".ripple-effect")
  if (existingRipple) {
    existingRipple.remove()
  }
  
  button.appendChild(ripple)
  
  setTimeout(() => {
    ripple.remove()
  }, 600)
}
