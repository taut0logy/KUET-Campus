"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Loader2, Users, Calendar, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';

import ClubCard from '@/components/clubs/ClubCard';
import EventCard from '@/components/clubs/EventCard';
import SearchComponent from '@/components/clubs/SearchComponent';
import { fetchClubs, fetchEvents } from '@/lib/api/clubsApi';

export default function ClubsDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'clubs' | 'events'>('clubs');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  
  const [clubs, setClubs] = useState([]);
  const [newClubs, setNewClubs] = useState([]);
  const [followedClubs, setFollowedClubs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [runningEvents, setRunningEvents] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all necessary data
        const [clubsData, eventsData, followedClubsData] = await Promise.all([
          fetchClubs({ sort: 'recent', limit: 20 }),
          fetchEvents({ sort: 'upcoming', limit: 10 }),
          fetchClubs({ followed: true, limit: 10 })
        ]);
        
        setClubs(clubsData.clubs);
        setNewClubs(clubsData.clubs.slice(0, 5)); // Get the 5 most recent clubs
        setFollowedClubs(followedClubsData.clubs);
        
        // Separate upcoming and currently running events
        const now = new Date();
        const running = eventsData.events.filter(
          event => new Date(event.startTime) <= now && new Date(event.endTime) >= now
        );
        const upcoming = eventsData.events.filter(
          event => new Date(event.startTime) > now
        );
        
        setRunningEvents(running);
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Error loading club dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        if (searchType === 'clubs') {
          const result = await fetchClubs({ search: debouncedSearchQuery });
          setSearchResults(result.clubs);
        } else {
          const result = await fetchEvents({ search: debouncedSearchQuery });
          setSearchResults(result.events);
        }
      } catch (error) {
        console.error(`Error searching ${searchType}:`, error);
      } finally {
        setIsSearching(false);
      }
    };
    
    performSearch();
  }, [debouncedSearchQuery, searchType]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading clubs and events...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Clubs & Events</h1>
        <p className="text-muted-foreground mt-2">
          Discover and join clubs, attend events, and connect with your university community.
        </p>
      </div>
      
      {/* Search Component */}
      <SearchComponent 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchType={searchType}
        setSearchType={setSearchType}
        isSearching={isSearching}
        searchResults={searchResults}
      />
      
      {debouncedSearchQuery.trim() ? (
        // Show search results
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">
            Search Results for &quot;{debouncedSearchQuery}&quot;
          </h2>
          {isSearching ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Searching...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No {searchType} found matching &quot;{debouncedSearchQuery}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchType === 'clubs' ? 
                searchResults.map((club) => (
                  <ClubCard key={club.id} club={club} />
                )) : 
                searchResults.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              }
            </div>
          )}
        </div>
      ) : (
        // Show the dashboard content
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="followed">Followed Clubs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-8">
            {/* New Clubs Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">New Clubs</h2>
                <Button variant="link" onClick={() => router.push('/clubs/discover')}>
                  View all
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newClubs.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    No new clubs to show
                  </div>
                ) : (
                  newClubs.map(club => (
                    <ClubCard key={club.id} club={club} />
                  ))
                )}
              </div>
            </section>
            
            <Separator />
            
            {/* All Clubs Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">All Clubs</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map(club => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="followed" className="space-y-8">
            {/* Followed Clubs Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Clubs You Follow</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followedClubs.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    You are not following any clubs yet
                  </div>
                ) : (
                  followedClubs.map(club => (
                    <ClubCard key={club.id} club={club} />
                  ))
                )}
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="events" className="space-y-8">
            {/* Running Events Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Happening Now</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {runningEvents.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    No events are currently running
                  </div>
                ) : (
                  runningEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </div>
            </section>
            
            <Separator />
            
            {/* Upcoming Events Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Upcoming Events</h2>
                <Button variant="link" onClick={() => router.push('/events')}>
                  View all
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    No upcoming events to show
                  </div>
                ) : (
                  upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
