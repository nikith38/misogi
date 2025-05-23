import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { startOfMonth, subMonths, format, parseISO, isWithinInterval, differenceInDays } from "date-fns";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MenteeSessionsChart() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("weekly");
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/mentee", user?.id],
    queryFn: async () => {
      try {
        // In a real app, this would filter by menteeId on the server
        const res = await apiRequest("GET", "/api/sessions");
        const allSessions = await res.json();
        
        // Filter sessions for this mentee
        return allSessions.filter((session: Session) => session.menteeId === user?.id);
      } catch (error) {
        console.error("Error fetching mentee sessions:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
  
  // Generate data for the last 6 months
  const generateMonthlyData = () => {
    if (!sessions || sessions.length === 0) {
      return getEmptyMonthlyData();
    }
    
    const currentDate = new Date();
    const monthsToShow = 6;
    
    // Initialize months data
    const monthsData = Array.from({ length: monthsToShow }, (_, i) => {
      const monthStart = startOfMonth(subMonths(currentDate, monthsToShow - 1 - i));
      const monthEnd = startOfMonth(subMonths(currentDate, monthsToShow - 2 - i));
      
      return {
        name: format(monthStart, "MMM"),
        sessions: 0,
        interval: { start: monthStart, end: monthEnd }
      };
    });
    
    // Count sessions for each month
    monthsData.forEach((monthData) => {
      monthData.sessions = sessions.filter((session: Session) => {
        const sessionDate = parseISO(session.date);
        return isWithinInterval(sessionDate, { start: monthData.interval.start, end: monthData.interval.end });
      }).length;
    });
    
    // Remove the interval property before returning
    return monthsData.map(({ name, sessions }) => ({ name, sessions }));
  };
  
  const getEmptyMonthlyData = () => {
    const currentDate = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const monthStart = startOfMonth(subMonths(currentDate, 5 - i));
      return {
        name: format(monthStart, "MMM"),
        sessions: 0
      };
    });
  };

  // Generate topic distribution data
  const generateTopicData = () => {
    if (!sessions || sessions.length === 0) {
      return [
        { name: "No Data", value: 1, fill: "#94a3b8" }
      ];
    }
    
    // Count sessions by topic
    const topicCounts: Record<string, number> = {};
    sessions.forEach((session: Session) => {
      const topic = session.topic || "Other";
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    
    // Convert to array format for the chart
    return Object.entries(topicCounts).map(([topic, count], index) => ({
      name: topic,
      value: count,
      fill: pieColors[index % pieColors.length]
    }));
  };
  
  // Generate session status data
  const generateStatusData = () => {
    if (!sessions || sessions.length === 0) {
      return [
        { name: "No Data", value: 1, fill: "#94a3b8" }
      ];
    }
    
    // Count sessions by status
    const statusCounts = {
      completed: 0,
      pending: 0,
      upcoming: 0,
      canceled: 0
    };
    
    const today = new Date();
    
    sessions.forEach((session: Session) => {
      const sessionDate = parseISO(session.date);
      
      if (session.status === "completed") {
        statusCounts.completed++;
      } else if (session.status === "canceled") {
        statusCounts.canceled++;
      } else if (sessionDate > today) {
        statusCounts.upcoming++;
      } else {
        statusCounts.pending++;
      }
    });
    
    // Convert to array format for the chart
    return [
      { name: "Completed", value: statusCounts.completed, fill: "#4ade80" },
      { name: "Upcoming", value: statusCounts.upcoming, fill: "#60a5fa" },
      { name: "Pending", value: statusCounts.pending, fill: "#f59e0b" },
      { name: "Canceled", value: statusCounts.canceled, fill: "#ef4444" }
    ].filter(item => item.value > 0);
  };

  const monthlyData = generateMonthlyData();
  
  // Define gradient colors for the chart
  const barColors = [
    '#60a5fa', // blue
    '#4ade80', // green
    '#a78bfa', // purple
    '#f472b6', // pink
    '#fbbf24', // amber
    '#6366f1'  // indigo
  ];
  
  const pieColors = [
    '#60a5fa', // blue
    '#4ade80', // green
    '#a78bfa', // purple
    '#f472b6', // pink
    '#fbbf24', // amber
    '#6366f1', // indigo
    '#2dd4bf', // teal
    '#f43f5e', // rose
    '#8b5cf6'  // violet
  ];

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/5 opacity-30" />
      
      <div className="relative">
        <Card className="col-span-4 dark:bg-slate-800/90 backdrop-blur-sm border-indigo-200 dark:border-indigo-800/30 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
          <div className="absolute inset-0">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
            />
          </div>
          
          <CardHeader>
            <CardTitle className="text-foreground dark:text-white flex items-center">
              <span className="relative">Your Mentorship Analytics</span>
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            </CardTitle>
            <CardDescription className="text-foreground/80 dark:text-white/80">
              Track your mentorship journey and progress
            </CardDescription>
            
            <Tabs defaultValue="monthly" className="w-full mt-2" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="monthly">Monthly Sessions</TabsTrigger>
                <TabsTrigger value="topics">Session Topics</TabsTrigger>
                <TabsTrigger value="status">Session Status</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-primary dark:text-primary/90 font-medium">Loading chart data...</p>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === "monthly" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData} className="[&_.recharts-cartesian-grid-horizontal_line]:opacity-30 [&_.recharts-cartesian-grid-vertical_line]:opacity-30">
                        <defs>
                          {barColors.map((color, index) => (
                            <linearGradient key={`gradient-${index}`} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                              <stop offset="95%" stopColor={color} stopOpacity={0.3} />
                            </linearGradient>
                          ))}
                        </defs>
                        
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: '#f8fafc' }}
                        />
                        <YAxis 
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: '#f8fafc' }}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} sessions`, 'Sessions']}
                          labelFormatter={(label) => `Month of ${label}`}
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569', 
                            color: '#f8fafc',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          }}
                          itemStyle={{ color: '#f8fafc' }}
                          labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                          cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                        />
                        <Bar 
                          dataKey="sessions" 
                          radius={[6, 6, 0, 0]}
                          name="Sessions"
                        >
                          {monthlyData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#barGradient${index % barColors.length})`} 
                              className="drop-shadow-lg"
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  
                  {activeTab === "topics" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateTopicData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} sessions`, 'Sessions']}
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569', 
                            color: '#f8fafc',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  
                  {activeTab === "status" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateStatusData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value} sessions`, 'Sessions']}
                          contentStyle={{ 
                            backgroundColor: '#1e293b', 
                            border: '1px solid #475569', 
                            color: '#f8fafc',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 