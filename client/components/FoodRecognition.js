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
      // Fruits
      'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
      'banana': { calories: 96, protein: 1.3, carbs: 27, fat: 0.3 },
      'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
      'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
      'grapes': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
      'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
      'watermelon': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
      'pineapple': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },

      // Vegetables
      'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
      'broccoli': { calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
      'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
      'onion': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
      'garlic': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
      'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
      'cucumber': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },

      // Grains and Legumes
      'rice': { calories: 130, protein: 2.4, carbs: 28, fat: 0.2 },
      'quinoa': { calories: 120, protein: 4.1, carbs: 21, fat: 1.9 },
      'lentils': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
      'chickpeas': { calories: 164, protein: 8.9, carbs: 27, fat: 2.6 },
      'black beans': { calories: 132, protein: 8.9, carbs: 23, fat: 0.5 },
      'oats': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },

      // Dairy and Alternatives
      'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
      'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
      'cheddar cheese': { calories: 403, protein: 25, carbs: 1.3, fat: 33 },
      'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },

      // Meats and Fish
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'beef sirloin': { calories: 206, protein: 26, carbs: 0, fat: 11 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
      'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1.3 },
      'egg': { calories: 68, protein: 5.5, carbs: 0.6, fat: 4.8 },

      // Nuts and Seeds
      'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 },
      'walnuts': { calories: 654, protein: 15, carbs: 14, fat: 65 },
      'chia seeds': { calories: 486, protein: 16, carbs: 42, fat: 31 },
      'flaxseeds': { calories: 534, protein: 18, carbs: 29, fat: 42 },

      // Baked Goods and Snacks
      'whole wheat bread': { calories: 247, protein: 12, carbs: 41, fat: 4.2 },
      'croissant': { calories: 406, protein: 8.2, carbs: 45, fat: 21 },
      'potato chips': { calories: 536, protein: 7, carbs: 53, fat: 34 },
      'popcorn': { calories: 375, protein: 11, carbs: 74, fat: 4.3 },

      // Beverages
      'orange juice': { calories: 45, protein: 0.7, carbs: 10, fat: 0.2 },
      'cola': { calories: 42, protein: 0, carbs: 11, fat: 0 },
      'beer': { calories: 43, protein: 0.5, carbs: 3.6, fat: 0 },
      'red wine': { calories: 85, protein: 0.1, carbs: 2.6, fat: 0 },

      // Desserts
      'chocolate cake': { calories: 371, protein: 4.3, carbs: 50, fat: 18 },
      'ice cream': { calories: 207, protein: 3.5, carbs: 23, fat: 11 },
      'apple pie': { calories: 237, protein: 2.1, carbs: 34, fat: 11 },
      'brownie': { calories: 466, protein: 6.5, carbs: 58, fat: 23 }
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
          {loading ? 'Upload Food Photo' : 'Analyzing...'}
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
