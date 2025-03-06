import React, { useEffect, useState } from 'react';
import useEventStore from '../../stores/event-store';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Container } from '../../components/ui/container';
import { Button } from '../../components/ui/button';

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const { fetchEventDetails, eventDetails } = useEventStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      await fetchEventDetails(eventId);
      setLoading(false);
    };
    fetchDetails();
  }, [eventId]);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <div style={{ backgroundImage: `url(${eventDetails.coverPhoto})` }} className="event-hero">
        <h1>{eventDetails.name}</h1>
        <h2>Club: {eventDetails.club.name}</h2>
        <p>Start: {new Date(eventDetails.startTime).toLocaleString()}</p>
        <p>End: {new Date(eventDetails.endTime).toLocaleString()}</p>
      </div>
      <h3>Event Description</h3>
      <p>{eventDetails.description}</p>
      <Button onClick={() => addToGoogleCalendar(eventDetails)}>Add to Google Calendar</Button>
    </Container>
  );
};

const addToGoogleCalendar = (event) => {
  const start = new Date(event.startTime).toISOString();
  const end = new Date(event.endTime).toISOString();
  const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(event.name)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.club.name)}`;
  window.open(url, '_blank');
};

export default EventDetailsPage; 