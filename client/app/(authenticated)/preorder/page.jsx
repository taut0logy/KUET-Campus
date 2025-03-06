'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useOrderStore from '@/stores/order-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, ArrowLeft, Copy, History, AlertTriangle, User, ChevronLeft } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import useCartStore from '@/stores/cart-store';

export default function PreorderPage() {
  const { orders, loading, error, fetchOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState('current');
  const router = useRouter();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders into current and past
  const currentOrders = orders.filter(order =>
    ['pending_approval', 'placed', 'ready'].includes(order.status)
  );

  const pastOrders = orders.filter(order =>
    ['picked_up', 'cancelled'].includes(order.status)
  );

  // Order summary stats
  const totalSpent = pastOrders.reduce((sum, order) => {
    if (order.status === 'picked_up') {
      return sum + (order.meal.price * order.quantity);
    }
    return sum;
  }, 0);

  const completedOrders = pastOrders.filter(order => order.status === 'picked_up').length;
  const cancelledOrders = pastOrders.filter(order => order.status === 'cancelled').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval': return 'bg-purple-500';
      case 'placed': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'picked_up': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval': return 'Pending Approval';
      case 'placed': return 'Order Placed';
      case 'ready': return 'Ready for Pickup';
      case 'picked_up': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getTimeRemaining = (pickupTime) => {
    if (!pickupTime) {
      return "Not yet known";
    }

    const now = new Date();
    const pickup = new Date(pickupTime);
    const diff = pickup - now;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 0) {
      return "Ready now";
    }

    return `${minutes} minutes`;
  };


  const handleOrderAgain = async (order) => {
    try {
      // Add the same meal to cart with the same quantity
      await addToCart(order.meal.id, order.quantity);
      
      // Show success message
      toast.success(`Added ${order.meal.name} to your cart`, {
        description: `Quantity: ${order.quantity}`,
        action: {
          label: "View Cart",
          onClick: () => router.push('/cart')
        }
      });
      
      // Navigate to cafeteria
      router.push('/cafeteria');
    } catch (error) {
      toast.error("Couldn't add meal to cart. Please try again.");
      console.error("Error reordering meal:", error);
    }
  };

  const createQRData = (order) => {
    // Include essential order data in QR code
    return JSON.stringify({
      orderId: order.id,
      verificationCode: order.verificationCode,
      timestamp: new Date().toISOString()
    });
  };

  const copyVerificationCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Verification code copied to clipboard');
  };

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const dayDiff = differenceInDays(now, date);

    if (dayDiff === 0) {
      return `Today, ${format(date, 'h:mm a')}`;
    } else if (dayDiff === 1) {
      return `Yesterday, ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 bg-gray-900 text-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">My Orders</h1>
        <div className="flex gap-2">
        <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                        onClick={() => router.push('/cafe-user-dashboard')}
                    >
                        <User className="h-4 w-4" />
                        <span>View User Dashboard</span>
                    </Button>
        
        <Button 
        variant="outline"
        className="flex items-center space-x-2"
        onClick={() => router.push('/cafeteria')}
        >
            <ChevronLeft className="h-4 w-4" />
            <span>Go to Cafeteria</span>
        </Button>
        </div>
      </div>

      {/* Order Status Summary */}
      {currentOrders.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-medium text-blue-300 mb-2">Active Orders Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentOrders.map(order => (
              <div key={`status-${order.id}`} className="flex items-center">
                <div className={`h-2.5 w-2.5 rounded-full mr-2 ${getStatusColor(order.status)}`}></div>
                <div className="text-sm">
                  <span className="font-medium text-gray-200">{order.meal.name.length > 15 ? order.meal.name.substring(0, 15) + '...' : order.meal.name}</span>
                  <span className="text-gray-400 ml-1">({getStatusLabel(order.status)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-gray-800">
          <TabsTrigger value="current" className="relative data-[state=active]:bg-gray-700">
            Current Orders
            {currentOrders.length > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                {currentOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-gray-700">
            Order History
            {pastOrders.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-[10px] text-white">
                {pastOrders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <AnimatePresence>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4"
                >
                  <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-white">
                            {order.meal.name}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          Order ID: #{order.id} • Ordered {formatOrderDate(order.orderTime)}
                        </p>
                        <p className="text-sm text-gray-400">
                          Quantity: {order.quantity} • Total: ৳{(order.meal.price * order.quantity).toFixed(2)}
                        </p>

                        {order.status === 'pending_approval' ? (
                          <div className="flex items-center gap-2 text-amber-400 text-sm mt-1">
                            <Clock className="h-4 w-4" />
                            <span>Awaiting cafeteria approval</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>Pickup in: {getTimeRemaining(order.pickupTime)}</span>
                          </div>
                        )}

                        {/* Verification code display - IMPROVED VISIBILITY */}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div
                            className="bg-gray-700 p-3 rounded-md border border-gray-600 flex items-center justify-between"
                            title="Click to copy"
                          >
                            <div>
                              <p className="text-xs text-gray-400 font-medium">VERIFICATION CODE</p>
                              <p className="font-mono text-gray-300 font-medium tracking-wider">{order.verificationCode}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => copyVerificationCode(order.verificationCode)}
                              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                              aria-label="Copy verification code"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Instructions for user based on status */}
                        <div className="mt-3 text-sm">
                          {order.status === 'pending_approval' && (
                            <p className="text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Your order is awaiting approval from the cafeteria staff.
                            </p>
                          )}

                          {order.status === 'placed' && (
                            <p className="text-blue-400">
                              Your order has been approved and is being prepared.
                            </p>
                          )}

                          {order.status === 'ready' && (
                            <p className="text-green-400">
                              Your order is ready! Show the QR code to the staff when you pick up.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Display QR code for verification */}
                      <div className="flex flex-col items-center">
                        <QRCodeSVG
                          value={createQRData(order)}
                          size={120}
                          level="H"
                          className="border border-gray-600 p-2 rounded-lg bg-white"
                        />
                        <p className="text-xs text-center mt-2 text-gray-400">Scan for pickup</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 border border-gray-700 rounded-lg bg-gray-800">
                <p className="text-gray-400">No active orders</p>
                <Link href="/cafeteria">
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Order Now</Button>
                </Link>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="past">
          {pastOrders.length > 0 ? (
            <>
              {/* Order History Stats */}
              <Card className="mb-6 bg-gray-800 border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Your Order Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-400">Total Spent</p>
                      <p className="text-2xl font-bold text-blue-400">৳{totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-400">Completed Orders</p>
                      <p className="text-2xl font-bold text-green-400">{completedOrders}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-400">Cancelled Orders</p>
                      <p className="text-2xl font-bold text-red-400">{cancelledOrders}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Past Orders List */}
              <ScrollArea className="h-[400px]">
                {pastOrders.map((order, index) => (
                  <div key={order.id} className="mb-2 last:mb-0">
                    <Card className="p-4 bg-gray-800 border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white">
                              {order.meal.name}
                            </h3>
                            <Badge className={`${getStatusColor(order.status)} text-xs`}>
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Ordered {formatOrderDate(order.orderTime)}
                          </p>
                          <div className="flex mt-1 gap-x-3">
                            <p className="text-sm text-gray-300">
                              Quantity: {order.quantity}
                            </p>
                            <p className="text-sm font-medium text-gray-300">
                              Total: ৳{(order.meal.price * order.quantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Rejection reason for cancelled orders */}
                          {order.status === 'cancelled' && order.rejectionReason && (
                            <div className="mt-2 bg-gray-700 p-2 rounded-md border border-red-900">
                              <p className="text-xs text-red-400">{order.rejectionReason}</p>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOrderAgain(order)}
                            className="border-gray-600 text-blue-400 hover:bg-gray-700 hover:text-blue-300"
                          >
                            Order Again
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {index < pastOrders.length - 1 && <Separator className="my-2 bg-gray-700" />}
                  </div>
                ))}
              </ScrollArea>
            </>
          ) : (
            <div className="text-center py-16 border border-gray-700 rounded-lg bg-gray-800">
              <History className="mx-auto h-10 w-10 text-gray-500" />
              <p className="mt-4 text-gray-400">No order history yet</p>
              <Link href="/cafeteria">
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Place Your First Order</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}