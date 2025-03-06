'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useOrderStore from '@/stores/order-store';
import useCartStore from '@/stores/cart-store';
import { format, parseISO, subMonths, isAfter, startOfMonth, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { BarChart } from '@/components/BarChart';
import { PieChart } from '@/components/PieChart';
import { LineChart } from '@/components/LineChart';
import { DataTable } from '@/components/DataTable';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  History, 
  PieChart as PieChartIcon, 
  BarChart3, 
  CalendarDays, 
  Utensils, 
  TrendingUp, 
  Clock,
  AlertTriangle, 
  ArrowLeft,
  Star,
  Calendar
} from 'lucide-react';

export default function CafeUserDashboard() {
  const { orders, loading, error, fetchOrders } = useOrderStore();
  const { addToCart } = useCartStore();
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders by status
  const completedOrders = orders.filter(order => order.status === 'picked_up');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');
  const activeOrders = orders.filter(order => 
    ['pending_approval', 'placed', 'ready'].includes(order.status)
  );

  // Calculate dashboard statistics and prepare chart data
  const dashboardData = useMemo(() => {
    if (loading || orders.length === 0) return null;

    // Total amount spent
    const totalSpent = completedOrders.reduce(
      (sum, order) => sum + (order.meal.price * order.quantity), 0
    );

    // Average order value
    const averageOrderValue = completedOrders.length > 0 ? 
      totalSpent / completedOrders.length : 0;

    // Cancellation rate
    const cancelRate = orders.length > 0 ?
      (cancelledOrders.length / orders.length) * 100 : 0;
    
    // Category distribution for pie chart
    const categoryData = {};
    completedOrders.forEach(order => {
      const category = order.meal.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = { count: 0, total: 0 };
      }
      categoryData[category].count += order.quantity;
      categoryData[category].total += (order.meal.price * order.quantity);
    });

    // Format for PieChart component
    const categoryChartData = Object.entries(categoryData).map(([name, data]) => ({
      name,
      value: data.total
    }));

    // Monthly spending data for bar chart
    const monthlySpending = {};
    // Initialize past 6 months
    for (let i = 0; i < 6; i++) {
      const month = subMonths(new Date(), i);
      const monthKey = format(month, 'MMM');
      monthlySpending[monthKey] = 0;
    }

    // Fill in spending data
    completedOrders.forEach(order => {
      const orderDate = new Date(order.orderTime);
      // Only consider orders from the last 6 months
      if (isAfter(orderDate, subMonths(new Date(), 6))) {
        const monthKey = format(orderDate, 'MMM');
        if (monthlySpending[monthKey] !== undefined) {
          monthlySpending[monthKey] += (order.meal.price * order.quantity);
        }
      }
    });

    // Convert to array and reverse for chronological order
    const spendingChartData = Object.entries(monthlySpending)
      .map(([month, amount]) => ({ month, amount }))
      .reverse();

    // Daily spending pattern over last 30 days for line chart
    const dailySpending = {};
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayKey = format(day, 'yyyy-MM-dd');
      dailySpending[dayKey] = 0;
      last30Days.push(dayKey);
    }

    completedOrders.forEach(order => {
      const orderDate = new Date(order.orderTime);
      const dayKey = format(orderDate, 'yyyy-MM-dd');
      if (dailySpending[dayKey] !== undefined) {
        dailySpending[dayKey] += (order.meal.price * order.quantity);
      }
    });

    // Convert to array for LineChart component
    const dailySpendingChartData = last30Days.map(day => ({
      date: day,
      spending: dailySpending[day]
    }));

    // Most ordered meals
    const mealCounts = {};
    completedOrders.forEach(order => {
      const mealId = order.meal.id;
      if (!mealCounts[mealId]) {
        mealCounts[mealId] = { 
          count: 0, 
          meal: order.meal,
          totalSpent: 0
        };
      }
      mealCounts[mealId].count += order.quantity;
      mealCounts[mealId].totalSpent += (order.meal.price * order.quantity);
    });

    const topMeals = Object.values(mealCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Table data for order history
    const tableData = orders.map(order => ({
      id: order.id,
      meal: order.meal.name,
      category: order.meal.category,
      date: format(new Date(order.orderTime), 'MMM dd, yyyy'),
      time: format(new Date(order.orderTime), 'h:mm a'),
      price: order.meal.price,
      quantity: order.quantity,
      total: order.meal.price * order.quantity,
      status: order.status
    }));

    return {
      totalSpent,
      completedOrdersCount: completedOrders.length,
      activeOrdersCount: activeOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      averageOrderValue,
      cancelRate,
      categoryChartData,
      spendingChartData,
      dailySpendingChartData,
      topMeals,
      tableData
    };
  }, [orders, completedOrders, cancelledOrders, activeOrders, loading]);

  // Define columns for the DataTable component
  const orderColumns = [
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'time',
      header: 'Time',
    },
    {
      accessorKey: 'meal',
      header: 'Meal',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => `৳${row.original.total.toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusColor = (status) => {
          switch (status) {
            case 'pending_approval': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'placed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'ready': return 'bg-green-100 text-green-800 border-green-300';
            case 'picked_up': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
          }
        };
  
        const getStatusLabel = (status) => {
          switch (status) {
            case 'pending_approval': return 'Pending Approval';
            case 'placed': return 'Placed';
            case 'ready': return 'Ready';
            case 'picked_up': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
          }
        };
  
        return (
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const meal = { id: row.original.id, name: row.original.meal };
        
        return row.original.status === 'picked_up' ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleOrderAgain(row.original)}
          >
            Order Again
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            disabled
          >
            -
          </Button>
        );
      },
    },
  ];

  const handleOrderAgain = async (orderData) => {
    try {
      // Find the original meal ID from the orders data
      const originalOrder = orders.find(order => order.id === orderData.id);
      
      if (originalOrder) {
        await addToCart(originalOrder.meal.id, orderData.quantity);
        
        toast.success(`Added ${originalOrder.meal.name} to your cart`, {
          description: `Quantity: ${orderData.quantity}`,
          action: {
            label: "View Cart",
            onClick: () => router.push('/cart')
          }
        });
      }
    } catch (error) {
      console.error("Error reordering meal:", error);
      toast.error("Couldn't add meal to cart. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold">Error Loading Orders</h2>
          <p className="mt-2 text-gray-500">
            We couldn't load your order data. Please try again later.
          </p>
          <Button 
            className="mt-4"
            onClick={() => fetchOrders()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Cafeteria Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Track your orders, spending patterns, and favorite meals
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cafeteria">
            <Button variant="outline" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Browse Menu
            </Button>
          </Link>
          <Link href="/preorder">
            <Button variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Track Orders
            </Button>
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <History className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-medium">No Order History Yet</h2>
            <p className="mt-2 text-gray-500">
              Place your first order to start building your personalized dashboard
            </p>
            <Link href="/cafeteria">
              <Button className="mt-6">Browse Cafeteria Menu</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {dashboardData?.completedOrdersCount || 0}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CalendarDays className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex text-sm">
                  <div className="text-green-500 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>
                      {activeOrders.length} active
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <h3 className="text-2xl font-bold mt-1">
                      ৳{dashboardData?.totalSpent.toFixed(2) || '0.00'}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex text-sm">
                  <div className="text-blue-500">
                    Avg ৳{dashboardData?.averageOrderValue.toFixed(2) || '0.00'} per order
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Completed Orders</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {dashboardData?.completedOrdersCount || 0}
                    </h3>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Utensils className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex text-sm">
                  <div className="text-red-500">
                    {dashboardData?.cancelledOrdersCount || 0} cancelled ({dashboardData?.cancelRate.toFixed(1) || '0.0'}%)
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500">Active Orders</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {activeOrders.length}
                    </h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex text-sm">
                  {activeOrders.length > 0 ? (
                    <Link href="/preorder" className="text-blue-500 hover:underline">
                      View active orders →
                    </Link>
                  ) : (
                    <span className="text-gray-500">No active orders</span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="spending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Spending</span>
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Favorites</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Order History</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Monthly Spending
                    </h3>
                    <div className="h-64">
                      <BarChart
                        data={dashboardData?.spendingChartData || []}
                        xAxis="month"
                        yAxis="amount"
                        yAxisLabel="Amount (৳)"
                        tooltipTitle="Amount"
                        tooltipFormatter={(value) => `৳${value}`}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Spending by Category
                    </h3>
                    <div className="h-64">
                      <PieChart
                        data={dashboardData?.categoryChartData || []}
                        nameKey="name"
                        dataKey="value"
                        tooltipFormatter={(value) => `৳${value}`}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-amber-500" />
                      Top Ordered Items
                    </h3>
                    {dashboardData?.topMeals && dashboardData.topMeals.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.topMeals.map((item, index) => (
                          <div key={item.meal.id} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">
                                {item.meal.name}
                              </span>
                              <span className="text-sm text-gray-600">
                                {item.count} orders
                              </span>
                            </div>
                            <Progress value={(item.count / dashboardData.topMeals[0].count) * 100} className="h-2" />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                ৳{item.meal.price} each
                              </span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => 
                                  handleOrderAgain({
                                    id: item.meal.id, 
                                    quantity: 1
                                  })
                                }
                                className="h-7 text-xs"
                              >
                                Order Again
                              </Button>
                            </div>
                            {index < dashboardData.topMeals.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No favorite meals yet
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Spending Tab */}
            <TabsContent value="spending">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Daily Spending (Last 30 Days)
                    </h3>
                    <div className="h-64">
                      <LineChart
                        data={dashboardData?.dailySpendingChartData || []}
                        xAxis="date"
                        yAxis="spending"
                        yAxisLabel="Amount (৳)"
                        tooltipTitle="Spending"
                        tooltipFormatter={(value) => `৳${value}`}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center">
                      <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Spending by Category
                    </h3>
                    <div className="h-64">
                      <PieChart
                        data={dashboardData?.categoryChartData || []}
                        nameKey="name"
                        dataKey="value"
                        tooltipFormatter={(value) => `৳${value}`}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Spending Insights</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Average Order Value</p>
                        <p className="text-xl font-medium">৳{dashboardData?.averageOrderValue.toFixed(2) || '0.00'}</p>
                      </div>
                      
                      <Separator />
                      
                      {dashboardData?.topMeals && dashboardData.topMeals.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Most Expensive Purchase</p>
                          <p className="text-xl font-medium">
                            {dashboardData.topMeals.sort((a, b) => 
                              b.totalSpent - a.totalSpent
                            )[0].meal.name} - 
                            ৳{dashboardData.topMeals.sort((a, b) => 
                              b.totalSpent - a.totalSpent
                            )[0].totalSpent.toFixed(2)}
                          </p>
                        </div>
                      )}
                      
                      <Separator />
                      
                      {dashboardData?.spendingChartData && dashboardData.spendingChartData.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Highest Spending Month</p>
                          <p className="text-xl font-medium">
                            {dashboardData.spendingChartData.sort((a, b) => 
                              b.amount - a.amount
                            )[0].month} - 
                            ৳{dashboardData.spendingChartData.sort((a, b) => 
                              b.amount - a.amount
                            )[0].amount.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Star className="h-5 w-5 mr-2 text-amber-500" />
                      Your Top Meals
                    </h3>
                    {dashboardData?.topMeals && dashboardData.topMeals.length > 0 ? (
                      <div className="space-y-6">
                        {dashboardData.topMeals.map((item, index) => (
                          <div key={item.meal.id} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{item.meal.name}</h4>
                                  <p className="text-sm text-gray-500">{item.meal.category}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                {item.count} orders
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="text-gray-500">Price:</span> ৳{item.meal.price}
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => 
                                  handleOrderAgain({
                                    id: item.meal.id, 
                                    quantity: 1
                                  })
                                }
                              >
                                Order Again
                              </Button>
                            </div>
                            {index < dashboardData.topMeals.length - 1 && (
                              <Separator className="mt-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        No favorite meals yet
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
                      Preferred Categories
                    </h3>
                    <div className="h-64 mb-6">
                      <PieChart
                        data={dashboardData?.categoryChartData || []}
                        nameKey="name"
                        dataKey="value"
                        tooltipFormatter={(value) => `৳${value}`}
                      />
                    </div>
                    
                    {dashboardData?.categoryChartData && dashboardData.categoryChartData.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Category Breakdown</h4>
                        <div className="space-y-2">
                          {dashboardData.categoryChartData
                            .sort((a, b) => b.value - a.value)
                            .map((category, index) => (
                              <div key={category.name} className="flex justify-between">
                                <span className="text-sm">{category.name}</span>
                                <span className="text-sm font-medium">৳{category.value.toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <History className="h-5 w-5 mr-2 text-blue-600" />
                    Complete Order History
                  </h3>
                  <DataTable
                    columns={orderColumns}
                    data={dashboardData?.tableData || []}
                    searchKey="meal"
                    searchPlaceholder="Search meals..."
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}