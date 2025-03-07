import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Clock, MapPin, Users, Heart, Check, Loader2 } from 'lucide-react';
import { formatDistanceToNow, isPast, isToday, isFuture } from 'date-fns';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Event } from '@/types/clubs';
import { followEvent, unfollowEvent } from '@/lib/api/clubsApi';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function EventCard({ event, className }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(event.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNavigateToEvent = () => {
    router.push(`/events/${event.slug}`);
  };
  
  const handleFollowToggle = async (e) => {
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowEvent(event.id);
        setIsFollowing(false);
        toast({
          title: "Event unfollowed",
          description: `You are no longer following ${event.name}`,
        });
      } else {
        await followEvent(event.id);
        setIsFollowing(true);
        toast({
          title: "Event followed",
          description: `You are now following ${event.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
      console.error("Error toggling follow status:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get event status
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const now = new Date();
  
  let eventStatus;
  if (isPast(endDate)) {
    eventStatus = 'past';
  } else if (now >= startDate && now <= endDate) {
    eventStatus = 'ongoing';
  } else if (isToday(startDate)) {
    eventStatus = 'today';
  } else {
    eventStatus = 'upcoming';
  }
  
  // Status badge
  const getStatusBadge = () => {
    switch(eventStatus) {
      case 'ongoing':
        return <Badge className="absolute top-2 right-2 bg-green-600">Happening Now</Badge>;
      case 'today':
        return <Badge className="absolute top-2 right-2 bg-blue-600">Today</Badge>;
      case 'upcoming':
        return <Badge className="absolute top-2 right-2 bg-primary">Upcoming</Badge>;
      case 'past':
        return <Badge className="absolute top-2 right-2 variant-outline">Past</Badge>;
      default:
        return null;
    }
  };
  
  // Format date range
  const formatEventDate = () => {
    const startDateStr = startDate.toLocaleDateString();
    const endDateStr = endDate.toLocaleDateString();
    
    if (startDateStr === endDateStr) {
      return startDateStr;
    }
    return `${startDateStr} - ${endDateStr}`;
  };
  
  // Format time range
  const formatEventTime = () => {
    const options = { hour: '2-digit', minute: '2-digit' };
    const startTimeStr = startDate.toLocaleTimeString(undefined, options);
    const endTimeStr = endDate.toLocaleTimeString(undefined, options);
    
    return `${startTimeStr} - ${endTimeStr}`;
  };
  
  // Get relative time (e.g., "3 days from now", "2 days ago")
  const getRelativeTime = () => {
    if (eventStatus === 'ongoing') {
      return 'Happening now';
    } else if (eventStatus === 'past') {
      return `${formatDistanceToNow(startDate)} ago`;
    } else {
      return `in ${formatDistanceToNow(startDate)}`;
    }
  };
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md overflow-hidden", 
        eventStatus === 'ongoing' && "border-green-500 shadow-sm",
        eventStatus === 'past' && "opacity-80",
        className
      )} 
      onClick={handleNavigateToEvent}
    >
      <div className="relative">
        <div className="relative w-full h-36 overflow-hidden">
          <Image
            src={event.coverPhoto || '/images/event-placeholder.jpg'}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>
        {getStatusBadge()}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{event.name}</CardTitle>
            <CardDescription>
              By {event.club?.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {event.description || "No description available"}
        </p>
        
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>{formatEventDate()}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>{formatEventTime()}</span>
          </div>
          
          {event.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1.5" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.slice(0, 2).map(tag => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {event.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 pb-3">
        <div className="flex items-center text-muted-foreground text-sm">
          <Users className="h-4 w-4 mr-1" />
          <span>{event._count?.followers || 0} following</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant={isFollowing ? "secondary" : "outline"} 
                className="h-8"
                onClick={handleFollowToggle}
                disabled={isLoading || eventStatus === 'past'}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : isFollowing ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Heart className="h-4 w-4 mr-1" />
                )}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {eventStatus === 'past' 
                ? 'Cannot follow past events' 
                : isFollowing 
                  ? 'Unfollow this event' 
                  : 'Follow this event to get updates'
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
      
      {/* Time indicator */}
      <div className={cn(
        "px-4 py-1 text-xs font-medium text-white",
        eventStatus === 'ongoing' ? "bg-green-600" :
        eventStatus === 'today' ? "bg-blue-600" :
        eventStatus === 'past' ? "bg-gray-500" : "bg-primary"
      )}>
        {getRelativeTime()}
      </div>
    </Card>
  );
}
