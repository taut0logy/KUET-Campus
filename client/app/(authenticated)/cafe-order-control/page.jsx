'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check, Clock, X, Filter, Search, RefreshCw, CalendarDays, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import QRScanner from '@/components/QRScanner';
import DateTimePicker from 'react-datetime-picker';
import axios from '@/lib/axios';

export default function CafeManagerPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [pickupDateTime, setPickupDateTime] = useState(new Date());

    // Fetch all orders
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/order/manage');
            setOrders(response.data.orders);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Filter orders based on status and search term
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        const matchesSearch = searchTerm === '' ||
            order.meal?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.verificationCode.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    // Handle order approval
    const handleApproveOrder = async (order) => {
        try {
            await axios.put(`/order/${order.id}/status`, { status: 'placed', approved: true });
            toast.success(`Order for ${order.meal.name} has been approved`);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve order');
        }
    };

    // Open reject dialog
    const openRejectDialog = (order) => {
        setSelectedOrder(order);
        setRejectionReason('');
        setIsRejectDialogOpen(true);
    };

    // Handle order rejection
    const handleRejectOrder = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            await axios.put(`/order/${selectedOrder.id}/status`, {
                status: 'cancelled',
                rejectionReason
            });
            toast.success(`Order has been rejected`);
            setIsRejectDialogOpen(false);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject order');
        }
    };

    // Open update status dialog
    const openUpdateDialog = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsUpdateDialogOpen(true);
    };

    // Handle status update
    const handleUpdateStatus = async () => {
        try {
            const payload = { status: newStatus };
            if (newStatus === 'ready' && pickupDateTime) {
                payload.pickupTime = pickupDateTime.toISOString();
            }
            await axios.put(`/order/${selectedOrder.id}/status`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            setIsUpdateDialogOpen(false);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update order status');
        }
    };

    // Open verify dialog
    const openVerifyDialog = () => {
        setVerificationCode('');
        setIsVerifyDialogOpen(true);
    };

    // Handle order verification
    const handleVerifyOrder = async () => {
        if (!verificationCode.trim()) {
            toast.error('Please enter a verification code');
            return;
        }

        try {
            await axios.post('/order/verify', {
                verificationData: verificationCode.trim()
            });
            toast.success('Order verified and marked as picked up!');
            setIsVerifyDialogOpen(false);
            setVerificationCode('');
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'placed': return 'bg-yellow-500';
            case 'ready': return 'bg-green-500';
            case 'picked_up': return 'bg-blue-500';
            case 'cancelled': return 'bg-red-500';
            case 'pending_approval': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Order Management Dashboard</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
                <div className="flex gap-2 items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchOrders}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </Button>

                    <div className="flex items-center gap-2 ml-4">
                        <Filter className="h-4 w-4" />
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Orders</SelectItem>
                                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                <SelectItem value="placed">Placed</SelectItem>
                                <SelectItem value="ready">Ready</SelectItem>
                                <SelectItem value="picked_up">Picked Up</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/cafe-meal-control')}>
                        <Utensils className="h-4 w-4" />
                        Manage Meals
                    </Button>

                    <Button onClick={openVerifyDialog}>
                        Verify Order Pickup
                    </Button>
                </div>
            </div>


            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="active">Active Orders</TabsTrigger>
                    <TabsTrigger value="history">Order History</TabsTrigger>
                </TabsList>

                <TabsContent value="active">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <p className="col-span-full text-center py-8">Loading orders...</p>
                        ) : filteredOrders.filter(order =>
                            ['pending_approval', 'placed', 'ready'].includes(order.status)
                        ).length > 0 ? (
                            filteredOrders
                                .filter(order => ['pending_approval', 'placed', 'ready'].includes(order.status))
                                .map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        onApprove={handleApproveOrder}
                                        onReject={openRejectDialog}
                                        onUpdateStatus={openUpdateDialog}
                                        getStatusColor={getStatusColor}
                                    />
                                ))
                        ) : (
                            <p className="col-span-full text-center py-8">No active orders found</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {loading ? (
                            <p className="col-span-full text-center py-8">Loading orders...</p>
                        ) : filteredOrders.filter(order =>
                            ['picked_up', 'cancelled'].includes(order.status)
                        ).length > 0 ? (
                            filteredOrders
                                .filter(order => ['picked_up', 'cancelled'].includes(order.status))
                                .map(order => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        isHistory={true}
                                        getStatusColor={getStatusColor}
                                    />
                                ))
                        ) : (
                            <p className="col-span-full text-center py-8">No order history found</p>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Status Update Dialog */}
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>
                            Change the status for order #{selectedOrder?.id}
                        </DialogDescription>
                    </DialogHeader>

                    <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="ready">Ready for Pickup</SelectItem>
                            <SelectItem value="cancelled">Cancel Order</SelectItem>
                        </SelectContent>
                    </Select>


                    {/* Add datetime picker when setting status to "ready" */}
                    {newStatus === 'ready' && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Set Pickup Time
                            </label>
                            <DateTimePicker
                                onChange={setPickupDateTime}
                                value={pickupDateTime}
                                className="w-full border rounded-md"
                                disableClock={true}
                                minDate={new Date()}
                                clearIcon={null}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateStatus}>
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Order</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this order.
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        placeholder="Rejection reason (required)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRejectOrder}>
                            Reject Order
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verify Order Dialog */}
            <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verify Order Pickup</DialogTitle>
                        <DialogDescription>
                            Scan the QR code or enter the verification code provided by the customer.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="scan">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="scan">Scan QR</TabsTrigger>
                            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        </TabsList>

                        <TabsContent value="scan" className="pt-4">
                            <QRScanner
                                onSuccess={(data) => {
                                    toast.success('Order verified and marked as picked up!');
                                    setIsVerifyDialogOpen(false);
                                    fetchOrders();
                                }}
                                onError={(error) => {
                                    toast.error(error.response?.data?.message || 'Verification failed');
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="manual" className="pt-4">
                            <div className="flex flex-col space-y-4">
                                <Input
                                    placeholder="Enter verification code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="font-mono uppercase"
                                />

                                <Button onClick={handleVerifyOrder} disabled={!verificationCode.trim()}>
                                    Verify Pickup
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Order Card Component
function OrderCard({ order, onApprove, onReject, onUpdateStatus, getStatusColor, isHistory = false }) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">
                        {order.meal?.name}
                    </CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                        {order.status}
                    </Badge>
                </div>
                <CardDescription>
                    Order #{order.id} • Quantity: {order.quantity}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <div className="text-muted-foreground">Customer:</div>
                        <div>
                            {order.user?.firstName} {order.user?.lastName}
                        </div>
                    </div>

                    <div className="flex justify-between text-sm">
                        <div className="text-muted-foreground">Pickup time:</div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(order.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>

                    <div className="flex justify-between text-sm">
                        <div className="text-muted-foreground">Ordered at:</div>
                        <div>
                            {new Date(order.orderTime).toLocaleString()}
                        </div>
                    </div>

                    {order.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-sm">
                            <div className="font-semibold text-red-700 mb-1">Rejection reason:</div>
                            <div className="text-red-600">{order.rejectionReason}</div>
                        </div>
                    )}

                    {/* Action buttons for active orders */}
                    {!isHistory && (
                        <div className="pt-2 flex gap-2">
                            {order.status === 'pending_approval' && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-green-500 hover:bg-green-50"
                                        onClick={() => onApprove(order)}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 border-red-500 hover:bg-red-50"
                                        onClick={() => onReject(order)}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}

                            {['placed', 'ready'].includes(order.status) && (
                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => onUpdateStatus(order)}
                                >
                                    Update Status
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}