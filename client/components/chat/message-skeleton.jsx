import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MessageSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4 p-4">
      {Array(count).fill(0).map((_, index) => {
        const isRight = index % 2 === 0;
        return (
          <div 
            key={index} 
            className={cn(
              "flex",
              isRight ? "justify-end" : "justify-start"
            )}
          >
            <div 
              className={cn(
                "max-w-[75%] p-4 rounded-lg",
                isRight ? "bg-primary/20" : "bg-muted"
              )}
            >
              <Skeleton className={cn(
                "h-4 mb-2",
                isRight ? "w-24" : "w-32"
              )} />
              <Skeleton className={cn(
                "h-4 mb-1",
                isRight ? "w-48" : "w-56"
              )} />
              <Skeleton className={cn(
                "h-4",
                isRight ? "w-32" : "w-40"
              )} />
              <div className="flex justify-end mt-1">
                <Skeleton className="w-10 h-3" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}