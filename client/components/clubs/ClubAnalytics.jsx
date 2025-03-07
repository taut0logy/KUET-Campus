import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ClubAnalytics({ analyticsData }) {
  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }
  
  // Extract data for charts
  const { basicStats, visitAnalytics, followActivity, memberRoles, recentEvents } = analyticsData;
  
  // Generate data for member role pie chart
  const memberRoleData = {
    labels: memberRoles?.map(role => role.role) || ['No data'],
    datasets: [
      {
        data: memberRoles?.map(role => role._count) || [0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',   // red
          'rgba(54, 162, 235, 0.6)',   // blue
          'rgba(255, 206, 86, 0.6)',   // yellow
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Simple data for follower activity bar chart
  const followerActivityData = {
    labels: ['Follows', 'Unfollows', 'Net Growth'],
    datasets: [
      {
        label: 'Follower Activity',
        data: [
          followActivity?.follows || 0,
          followActivity?.unfollows || 0,
          followActivity?.netGrowth || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          followActivity?.netGrowth >= 0 
            ? 'rgba(75, 192, 192, 0.6)' 
            : 'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };
  
  // Mock data for visits over time (would come from API in real app)
  const visitsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Club Visits',
        data: [65, 59, 80, 81],
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.8)',
      },
    ],
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Stats Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats?.members || 0}</div>
            <p className="text-xs text-muted-foreground">
              People who are members of your club
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats?.followers || 0}</div>
            <p className="text-xs text-muted-foreground">
              People who follow your club for updates
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicStats?.events || 0}</div>
            <p className="text-xs text-muted-foreground">
              Events created by your club
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitAnalytics?.totalVisits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Times users have visited this club page
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitAnalytics?.uniqueVisitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Different users who have visited
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followActivity?.netGrowth || 0}</div>
            <p className="text-xs text-muted-foreground">
              Net new followers in period
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Member Roles Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Member Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie 
                data={memberRoleData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Follower Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Follower Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar 
                data={followerActivityData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Visit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line
              data={visitsData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents && recentEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{new Date(event.startTime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(event.endTime).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent events to show</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}