
import { useState } from 'react';
import { useUserStore } from '@/services/meetupService';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { CalendarDays, Clock, TrendingUp, Users } from 'lucide-react';

interface ActivityDataPoint {
  name: string;
  value: number;
  fill?: string;
}

const ActivityInsights = () => {
  const { attendedMeetups, points, level, joinedLobbies } = useUserStore();
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');

  // Generate sample activity data by day for demo purposes
  // In a real app, you would use actual user activity data from an API
  const generateActivityData = (): ActivityDataPoint[] => {
    // For demo, generate some random activity points for each day
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      const value = Math.floor(Math.random() * 20);
      return {
        name: day,
        value,
        fill: value > 10 ? '#22c55e' : '#3b82f6'
      };
    });
  };

  // Generate monthly data
  const generateMonthlyData = (): ActivityDataPoint[] => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map(week => {
      const value = Math.floor(Math.random() * 50);
      return {
        name: week,
        value,
        fill: value > 25 ? '#22c55e' : '#3b82f6'
      };
    });
  };

  const weeklyData = generateActivityData();
  const monthlyData = generateMonthlyData();
  
  // Calculate stats from the user's activity
  const totalAttended = attendedMeetups.length;
  const totalEarned = points;
  const avgPointsPerMeetup = totalAttended > 0 ? Math.round(totalEarned / totalAttended) : 0;
  const totalLobbyJoins = joinedLobbies.length;
  
  // Display level starting from 1 (instead of 0)
  const displayLevel = level;
  
  // Get the most recent activity
  const latestActivity = attendedMeetups.length > 0 
    ? new Date(attendedMeetups[attendedMeetups.length - 1].dateTime).toLocaleDateString()
    : 'No recent activity';

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Activity Insights</h3>
      
      {/* Activity Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Meetups
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{totalAttended}</div>
            <p className="text-xs text-muted-foreground">attended so far</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Avg. Points
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-2xl font-bold">{avgPointsPerMeetup}</div>
            <p className="text-xs text-muted-foreground">per meetup</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Activity Overview</CardTitle>
            <Tabs defaultValue="weekly" className="w-[180px]" onValueChange={(v) => setView(v as 'weekly' | 'monthly')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription className="text-xs">Points earned over time</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ChartContainer
            className="h-[200px]"
            config={{
              "value": {
                "label": "Points"
              }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={view === 'weekly' ? weeklyData : monthlyData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Last active</p>
                <p className="text-xs text-muted-foreground">{latestActivity}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Lobby joins</p>
                <p className="text-xs text-muted-foreground">{totalLobbyJoins} meetup lobbies joined</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Interests</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {useUserStore.getState().tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityInsights;
