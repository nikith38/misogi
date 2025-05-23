"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface CalendarDayProps {
  day: number | string;
  isHeader?: boolean;
  isAvailable?: boolean;
  onClick?: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isHeader,
  isAvailable,
  onClick
}) => {
  const className = !isHeader 
    ? isAvailable 
      ? "bg-primary text-primary-foreground cursor-pointer" 
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
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const [availableDays, setAvailableDays] = useState<number[]>([]);

  // Fetch mentor's availability
  const { data: availability } = useQuery({
    queryKey: ["/api/mentors", mentorId, "availability"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/mentors/${mentorId}/availability`);
      return await res.json();
    },
    enabled: !!mentorId,
  });

  // Process availability data to determine which days are available
  useEffect(() => {
    if (!availability || !mentorId) {
      setAvailableDays([]);
      return;
    }

    // Get unique days that the mentor is available
    const availableDayNames = Array.from(new Set(availability.map((slot: any) => slot.day.toLowerCase())));
    
    // Map day names to day numbers in the current month
    const availableDayNumbers: number[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentDate.getMonth(), i);
      const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()];
      if (availableDayNames.includes(dayName)) {
        availableDayNumbers.push(i);
      }
    }
    
    setAvailableDays(availableDayNumbers);
  }, [availability, mentorId, currentDate, currentYear, daysInMonth]);

  const handleDayClick = (day: number) => {
    if (availableDays.includes(day) && onSelectDate) {
      const selectedDate = new Date(currentYear, currentDate.getMonth(), day);
      onSelectDate(selectedDate);
    }
  };

  const renderCalendarDays = () => {
    let days: React.ReactNode[] = [
      ...dayNames.map((day, i) => (
        <CalendarDay key={`header-${day}`} day={day} isHeader />
      )),
      ...Array(firstDayOfWeek).map((_, i) => (
        <div
          key={`empty-start-${i}`}
          className="col-span-1 row-span-1 h-8 w-8"
        />
      )),
      ...Array(daysInMonth)
        .fill(null)
        .map((_, i) => (
          <CalendarDay 
            key={`date-${i + 1}`} 
            day={i + 1} 
            isAvailable={availableDays.includes(i + 1)}
            onClick={() => handleDayClick(i + 1)}
          />
        )),
    ];

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
