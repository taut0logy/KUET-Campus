"use client";
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Loader2, Upload, Camera, Sparkles, Brain, Cpu, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function FoodRecognition({ meals }) {
  const [predictions, setPredictions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [nutritionEstimate, setNutritionEstimate] = useState(null);
  const [similarMeals, setSimilarMeals] = useState([]);
  const fileInputRef = useRef();
  const modelRef = useRef();

  // Load model on component mount
  useEffect(() => {
    async function loadModel() {
      setModelLoading(true);
      modelRef.current = await mobilenet.load({
        version: 2,
        alpha: 1.0
      });
      setModelLoading(false);
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


    return nutritionDB[foodItem.toLowerCase()] || {
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
    <div className="space-y-6 p-4 bg-gray from-blue-50 to-indigo-50 rounded-xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-2 mb-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-red-600">
            AI Food Nutrition Estimation
          </h2>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </div>
        <p className="text-white-600 max-w mx-auto">
          Take a photo of your food to get instant nutrition estimates and find similar meals in our cafeteria.
        </p>

        
      </motion.div>

      {/* Model status indicator */}
      <div className="flex justify-center">
        <Badge 
          variant={modelLoading ? "outline" : "default"} 
          className={`${modelLoading ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-green-100 text-green-800 border-green-200'} flex items-center gap-1 px-3 py-1`}
        >
          {modelLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>AI Model Loading...</span>
            </>
          ) : (
            <>
              <Check className="h-3 w-3" />
              <span>AI Ready</span>
            </>
          )}
        </Badge>
      </div>

      <motion.div 
        className="border-2 border-dashed border-indigo-200 rounded-lg bg-black/80 backdrop-blur-sm p-8 text-center shadow-sm hover:shadow-md transition-shadow"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />

        {!selectedImage ? (
          <div className="py-8">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-indigo-100 p-4">
                <Camera className="h-12 w-12 text-indigo-600" />
              </div>
            </div>
            <Button
              onClick={() => fileInputRef.current.click()}
              disabled={loading || modelLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              {modelLoading ? 'AI Model Loading...' : 'Upload Food Photo'}
            </Button>
          </div>
        ) : (
          <div className="relative">
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={selectedImage}
              alt="Uploaded food"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            {loading && (
              <div className="absolute inset-0 bg-indigo-900/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Loader2 className="animate-spin text-white h-10 w-10 mx-auto mb-2" />
                  <p className="text-white font-medium">AI Analyzing...</p>
                </div>
              </div>
            )}
            {!loading && (
              <div className="mt-4">
                <Button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  size="sm"
                >
                  Choose Another Photo
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Results */}
      {predictions.length > 0 && (
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="overflow-hidden border-indigo-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-indigo-600" /> 
                    AI Detection
                  </CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                    {Math.round(predictions[0].probability * 100)}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h3 className="font-medium text-lg text-indigo-800">{predictions[0].className.split(',')[0]}</h3>
                  <p className="text-sm text-gray-600">
                    {predictions[0].className.split(',').slice(1).join(', ')}
                  </p>
                </div>
                {predictions.length > 1 && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Other possibilities:</p>
                    <ul className="list-disc list-inside">
                      {predictions.slice(1, 3).map((pred, idx) => (
                        <li key={idx}>
                          {pred.className.split(',')[0]} ({Math.round(pred.probability * 100)}%)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-indigo-100 shadow-md hover:shadow-lg transition-shadow">
              <div className="h-2 bg-gradient-to-r from-green-500 to-teal-600"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-teal-600" /> 
                  Nutrition AI Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg mb-3">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-green-800">
                      {nutritionEstimate?.calories}
                    </span>
                    <span className="block text-sm text-green-600">calories</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-800">{nutritionEstimate?.protein}g</p>
                    <p className="text-sm text-blue-600">Protein</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-800">{nutritionEstimate?.carbs}g</p>
                    <p className="text-sm text-purple-600">Carbs</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-800">{nutritionEstimate?.fat}g</p>
                    <p className="text-sm text-amber-600">Fat</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-indigo-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center">
                <Brain className="h-4 w-4 mr-2 text-orange-600" /> 
                AI-Recommended Menu Items
              </CardTitle>
              <CardDescription>
                Based on your photo, our AI found these similar meals in our cafeteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {similarMeals.map((meal, index) => (
                  <motion.div 
                    key={meal.id} 
                    className="border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg hover:shadow-md transition-all"
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <h3 className="font-bold text-orange-800">{meal.name}</h3>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        {meal.nutrition.calories} cal
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-gray-600">${meal.price}</span>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Match score: {Math.min(100, Math.max(0, 100 - meal.score))}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-orange-50 flex justify-center">
              <p className="text-sm text-orange-700">
                <Sparkles className="h-3 w-3 inline mr-1" />
                AI recommendations are based on nutritional similarity
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
}