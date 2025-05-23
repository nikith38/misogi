"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CalendarDay: React.FC<{ day: number | string; isHeader?: boolean }> = ({
  day,
  isHeader,
}) => {
  const randomBgWhite =
    !isHeader && Math.random() < 0.3
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground";

  return (
    <div
      className={`col-span-1 row-span-1 flex h-8 w-8 items-center justify-center ${
        isHeader ? "" : "rounded-xl"
      } ${randomBgWhite}`}
    >
      <span className={`font-medium ${isHeader ? "text-xs" : "text-sm"}`}>
        {day}
      </span>
    </div>
  );
};

interface BookingCalendarProps {
  bookingLink?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export function BookingCalendar({
  bookingLink = "/my-sessions",
  title = "Any questions about mentorship?",
  subtitle = "Feel free to reach out to me!",
  buttonText = "Book Now"
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
        .map((_, i) => <CalendarDay key={`date-${i + 1}`} day={i + 1} />),
    ];

    return days;
  };

  return (
    <BentoCard height="h-auto" linkTo={bookingLink}>
      <div className="grid h-full gap-5">
        <div className="">
          <h2 className="mb-4 text-lg md:text-3xl font-semibold text-foreground">
            {title}
          </h2>
          <p className="mb-2 text-xs md:text-md text-muted-foreground">
            {subtitle}
          </p>
          <Button className="mt-3 rounded-2xl bg-primary hover:bg-primary/90">
            {buttonText}
          </Button>
        </div>
        <div className="transition-all duration-500 ease-out md:group-hover:-right-12 md:group-hover:top-5">
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
    </BentoCard>
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
