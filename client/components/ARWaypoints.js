import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ARWaypoints({ 
  userPosition, 
  destination, 
  deviceOrientation, 
  compassHeading 
}) {
  const [waypoints, setWaypoints] = useState([]);
  
  // Generate simulated waypoints for demo
  useEffect(() => {
    if (!userPosition || !destination) return;
    
    // In a real app, you'd get these from a navigation API
    // For hackathon, we'll create simulated waypoints
    const simulatedWaypoints = [
      { 
        name: "First Turn", 
        position: [
          userPosition[0] + (destination.position[0] - userPosition[0]) * 0.2,
          userPosition[1] + (destination.position[1] - userPosition[1]) * 0.2
        ],
        type: "turn-right"
      },
      {
        name: "Midpoint",
        position: [
          userPosition[0] + (destination.position[0] - userPosition[0]) * 0.5,
          userPosition[1] + (destination.position[1] - userPosition[1]) * 0.5
        ],
        type: "landmark",
        landmark: "Campus Center"
      },
      {
        name: "Final Turn",
        position: [
          userPosition[0] + (destination.position[0] - userPosition[0]) * 0.8,
          userPosition[1] + (destination.position[1] - userPosition[1]) * 0.8
        ],
        type: "turn-left"
      }
    ];
    
    setWaypoints(simulatedWaypoints);
  }, [userPosition, destination]);
  
  // Calculate if waypoint is in current view
  const isInView = (waypointPos) => {
    // Using device orientation and compass to determine if waypoint
    // would be visible in the current camera viewport
    // This is a simplified version for the hackathon
    
    if (!userPosition || !compassHeading) return false;
    
    const lat1 = userPosition[0] * Math.PI / 180;
    const lon1 = userPosition[1] * Math.PI / 180;
    const lat2 = waypointPos[0] * Math.PI / 180;
    const lon2 = waypointPos[1] * Math.PI / 180;
    
    // Calculate bearing to waypoint
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    // Adjust based on compass heading
    const relativeBearing = (bearing - compassHeading + 360) % 360;
    
    // Check if waypoint is in view angle (assuming camera has ~60° FOV)
    return relativeBearing > 330 || relativeBearing < 30;
  };
  
  return (
    <>
      {waypoints.map((waypoint, index) => {
        // Only show waypoints that would be in view
        if (!isInView(waypoint.position)) return null;
        
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              // Position would be calculated based on device orientation
              // This is simplified for demonstration
              top: `${30 + index * 10}%`,
              left: `${50 + (Math.random() * 20 - 10)}%`
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary/70 text-white p-3 rounded-lg shadow-lg flex flex-col items-center">
              {waypoint.type === 'turn-right' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {waypoint.type === 'turn-left' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {waypoint.type === 'landmark' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L16 8H8L12 2Z" fill="currentColor"/>
                  <circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
              <span className="mt-1 font-medium">{waypoint.name}</span>
              {waypoint.landmark && (
                <span className="text-xs">{waypoint.landmark}</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </>
  );
}