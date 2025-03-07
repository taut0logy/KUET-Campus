import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';

export default function SearchComponent({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  isSearching,
  searchResults
}) {
  
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${searchType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button 
              onClick={handleClearSearch}
              className="absolute right-3 top-2.5"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 p-1 border rounded-lg">
          <Toggle
            aria-label="Search clubs"
            pressed={searchType === 'clubs'}
            onPressedChange={() => setSearchType('clubs')}
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Clubs
          </Toggle>
          
          <Toggle
            aria-label="Search events"
            pressed={searchType === 'events'}
            onPressedChange={() => setSearchType('events')}
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Events
          </Toggle>
        </div>
      </div>
      
      {searchQuery && !isSearching && searchResults.length > 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          Found {searchResults.length} {searchType}
        </p>
      )}
    </div>
  );
}
