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
  FileText,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const busesPerPage = 5;
  
  // Calculate pagination values
  const indexOfLastBus = currentPage * busesPerPage;
  const indexOfFirstBus = indexOfLastBus - busesPerPage;
  const currentBuses = Array.isArray(buses) ? buses.slice(indexOfFirstBus, indexOfLastBus) : [];
  const totalPages = Math.ceil((buses?.length || 0) / busesPerPage);

  // Pagination controls
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Log the buses to see what data is being passed
  console.log('BusList Buses:', buses);

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

  if (!Array.isArray(buses) || buses.length === 0) {
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
    <div className="space-y-6">
      <div className="space-y-4">
        {currentBuses.map((bus) => (
          <Card 
            key={bus.id} 
            onClick={() => handleBusClick(bus.id)}
            className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-background to-card/50 hover:from-card/60 hover:to-card/80 border-border/50 group cursor-pointer relative rounded-xl overflow-hidden"
          >
            {/* Updated decorative borders with curved corners */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 top-2 h-[calc(100%-16px)] w-[1px] bg-gradient-to-b from-primary/30 via-primary/10 to-primary/30" />
              <div className="absolute right-0 top-2 h-[calc(100%-16px)] w-[1px] bg-gradient-to-b from-primary/30 via-primary/10 to-primary/30" />
              <div className="absolute top-0 left-2 w-[calc(100%-16px)] h-[1px] bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30" />
              <div className="absolute bottom-0 left-2 w-[calc(100%-16px)] h-[1px] bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30" />
              
              {/* Updated corner accents with larger curved areas */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-xl" />
            </div>

            {/* Updated glow effect to match curved corners */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-primary/5 blur-sm rounded-xl" />
            </div>

            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-primary/60" />
                  <span className="text-lg font-semibold text-primary/90">#{bus.busNumber}</span>
                </div>
                <Badge 
                  className={cn(
                    "transition-colors duration-300",
                    bus.isActive 
                      ? "bg-green-500/20 text-green-400 dark:text-green-300" 
                      : "bg-gray-500/20 text-gray-400 dark:text-gray-300"
                  )}
                >
                  {bus.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {bus.description && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span className="text-sm">{bus.description}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{bus.capacity} seats</span>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <span className="text-xs text-muted-foreground/60 group-hover:text-primary/60 transition-colors">
                  Click to view details →
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 p-0 hover:bg-muted/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNumber)}
              className={cn(
                "w-8 h-8 p-0",
                pageNumber === currentPage 
                  ? "bg-primary/20 text-primary hover:bg-primary/30" 
                  : "hover:bg-muted/80"
              )}
            >
              {pageNumber}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 p-0 hover:bg-muted/80"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bus count indicator */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {indexOfFirstBus + 1}-{Math.min(indexOfLastBus, buses.length)} of {buses.length} buses
      </div>
    </div>
  );
}
