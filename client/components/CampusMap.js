'use client';

import { Suspense } from 'react';
import CampusMap from '@/components/CampusMap';

export default function CampusMapPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">KUET Campus Map</h1>
      <p className="mb-6">
        Find your way around campus with our interactive map. Enable location services to see
        directions to key buildings and facilities.
      </p>
      
      <Suspense fallback={<div className="h-[500px] flex items-center justify-center">Loading Map...</div>}>
        <CampusMap height="600px" />
      </Suspense>
      
      <div className="mt-6 bg-muted p-4 rounded-md">
        <h2 className="text-lg font-medium mb-2">How to use</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click on any building to see more information</li>
          <li>Use the list on the left to select destinations</li>
          <li>Allow location access to see your position on the map</li>
          <li>Follow the dashed line to navigate to your destination</li>
        </ul>
      </div>
    </div>
  );
}