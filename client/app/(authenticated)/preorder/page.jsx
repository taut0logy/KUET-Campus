'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useOrderStore  from '@/stores/order-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

import { motion, AnimatePresence } from 'framer-motion';

export default function PreorderPage() {
  const { orders, loading, error, fetchOrders } = useOrderStore();
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'picked_up': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeRemaining = (pickupTime) => {
    const now = new Date();
    const pickup = new Date(pickupTime);
    const diff = pickup - now;
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes} minutes` : 'Time expired';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Preorders</h1>
        <Link href="/cafeteria">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cafeteria
          </Button>
        </Link>
      </div>

      <AnimatePresence>
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {order.menuMeal.meal.name}
                    </h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Order ID: #{order.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {order.quantity}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Pickup in: {getTimeRemaining(order.pickupTime)}</span>
                  </div>
                  <p className="text-sm font-medium">
                    Verification Code: {order.verificationCode}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No preorders found</p>
            <Link href="/cafeteria">
              <Button className="mt-4">Order Something</Button>
            </Link>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}