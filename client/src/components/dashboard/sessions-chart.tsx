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
  Cell
} from "recharts";
import { startOfWeek, addWeeks, format, parseISO, isWithinInterval } from "date-fns";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export default function SessionsChart() {
  const { user } = useAuth();
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  console.log("Sessions for chart:", sessions);
  
  // Generate data for the last 6 weeks
  const generateWeeklyData = () => {
    if (!sessions || sessions.length === 0) {
      return getEmptyData();
    }
    
    const currentDate = new Date();
    const weeksToShow = 6;
    
    // Calculate the start of the oldest week we want to show
    const oldestWeekStart = startOfWeek(addWeeks(currentDate, -(weeksToShow - 1)));
    
    // Initialize weeks data
    const weeksData = Array.from({ length: weeksToShow }, (_, i) => {
      const weekStart = startOfWeek(addWeeks(oldestWeekStart, i));
      const weekEnd = addWeeks(weekStart, 1);
      
      return {
        name: format(weekStart, "MMM d"),
        sessions: 0,
        interval: { start: weekStart, end: weekEnd }
      };
    });
    
    // Count sessions for each week
    const countSessionsInWeek = (startDate: Date, endDate: Date, session: Session) => {
      if (!sessions) return 0;
      const sessionDate = parseISO(session.date);
      return isWithinInterval(sessionDate, { start: startDate, end: endDate }) ? 1 : 0;
    };

    weeksData.forEach((weekData) => {
      weekData.sessions = sessions.reduce((acc: number, session: Session) => acc + countSessionsInWeek(weekData.interval.start, weekData.interval.end, session), 0);
    });
    
    // Remove the interval property before returning (not needed for the chart)
    return weeksData.map(({ name, sessions }) => ({ name, sessions }));
  };
  
  const getEmptyData = () => {
    const currentDate = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const weekStart = startOfWeek(addWeeks(currentDate, -(5 - i)));
      return {
        name: format(weekStart, "MMM d"),
        sessions: 0
      };
    });
  };

  const data = generateWeeklyData();
  
  // Define gradient colors for the chart
  const barColors = [
    '#60a5fa', // blue
    '#4ade80', // green
    '#a78bfa', // purple
    '#f472b6', // pink
    '#fbbf24', // amber
    '#6366f1'  // indigo
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
              <span className="relative">Sessions Per Week</span>
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
            </CardTitle>
            <CardDescription className="text-foreground/80 dark:text-white/80">
              View your mentorship session activity over the past 6 weeks
            </CardDescription>
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} className="[&_.recharts-cartesian-grid-horizontal_line]:opacity-30 [&_.recharts-cartesian-grid-vertical_line]:opacity-30">
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
                      labelFormatter={(label) => `Week of ${label}`}
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
                      {data.map((entry, index) => (
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}