'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import ARNavigationView from '@/components/ARNavigationView';
import { Navigation } from 'lucide-react';

// Fix for default icons in Leaflet with Next.js
const userIcon = new Icon({
  iconUrl: '/images/user-location.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const locationIcon = new Icon({
  iconUrl: '/images/location-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Sample campus POIs - Replace with actual KUET coordinates
const campusLocations = [
  { id: 1, name: 'Main Academic Building', position: [23.7730, 90.4047], description: 'Central Academic Complex' },
  { id: 2, name: 'Military Training Ground', position: [23.7733, 90.4055], description: 'Field Training Area' },
  { id: 3, name: 'Engineering Labs', position: [23.7735, 90.4046], description: 'Advanced Engineering Laboratories' },
  { id: 4, name: 'Command Center', position: [23.7726, 90.4042], description: 'Administrative Headquarters' },
  { id: 5, name: 'Mess Hall', position: [23.7732, 90.4039], description: 'Dining Facility' },
  { id: 6, name: 'Barracks', position: [23.7728, 90.4051], description: 'Student Accommodation' },
  { id: 7, name: 'Parade Ground', position: [23.7738, 90.4050], description: 'Ceremonial Area' },
  { id: 8, name: 'Tactical Simulator', position: [23.7732, 90.4058], description: 'Simulation Training Center' },
];

// Component to re-center the map on user's position
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}



// Main map component
export default function CampusMap({ height = '500px' }) {
  const [userPosition, setUserPosition] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [routePoints, setRoutePoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [navigationSteps, setNavigationSteps] = useState([]);
  // Default center is KUET campus approximate location
  const defaultCenter = [22.8997, 89.5022];
  const [arModeActive, setArModeActive] = useState(false);

  // Get user's location
  // After the initial useEffect for location
useEffect(() => {
    let watchId;
    
    if (navigator.geolocation) {
      // Set up continuous location tracking
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          
          // If navigating, recalculate route
          if (selectedLocation) {
            setRoutePoints([
              [latitude, longitude],
              selectedLocation.position
            ]);
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [selectedLocation]);

  // Generate a simple route (straight line) between two points
  // In a real app, you'd use a routing API here
  const generateRoute = (destination) => {
    if (!userPosition || !destination) return;
    
    // For demo, we'll just draw a straight line
    setRoutePoints([userPosition, destination.position]);
    setSelectedLocation(destination);
  };

  // Calculate distance between two points (in meters)
  const calculateDistance = (point1, point2) => {
    if (!point1 || !point2) return 0;
    
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1[0] * Math.PI / 180;
    const φ2 = point2[0] * Math.PI / 180;
    const Δφ = (point2[0] - point1[0]) * Math.PI / 180;
    const Δλ = (point2[1] - point1[1]) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredLocations = campusLocations.filter(location => 
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  return (
    <>
      {arModeActive && selectedLocation && (
        <ARNavigationView 
          destination={selectedLocation}
          userPosition={userPosition}
          onClose={() => setArModeActive(false)}
          calculateDistance={calculateDistance}
        />
      )}
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Campus Locations</h2>
          <div className="border rounded-md p-4 bg-background shadow-sm">
            <div className="space-y-2">
                
              {campusLocations.map(location => (
                <button
                  key={location.id}
                  onClick={() => generateRoute(location)}
                  className={`w-full text-left p-2 rounded-md flex items-center justify-between 
                    ${selectedLocation?.id === location.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'}`}
                >
                    
                  <span>{location.name}</span>
                  {userPosition && (
                    <span className="text-xs">
                      {Math.round(calculateDistance(userPosition, location.position) / 10) / 100} km
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {selectedLocation && (
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Navigation</h2>
            <div className="border rounded-md p-4 bg-background shadow-sm">
              <h3 className="font-medium text-lg">{selectedLocation.name}</h3>
              <p className="text-muted-foreground mb-2">{selectedLocation.description}</p>
              <div className="mt-4">
                <h4 className="font-medium">Directions:</h4>
                <p className="text-sm">
                  {userPosition ? (
                    <>
                      Distance: {Math.round(calculateDistance(userPosition, selectedLocation.position) / 10) / 100} km<br />
                      Estimated time: {Math.ceil(calculateDistance(userPosition, selectedLocation.position) / 80)} min walking
                    </>
                  ) : (
                    'Enable location services to see directions'
                  )}
                </p>
                {/* AR Navigation button */}
                {userPosition && (
                    <button
                      onClick={() => setArModeActive(true)}
                      className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center"
                    >
                      <Navigation className="mr-2" size={16} />
                      Start AR Navigation
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ height, width: '100%' }} className="relative border rounded-md overflow-hidden">
        {loadingLocation && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-2">Getting your location...</span>
          </div>
        )}
        
        {locationError && (
          <div className="absolute top-2 left-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-md z-10">
            {locationError}
          </div>
        )}
        
        <MapContainer
          center={userPosition || defaultCenter}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>
                Your current location
              </Popup>
            </Marker>
          )}
          
          {campusLocations.map(location => (
            <Marker 
              key={location.id} 
              position={location.position} 
              icon={locationIcon}
              eventHandlers={{
                click: () => generateRoute(location),
              }}
            >
              <Popup>
                <div>
                  <h3 className="font-medium">{location.name}</h3>
                  <p>{location.description}</p>
                  {userPosition && (
                    <button 
                      className="mt-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
                      onClick={() => generateRoute(location)}
                    >
                      Get Directions
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {routePoints.length === 2 && (
            <Polyline 
              positions={routePoints} 
              color="blue" 
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
          
          <ChangeMapView center={userPosition} />
        </MapContainer>
      </div>
    </div>
    </>
  );
}