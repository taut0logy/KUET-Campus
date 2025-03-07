import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import useClubStore from '@/stores/club-store';
import { formatDistanceToNow } from 'date-fns';

export default function RecentClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { getAllClubs } = useClubStore();
  
  useEffect(() => {
    const loadClubs = async () => {
      setLoading(true);
      try {
        const res = await getAllClubs({ 
          sort: 'recent', 
          limit: 3 
        });
        setClubs(res.clubs || []);
      } catch (error) {
        console.error('Error loading recent clubs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadClubs();
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex items-center p-2">
            <div className="rounded-full bg-muted h-10 w-10"></div>
            <div className="ml-4 space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (clubs.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No clubs have been added recently.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {clubs.map(club => (
        <div 
          key={club.id} 
          className="flex items-center p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
          onClick={() => router.push(`/clubs/${club.slug}`)}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback>{club.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            {club.coverPhoto && <AvatarImage src={club.coverPhoto} alt={club.name} />}
          </Avatar>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{club.name}</h3>
              <Badge variant="outline">New</Badge>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-xs text-muted-foreground">
                {club._count?.followers || 0} followers
              </p>
              <p className="text-xs text-muted-foreground">
                Added {formatDistanceToNow(new Date(club.foundingDate), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
