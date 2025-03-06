import React, { useEffect, useState } from 'react';
import useClubStore from '../../stores/club-store';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Container } from '../../components/ui/container';
import { Button } from '../../components/ui/button';

const ClubDetailsPage = () => {
  const { clubId } = useParams();
  const { fetchClubDetails, clubDetails } = useClubStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      await fetchClubDetails(clubId);
      setLoading(false);
    };
    fetchDetails();
  }, [clubId]);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <div style={{ backgroundImage: `url(${clubDetails.coverPhoto})` }} className="club-hero">
        <h1>{clubDetails.name}</h1>
        <h2>Moderator: {clubDetails.moderator.name}</h2>
      </div>
      <h3>Members</h3>
      <ul>
        {clubDetails.members.map(member => (
          <li key={member.userId}>{member.userId} - {member.role}</li>
        ))}
      </ul>
      <h3>Notable Events</h3>
      <ul>
        {clubDetails.events.slice(0, 5).map(event => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
    </Container>
  );
};

export default ClubDetailsPage; 