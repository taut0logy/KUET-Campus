"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Users, CalendarDays, Heart, Check, MapPin, Info, Settings, Share2 } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

import EventCard from '@/components/clubs/EventCard';
import MembersList from '@/components/clubs/MembersList';
import ClubAnalytics from '@/components/clubs/ClubAnalytics';

import { getClubBySlug, followClub, unfollowClub, getClubAnalytics } from '@/lib/api/clubsApi';
import { fetchEvents } from '@/lib/api/clubsApi';
import { Club, Event } from '@/types/clubs';
import { useSession } from 'next-auth/react';

export default function ClubDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  const userId = session?.user?.id;
  
  useEffect(() => {
    const loadClubData = async () => {
      setIsLoading(true);
      try {
        // Load club details and events
        const { club: clubData } = await getClubBySlug(slug);
        const eventsData = await fetchEvents({ clubId: clubData.id });
        
        setClub(clubData);
        setEvents(eventsData.events || []);
        setIsFollowing(clubData.isFollowing || false);
      } catch (error) {
        console.error('Error loading club data:', error);
        toast({
          title: "Error",
          description: "Failed to load club information",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) {
      loadClubData();
    }
  }, [slug, toast]);
  
  // Load analytics if user is a moderator or manager
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!club || !userId) return;
      
      const canViewAnalytics = 
        club.moderatorId === userId || 
        club.userRole === 'MANAGER' ||
        (session?.user?.roles && session.user.roles.includes('ADMIN'));
      
      if (canViewAnalytics) {
        setIsLoadingAnalytics(true);
        try {
          const { analytics } = await getClubAnalytics(club.id);
          setAnalyticsData(analytics);
        } catch (error) {
          console.error('Error loading club analytics:', error);
        } finally {
          setIsLoadingAnalytics(false);
        }
      }
    };
    
    if (club && userId) {
      loadAnalytics();
    }
  }, [club, userId, session?.user?.roles]);
  
  const handleFollowToggle = async () => {
    if (!club) return;
    
    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await unfollowClub(club.id);
        setIsFollowing(false);
        toast({
          title: "Club unfollowed",
          description: `You are no longer following ${club.name}`,
        });
      } else {
        await followClub(club.id);
        setIsFollowing(true);
        toast({
          title: "Club followed",
          description: `You are now following ${club.name}`,
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
      setIsLoadingFollow(false);
    }
  };
  
  const handleShareClub = () => {
    if (navigator.share && club) {
      navigator.share({
        title: club.name,
        text: club.description || `Check out ${club.name}!`,
        url: window.location.href
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Link copied to clipboard"
      });
    }
  };
  
  // Check if user has management rights
  const isManager = club && (
    club.moderatorId === userId || 
    club.userRole === 'MANAGER' || 
    (session?.user?.roles && session.user.roles.includes('ADMIN'))
  );
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading club details...</span>
      </div>
    );
  }
  
  if (!club) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold">Club not found</h1>
          <p className="mt-2 text-muted-foreground">The club you're looking for doesn't exist or has been removed.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/clubs')}
          >
            Back to clubs
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      {/* Club Header */}
      <div className="relative mb-8">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
          <Image
            src={club.coverPhoto || '/images/club-placeholder.jpg'}
            alt={club.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Club Info */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between md:absolute md:bottom-4 md:left-4 md:right-4 bg-background/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-4 md:p-0 rounded-lg md:rounded-none">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-background">
              <AvatarFallback>{club.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              {club.coverPhoto && <AvatarImage src={club.coverPhoto} />}
            </Avatar>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{club.name}</h1>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-1" />
                <span>Founded {new Date(club.foundingDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            {isManager && (
              <Button 
                variant="outline"
                size="sm"
                onClick={() => router.push(`/clubs/${slug}/manage`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareClub}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              onClick={handleFollowToggle}
              disabled={isLoadingFollow}
            >
              {isLoadingFollow ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isFollowing ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Club Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Members</p>
              <p className="text-2xl font-bold">{club._count?.members || 0}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground/50" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Followers</p>
              <p className="text-2xl font-bold">{club._count?.followers || 0}</p>
            </div>
            <Heart className="h-8 w-8 text-muted-foreground/50" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Events</p>
              <p className="text-2xl font-bold">{club._count?.events || 0}</p>
            </div>
            <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visits</p>
              <p className="text-2xl font-bold">{club._count?.userVisits || 0}</p>
            </div>
            <Info className="h-8 w-8 text-muted-foreground/50" />
          </CardContent>
        </Card>
      </div>
      
      {/* Club Content */}
      <Tabs defaultValue="about" className="space-y-4">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isManager && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="about" className="space-y-6">
          {/* Description */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              {club.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">{club.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description available</p>
              )}
            </CardContent>
          </Card>
          
          {/* Tags */}
          {club.tags && club.tags.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {club.tags.map(tag => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Moderator Info */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3">Club Moderator</h3>
              
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{club.moderator?.name?.slice(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{club.moderator?.name || 'Not Available'}</p>
                  <p className="text-sm text-muted-foreground">{club.moderator?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Events Preview */}
          {events.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Upcoming Events</h3>
                  <Button variant="link" size="sm" onClick={() => document.querySelector('[data-value="events"]')?.click()}>
                    View all
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.slice(0, 2).map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Club Events</h3>
            {isManager && (
              <Button 
                onClick={() => router.push(`/clubs/${slug}/create-event`)}
              >
                Create Event
              </Button>
            )}
          </div>
          
          {events.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <h4 className="font-medium">No events found</h4>
                  <p className="text-muted-foreground mt-1">This club has not scheduled any events yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <MembersList 
            club={club}
            isManager={isManager}
            onMemberUpdate={(updatedClub) => setClub(updatedClub)}
          />
        </TabsContent>
        
        {isManager && (
          <TabsContent value="analytics" className="space-y-6">
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading analytics...</span>
              </div>
            ) : (
              <ClubAnalytics analyticsData={analyticsData} />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

