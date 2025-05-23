"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, CheckCircle2, Clock, ExternalLink, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format, getDay, isToday, isFuture, isPast, parseISO } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Configure tooltip to be more stable
const tooltipConfig = {
  delayDuration: 300
};

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

interface SessionInfo {
  id: number;
  date: string;
  time: string;
  mentorId: number;
  mentorName: string;
  topic: string;
  status: string;
}

interface CalendarDayProps {
  day: number | string;
  isHeader?: boolean;
  isToday?: boolean;
  sessionInfo?: SessionInfo | null;
  isUpcoming?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isHeader,
  isToday,
  sessionInfo,
  isUpcoming,
  isCompleted,
  onClick
}) => {
  // Style based on the day status
  const getDayStyle = () => {
    if (isHeader) return "text-muted-foreground";
    if (isToday) return "bg-blue-100 dark:bg-blue-900/30 font-bold";
    if (isUpcoming) return "bg-primary/20 hover:bg-primary/30 cursor-pointer";
    if (isCompleted) return "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/40 cursor-pointer";
    return "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800/50";
  };

  return (
    <div
      className={`col-span-1 row-span-1 flex h-10 w-10 items-center justify-center relative ${
        isHeader ? "" : "rounded-xl"
      } ${getDayStyle()}`}
      onClick={isHeader ? undefined : onClick}
    >
      <span className={`font-medium ${isHeader ? "text-xs" : "text-sm"}`}>
        {day}
      </span>
      
      {/* Icons for session status */}
      {isUpcoming && (
        <div className="absolute -top-1 -right-1">
          <Clock className="h-4 w-4 text-primary" />
        </div>
      )}
      {isCompleted && (
        <div className="absolute -top-1 -right-1">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      )}
    </div>
  );
};

interface DashboardCalendarProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onBookNowClick?: () => void;
  menteeId?: number;
}

