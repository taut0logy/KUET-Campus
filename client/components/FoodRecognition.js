"use client";
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Loader2, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FoodRecognition({ meals }) {
  const [predictions, setPredictions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nutritionEstimate, setNutritionEstimate] = useState(null);
  const [similarMeals, setSimilarMeals] = useState([]);
  const fileInputRef = useRef();
  const modelRef = useRef();

  // Load model on component mount
  useEffect(() => {
    async function loadModel() {
      setLoading(true);
      modelRef.current = await mobilenet.load({
        version: 2,
        alpha: 1.0
      });
      setLoading(false);
    }
    loadModel();
  }, []);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setSelectedImage(e.target.result);
      analyzeImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Analyze image
  const analyzeImage = async (imageSrc) => {
    setLoading(true);
    try {
      const img = new Image();
      img.src = imageSrc;
      await img.decode();
      
      // Make prediction
      const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();
      
      const predictions = await modelRef.current.classify(tensor);
      setPredictions(predictions);
      
      // Estimate nutrition (mock data mapping)
      const foodItem = predictions[0].className.split(',')[0];
      const nutrition = estimateNutrition(foodItem);
      setNutritionEstimate(nutrition);
      
      // Find similar meals
      findSimilarMeals(nutrition);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setLoading(false);
  };

  // Simple nutrition estimation (replace with your API/database)
  const estimateNutrition = (foodItem) => {
    // Mock data - replace with actual nutrition database
    const nutritionDB = {
      'pizza': { calories: 285, protein: 12, carbs: 36, fat: 10 },
      'burger': { calories: 354, protein: 15, carbs: 29, fat: 18 },
      'salad': { calories: 152, protein: 5, carbs: 12, fat: 9 },
      // Add more items
    };

    return nutritionDB[foodItem] || {
      calories: 300,
      protein: 10,
      carbs: 35,
      fat: 12
    };
  };

  // Find similar meals from cafeteria menu
  const findSimilarMeals = (targetNutrition) => {
    const scoredMeals = meals.map(meal => {
      const score = Math.abs(meal.nutrition.calories - targetNutrition.calories) +
                    Math.abs(meal.nutrition.protein - targetNutrition.protein);
      return { ...meal, score };
    });

    setSimilarMeals(scoredMeals.sort((a, b) => a.score - b.score).slice(0, 3));
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        
        <Button 
          onClick={() => fileInputRef.current.click()}
          disabled={loading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {loading ? 'Analyzing...' : 'Upload Food Photo'}
        </Button>

        {selectedImage && (
          <div className="mt-4 relative">
            <img 
              src={selectedImage} 
              alt="Uploaded food"
              className="max-h-48 mx-auto rounded-lg"
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="animate-spin text-white h-8 w-8" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Detection Results</CardTitle>
                <CardDescription>
                  {predictions[0].className} ({Math.round(predictions[0].probability * 100)}% confidence)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nutrition Estimate</CardTitle>
                <CardDescription>
                  {nutritionEstimate?.calories} cal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm">Protein</p>
                    <p className="font-bold">{nutritionEstimate?.protein}g</p>
                  </div>
                  <div>
                    <p className="text-sm">Carbs</p>
                    <p className="font-bold">{nutritionEstimate?.carbs}g</p>
                  </div>
                  <div>
                    <p className="text-sm">Fat</p>
                    <p className="font-bold">{nutritionEstimate?.fat}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Similar Menu Items</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              {similarMeals.map(meal => (
                <div key={meal.id} className="border p-4 rounded-lg">
                  <h3 className="font-bold">{meal.name}</h3>
                  <p className="text-sm text-gray-600">
                    {meal.nutrition.calories} cal
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
