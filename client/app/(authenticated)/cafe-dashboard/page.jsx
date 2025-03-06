'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { LineChart } from '@/components/LineChart';
import { BarChart } from '@/components/BarChart';
import { PieChart } from '@/components/PieChart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, RefreshCw, Download } from 'lucide-react';
import axios from '@/lib/axios';
import { toast } from 'sonner';

export default function CafeDashboard() {
  // State for date filters
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [timeframe, setTimeframe] = useState('month'); // day, week, month
  
  // Analytics data states
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [mealData, setMealData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  
  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, dateRange]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Format dates for API
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');
      
      // Fetch all analytics data in parallel
      const [salesResponse, ordersResponse, mealsResponse, customersResponse] = await Promise.all([
        axios.get(`/analytics/sales?timeframe=${timeframe}&from=${fromDate}&to=${toDate}`),
        axios.get(`/analytics/orders?timeframe=${timeframe}&from=${fromDate}&to=${toDate}`),
        axios.get(`/analytics/meals?timeframe=${timeframe}&from=${fromDate}&to=${toDate}`),
        axios.get(`/analytics/customers?timeframe=${timeframe}&from=${fromDate}&to=${toDate}`)
      ]);
      
      setSalesData(salesResponse.data);
      setOrderData(ordersResponse.data);
      setMealData(mealsResponse.data);
      setCustomerData(customersResponse.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      
      // Set mock data for development if API is not ready
      setMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Mock data for development/demo purposes
  const setMockData = () => {
    // Sales data
    setSalesData({
      total: 87650,
      change: 12.5,
      dailyRevenue: [
        { date: '2024-02-01', revenue: 2500 },
        { date: '2024-02-02', revenue: 2800 },
        { date: '2024-02-03', revenue: 3100 },
        { date: '2024-02-04', revenue: 2700 },
        { date: '2024-02-05', revenue: 3200 },
        { date: '2024-02-06', revenue: 3400 },
        { date: '2024-02-07', revenue: 3600 },
      ],
      categoryRevenue: [
        { category: 'Breakfast', revenue: 28500 },
        { category: 'Lunch', revenue: 35200 },
        { category: 'Dinner', revenue: 18700 },
        { category: 'Snacks', revenue: 5250 },
      ],
      topMeals: [
        { id: 1, name: 'Grilled Chicken Salad', revenue: 8500, count: 850 },
        { id: 2, name: 'Vegan Buddha Bowl', revenue: 7200, count: 650 },
        { id: 3, name: 'Classic Cheeseburger', revenue: 6700, count: 670 },
        { id: 4, name: 'Wild Salmon Fillet', revenue: 5900, count: 350 },
        { id: 5, name: 'Quinoa Power Bowl', revenue: 5500, count: 500 },
      ],
      avgOrderValue: 467.5
    });
    
    // Order data
    setOrderData({
      total: 1875,
      change: 8.2,
      ordersByStatus: [
        { status: 'pending_approval', count: 35 },
        { status: 'placed', count: 120 },
        { status: 'ready', count: 45 },
        { status: 'picked_up', count: 1575 },
        { status: 'cancelled', count: 100 },
      ],
      hourlyDistribution: [
        { hour: '08:00', count: 75 },
        { hour: '09:00', count: 120 },
        { hour: '10:00', count: 95 },
        { hour: '11:00', count: 185 },
        { hour: '12:00', count: 320 },
        { hour: '13:00', count: 285 },
        { hour: '14:00', count: 165 },
        { hour: '15:00', count: 95 },
        { hour: '16:00', count: 120 },
        { hour: '17:00', count: 205 },
        { hour: '18:00', count: 175 },
        { hour: '19:00', count: 85 },
      ],
      fulfillmentTime: {
        average: 18, // minutes
        change: -5.3, // percent
      },
      dailyOrders: [
        { date: '2024-02-01', count: 245 },
        { date: '2024-02-02', count: 267 },
        { date: '2024-02-03', count: 210 },
        { date: '2024-02-04', count: 198 },
        { date: '2024-02-05', count: 276 },
        { date: '2024-02-06', count: 287 },
        { date: '2024-02-07', count: 292 },
      ]
    });
    
    // Meal data
    setMealData({
      total: 42,
      dietaryPreferences: [
        { preference: 'Vegan', count: 12, percentage: 28.6 },
        { preference: 'Gluten-Free', count: 15, percentage: 35.7 },
        { preference: 'Sugar-Free', count: 8, percentage: 19.0 },
        { preference: 'Low-Fat', count: 10, percentage: 23.8 },
        { preference: 'Organic', count: 6, percentage: 14.3 },
      ],
      categoryDistribution: [
        { category: 'Breakfast', count: 10 },
        { category: 'Lunch', count: 15 },
        { category: 'Dinner', count: 8 },
        { category: 'Snacks', count: 5 },
        { category: 'Desserts', count: 4 },
      ],
      lowPerforming: [
        { id: 38, name: 'Vegetable Samosa', orderCount: 12, revenue: 420 },
        { id: 22, name: 'Miso Soup', orderCount: 15, revenue: 375 },
        { id: 17, name: 'Beet Salad', orderCount: 18, revenue: 540 },
        { id: 41, name: 'Carrot Cake', orderCount: 20, revenue: 800 },
        { id: 29, name: 'Mushroom Risotto', orderCount: 22, revenue: 990 },
      ]
    });
    
    // Customer data
    setCustomerData({
      total: 643,
      new: 87,
      returning: 556,
      topCustomers: [
        { id: 1, name: 'Ahmed Khan', orderCount: 28, totalSpent: 12800 },
        { id: 2, name: 'Sarah Rahman', orderCount: 24, totalSpent: 10650 },
        { id: 3, name: 'Mahmud Hasan', orderCount: 22, totalSpent: 9870 },
        { id: 4, name: 'Fatima Ali', orderCount: 19, totalSpent: 8730 },
        { id: 5, name: 'Kamal Uddin', orderCount: 17, totalSpent: 7850 },
      ],
      orderFrequency: [
        { frequency: '1-2 times', count: 320 },
        { frequency: '3-5 times', count: 186 },
        { frequency: '6-10 times', count: 94 },
        { frequency: '11+ times', count: 43 },
      ]
    });
  };

  // Handle date filter changes
  const handleDateChange = (range) => {
    setDateRange(range);
  };
  
  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      pending_approval: 'bg-purple-500',
      placed: 'bg-yellow-500',
      ready: 'bg-green-500',
      picked_up: 'bg-blue-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Analyze your cafeteria performance and trends</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date range picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  "Date Range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          {/* Time frame selector */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Time frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Refresh button */}
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {/* Export button */}
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="orders">Order Analytics</TabsTrigger>
          <TabsTrigger value="meals">Menu Analytics</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
        </TabsList>
        
        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Sales Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{salesData?.total?.toLocaleString() || '0'}</div>
                <p className={`text-xs ${salesData?.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {salesData?.change >= 0 ? "+" : ""}{salesData?.change || 0}% from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">৳{salesData?.avgOrderValue?.toFixed(2) || '0'}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderData?.total?.toLocaleString() || '0'}</div>
                <p className={`text-xs ${orderData?.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {orderData?.change >= 0 ? "+" : ""}{orderData?.change || 0}% from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mealData?.total || '0'}</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue Over Time Chart */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Daily revenue for the selected period</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">Loading chart data...</div>
              ) : (
                <LineChart 
                  data={salesData?.dailyRevenue || []} 
                  xAxis="date"
                  yAxis="revenue"
                  yAxisLabel="Revenue (৳)"
                  tooltipTitle="Revenue"
                  tooltipFormatter={(value) => `৳${value.toLocaleString()}`}
                />
              )}
            </CardContent>
          </Card>
          
          {/* Revenue by Category and Top Meals */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Revenue distribution across meal categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">Loading chart data...</div>
                ) : (
                  <PieChart 
                    data={salesData?.categoryRevenue || []}
                    nameKey="category"
                    dataKey="revenue"
                    tooltipFormatter={(value) => `৳${value.toLocaleString()}`}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Top Selling Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Meals</CardTitle>
                <CardDescription>Best performing meals by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">Loading data...</div>
                ) : (
                  <div className="space-y-4">
                    {salesData?.topMeals?.map((meal, index) => (
                      <div key={meal.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{meal.name}</p>
                            <p className="text-sm text-muted-foreground">{meal.count} orders</p>
                          </div>
                        </div>
                        <p className="font-medium">৳{meal.revenue.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Orders Analytics Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Order Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current orders by status</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {loading ? (
                <div className="col-span-full h-24 flex items-center justify-center">Loading status data...</div>
              ) : (
                orderData?.ordersByStatus?.map(status => (
                  <Card key={status.status}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Badge className={`mb-2 ${getStatusColor(status.status)}`}>
                        {status.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-3xl font-bold">{status.count}</p>
                      <p className="text-sm text-muted-foreground">orders</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Hourly Order Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Hourly Order Distribution</CardTitle>
              <CardDescription>Orders by hour of day</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">Loading chart data...</div>
              ) : (
                <BarChart 
                  data={orderData?.hourlyDistribution || []}
                  xAxis="hour"
                  yAxis="count"
                  yAxisLabel="Order Count"
                  tooltipTitle="Orders"
                />
              )}
            </CardContent>
          </Card>
          
          {/* Order Fulfillment and Daily Orders */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Average Fulfillment Time */}
            <Card>
              <CardHeader>
                <CardTitle>Average Fulfillment Time</CardTitle>
                <CardDescription>Time from order placement to ready status</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <p className="text-5xl font-bold">{orderData?.fulfillmentTime?.average || 0}</p>
                  <p className="text-xl text-muted-foreground mt-2">minutes</p>
                  <p className={`mt-4 text-sm ${orderData?.fulfillmentTime?.change <= 0 ? "text-green-600" : "text-red-600"}`}>
                    {orderData?.fulfillmentTime?.change <= 0 ? "↓" : "↑"} {Math.abs(orderData?.fulfillmentTime?.change || 0)}% from previous period
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Order Volume</CardTitle>
                <CardDescription>Number of orders per day</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">Loading chart data...</div>
                ) : (
                  <LineChart 
                    data={orderData?.dailyOrders || []} 
                    xAxis="date"
                    yAxis="count"
                    yAxisLabel="Orders"
                    tooltipTitle="Orders"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Menu Analytics Tab */}
        <TabsContent value="meals" className="space-y-6">
          {/* Dietary Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Dietary Preferences</CardTitle>
              <CardDescription>Distribution of dietary options in menu</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-5 gap-4">
              {loading ? (
                <div className="col-span-full h-24 flex items-center justify-center">Loading data...</div>
              ) : (
                mealData?.dietaryPreferences?.map(pref => (
                  <Card key={pref.preference}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-bold">{pref.count}</div>
                      <p className="text-sm">{pref.preference}</p>
                      <p className="text-xs text-muted-foreground">{pref.percentage}% of menu</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Category Distribution and Low Performing Items */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Meal Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Meal Categories</CardTitle>
                <CardDescription>Distribution of meals by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">Loading chart data...</div>
                ) : (
                  <PieChart 
                    data={mealData?.categoryDistribution || []}
                    nameKey="category"
                    dataKey="count"
                    tooltipFormatter={(value) => `${value} meals`}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Low Performing Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Low Performing Meals</CardTitle>
                <CardDescription>Meals with lowest order counts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">Loading data...</div>
                ) : (
                  <div className="space-y-4">
                    {mealData?.lowPerforming?.map((meal) => (
                      <div key={meal.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-muted-foreground">{meal.orderCount} orders</p>
                        </div>
                        <p className="font-medium">৳{meal.revenue.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Customer Analytics Tab */}
        <TabsContent value="customers" className="space-y-6">
          {/* Customer Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerData?.total || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerData?.new || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {customerData?.new && customerData?.total 
                    ? ((customerData.new / customerData.total) * 100).toFixed(1) 
                    : 0}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Returning Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerData?.returning || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {customerData?.returning && customerData?.total 
                    ? ((customerData.returning / customerData.total) * 100).toFixed(1) 
                    : 0}% of total
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Top Customers and Order Frequency */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Customers with highest order volume</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">Loading data...</div>
                ) : (
                  <div className="space-y-4">
                    {customerData?.topCustomers?.map((customer, index) => (
                      <div key={customer.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.orderCount} orders</p>
                          </div>
                        </div>
                        <p className="font-medium">৳{customer.totalSpent.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Order Frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Order Frequency</CardTitle>
                <CardDescription>How often customers order</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center">Loading chart data...</div>
                ) : (
                  <BarChart 
                    data={customerData?.orderFrequency || []}
                    xAxis="frequency"
                    yAxis="count"
                    yAxisLabel="Customers"
                    tooltipTitle="Customers"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}