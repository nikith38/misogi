"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format, getDay, parse, isValid } from "date-fns";

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface CalendarDayProps {
  day: number | string;
  isHeader?: boolean;
  isAvailable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isHeader,
  isAvailable,
  isSelected,
  onClick
}) => {
  // Make available days more visually distinct
  const className = !isHeader 
    ? isSelected
      ? "bg-primary text-primary-foreground cursor-pointer ring-2 ring-primary"
      : isAvailable 
        ? "bg-primary/70 hover:bg-primary/80 text-primary-foreground font-bold cursor-pointer" 
        : "text-muted-foreground"
    : "text-muted-foreground";

  return (
    <div
      className={`col-span-1 row-span-1 flex h-8 w-8 items-center justify-center ${
        isHeader ? "" : "rounded-xl"
      } ${className}`}
      onClick={isHeader || !isAvailable ? undefined : onClick}
    >
      <span className={`font-medium ${isHeader ? "text-xs" : "text-sm"}`}>
        {day}
      </span>
    </div>
  );
};

interface BookingCalendarProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onBookNowClick?: () => void;
  mentorId?: number;
  onSelectDate?: (date: Date) => void;
}

export function Calendar({
  title = "Book a mentorship session",
  subtitle = "Schedule time with an experienced mentor",
  buttonText = "Book Now",
  onBookNowClick,
  mentorId,
  onSelectDate
}: BookingCalendarProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  
  // Correctly calculate first day of month and day of week
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  console.log(`DEBUG - Current month: ${currentMonth} ${currentYear}`);
  console.log(`DEBUG - First day of month: ${firstDayOfMonth.toDateString()}`);
  console.log(`DEBUG - First day of week index: ${firstDayOfWeek}`);
  
  const daysInMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Fetch mentor's availability
  const { data: availability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ["/api/mentors", mentorId, "availability"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/mentors/${mentorId}/availability`);
      const data = await res.json();
      console.log("Availability data:", data);
      return data;
    },
    enabled: !!mentorId,
  });

  // Fetch mentor's existing sessions to check for conflicts
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/sessions", mentorId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/sessions?mentorId=${mentorId}`);
      const data = await res.json();
      console.log("Sessions data:", data);
      return data;
    },
    enabled: !!mentorId,
  });

  // Process availability data to determine which days are available
  useEffect(() => {
    if (isLoadingAvailability || isLoadingSessions) {
      console.log("Still loading availability or sessions data");
      return;
    }
    
    if (!availability || !mentorId) {
      console.log("No availability data or mentorId");
      setAvailableDays([]);
      return;
    }

    // Ensure we have availability data
    if (!Array.isArray(availability) || availability.length === 0) {
      console.log("Availability array is empty");
      setAvailableDays([]);
      return;
    }

    // Clean debugging output to understand the data better
    console.log("DEBUG - Raw availability records:", availability);
    
    // Get the 'real' day names in the data to identify any issues
    const realDayNames = Array.from(new Set(availability.map((slot: any) => slot.day)));
    console.log("DEBUG - Unique day names in data:", realDayNames);

    // Map of standard day names to their correct day indices (0 = Sunday, 1 = Monday, etc.)
    const dayMap: Record<string, number> = {
      "sunday": 0, 
      "monday": 1, 
      "tuesday": 2, 
      "wednesday": 3, 
      "thursday": 4, 
      "friday": 5, 
      "saturday": 6
    };
    
    // Create an array of day indices when the mentor is available (0 = Sunday, 1 = Monday, etc.)
    const availableDayIndices: number[] = [];
    
    // First identify all the day indices the mentor is available
    availability.forEach((slot: any) => {
      if (!slot.day) return;
      
      const dayName = typeof slot.day === 'string' ? slot.day.toLowerCase() : '';
      const dayIndex = dayMap[dayName];
      
      console.log(`DEBUG - Processing day "${slot.day}" → lowercase: "${dayName}" → index: ${dayIndex}`);
      
      if (dayIndex !== undefined && !availableDayIndices.includes(dayIndex)) {
        availableDayIndices.push(dayIndex);
      }
    });

    console.log("DEBUG - Available day indices:", availableDayIndices);

    // Now check which days in the current month match these weekday indices
    const availableDayNumbers: number[] = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get all booked sessions for this mentor
    const bookedSessions = sessions ? sessions.filter((s: any) => 
      s.mentorId === mentorId && 
      s.status !== 'rejected' && 
      s.status !== 'canceled'
    ) : [];
    
    // Check each day in the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dayIndex = date.getDay(); // 0-6 representing Sun-Sat
      const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
      
      console.log(`DEBUG - Day ${i} is a ${dayName} (index: ${dayIndex})`);
      
      // Skip if mentor isn't available on this day of the week
      if (!availableDayIndices.includes(dayIndex)) {
        continue;
      }
      
      // Get slots for this day of the week
      const daySlots = availability.filter((slot: any) => {
        // Convert the slot's day name to its index
        if (!slot.day) return false;
        const slotDayName = typeof slot.day === 'string' ? slot.day.toLowerCase() : '';
        const slotDayIndex = dayMap[slotDayName];
        return slotDayIndex === dayIndex;
      });
      
      console.log(`DEBUG - Day ${i} (${dayName}) matching slots: ${daySlots.length}`);
      
      if (daySlots.length === 0) continue;
      
      // Format current date to match session date format 'YYYY-MM-DD'
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Check if all slots for this day are booked
      const bookedTimesForDay = bookedSessions
        .filter((s: any) => s.date === formattedDate)
        .map((s: any) => s.time);
      
      // Count available time slots for this day
      let hasAvailableSlot = false;
      
      for (const slot of daySlots) {
        // Generate 30-minute intervals for this slot
        const intervals = generateTimeIntervals(slot.startTime, slot.endTime);
        
        // Check if any interval is available
        for (const interval of intervals) {
          if (!bookedTimesForDay.includes(interval)) {
            hasAvailableSlot = true;
            break;
          }
        }
        
        if (hasAvailableSlot) break;
      }
      
      if (hasAvailableSlot) {
        availableDayNumbers.push(i);
      }
    }
    
    console.log("DEBUG - Final available days:", availableDayNumbers);
    setAvailableDays(availableDayNumbers);
    
    // Store debug info
    setDebugInfo({
      availableDayIndices,
      availableDayNumbers,
      bookedSessions: bookedSessions || [],
      rawAvailability: availability
    });
  }, [availability, sessions, mentorId, currentDate, daysInMonth, isLoadingAvailability, isLoadingSessions]);

  // Helper function to generate time intervals
  const generateTimeIntervals = (startTime: string, endTime: string) => {
    const intervals = [];
    let [hour, minute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      intervals.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    
    return intervals;
  };

  const handleDayClick = (day: number) => {
    if (availableDays.includes(day)) {
      setSelectedDay(day);
      
      if (onSelectDate) {
        const selectedDate = new Date(currentYear, currentDate.getMonth(), day);
        onSelectDate(selectedDate);
      }
    }
  };

  const renderCalendarDays = () => {
    let days: React.ReactNode[] = [
      ...dayNames.map((day, i) => (
        <CalendarDay key={`header-${day}`} day={day} isHeader />
      )),
    ];
    
    // Debug the first day of week placement
    console.log(`DEBUG - Placing ${firstDayOfWeek} empty cells before day 1`);
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-start-${i}`}
          className="col-span-1 row-span-1 h-8 w-8"
        />
      );
    }
    
    // Add the actual dates for the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <CalendarDay 
          key={`date-${i}`} 
          day={i} 
          isAvailable={availableDays.includes(i)}
          isSelected={selectedDay === i}
          onClick={() => handleDayClick(i)}
        />
      );
    }

    return days;
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 hover:bg-primary/5 dark:hover:bg-primary/10 overflow-hidden h-auto">
      <div className="grid h-full gap-5">
        <div className="">
          <h2 className="mb-4 text-lg md:text-3xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="mb-2 text-xs md:text-md text-muted-foreground">
            {subtitle}
          </p>
          {/* Display loading state */}
          {(isLoadingAvailability || isLoadingSessions) && (
            <div className="text-sm text-muted-foreground mb-2">
              Loading availability...
            </div>
          )}
          {/* Display when no days are available */}
          {!isLoadingAvailability && !isLoadingSessions && availableDays.length === 0 && (
            <div className="text-sm text-amber-500 mb-2">
              No available days for booking in this month
            </div>
          )}
          {/* Display available days */}
          {!isLoadingAvailability && !isLoadingSessions && availableDays.length > 0 && (
            <div className="text-xs text-muted-foreground mb-2">
              <span className="font-medium text-blue-600 dark:text-blue-400">Available days:</span> {availableDays.join(', ')}
            </div>
          )}
          <Button 
            className="mt-3 rounded-2xl bg-primary hover:bg-primary/90"
            onClick={onBookNowClick}
          >
            {buttonText}
          </Button>
        </div>
        <div className="transition-all duration-500 ease-out">
          <div>
            <div className="h-full w-full md:w-[550px] rounded-[24px] border border-border p-2 transition-colors duration-100 group-hover:border-primary">
              <div
                className="h-full rounded-2xl border-2 border-border/10 p-3 bg-card"
                style={{ boxShadow: "0px 2px 1.5px 0px rgba(0,0,0,0.05) inset" }}
              >
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">
                      {currentMonth}, {currentYear}
                    </span>
                  </p>
                  <span className="h-1 w-1 rounded-full">&nbsp;</span>
                  <p className="text-xs text-muted-foreground">30 min call</p>
                </div>
                <div className="mt-4 grid grid-cols-7 grid-rows-5 gap-2 px-4">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  height?: string;
  rowSpan?: number;
  colSpan?: number;
  className?: string;
  showHoverGradient?: boolean;
  hideOverflow?: boolean;
  linkTo?: string;
}

export function BentoCard({
  children,
  height = "h-auto",
  rowSpan = 8,
  colSpan = 7,
  className = "",
  showHoverGradient = true,
  hideOverflow = true,
  linkTo,
}: BentoCardProps) {
  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-border bg-card p-6",
        "hover:bg-primary/5 dark:hover:bg-primary/10",
        hideOverflow && "overflow-hidden",
        height,
        `row-span-${rowSpan}`,
        `col-span-${colSpan}`,
        className
      )}
    >
      {linkTo && (
        <div className="absolute bottom-4 right-6 z-[999] flex h-12 w-12 rotate-6 items-center justify-center rounded-full bg-background opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-[-8px] group-hover:rotate-0 group-hover:opacity-100">
          <ExternalLink className="h-6 w-6 text-primary" />
        </div>
      )}
      {showHoverGradient && (
        <div className="user-select-none pointer-events-none absolute inset-0 z-30 bg-gradient-to-tl from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100"></div>
      )}
      {children}
    </div>
  );

  if (linkTo) {
    return linkTo.startsWith("/") ? (
      <a href={linkTo} className="block">
        {cardContent}
      </a>
    ) : (
      <a
        href={linkTo}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}
