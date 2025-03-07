"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Loader2, 
  Heart, 
  Check, 
  Share2, 
  Calendar, 
  Clock, 
  MapPin,
  Users,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import useClubStore from '@/stores/club-store';

export default function EventDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const { events, eventState, getEventBySlug, followEvent, unfollowEvent } = useClubStore();
  
  useEffect(() => {
    const loadEventData = async () => {
      setIsLoading(true);
      try {
        const { event: eventData } = await getEventBySlug(slug);
        setEvent(eventData);
        setIsFollowing(eventData.isFollowing || false);
      } catch (error) {
        console.error('Error loading event data:', error);
        toast.error("Failed to load event information");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) {
      loadEventData();
    }
  }, [slug, toast]);
  
  const handleFollowToggle = async () => {
    if (!event) return;
    
    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowEvent(event.id);
        setIsFollowing(false);
        toast.success(`You are no longer following ${event.name}`);
      } else {
        await followEvent(event.id);
        setIsFollowing(true);
        toast.success(`You are now following ${event.name}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
      console.error("Error toggling follow status:", error);
    } finally {
      setIsLoadingFollow(false);
    }
  };
  
  const handleShareEvent = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.name,
        text: event.description || `Check out ${event.name}!`,
        url: window.location.href
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };
  
  // Get event status
  const getEventStatus = () => {
    if (!event) return null;
    
    const now = new Date();
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-blue-500' };
    } else if (now > endDate) {
      return { label: 'Past', color: 'bg-gray-500' };
    } else {
      return { label: 'Happening Now', color: 'bg-green-500' };
    }
  };
  
  // Format event date
  const formatEventDate = () => {
    if (!event) return '';
    
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    // If same day
    if (startDate.toDateString() === endDate.toDateString()) {
      return format(startDate, 'EEEE, MMMM d, yyyy');
    } else {
      return `${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`;
    }
  };
  
  // Format event time
  const formatEventTime = () => {
    if (!event) return '';
    
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };
  
  const eventStatus = getEventStatus();
  
  // Check if it's a past event
  const isPastEvent = eventStatus?.label === 'Past';
  
  // Parse event links
  const eventLinks = event?.eventLinks || [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading event details...</span>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/events')}
          >
            Back to events
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      {/* Event Header */}
      <div className="relative mb-8">
        {/* Cover Photo */}
        <div className="relative h-60 md:h-80 rounded-lg overflow-hidden">
          <Image
            src={event.coverPhoto || '/images/event-placeholder.jpg'}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
          {eventStatus && (
            <Badge className={`absolute top-4 right-4 text-white ${eventStatus.color}`}>
              {eventStatus.label}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Event Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Event Details */}
        <div className="flex-grow space-y-6 order-2 lg:order-1">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="mr-4">{formatEventDate()}</span>
              <Clock className="h-4 w-4 mr-2 ml-2" />
              <span>{formatEventTime()}</span>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">About This Event</h2>
              {event.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description available</p>
              )}
            </CardContent>
          </Card>
          
          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Event Links */}
          {eventLinks && eventLinks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Event Links</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {eventLinks.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {link.name || link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Event Side Panel */}
        <div className="w-full lg:w-80 order-1 lg:order-2">
          {/* Organizer Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Organized By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarFallback>
                    {event.club?.name?.slice(0, 2).toUpperCase() || 'CL'}
                  </AvatarFallback>
                  {event.club?.coverPhoto && <AvatarImage src={event.club.coverPhoto} />}
                </Avatar>
                <div>
                  <Link 
                    href={`/clubs/${event.club?.slug}`}
                    className="font-medium hover:underline"
                  >
                    {event.club?.name}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Event Actions Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  onClick={handleFollowToggle}
                  disabled={isLoadingFollow || isPastEvent}
                  className="w-full"
                >
                  {isLoadingFollow ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isFollowing ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Heart className="h-4 w-4 mr-2" />
                  )}
                  {isFollowing ? 'Following' : 'Follow Event'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleShareEvent}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                
                <div className="text-center mt-2">
                  <p className="text-sm text-muted-foreground flex items-center justify-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{event._count?.followers || 0} followers</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Other Events Card */}
          <Card>
            <CardHeader>
              <CardTitle>Other Events By This Club</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/clubs/${event.club?.slug}/events`)}
              >
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