export function DashboardCalendar({
  title = "Book a mentorship session",
  subtitle = "Schedule time with a mentor to help you grow",
  buttonText = "Book Now",
  onBookNowClick,
  menteeId
}: DashboardCalendarProps) {
  // Use current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();
  
  // Create a date for the first day of the month we're displaying
  const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  const daysInMonth = new Date(
    currentYear,
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, SessionInfo>>({});
  const [hoveredSession, setHoveredSession] = useState<SessionInfo | null>(null);

  // Fetch user's sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/sessions/upcoming"],
    queryFn: async () => {
      try {
        // Fetch all sessions for this mentee
        const res = await apiRequest("GET", "/api/sessions");
        const sessionsData = await res.json();
        console.log("Fetched sessions data:", sessionsData);
        
        // Get mentor information for each session
        const enhancedSessions = await Promise.all(
          sessionsData.map(async (session: any) => {
            try {
              // Fetch mentor details
              const mentorRes = await apiRequest("GET", `/api/mentors/${session.mentorId}`);
              const mentor = await mentorRes.json();
              
              return {
                ...session,
                mentorName: mentor ? `${mentor.firstName} ${mentor.lastName}` : "Mentor"
              };
            } catch (error) {
              console.error(`Error fetching mentor ${session.mentorId}:`, error);
              return {
                ...session,
                mentorName: "Mentor"
              };
            }
          })
        );
        
        return enhancedSessions;
      } catch (error) {
        console.error("Error fetching sessions:", error);
        return [];
      }
    },
    enabled: true,
  });

  // Process sessions data to organize by date
  useEffect(() => {
    if (isLoadingSessions || !sessions) return;
    
    const sessionMap: Record<string, SessionInfo> = {};
    
    sessions.forEach((session: any) => {
      // Only include this mentee's sessions
      if (menteeId && session.menteeId !== menteeId) return;
      
      // Format date to get day number
      const sessionDate = parseISO(session.date);
      const dayNumber = sessionDate.getDate();
      const formattedDate = format(sessionDate, 'yyyy-MM-dd');
      
      // Only include sessions for the current month
      if (sessionDate.getMonth() !== currentDate.getMonth() || 
          sessionDate.getFullYear() !== currentDate.getFullYear()) {
        return;
      }
      
      sessionMap[dayNumber.toString()] = {
        id: session.id,
        date: formattedDate,
        time: session.time,
        mentorId: session.mentorId,
        mentorName: session.mentorName || "Mentor",
        topic: session.topic,
        status: session.status
      };
    });
    
    setSessionsByDate(sessionMap);
  }, [sessions, menteeId, currentDate]);

  const handleDayClick = (day: number) => {
    // If clicking the same day, toggle the selection
    if (selectedDay === day) {
      setSelectedDay(null);
      setHoveredSession(null);
      return;
    }
    
    setSelectedDay(day);
    
    // If this day has a session, show session details
    const sessionInfo = sessionsByDate[day.toString()];
    if (sessionInfo) {
      setHoveredSession(sessionInfo);
    } else {
      setHoveredSession(null);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Add day headers
    for (let i = 0; i < 7; i++) {
      days.push(
        <CalendarDay key={`header-${i}`} day={dayNames[i]} isHeader />
      );
    }
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="col-span-1 row-span-1" />);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(currentYear, currentDate.getMonth(), i);
      const sessionInfo = sessionsByDate[i.toString()];
      const isDayToday = isToday(dateObj);
      
      // Check if the session is upcoming or completed
      let isUpcoming = false;
      let isCompleted = false;
      
      if (sessionInfo) {
        try {
          const sessionDateTime = parseISO(`${sessionInfo.date}T${sessionInfo.time}`);
          isUpcoming = isFuture(sessionDateTime);
          isCompleted = isPast(sessionDateTime) || sessionInfo.status === 'completed';
        } catch (error) {
          console.error(`Error parsing date for session on day ${i}:`, error);
        }
      }
      
      const dayElement = (
        <TooltipProvider key={`day-${i}`}>
          <Tooltip delayDuration={tooltipConfig.delayDuration}>
            <TooltipTrigger asChild>
              <div className="relative">
                <CalendarDay 
                  day={i} 
                  isToday={isDayToday}
                  sessionInfo={sessionInfo}
                  isUpcoming={isUpcoming}
                  isCompleted={isCompleted}
                  onClick={() => handleDayClick(i)}
                />
              </div>
            </TooltipTrigger>
            {sessionInfo && (
              <TooltipContent side="bottom" className="p-3 max-w-xs z-50">
                <div className="space-y-1">
                  <p className="font-medium">{sessionInfo.topic}</p>
                  <p className="text-sm text-muted-foreground">
                    With {sessionInfo.mentorName}
                  </p>
                  <p className="text-sm">
                    {format(parseISO(sessionInfo.date), "MMMM d")} at {" "}
                    {format(parseISO(`2021-01-01T${sessionInfo.time}`), "h:mm a")}
                  </p>
                  <p className={`text-xs uppercase font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${
                    isCompleted ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : 
                    "bg-primary/20 text-primary"
                  }`}>
                    {isCompleted ? "Completed" : sessionInfo.status}
                  </p>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
      
      days.push(dayElement);
    }
    
    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border p-6">
      <div className="flex flex-col space-y-1.5 mb-5">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      
      {/* Session info display with fixed height to prevent layout shifts */}
      <div className="h-[76px] mb-4">
        {hoveredSession ? (
          <div className="p-3 bg-muted/50 rounded-lg border border-border h-full">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{hoveredSession.topic}</h4>
                <p className="text-sm text-muted-foreground">
                  With {hoveredSession.mentorName} on {format(parseISO(hoveredSession.date), "MMMM d")} at {" "}
                  {format(parseISO(`2021-01-01T${hoveredSession.time}`), "h:mm a")}
                </p>
              </div>
              <div className="flex items-center">
                {isPast(parseISO(`${hoveredSession.date}T${hoveredSession.time}`)) || hoveredSession.status === 'completed' ? (
                  <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-primary">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            {isLoadingSessions ? "Loading session data..." : "Click on a day with a session to see details"}
          </div>
        )}
      </div>
      
      {/* No available days message */}
      {!isLoadingSessions && Object.keys(sessionsByDate).length === 0 && (
        <div className="text-amber-600 dark:text-amber-400 text-sm mb-4">
          No available days for booking in this month
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">
            {currentMonth}, {currentYear}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {isLoadingSessions ? "Loading sessions..." : `${Object.keys(sessionsByDate).length} sessions`}
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {renderCalendarDays()}
      </div>
      
      <div className="flex flex-col space-y-2 mt-4">
        <Button 
          onClick={onBookNowClick} 
          className="bg-primary hover:bg-primary-dark text-white"
        >
          {buttonText}
        </Button>
        
        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-primary/20 mr-1"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-1"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-1"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
} 