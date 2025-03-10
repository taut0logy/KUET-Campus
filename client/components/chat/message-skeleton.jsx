"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MessageSkeleton({ isSelf = false }) {
  return (
    <div 
      className={cn(
        "flex mb-4",
        isSelf ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "flex max-w-[80%]",
          isSelf ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        {!isSelf && (
          <div className="flex flex-col items-center mr-2">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        )}
        
        {/* Message content */}
        <div 
          className={cn(
            "flex flex-col",
            isSelf ? "items-end mr-2" : "items-start ml-2"
          )}
        >
          {/* Sender name and time */}
          <div className="flex items-center gap-1 mb-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-10" />
          </div>
          
          {/* Message bubble */}
          <Skeleton 
            className={cn(
              "h-16 w-48 rounded-lg",
              isSelf ? "bg-primary/20" : "bg-accent/50"
            )}
          />
        </div>
      </div>
    </div>
  );
}