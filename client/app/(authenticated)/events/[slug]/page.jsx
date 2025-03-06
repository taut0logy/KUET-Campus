import { useParams } from 'react-router-dom';
import EventDetailsPage from './EventDetailsPage';

const EventSlugPage = () => {
  const { slug } = useParams();
  return <EventDetailsPage slug={slug} />;
};

export default EventSlugPage; 