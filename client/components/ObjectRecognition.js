import { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, AlertCircle } from 'lucide-react';

export default function ObjectRecognition({ videoRef }) {
    const canvasRef = useRef(null);
    const [model, setModel] = useState(null);
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [showChairWarning, setShowChairWarning] = useState(false);
    const [chairLocation, setChairLocation] = useState(null);

    // Objects that should trigger warnings
    const ALERT_OBJECTS = ['chair'];

    // Load object detection model
    useEffect(() => {
        const loadModel = async () => {
            try {
                // Load TensorFlow.js and model
                await tf.ready();
                const loadedModel = await cocossd.load();
                setModel(loadedModel);
                console.log("Object detection model loaded");
            } catch (error) {
                console.error("Failed to load model", error);
            }
        };
        loadModel();
    }, []);

    // Run object detection
    useEffect(() => {
        if (!model || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let animationFrame;
        const detectObjects = async () => {
            // Check if video is playing
            if (video.readyState !== 4) {
                animationFrame = requestAnimationFrame(detectObjects);
                return;
            }

            // Adjust canvas to video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            try {
                // Run detection
                const predictions = await model.detect(video);
                setDetectedObjects(predictions);

                // Check if chair is detected
                const chairDetection = predictions.find(pred =>
                    pred.class.toLowerCase() === 'chair' && pred.score > 0.6
                );

                if (chairDetection && !showChairWarning) {
                    // Show chair warning popup
                    setShowChairWarning(true);
                    setChairLocation({
                        x: chairDetection.bbox[0] + chairDetection.bbox[2] / 2,
                        y: chairDetection.bbox[1] + chairDetection.bbox[3] / 2
                    });
                }

                // Clear previous drawings
                context.clearRect(0, 0, canvas.width, canvas.height);

                // Draw predictions
                predictions.forEach(prediction => {
                    const { class: objectClass, score, bbox } = prediction;

                    // Check if this is a warning object
                    const isWarningObject = ALERT_OBJECTS.includes(objectClass.toLowerCase());

                    // Set different styles based on warning status
                    if (isWarningObject) {
                        // Warning style - Red for dangerous objects
                        context.strokeStyle = '#FF0000';
                        context.fillStyle = '#FF0000';
                        context.lineWidth = 3;
                        context.setLineDash([]);

                        // Draw pulsing highlight
                        context.beginPath();
                        context.arc(
                            bbox[0] + bbox[2] / 2,
                            bbox[1] + bbox[3] / 2,
                            Math.max(bbox[2], bbox[3]) / 2 + 10 + Math.sin(Date.now() / 200) * 5,
                            0,
                            2 * Math.PI
                        );
                        context.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                        context.stroke();
                    } else {
                        // Normal style - Green for standard objects
                        context.strokeStyle = '#00FF00';
                        context.fillStyle = '#00FF00';
                        context.lineWidth = 2;
                        context.setLineDash([5, 3]);
                    }

                    // Draw bounding box
                    context.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);

                    // Draw label with special formatting for warning objects
                    context.font = isWarningObject
                        ? 'bold 18px "Courier New", monospace'
                        : '16px "Courier New", monospace';

                    context.fillText(
                        `${objectClass.toUpperCase()} (${Math.round(score * 100)}%)`,
                        bbox[0],
                        bbox[1] > 25 ? bbox[1] - 5 : 25
                    );

                    // Draw distance estimate (simulated)
                    const distanceEstimate = Math.round(Math.random() * 10) + 5; // 5-15m
                    context.fillText(
                        `EST DIST: ${distanceEstimate}m`,
                        bbox[0],
                        bbox[1] > 45 ? bbox[1] - 25 : 45
                    );

                    // Additional warning for alert objects
                    if (isWarningObject) {
                        context.fillStyle = 'rgba(255, 0, 0, 0.9)';
                        context.font = 'bold 16px "Courier New", monospace';
                        context.fillText(
                            '⚠️ CAUTION',
                            bbox[0],
                            bbox[1] + bbox[3] + 20
                        );
                    }
                });
            } catch (error) {
                console.error("Detection error:", error);
            }

            // Continue detection
            animationFrame = requestAnimationFrame(detectObjects);
        };

        detectObjects();

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [model, videoRef, showChairWarning, detectedObjects, ALERT_OBJECTS]);

    const handleCloseWarning = () => {
        setShowChairWarning(false);

        // Allow new warnings after 3 seconds
        setTimeout(() => {
            setChairLocation(null);
        }, 3000);
    };

    return (
        <>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 pointer-events-none"
                style={{ objectFit: 'cover' }}
            />

            {/* Chair Warning Popup */}
            <AnimatePresence>
                {showChairWarning && (
                    <motion.div
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="relative max-w-md w-full bg-black/85 backdrop-blur-md border-2 border-red-500 rounded-lg p-5 shadow-lg"
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                            {/* Pulsing background effect */}
                            <motion.div
                                className="absolute inset-0 rounded-lg bg-red-500/20"
                                animate={{ opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <motion.div
                                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                                        transition={{ duration: 0.5, repeat: 3 }}
                                    >
                                        <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                                    </motion.div>
                                    <h2 className="text-xl font-bold text-red-500">WARNING</h2>
                                </div>
                                <button
                                    onClick={handleCloseWarning}
                                    className="p-1 rounded-full hover:bg-gray-700/50"
                                >
                                    <X className="h-5 w-5 text-gray-300" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-white mb-2">Obstacle Detected!</h3>
                                <p className="text-gray-300 mb-3">
                                    A <span className="text-red-400 font-bold">CHAIR</span> has been detected in your path.
                                    This would be a car in a real scenario.
                                </p>
                                <p className="text-gray-400 text-sm italic">
                                    Proceed with caution to avoid collision.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseWarning}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium"
                                >
                                    Acknowledge
                                </button>
                                <button
                                    onClick={handleCloseWarning}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
                                >
                                    Dismiss
                                </button>
                            </div>

                            {/* Military-style decorative elements */}
                            <div className="absolute top-0 left-0 w-12 h-1 bg-red-500 transform -translate-y-0.5"></div>
                            <div className="absolute top-0 right-0 w-12 h-1 bg-red-500 transform -translate-y-0.5"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-1 bg-red-500 transform translate-y-0.5"></div>
                            <div className="absolute bottom-0 right-0 w-12 h-1 bg-red-500 transform translate-y-0.5"></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Additional warning indicators when chair is detected */}
            {showChairWarning && (
                <div className="absolute top-0 inset-x-0 z-30">
                    <motion.div
                        className="h-1.5 bg-red-500"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                        className="bg-red-600/30 py-1 px-4 flex items-center justify-center"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        <p className="text-xs font-mono font-bold text-red-500">CAUTION REQUIRED</p>
                    </motion.div>
                </div>
            )}
        </>
    );
}