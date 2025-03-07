"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

import ClubCard from '@/components/clubs/ClubCard';
import EventCard from '@/components/clubs/EventCard';
import SearchComponent from '@/components/clubs/SearchComponent';
import useClubStore from '@/stores/club-store';
import useEventStore from '@/stores/event-store';

export default function ClubsDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'clubs' | 'events'>('clubs');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  
  // Local state for sections
  const [allClubs, setAllClubs] = useState([]);
  const [newClubs, setNewClubs] = useState([]);
  const [followedClubs, setFollowedClubs] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [runningEvents, setRunningEvents] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Destructure functions from club and event stores
  const { getAllClubs, searchClubs } = useClubStore();
  const { getAllEvents, searchEvents } = useEventStore();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch data concurrently
        const [clubsData, eventsData, followedClubsData] = await Promise.all([
          getAllClubs({ sort: 'recent', limit: 20 }),
          getAllEvents({ sort: 'upcoming', limit: 10 }),
          getAllClubs({ followed: true, limit: 10 })
        ]);
        
        const clubsList = clubsData?.clubs || clubsData;
        const followedList = followedClubsData?.clubs || followedClubsData;
        const eventsList = eventsData?.events || eventsData;
        
        setAllClubs(clubsList);
        setNewClubs(clubsList.slice(0, 5));
        setFollowedClubs(followedList);
        
        // Filter events based on current time
        const now = new Date();
        const running = eventsList.filter(
          event => new Date(event.startTime) <= now && new Date(event.endTime) >= now
        );
        const upcoming = eventsList.filter(
          event => new Date(event.startTime) > now
        );
        
        setRunningEvents(running);
        setUpcomingEvents(upcoming);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [getAllClubs, getAllEvents]);

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
          const result = await searchClubs({ search: debouncedSearchQuery });
          setSearchResults(result?.clubs || result);
        } else {
          const result = await searchEvents({ search: debouncedSearchQuery });
          setSearchResults(result?.events || result);
        }
      } catch (error) {
        console.error(`Error searching ${searchType}:`, error);
      } finally {
        setIsSearching(false);
      }
    };
    performSearch();
  }, [debouncedSearchQuery, searchType, searchClubs, searchEvents]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading clubs and events...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Clubs &amp; Events</h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Clubs</TabsTrigger>
            <TabsTrigger value="followed">Followed Clubs</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">New Clubs</h2>
                <Button variant="link" onClick={() => router.push('/clubs/discover')}>
                  View all
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">All Clubs</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allClubs.map(club => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            </section>
          </TabsContent>
          
          <TabsContent value="followed" className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Clubs You Follow</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Happening Now</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Upcoming Events</h2>
                <Button variant="link" onClick={() => router.push('/events')}>
                  View all
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
