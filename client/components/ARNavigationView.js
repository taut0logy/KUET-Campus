'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUp, X, Navigation, CornerUpLeft, CornerUpRight, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ARNavigationView({ 
  destination, 
  userPosition, 
  onClose,
  calculateDistance 
}) {
  const [heading, setHeading] = useState(0);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const [instructions, setInstructions] = useState('');
  const [previousPositions, setPreviousPositions] = useState([]);
  const [currentDirection, setCurrentDirection] = useState('straight');
  const [actionRequired, setActionRequired] = useState(false);
  const lastUpdateTime = useRef(Date.now());
  const [arElements, setArElements] = useState([]);
  
  // Store previous positions to determine direction of travel
  useEffect(() => {
    if (!userPosition) return;
    
    setPreviousPositions(prev => {
      // Keep only last 5 positions for movement analysis
      const newPositions = [...prev, userPosition].slice(-5);
      return newPositions;
    });
  }, [userPosition]);

  // Calculate direction to destination with improved guidance
  useEffect(() => {
    if (!userPosition || !destination?.position) return;
    
    // Calculate heading to destination
    const deltaX = destination.position[1] - userPosition[1];
    const deltaY = destination.position[0] - userPosition[0];
    const headingInRadians = Math.atan2(deltaX, deltaY);
    let headingInDegrees = (headingInRadians * 180 / Math.PI);
    if (headingInDegrees < 0) headingInDegrees += 360;
    setHeading(headingInDegrees);
    
    // Generate detailed instructions
    const distance = calculateDistance(userPosition, destination.position);
    
    // Calculate absolute angle difference
    let angleDiff = Math.abs(headingInDegrees - deviceOrientation);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    
    // Direction based on relative angle
    const relativeAngle = ((headingInDegrees - deviceOrientation) + 360) % 360;
    
    // Determine if we need to turn and which direction
    let direction = '';
    let actionNeeded = false;
    
    if (angleDiff < 15) {
      direction = 'straight ahead';
      setCurrentDirection('straight');
      actionNeeded = false;
    } else if (angleDiff < 45) {
      if (relativeAngle < 180) {
        direction = 'slightly right';
        setCurrentDirection('slight-right');
      } else {
        direction = 'slightly left';
        setCurrentDirection('slight-left');
      }
      actionNeeded = angleDiff > 30;
    } else if (angleDiff < 90) {
      if (relativeAngle < 180) {
        direction = 'turn right';
        setCurrentDirection('right');
      } else {
        direction = 'turn left';
        setCurrentDirection('left');
      }
      actionNeeded = true;
    } else {
      if (relativeAngle < 180) {
        direction = 'make a sharp right turn';
        setCurrentDirection('sharp-right');
      } else {
        direction = 'make a sharp left turn';
        setCurrentDirection('sharp-left');
      }
      actionNeeded = true;
    }
    
    // Update instruction with distance and direction
    const distanceText = distance < 50 
      ? "You've arrived at your destination!" 
      : `${Math.round(distance/10)/100} km ${direction}`;
    
    setInstructions(distanceText);
    setActionRequired(actionNeeded);
    
    // Generate virtual AR waypoints when close to destination
    if (distance < 200 && Date.now() - lastUpdateTime.current > 2000) {
      lastUpdateTime.current = Date.now();
      
      // Create AR navigation elements at various distances
      const newElements = [];
      
      // Add waypoints along the path
      for (let i = 1; i <= 3; i++) {
        const factor = i / 4;
        const waypointPos = [
          userPosition[0] + (destination.position[0] - userPosition[0]) * factor,
          userPosition[1] + (destination.position[1] - userPosition[1]) * factor
        ];
        
        // Calculate waypoint heading
        const wpDeltaX = waypointPos[1] - userPosition[1];
        const wpDeltaY = waypointPos[0] - userPosition[0];
        const wpHeading = Math.atan2(wpDeltaX, wpDeltaY) * 180 / Math.PI;
        
        newElements.push({
          type: 'waypoint',
          position: waypointPos,
          heading: wpHeading,
          distance: calculateDistance(userPosition, waypointPos)
        });
      }
      
      setArElements(newElements);
    }
  }, [userPosition, destination, deviceOrientation, calculateDistance]);
  
  // More realistic device orientation simulation
  useEffect(() => {
    // Instead of continuously rotating, let's simulate more realistic movement
    const interval = setInterval(() => {
      // Simulate user looking around or walking
      setDeviceOrientation(prev => {
        // More realistic orientation changes
        const change = (Math.random() - 0.5) * 5; // Random change between -2.5 and 2.5 degrees
        return (prev + change + 360) % 360;
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate arrow rotation based on heading and device orientation
  const arrowRotation = heading - deviceOrientation;
  
  // Get direction icon based on current direction
  const getDirectionIcon = () => {
    switch(currentDirection) {
      case 'slight-right':
      case 'right':
      case 'sharp-right':
        return <CornerUpRight 
          size={120} 
          className={`text-primary ${actionRequired ? 'animate-pulse' : ''}`}
        />;
      case 'slight-left':
      case 'left':
      case 'sharp-left':
        return <CornerUpLeft 
          size={120} 
          className={`text-primary ${actionRequired ? 'animate-pulse' : ''}`}
        />;
      case 'straight':
      default:
        return <ArrowUp
          size={120}
          className="text-primary"
        />;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Mock camera view */}
      <div 
        className="flex-1 relative bg-gradient-to-b from-sky-400 to-gray-900 overflow-hidden"
        style={{ backgroundImage: "url('/images/campus-ar-bg.jpg')", backgroundSize: 'cover' }}
      >
        {/* AR overlays */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Direction indicators */}
          <div className="mb-8 relative">
            {getDirectionIcon()}
            
            {/* Degree indicator */}
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white">
              {Math.round(Math.abs(heading - deviceOrientation))}°
            </div>
          </div>
          
          {/* Distance marker */}
          <div className="bg-primary text-white px-6 py-3 rounded-full text-xl font-bold">
            {userPosition && destination ? 
              `${Math.round(calculateDistance(userPosition, destination.position)/10)/100} km` : 
              'Calculating...'}
          </div>
          
          {/* AR path visualization */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full flex items-center justify-center">
              <div className="perspective-[800px] transform-gpu">
                {/* Visualize a path on the ground */}
                <div className="w-40 h-[400px] bg-primary/30 rounded-md border-2 border-primary transform-gpu rotateX(60deg) translate-y-60 flex flex-col justify-end items-center">
                  <div className="w-full h-2 bg-primary"></div>
                  <div className="w-full h-2 bg-primary mt-20"></div>
                  <div className="w-full h-2 bg-primary mt-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top banner - current action */}
        {actionRequired && (
          <div className="absolute top-4 left-4 right-4 bg-red-500 text-white p-2 rounded-md text-center font-bold animate-bounce">
            {currentDirection.includes('right') ? 'Turn right now!' : 'Turn left now!'}
          </div>
        )}
        
        {/* Instructions panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
          <h3 className="text-xl font-bold mb-2 flex items-center">
            <Navigation className="mr-2" /> 
            {destination?.name || 'Navigating...'}
          </h3>
          <div className="flex items-center">
            {/* Visual direction indicator */}
            <div className="mr-3">
              {currentDirection.includes('right') ? 
                <ArrowRight className="text-primary" size={24} /> : 
                currentDirection.includes('left') ? 
                <ArrowLeft className="text-primary" size={24} /> : 
                <ArrowUp className="text-primary" size={24} />
              }
            </div>
            <p>{instructions || 'Getting directions...'}</p>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-black text-white p-4 flex justify-between items-center">
        <button 
          onClick={onClose}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-800"
        >
          <X size={24} />
        </button>
        <div className="text-center">AR Navigation (Demo)</div>
        <div className="w-12"></div>
      </div>
    </div>
  );
}