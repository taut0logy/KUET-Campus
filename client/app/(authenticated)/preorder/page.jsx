'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useOrderStore from '@/stores/order-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, ArrowLeft, Copy } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {order.meal.name}
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
                  
                  {/* Verification code display */}
                  <div className="mt-4 pt-4 border-t">
                    <div 
                      className="bg-gray-50 p-3 rounded-md border flex items-center justify-between"
                      title="Click to copy"
                    >
                      <div>
                        <p className="text-xs text-gray-500 font-medium">VERIFICATION CODE</p>
                        <p className="font-mono text-gray-500 font-medium tracking-wider">{order.verificationCode}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => copyVerificationCode(order.verificationCode)}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </div>
                  {/* Add the rejection reason display here */}
{order.status === 'cancelled' && order.rejectionReason && (
  <div className="mt-4 pt-4 border-t">
    <div className="bg-red-50 p-3 rounded-md border border-red-200">
      <p className="text-xs text-red-500 font-medium">ORDER CANCELLED</p>
      <p className="text-sm text-red-700">{order.rejectionReason}</p>
    </div>
  </div>
)}
                </div>
                
                {/* Display QR code for verification */}
                <div className="flex flex-col items-center">
                  <QRCodeSVG 
                    value={createQRData(order)}
                    size={120}
                    level="H"
                    className="border p-2 rounded-lg"
                  />
                  <p className="text-xs text-center mt-2 text-muted-foreground">Scan for pickup</p>
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