import { useParams } from 'react-router-dom';
import ClubDetailsPage from './ClubDetailsPage';

const ClubSlugPage = () => {
  const { slug } = useParams();
  return <ClubDetailsPage slug={slug} />;
};

export default ClubSlugPage; 