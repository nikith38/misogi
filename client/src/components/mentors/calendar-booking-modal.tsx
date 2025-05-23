import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { User, InsertSession } from "@shared/schema";
import { format, parseISO, getDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SuccessModal from "./success-modal";

interface CalendarBookingModalProps {
  mentor: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarBookingModal({ mentor, isOpen, onClose }: CalendarBookingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [topic, setTopic] = useState<string>("Career Growth Strategy");
  const [notes, setNotes] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [showTimeSelection, setShowTimeSelection] = useState(false);
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
  useEffect(() => {
    if (!selectedDate || !availability) {
      setAvailableTimes([]);
      return;
    }
    
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
    const available = allIntervals.filter((time: string) => !bookedTimes.includes(time));
    setAvailableTimes(available);
  }, [selectedDate, availability, sessions, mentor.id]);
  
  // This useEffect ensures we compute available times when a date is selected
  useEffect(() => {
    if (selectedDate) {
      setShowTimeSelection(true);
    }
  }, [selectedDate]);
  
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
    onError: (error: unknown) => {
      toast({
        title: "Booking failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
    setShowTimeSelection(false);
    onClose();
  };
  
  return (
    <>
      <Dialog open={isOpen && !showSuccessModal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl mx-4 md:mx-auto max-h-[90vh] overflow-y-auto pb-6">
          <DialogHeader>
            <DialogTitle>Book a Session with {mentor.firstName} {mentor.lastName}</DialogTitle>
          </DialogHeader>
          
          {!showTimeSelection ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Session Types</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                      <div>
                        <h4 className="font-medium text-foreground">Quick Question</h4>
                        <p className="text-sm text-muted-foreground">15 min</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-foreground">Free</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                      <div>
                        <h4 className="font-medium text-foreground">Career Guidance</h4>
                        <p className="text-sm text-muted-foreground">30 min</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-foreground">$40</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                      <div>
                        <h4 className="font-medium text-foreground">Deep Dive</h4>
                        <p className="text-sm text-muted-foreground">60 min</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-foreground">$75</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
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
              </div>
              
              <div className="md:w-2/3">
                <Calendar 
                  title={`Book time with ${mentor.firstName}`}
                  subtitle="Choose a date to see available times"
                  buttonText="Check Availability"
                  mentorId={mentor.id}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setShowTimeSelection(true);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <h3 className="text-lg font-semibold mb-4">
                    Available Times on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                  </h3>
                  
                  {availableTimes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          className={selectedTime === time ? "bg-primary text-primary-foreground" : ""}
                          onClick={() => setSelectedTime(time)}
                        >
                          {format(parseISO(`2021-01-01T${time}`), "h:mm a")}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-muted/50 rounded-lg text-center">
                      <p className="text-muted-foreground">No available times for this date.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => setShowTimeSelection(false)}
                      >
                        Choose Another Date
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="md:w-1/2">
                  <div className="mb-6">
                    <Label className="block text-sm font-medium mb-2">Session Notes (optional)</Label>
                    <Textarea
                      placeholder="Share what you'd like to discuss..."
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg mb-6">
                    <h4 className="font-medium mb-2">Session Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li><span className="font-medium">Mentor:</span> {mentor.firstName} {mentor.lastName}</li>
                      <li><span className="font-medium">Topic:</span> {topic}</li>
                      <li><span className="font-medium">Date:</span> {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}</li>
                      <li>
                        <span className="font-medium">Time:</span> {selectedTime ? format(parseISO(`2021-01-01T${selectedTime}`), "h:mm a") : "Not selected"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setShowTimeSelection(false)}>
                  Back to Calendar
                </Button>
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={!selectedTime || bookSessionMutation.isPending}
                >
                  {bookSessionMutation.isPending ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
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