import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Map, AlertTriangle, Lock } from 'lucide-react';

export default function MilitaryIndoorNavigation({ buildingId, userLevel, onExit }) {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [loading, setLoading] = useState(true);
  const [securityClearance, setSecurityClearance] = useState('cadet'); // cadet, officer, command
  const [indoorWaypoints, setIndoorWaypoints] = useState([]);
  const [floorData, setFloorData] = useState(null);
  
  // Simulate loading floor data
  useEffect(() => {
    setLoading(true);
    // In a real app, you would fetch this data from your backend
    setTimeout(() => {
      // Sample indoor mapping data for the main academic building
      if (buildingId === 1) { // Main Academic Building
        setFloorData({
          floors: 4,
          currentFloor: 1,
          layout: "rectangular",
          secureAreas: [
            { name: "Tactical Communication Lab", floor: 2, clearanceRequired: "officer" },
            { name: "Command Simulation Room", floor: 3, clearanceRequired: "command" }
          ]
        });
        
        setIndoorWaypoints([
          { id: 1, name: "Entrance", position: [20, 80], floor: 1 },
          { id: 2, name: "Main Hall", position: [50, 50], floor: 1 },
          { id: 3, name: "Classroom 101", position: [30, 30], floor: 1 },
          { id: 4, name: "Tactical Lab", position: [70, 40], floor: 2, restricted: true },
          { id: 5, name: "Library", position: [60, 70], floor: 2 }
        ]);
      } else if (buildingId === 3) { // Engineering Labs
        setFloorData({
          floors: 3,
          currentFloor: 1,
          layout: "complex",
          secureAreas: [
            { name: "Advanced Materials Lab", floor: 1, clearanceRequired: "officer" },
            { name: "Prototype Test Chamber", floor: 2, clearanceRequired: "command" }
          ]
        });
        
        setIndoorWaypoints([
          { id: 1, name: "Entrance", position: [20, 80], floor: 1 },
          { id: 2, name: "Computer Lab", position: [40, 60], floor: 1 },
          { id: 3, name: "Materials Lab", position: [70, 70], floor: 1, restricted: true },
          { id: 4, name: "Electronics Workshop", position: [50, 30], floor: 2 },
          { id: 5, name: "Test Chamber", position: [80, 20], floor: 2, restricted: true }
        ]);
      }
      
      setLoading(false);
    }, 1500);
  }, [buildingId]);

  const handleFloorChange = (floor) => {
    setCurrentFloor(floor);
  };

  // Filter waypoints for current floor
  const currentFloorWaypoints = indoorWaypoints.filter(wp => wp.floor === currentFloor);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white">Loading indoor navigation data...</p>
          <p className="text-white/60 text-sm mt-2">Scanning building layout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black/85">
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onExit}
          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Exit Indoor View
        </button>
      </div>
      
      {/* Floor selector */}
      <div className="absolute top-4 left-4 bg-background/20 backdrop-blur-md rounded-lg p-2">
        <div className="text-xs text-white mb-1 font-medium">Floor Level</div>
        <div className="flex flex-col gap-2">
          {Array.from({length: floorData?.floors || 1}, (_, i) => i + 1).reverse().map(floor => (
            <button
              key={floor}
              onClick={() => handleFloorChange(floor)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                ${currentFloor === floor 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background/40 text-white hover:bg-background/60'}`}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>
      
      {/* Indoor map area (simulated) */}
      <div className="absolute inset-10 border-2 border-white/20 rounded-lg overflow-hidden">
        {/* Simple grid layout for demo */}
        <div className="relative w-full h-full">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
            {Array.from({length: 100}).map((_, i) => (
              <div key={i} className="border border-white/10"></div>
            ))}
          </div>
          
          {/* Waypoints */}
          {currentFloorWaypoints.map(waypoint => (
            <motion.div
              key={waypoint.id}
              className={`absolute rounded-full 
                ${waypoint.restricted 
                  ? 'bg-red-500/70 text-white' 
                  : 'bg-primary/70 text-primary-foreground'}`}
              style={{
                left: `${waypoint.position[0]}%`,
                top: `${waypoint.position[1]}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <div className="p-3">
                {waypoint.restricted ? <Lock size={16} /> : <Map size={16} />}
              </div>
              <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs ${waypoint.restricted ? 'bg-red-900/70' : 'bg-background/70'}`}>
                  {waypoint.name}
                  {waypoint.restricted && (
                    <span className="ml-1 text-red-300">
                      <AlertTriangle size={10} className="inline" /> Restricted
                    </span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
          
          {/* Current position (simulated) */}
          <motion.div
            className="absolute bg-blue-500 rounded-full w-4 h-4 border-2 border-white"
            style={{ left: '20%', top: '80%' }}
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.5)', '0 0 0 10px rgba(59, 130, 246, 0)'],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
      
      {/* Floor info */}
      <div className="absolute bottom-4 left-4 right-4 bg-background/30 backdrop-blur-md rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-primary" />
          <h3 className="font-semibold text-white">Floor {currentFloor} - Security Level: {securityClearance}</h3>
        </div>
        <p className="text-sm text-white/70">
          {currentFloor === 1 
            ? "Main access floor with classrooms and administrative offices."
            : currentFloor === 2
              ? "Advanced laboratories and research facilities. Some areas require officer clearance."
              : "Command and control facilities. Restricted access."}
        </p>
      </div>
    </div>
  );
}