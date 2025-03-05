"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useBusStore from "@/stores/bus-store";
import { 
  Loader, 
  AlertTriangle, 
  RefreshCw, 
  Bus, 
  Car, // Changed to Car icon instead
  Users, 
  FileText 
} from "lucide-react";

const SkeletonBusCard = () => (
  <div className="rounded-lg border bg-card p-0">
    <div className="space-y-4 p-6">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  </div>
);

export function BusList() {
  const router = useRouter();
  const { buses, loading, error, fetchBuses, clearError } = useBusStore();

  const handleBusClick = (busId) => {
    router.push(`/bus/${busId}`);
  };

  if (loading) {
    return (
      <div className="relative min-h-[400px]">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBusCard key={i} />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Loader className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            Fetching buses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-in fade-in-50 duration-500">
        <motion.div 
          className="flex flex-col items-center gap-4 p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />
          <AlertDescription className="text-lg font-semibold text-destructive">
            {error}
          </AlertDescription>
          <Button
            onClick={() => {
              clearError();
              fetchBuses();
            }}
            variant="outline"
            className="mt-2 bg-background/5 backdrop-blur-sm hover:bg-destructive hover:text-white transition-all duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </motion.div>
      </Alert>
    );
  }

  if (!buses || buses.length === 0) {
    return (
      <Card className="animate-in fade-in-50 duration-500">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <Bus className="h-16 w-16 text-muted-foreground/50" />
          <CardTitle className="text-xl font-semibold text-foreground">
            No buses available
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            There are currently no buses in the system. Check back later or refresh the list.
          </p>
          <Button
            onClick={fetchBuses}
            variant="outline"
            className="mt-2 hover:scale-105 transition-transform duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {buses.map((bus) => (
          <motion.div
            key={bus.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              onClick={() => handleBusClick(bus.id)}
              className={`
                cursor-pointer border transition-all duration-300
                hover:shadow-lg hover:border-primary/20
                ${bus.isActive ? 'bg-card' : 'bg-muted/50'}
              `}
            >
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    Bus {bus.busNumber}
                  </CardTitle>
                  <Badge 
                    variant={bus.isActive ? "default" : "secondary"}
                    className={`
                      transition-all duration-500
                      ${bus.isActive ? 'animate-pulse' : ''}
                    `}
                  >
                    {bus.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Car className="mr-2 h-4 w-4" /> {/* Updated here */}
                  <span className="font-medium">License Plate:</span>
                  <span className="ml-2">{bus.licensePlate}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Bus className="mr-2 h-4 w-4" />
                  <span className="font-medium">Type:</span>
                  <span className="ml-2">{bus.type}</span>
                </div>
                {bus.description && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="font-medium">Description:</span>
                    <span className="ml-2">{bus.description}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  <span className="font-medium">Capacity:</span>
                  <span className="ml-2">{bus.capacity} seats</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
