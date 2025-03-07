import { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';

export default function ObjectRecognition({ videoRef }) {
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  
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
    
    const detectObjects = async () => {
      // Check if video is playing
      if (video.readyState !== 4) return;

      // Adjust canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Run detection
      const predictions = await model.detect(video);
      
      // Clear previous drawings
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw predictions
      predictions.forEach(prediction => {
        // Draw bounding box with military-style appearance
        context.strokeStyle = '#00FF00';
        context.lineWidth = 2;
        context.setLineDash([5, 3]);
        context.strokeRect(
          prediction.bbox[0], 
          prediction.bbox[1], 
          prediction.bbox[2], 
          prediction.bbox[3]
        );
        
        // Draw label
        context.fillStyle = '#00FF00';
        context.font = '16px "Courier New", monospace';
        context.fillText(
          `${prediction.class.toUpperCase()} (${Math.round(prediction.score * 100)}%)`,
          prediction.bbox[0],
          prediction.bbox[1] > 20 ? prediction.bbox[1] - 5 : 20
        );
        
        // Draw distance estimate (simulated)
        const distanceEstimate = Math.round(Math.random() * 10) + 5; // 5-15m
        context.fillText(
          `EST DIST: ${distanceEstimate}m`,
          prediction.bbox[0],
          prediction.bbox[1] > 40 ? prediction.bbox[1] - 25 : 40
        );
      });
      
      // Continue detection
      requestAnimationFrame(detectObjects);
    };
    
    detectObjects();
  }, [model, videoRef]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-10 pointer-events-none"
      style={{ objectFit: 'cover' }}
    />
  );
}
