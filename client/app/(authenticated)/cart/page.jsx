'use client';

import { useEffect } from 'react';
import useCartStore from '@/stores/cart-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function CartPage() {
  const { items, loading, error, fetchCart, updateCartItemQuantity, removeFromCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <Button variant="outline" onClick={() => window.location.href = '/meals'}>
          Browse Meals
        </Button>
      </div>
    );
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.meal.price * item.quantity), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.meal.image}
                    alt={item.meal.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{item.meal.name}</h3>
                    <p className="text-gray-600">${item.meal.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button className="w-full mt-6">
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}