import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User, InsertSession, insertSessionSchema } from "@shared/schema";
import { format, addDays, parseISO, getDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SuccessModal from "./success-modal";

interface BookingModalProps {
  mentor: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ mentor, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [topic, setTopic] = useState<string>("Career Growth Strategy");
  const [notes, setNotes] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Fetch mentor's availability
  const { data: availability } = useQuery({
    queryKey: ["/api/mentors", mentor.id, "availability"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/mentors/${mentor.id}/availability`);
      return await res.json();
    },
    enabled: !!mentor.id && isOpen,
  });

  // Fetch mentor's sessions for the selected date
  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions", mentor.id, selectedDate && format(selectedDate, "yyyy-MM-dd")],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/sessions");
      return await res.json();
    },
    enabled: !!mentor.id && !!selectedDate && isOpen,
  });

  // Helper to get day name from date
  const getDayName = (date: Date) => {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][getDay(date)];
  };

  // Helper to generate 30-minute intervals between two times ("HH:mm")
  function generateIntervals(start: string, end: string) {
    const intervals = [];
    let [hour, minute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      intervals.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    return intervals;
  }

  // Compute available times for the selected date
  const getAvailableTimes = () => {
    if (!selectedDate || !availability) return [];
    const dayName = getDayName(selectedDate);
    // Get all slots for this day
    const slots = availability.filter((slot: any) => slot.day.toLowerCase() === dayName.toLowerCase());
    // Generate all 30-min intervals for all slots
    let allIntervals: string[] = [];
    slots.forEach((slot: any) => {
      allIntervals = allIntervals.concat(generateIntervals(slot.startTime, slot.endTime));
    });
    // Get booked times for this mentor on this date
    const bookedTimes = (sessions || [])
      .filter((s: any) => s.mentorId === mentor.id && s.date === format(selectedDate, "yyyy-MM-dd"))
      .map((s: any) => s.time);
    // Return only intervals not already booked
    return allIntervals.filter((time: string) => !bookedTimes.includes(time));
  };

  const availableTimes = getAvailableTimes();
  
  const bookSessionMutation = useMutation({
    mutationFn: async (sessionData: InsertSession) => {
      const res = await apiRequest("POST", "/api/sessions", sessionData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/upcoming"] });
      setShowSuccessModal(true);
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || !topic) {
      toast({
        title: "Incomplete booking",
        description: "Please select a date, time, and topic for your session.",
        variant: "destructive",
      });
      return;
    }
    
    const sessionData: InsertSession = {
      mentorId: mentor.id,
      menteeId: user!.id,
      topic,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      notes: notes || undefined,
      status: "pending", // Starts as pending until mentor approves
    };
    
    // Add mentor name for activity feed
    const sessionDataWithMeta = {
      ...sessionData,
      mentorName: `${mentor.firstName} ${mentor.lastName}`
    };
    
    bookSessionMutation.mutate(sessionDataWithMeta);
  };
  
  const closeAll = () => {
    setShowSuccessModal(false);
    onClose();
  };
  
  return (
    <>
      <Dialog open={isOpen && !showSuccessModal} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-4 md:mx-auto max-h-[90vh] overflow-y-auto pb-6">
          <DialogHeader>
            <DialogTitle>Book a Session</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center mb-6">
            <Avatar className="h-14 w-14">
              <AvatarImage src={mentor.profileImage || undefined} alt={`${mentor.firstName} ${mentor.lastName}`} />
              <AvatarFallback className="bg-primary-light text-white">
                {mentor.firstName?.[0]}{mentor.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h4 className="font-semibold">{mentor.firstName} {mentor.lastName}</h4>
              <p className="text-sm text-neutral">{mentor.title} at {mentor.organization}</p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-accent" />
                ))}
                <span className="text-xs text-neutral ml-1">5.0 (26 reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium mb-2">Session Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Career Growth Strategy">Career Growth Strategy</SelectItem>
                <SelectItem value="Leadership Development">Leadership Development</SelectItem>
                <SelectItem value="Technical Skills">Technical Skills</SelectItem>
                <SelectItem value="Portfolio Review">Portfolio Review</SelectItem>
                <SelectItem value="Interview Preparation">Interview Preparation</SelectItem>
                <SelectItem value="Other">Other (specify in notes)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium mb-2">Select Date & Time</Label>
            <div className="bg-neutral-lighter p-4 rounded-md">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border-none p-0"
                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
              />
              
              {selectedDate && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">
                    Available Times on {format(selectedDate, "MMM d")}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={selectedTime === time ? "bg-primary text-white" : ""}
                        onClick={() => setSelectedTime(time)}
                      >
                        {format(parseISO(`2021-01-01T${time}`), "h:mm a")}
                      </Button>
                    ))}
                    {availableTimes.length === 0 && (
                      <p className="col-span-3 text-center text-sm text-neutral">
                        No available times for this date.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <Label className="block text-sm font-medium mb-2">Session Notes (optional)</Label>
            <Textarea
              placeholder="Share what you'd like to discuss..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex justify-between mt-6 pt-4 border-t border-neutral-lighter sticky bottom-0 bg-white">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} disabled={bookSessionMutation.isPending}>
              {bookSessionMutation.isPending ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={closeAll}
          mentorName={`${mentor.firstName} ${mentor.lastName}`}
          sessionDate={selectedDate ? format(selectedDate, "MMMM d") : ""}
          sessionTime={selectedTime ? format(parseISO(`2021-01-01T${selectedTime}`), "h:mm a") : ""}
        />
      )}
    </>
  );
}
