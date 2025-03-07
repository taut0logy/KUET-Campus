import { useEffect, useRef, useState } from 'react';
import { ArrowUp, CornerDownLeft, CornerUpRight, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import ARWaypoints from './ARWaypoints';
import MilitaryIndoorNavigation from './MilitaryIndoorNavigation';
import ObjectRecognition from './ObjectRecognition';
export default function ARNavigationView({ destination, userPosition, onClose, calculateDistance }) {
    const videoRef = useRef(null);
    const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
    const [compassHeading, setCompassHeading] = useState(0);
    const [arDirections, setArDirections] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [permissionStatus, setPermissionStatus] = useState('pending');
    const [remainingDistance, setRemainingDistance] = useState(0);
    const [indoorModeActive, setIndoorModeActive] = useState(false);
    const [showTacticalOverlay, setShowTacticalOverlay] = useState(false);
    const [objectDetectionActive, setObjectDetectionActive] = useState(true); 

  // Initialize camera and sensors
  useEffect(() => {
    // Request camera permission
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setPermissionStatus('granted');
          }
        })
        .catch(error => {
          console.error("Camera access error:", error);
          setPermissionStatus('denied');
        });
    }

    // Request device orientation permission
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        DeviceOrientationEvent.requestPermission) {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    // Get compass heading if available
    if (window.navigator.geolocation) {
      window.addEventListener('deviceorientationabsolute', handleCompass);
    }

    // Generate navigation steps (in real app, this would come from a navigation API)
    generateNavigationSteps();

    // Update distance calculation
    const distanceInterval = setInterval(() => {
      if (userPosition && destination) {
        const distance = calculateDistance(userPosition, destination.position);
        setRemainingDistance(distance);
      }
    }, 1000);

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('deviceorientationabsolute', handleCompass);
      clearInterval(distanceInterval);
    };
  }, [destination, userPosition]);

  const handleOrientation = (event) => {
    setDeviceOrientation({
      alpha: event.alpha, // z-axis rotation
      beta: event.beta,   // x-axis rotation
      gamma: event.gamma  // y-axis rotation
    });
  };

  const handleCompass = (event) => {
    if (event.webkitCompassHeading) {
      setCompassHeading(event.webkitCompassHeading);
    } else {
      setCompassHeading(360 - event.alpha);
    }
  };

  // Simulate navigation steps (would use a routing API in production)
  const generateNavigationSteps = () => {
    // Sample directions
    setArDirections([
      { type: 'straight', distance: 50, instruction: 'Walk straight for 50m' },
      { type: 'right', distance: 100, instruction: 'Turn right at the Science Building' },
      { type: 'straight', distance: 75, instruction: 'Continue straight for 75m' },
      { type: 'left', distance: 30, instruction: 'Turn left towards the Library' },
      { type: 'destination', instruction: `Destination: ${destination.name}` }
    ]);
  };

  // Calculate direction arrow angle based on compass and destination
  const calculateDirectionAngle = () => {
    if (!userPosition || !destination) return 0;
    
    const lat1 = userPosition[0] * Math.PI / 180;
    const lon1 = userPosition[1] * Math.PI / 180;
    const lat2 = destination.position[0] * Math.PI / 180;
    const lon2 = destination.position[1] * Math.PI / 180;
    
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    // Adjust based on compass heading
    return (bearing - compassHeading + 360) % 360;
  };

  const toggleObjectDetection = () => {
    setObjectDetectionActive(!objectDetectionActive);
  };

  if (permissionStatus === 'denied') {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          Camera access is required for AR navigation
        </div>
        <button onClick={onClose} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          Return to Map
        </button>
      </div>
    );
  }

  if (indoorModeActive) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <MilitaryIndoorNavigation 
          buildingId={destination.id} 
          onExit={() => setIndoorModeActive(false)} 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera view */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Object Recognition layer - added new! */}
      {objectDetectionActive && permissionStatus === 'granted' && (
        <ObjectRecognition videoRef={videoRef} />
      )}
      
      {/* AR overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Direction indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            className="bg-primary/80 rounded-full p-4 shadow-glow"
            style={{ rotate: `${calculateDirectionAngle()}deg` }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Navigation size={48} className="text-primary-foreground" />
          </motion.div>
        </div>
        
        {showTacticalOverlay && (
          <div className="absolute inset-0">
            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 pointer-events-none">
              {Array.from({length: 64}).map((_, i) => (
                <div key={i} className="border border-green-500/20"></div>
              ))}
            </div>
            
            {/* Compass rose */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-60">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border border-green-500"></div>
                <div 
                  className="absolute top-1/2 left-1/2 h-14 w-1 bg-green-500 origin-bottom transform -translate-x-1/2 -translate-y-1/2"
                  style={{ rotate: `${compassHeading}deg` }}
                ></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-xs text-green-500 font-mono">N</div>
                <div className="absolute right-0 top-1/2 transform translate-y-1/2 translate-x-1 text-xs text-green-500 font-mono">E</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 text-xs text-green-500 font-mono">S</div>
                <div className="absolute left-0 top-1/2 transform translate-y-1/2 -translate-x-1 text-xs text-green-500 font-mono">W</div>
              </div>
            </div>
            
            {/* Coordinates display */}
            <div className="absolute bottom-24 right-4 bg-black/40 p-2 rounded font-mono text-xs text-green-500">
              <div>LAT: {userPosition?.[0].toFixed(6) || "00.000000"}</div>
              <div>LON: {userPosition?.[1].toFixed(6) || "00.000000"}</div>
              <div>HDG: {Math.round(compassHeading)}°</div>
            </div>
          </div>
        )}

        {/* Use the ARWaypoints component for dynamic waypoints */}
        <ARWaypoints 
          userPosition={userPosition}
          destination={destination}
          deviceOrientation={deviceOrientation}
          compassHeading={compassHeading}
        />
        </div>
        {/* UI Elements */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        {/* Current direction step */}
        <div className="bg-background/90 rounded-lg p-4 mb-4 shadow-lg">
          <div className="flex items-center mb-2">
            {arDirections[currentStep]?.type === 'straight' && <ArrowUp className="mr-2" />}
            {arDirections[currentStep]?.type === 'right' && <CornerUpRight className="mr-2" />}
            {arDirections[currentStep]?.type === 'left' && <CornerDownLeft className="mr-2" />}
            {arDirections[currentStep]?.type === 'destination' && <MapPin className="mr-2" />}
            <h3 className="font-semibold">{arDirections[currentStep]?.instruction}</h3>
          </div>
          
          {remainingDistance > 0 && (
            <div className="text-sm text-muted-foreground">
              {Math.round(remainingDistance / 10) / 100} km to destination
            </div>
          )}
          
          {/* Steps indicator */}
          <div className="flex justify-center mt-2 space-x-1">
            {arDirections.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 w-6 rounded-full ${i === currentStep ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="bg-muted/80 p-2 rounded-full disabled:opacity-50"
          >
            Previous
          </button>
          
          <button 
            onClick={onClose} 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
          >
            Exit AR Mode
          </button>
          
          <button 
            onClick={() => setCurrentStep(prev => Math.min(arDirections.length - 1, prev + 1))}
            disabled={currentStep === arDirections.length - 1}
            className="bg-muted/80 p-2 rounded-full disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}