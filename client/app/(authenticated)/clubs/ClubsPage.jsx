'use client';
import React, { useEffect, useState } from 'react';
import useClubStore from '../../stores/club-store';
import useEventStore from '../../stores/event-store';
import { Input } from '../ui/Input';
import ClubCard from '../ui/ClubCard';
import EventCard from '../ui/EventCard';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Container } from '../../components/ui/container';
import { Grid } from '../../components/ui/grid';

const ClubsPage = () => {
  const { fetchClubs, clubs } = useClubStore();
  const { fetchEvents, events } = useEventStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('club'); // 'club' or 'event'

  useEffect(() => {
    fetchClubs({ query: searchQuery });
    fetchEvents({ query: searchQuery });
  }, [searchQuery]);

  return (
    <Container>
      <h1 className="text-2xl font-bold mb-4">Clubs</h1>
      <Input
        type="text"
        placeholder="Search clubs or events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />
      <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
      <Grid>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </Grid>
      <h2 className="text-xl font-semibold mb-2">Clubs</h2>
      <Grid>
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </Grid>
    </Container>
  );
};

export default ClubsPage; 