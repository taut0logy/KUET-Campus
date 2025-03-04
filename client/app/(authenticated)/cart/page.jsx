'use client';

import { useEffect, useState } from 'react';
import useCartStore from '@/stores/cart-store';
import useOrderStore from '@/stores/order-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { Loader2, ShoppingCart, ChevronLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
    const { items, loading, error, fetchCart, updateCartItemQuantity, removeFromCart, resetCart } = useCartStore();
    const { createOrder } = useOrderStore();
    const [loadingItems, setLoadingItems] = useState(new Set());
    const [isPreordering, setIsPreordering] = useState(false);
    const router = useRouter();


    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        setLoadingItems(prev => new Set(prev).add(itemId));
        try {
            await updateCartItemQuantity(itemId, newQuantity);
        } finally {
            setLoadingItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        }
    };

    const handleRemove = async (itemId) => {
        setLoadingItems(prev => new Set(prev).add(itemId));
        try {
            await removeFromCart(itemId);
        } finally {
            setLoadingItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your cart...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
                <div className="p-4 bg-destructive/10 rounded-full">
                    <ShoppingCart className="h-8 w-8 text-destructive" />
                </div>
                <p className="text-destructive font-medium">Error: {error}</p>
                <Button variant="outline" onClick={() => fetchCart()}>
                    Try Again
                </Button>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
                <div className="p-6 bg-muted rounded-full">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold">Your cart is empty</h2>
                <p className="text-muted-foreground">Add some delicious meals to get started!</p>
                <Link href="/meals">
                    <Button className="flex items-center space-x-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Browse Meals</span>
                    </Button>
                </Link>
            </div>
        );
    }

    const calculateTotal = () => {
        return items.reduce((total, item) => total + (item.meal.price * item.quantity), 0);
    };


    const handlePreorder = async () => {
        setIsPreordering(true);
        try {
          await createOrder(items);
          await resetCart();
          toast({
            title: "Order placed successfully!",
            description: "Your meals will be ready for pickup in 30 minutes.",
            duration: 5000,
          });
          router.push('/preorder');
        } catch (error) {
          toast({
            title: "Failed to place order",
            description: error.message || "Please try again later",
            variant: "destructive",
            duration: 5000,
          });
        } finally {
          setIsPreordering(false);
        }
      };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <Link href="/cafeteria">
                    <Button variant="outline" className="flex items-center space-x-2">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Go to Cafeteria</span>
                    </Button>
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className="p-6 mb-4 hover:shadow-lg transition-shadow duration-200">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center space-x-6">

                                            <div className="space-y-2 max-w-md">
                                                <h3 className="font-semibold text-lg">{item.meal.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {item.meal.description || "No description available"}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-primary text-lg font-medium">
                                                        ${(item.meal.price * item.quantity).toFixed(2)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${item.meal.price} each
                                                    </p>
                                                </div>
                                                {item.meal.category && (
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                        {item.meal.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6">
                                            <div className="flex items-center">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-r-none"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || loadingItems.has(item.id)}
                                                >
                                                    {loadingItems.has(item.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : '-'}
                                                </Button>
                                                <div className="px-6 py-2 border-y border-input">
                                                    {item.quantity}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="rounded-l-none"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    disabled={loadingItems.has(item.id)}
                                                >
                                                    {loadingItems.has(item.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : '+'}
                                                </Button>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleRemove(item.id)}
                                                disabled={loadingItems.has(item.id)}
                                            >
                                                {loadingItems.has(item.id) ?
                                                    <Loader2 className="h-5 w-5 animate-spin" /> :
                                                    <Trash2 className="h-5 w-5" />
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="md:col-span-1">
                    <Card className="p-6 sticky top-4">
                        <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Including all taxes</p>
                            </div>
                        </div>
                        <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="w-full mt-6 py-6 text-lg"
                            disabled={isPreordering}
                        >
                            {isPreordering ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Proceed to Preorder"
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Preorder</DialogTitle>
                            <DialogDescription>
                                Your order will be ready for pickup in 30 minutes. Do you want to proceed?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => document.querySelector('[data-dialog-close]').click()}>
                                Cancel
                            </Button>
                            <Button onClick={handlePreorder} disabled={isPreordering}>
                                {isPreordering ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Order"
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                    </Card>
                </div>
            </div>
        </div>
    );
}