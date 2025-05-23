import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Availability, insertAvailabilitySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Array of days of the week
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Array of time slots (30-minute intervals)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 20; hour++) {
    const hourStr = hour.toString().padStart(2, "0");
    slots.push(`${hourStr}:00`);
    slots.push(`${hourStr}:30`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

type AvailabilityFormValues = z.infer<typeof insertAvailabilitySchema>;

export default function AvailabilityCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  
  const { data: availabilitySlots, isLoading } = useQuery<Availability[]>({
    queryKey: [`/api/mentors/${user?.id}/availability`],
    enabled: !!user?.id && user?.role === "mentor",
  });
  
  const form = useForm<z.infer<typeof insertAvailabilitySchema>>({
    resolver: zodResolver(
      insertAvailabilitySchema.pick({
        day: true,
        startTime: true,
        endTime: true,
      })
    ),
    defaultValues: {
      day: undefined,
      startTime: undefined,
      endTime: undefined,
    },
  });
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isAddingSlot) {
      form.reset();
    }
  }, [isAddingSlot, form]);
  
  const addAvailabilityMutation = useMutation({
    mutationFn: async (values: Omit<AvailabilityFormValues, "mentorId">) => {
      const data = { ...values, mentorId: user!.id };
      const res = await apiRequest("POST", "/api/availability", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mentors/${user?.id}/availability`] });
      setIsAddingSlot(false);
      toast({
        title: "Availability added",
        description: "Your availability slot has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add availability",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/availability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mentors/${user?.id}/availability`] });
      toast({
        title: "Availability removed",
        description: "The availability slot has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove availability",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof insertAvailabilitySchema>) => {
    // Validate that end time is after start time
    const startHour = parseInt(values.startTime.split(":")[0]);
    const startMinute = parseInt(values.startTime.split(":")[1]);
    const endHour = parseInt(values.endTime.split(":")[0]);
    const endMinute = parseInt(values.endTime.split(":")[1]);
    
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for overlapping time slots
    const hasOverlap = availabilitySlots?.some(slot => {
      if (slot.day !== values.day) return false;
      
      const slotStart = slot.startTime;
      const slotEnd = slot.endTime;
      
      // Check if the new slot overlaps with existing slot
      return (
        (values.startTime >= slotStart && values.startTime < slotEnd) ||
        (values.endTime > slotStart && values.endTime <= slotEnd) ||
        (values.startTime <= slotStart && values.endTime >= slotEnd)
      );
    });
    
    if (hasOverlap) {
      toast({
        title: "Overlapping time slot",
        description: "This time slot overlaps with an existing availability slot.",
        variant: "destructive",
      });
      return;
    }
    
    addAvailabilityMutation.mutate(values);
  };

  if (user?.role !== "mentor") {
    return (
      <div className="p-6 text-center bg-neutral-50 border border-neutral-200 rounded-lg">
        <p className="mb-2 font-medium">Availability Management</p>
        <p className="text-sm text-neutral">
          Only mentors can set their availability for booking sessions.
        </p>
      </div>
    );
  }

  // Get sorted availability slots by day and time
  const getSortedAvailability = () => {
    const dayOrder = { 
      "Monday": 0, 
      "Tuesday": 1, 
      "Wednesday": 2, 
      "Thursday": 3, 
      "Friday": 4, 
      "Saturday": 5, 
      "Sunday": 6 
    };
    
    return [...(availabilitySlots || [])].sort((a, b) => {
      if (a.day !== b.day) {
        return dayOrder[a.day as keyof typeof dayOrder] - dayOrder[b.day as keyof typeof dayOrder];
      }
      return a.startTime.localeCompare(b.startTime);
    });
  };
  
  const sortedAvailability = getSortedAvailability();

  // Format time for display (24h to 12h)
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-foreground dark:text-white">Your Weekly Availability</h3>
          <Button 
            onClick={() => setIsAddingSlot(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-blue-600 dark:text-blue-400 font-medium">Loading your availability...</p>
          </div>
        ) : sortedAvailability.length > 0 ? (
          <div className="rounded-md border">
            <Table className="border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow className="hover:bg-gray-100/50 dark:hover:bg-gray-800/70">
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Day</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Time</TableHead>
                  <TableHead className="text-right text-gray-700 dark:text-gray-300 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAvailability.map((slot) => (
                  <TableRow key={slot.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 border-b border-gray-200 dark:border-gray-700">
                    <TableCell className="font-medium text-gray-800 dark:text-gray-200">{slot.day}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAvailabilityMutation.mutate(slot.id)}
                        disabled={deleteAvailabilityMutation.isPending}
                        className="hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-50 dark:bg-gray-800/50 rounded-md border border-neutral-200 dark:border-gray-700">
            <p className="text-neutral dark:text-gray-300 mb-4">
              You haven't set any availability slots yet. Add time slots to let mentees book sessions with you.
            </p>
            <Button 
              onClick={() => setIsAddingSlot(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Time Slot
            </Button>
          </div>
        )}
        
        <div className="relative rounded-xl overflow-hidden mt-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-600/5 opacity-30" />
          
          <div className="relative">
            <div className="p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.2)] border border-indigo-200 dark:border-indigo-800/30">
              <h3 className="text-sm font-medium mb-3 text-gray-800 dark:text-white flex items-center">
                <span>How it works:</span>
                <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              </h3>
              <ul className="list-disc pl-6 space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                <li>Add weekly recurring time slots when you're available for mentorship sessions</li>
                <li>Mentees will only be able to book sessions during your available time slots</li>
                <li>You'll receive notifications when sessions are booked</li>
                <li>You can remove or adjust your availability at any time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isAddingSlot} onOpenChange={setIsAddingSlot}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Add Availability</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Add a recurring weekly time slot when you're available for mentorship sessions.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {days.map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Start time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={`start-${time}`} value={time}>
                                {formatTime(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="End time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {formatTime(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddingSlot(false)}
                  className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addAvailabilityMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {addAvailabilityMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Availability"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
