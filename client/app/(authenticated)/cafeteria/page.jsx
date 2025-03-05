"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import useCafeteriaStore from "@/stores/cafeteria-store";
import useCartStore from "@/stores/cart-store";
import { Wheat, Loader2, ArrowDown01, ArrowUp01, Filter, Sparkles, Vegan, WheatOff, Square, ShoppingCart, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import FoodRecognition from '@/components/FoodRecognition';
import MealChatbot from '@/components/MealChatbot';

export default function Cafeteria() {
  const { meals, loading, error, fetchMeals, createPreorder } = useCafeteriaStore();
  const { addToCart } = useCartStore();

  // State for search and category filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  // State variables at the top of the component
  const [sortType, setSortType] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");
  const [priceRange, setPriceRange] = useState([0, 100]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // State for user inputs and suggested meal
  const [userInputs, setUserInputs] = useState({
    weight: "",
    heightFeet: "",
    heightInches: "",
    age: "",
    gender: "",
    theoryClasses: "",
    sessionalClasses: "",
    weather: "",
  });
  const [suggestedMeal, setSuggestedMeal] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // Fetch meals on component mount
  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);


  // Fetch meals on component mount
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, priceRange, sortType, sortOrder]);


    // Filter meals based on search and category
    const filteredMeals = meals
    .filter((meal) => {
      const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(meal.category);
      const matchesPrice = meal.price >= priceRange[0] && meal.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      let valueA, valueB;

      if (sortType === "price") {
        valueA = a.price;
        valueB = b.price;
      } else {
        valueA = a.nutrition?.calories || 0;
        valueB = b.nutrition?.calories || 0;
      }

      if (sortOrder === "asc") {
        return valueA - valueB;
      }
      return valueB - valueA;
    });


  // Calculate pagination indexes
  const indexOfLastMeal = currentPage * itemsPerPage;
  const indexOfFirstMeal = indexOfLastMeal - itemsPerPage;
  const currentMeals = filteredMeals.slice(indexOfFirstMeal, indexOfLastMeal);
  const totalPages = Math.ceil(filteredMeals.length / itemsPerPage);

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  // Handle meal order
  const handleOrder = async (mealId) => {
    try {
      await createPreorder(mealId);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    }
  };

  // Handler to add a meal to the cart
  const handleAddToCart = async (mealId) => {
    try {
      await addToCart(mealId);
      toast.success("Meal added to cart! Visit cart to place order.");
    } catch (error) {
      toast.error(error.message || "Failed to add meal to cart");
    }
  };

  // Handle category filter changes
  const handleCategoryChange = (category, checked) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  // Handle changes in form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInputs((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate and suggest a meal
  const calculateSuggestion = () => {
    const {
      weight,
      heightFeet,
      heightInches,
      age,
      gender,
      theoryClasses,
      sessionalClasses,
      weather,
    } = userInputs;

    // Validate inputs
    if (!weight || !heightFeet || !heightInches || !age || !gender || !theoryClasses || !sessionalClasses || !weather) {
      toast.error("Please fill all fields");
      return;
    }
    if (isNaN(weight) || isNaN(heightFeet) || isNaN(heightInches) || isNaN(age) || isNaN(theoryClasses) || isNaN(sessionalClasses)) {
      toast.error("Please enter valid numbers for weight, height, age, and classes");
      return;
    }

    // Convert height to centimeters
    const heightCm = parseFloat(heightFeet) * 30.48 + parseFloat(heightInches) * 2.54;

    // Calculate BMR (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === "male") {
      bmr = 10 * parseFloat(weight) + 6.25 * heightCm - 5 * parseFloat(age) + 5;
    } else if (gender === "female") {
      bmr = 10 * parseFloat(weight) + 6.25 * heightCm - 5 * parseFloat(age) - 161;
    } else {
      toast.error("Invalid gender");
      return;
    }

    // Calculate activity multiplier based on total class time
    const totalClassMinutes = parseFloat(theoryClasses) * 50 + parseFloat(sessionalClasses) * 150;
    const totalClassHours = totalClassMinutes / 60;
    let activityMultiplier;
    if (totalClassHours < 3) {
      activityMultiplier = 1.2; // Sedentary
    } else if (totalClassHours <= 6) {
      activityMultiplier = 1.375; // Moderately active
    } else {
      activityMultiplier = 1.55; // Active
    }

    // Adjust for weather
    let weatherAdjustment = 1.0;
    if (weather === "cold") {
      weatherAdjustment = 1.05; // 5% increase
    } else if (weather === "very sunny") {
      weatherAdjustment = 0.95; // 5% decrease
    }

    // Calculate TDEE and meal targets
    const tdee = bmr * activityMultiplier * weatherAdjustment;
    const mealCalories = tdee * 0.35;
    const targetCarbs = (mealCalories * 0.5) / 4; // 50% of calories, 4 kcal/g
    const targetFats = (mealCalories * 0.3) / 9; // 30% of calories, 9 kcal/g
    const targetProteins = (mealCalories * 0.2) / 4; // 20% of calories, 4 kcal/g

    // Find the best matching meal
    let bestMeal = null;
    let minScore = Infinity;
    meals.forEach((meal) => {
      const calories = meal.nutrition?.calories || 0;
      const carbs = meal.nutrition?.carbs || 0;
      const fats = meal.nutrition?.fat || 0;
      const proteins = meal.nutrition?.protein || 0;
      const score =
        Math.abs(calories - mealCalories) +
        Math.abs(carbs - targetCarbs) +
        Math.abs(fats - targetFats) +
        Math.abs(proteins - targetProteins);
      if (score < minScore) {
        minScore = score;
        bestMeal = meal;
      }
    });

    if (bestMeal) {
      setSuggestedMeal(bestMeal);
      setIsDialogOpen(false); // Close dialog after suggestion
    } else {
      toast.error("No meals available");
    }
  };

  // Get unique categories for filtering
  const uniqueCategories = Array.from(new Set(meals.map((meal) => meal.category))).sort();





  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <Button onClick={fetchMeals}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">KUET Cafeteria</h1>

          </div>
          <p className="text-lg text-white mt-2">
            Discover our delicious meals and order your favorite dish today!
          </p>

          {/* Button to open personalized suggestion dialog */}
          <div className="mt-6 flex justify-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="recommendation" className="mt-6 mb-6" > <Sparkles className="h-3 w-3 inline mr-1" /> Get Personalized Suggestion</Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className="text-xl font-bold mb-4">Enter Your Details</h2>
                <form onSubmit={(e) => { e.preventDefault(); calculateSuggestion(); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Weight (kg)</label>
                      <Input
                        type="number"
                        name="weight"
                        value={userInputs.weight}
                        onChange={handleInputChange}
                        placeholder="e.g., 70"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Height (feet)</label>
                      <Input
                        type="number"
                        name="heightFeet"
                        value={userInputs.heightFeet}
                        onChange={handleInputChange}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Height (inches)</label>
                      <Input
                        type="number"
                        name="heightInches"
                        value={userInputs.heightInches}
                        onChange={handleInputChange}
                        placeholder="e.g., 8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Age</label>
                      <Input
                        type="number"
                        name="age"
                        value={userInputs.age}
                        onChange={handleInputChange}
                        placeholder="e.g., 20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Gender</label>
                      <select
                        name="gender"
                        value={userInputs.gender}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Number of Theory Classes</label>
                      <Input
                        type="number"
                        name="theoryClasses"
                        value={userInputs.theoryClasses}
                        onChange={handleInputChange}
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Number of Sessional Classes</label>
                      <Input
                        type="number"
                        name="sessionalClasses"
                        value={userInputs.sessionalClasses}
                        onChange={handleInputChange}
                        placeholder="e.g., 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Weather</label>
                      <select
                        name="weather"
                        value={userInputs.weather}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                      >
                        <option value="">Select</option>
                        <option value="cold">Cold</option>
                        <option value="sunny">Sunny</option>
                        <option value="very sunny">Very Sunny</option>
                        <option value="overcast">Overcast</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full">Get Suggestion</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Display suggested meal */}
          {suggestedMeal && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Suggested Meal</h2>
              <motion.div
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="flex-1 border rounded-lg hover:shadow-2xl transition-shadow">
                  <CardHeader className="p-4 rounded-t-lg">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-white">
                        {suggestedMeal.name}
                      </CardTitle>
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                        ${suggestedMeal.price}
                      </span>
                    </div>
                    <div className="flex mt-2 space-x-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                        {suggestedMeal.category}
                      </span>
                      {suggestedMeal.isVegan && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full" >
                          Vegan
                        </span>
                      )}
                      {suggestedMeal.isGlutenFree && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                          Gluten-Free
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardDescription className="text-gray-300 mb-4">
                      {suggestedMeal.description || "No description available."}
                    </CardDescription>
                    <div className="mt-4 space-y-4">
                      {suggestedMeal.nutrition && (
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{suggestedMeal.nutrition.calories || "N/A"}</p>
                            <p className="text-xs text-gray-600">Cal</p>
                          </div>
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{suggestedMeal.nutrition.protein || "N/A"}g</p>
                            <p className="text-xs text-gray-600">Protein</p>
                          </div>
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{suggestedMeal.nutrition.carbs || "N/A"}g</p>
                            <p className="text-xs text-gray-600">Carbs</p>
                          </div>
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{suggestedMeal.nutrition.fat || "N/A"}g</p>
                            <p className="text-xs text-gray-600">Fat</p>
                          </div>
                        </div>
                      )}
                      {suggestedMeal.allergens && suggestedMeal.allergens.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold mb-1">Allergens:</p>
                          <div className="flex flex-wrap gap-1">
                            {suggestedMeal.allergens.map((allergen) => (
                              <span key={allergen} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">

                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      onClick={() => handleOrder(suggestedMeal.id)}

                    >
                      <ShoppingCart className="h-3 w-3 inline mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              </motion.div>
              <Button variant="ghost" onClick={() => setSuggestedMeal(null)} className="mt-4">
                Clear Suggestion
              </Button>
            </div>
          )}





          <Card className="mb-8">
            <CardContent>
              <FoodRecognition meals={meals} />
            </CardContent>
          </Card>


          {/* Search and category filter controls */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <Input
                type="text"
                icon={<Search className="h-3 w-3 inline mr-1" />}
                placeholder="Search for your favourite meal..."
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Price Range Slider with Inputs */}
              <Card className="p-4 mt-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium">Min Price ($)</label>
                      <Input
                        type="number"
                        min="0"
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const minVal = Math.min(Number(e.target.value), priceRange[1]);
                          setPriceRange([minVal, priceRange[1]]);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium">Max Price ($)</label>
                      <Input
                        type="number"
                        min={priceRange[0]}
                        max={Math.max(...meals.map(meal => meal.price), 100)}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const maxVal = Math.max(Number(e.target.value), priceRange[0]);
                          setPriceRange([priceRange[0], maxVal]);
                        }}
                      />
                    </div>
                  </div>

                  <Slider
                    value={priceRange}
                    min={0}
                    max={Math.max(...meals.map(meal => meal.price), 100)}
                    step={1}
                    onValueChange={(value) => setPriceRange(value)}
                  />

                  <div className="flex justify-between text-sm">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </Card>
              
            </div>

            <div className="w-full sm:w-64">
              <Popover>
                <PopoverTrigger >
                  <Button variant="outline" className="w-full" >
                    <Filter className="h-3 w-3 inline mr-1" />
                    {selectedCategories.length > 0
                      ? `Categories (${selectedCategories.length})`
                      : "Filter by Category"}
                  </Button>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Filter by price and calories to find your favourite meal
                    </p>
                  </div>

                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Select Categories</h3>
                    {uniqueCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                        />
                        <label htmlFor={category} className="ml-2">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCategories([])}
                    className="mt-2 w-full"
                  >
                    Clear Selection
                  </Button>
                </PopoverContent>
              </Popover>

              {/* Add this after the category filter popover */}
              <div className="w-full space-y-4">


                {/* Sorting Controls */}
                <div className="flex gap-2">
                  <Select value={sortType} onValueChange={setSortType}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="calories">Calories</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc"> <ArrowDown01 className="h-3 w-3 inline mr-1" /> Ascending</SelectItem>
                      <SelectItem value="desc"> <ArrowUp01 className="h-3 w-3 inline mr-1" /> Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>


          {/* <MealChatbot meals={meals} /> */}


        </header>


        {/* Meal grid */}
        {filteredMeals.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <p className="text-gray-600 text-center">No meals found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {currentMeals.map((meal) => (
              <motion.div
                key={meal.id}
                className="flex flex-col"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="flex-1 border rounded-lg hover:shadow-2xl transition-shadow">
                  <CardHeader className="p-4 rounded-t-lg">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-white">
                        {meal.name}
                      </CardTitle>
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                        ${meal.price}
                      </span>
                    </div>
                    <div className="flex mt-2 space-x-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                        {meal.category}
                      </span>
                      {meal.isVegan && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                          <Vegan className="h-3 w-3 inline mr-1" />
                          Vegan
                        </span>
                      )}
                      {meal.isGlutenFree && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                          <WheatOff className="h-3 w-3 inline mr-1" />
                          Gluten-Free
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardDescription className="text-gray-300 mb-4">
                      {meal.description || "No description available."}
                    </CardDescription>
                    <div className="mt-4 space-y-4">
                      {meal.nutrition && (
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{meal.nutrition.calories || "N/A"}</p>
                            <p className="text-xs text-gray-600">Cal</p>
                          </div>
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{meal.nutrition.protein || "N/A"}g</p>
                            <p className="text-xs text-gray-600">Protein</p>
                          </div>
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{meal.nutrition.carbs || "N/A"}g</p>
                            <p className="text-xs text-gray-600">Carbs</p>
                          </div>
                          <div className="bg-gray-100 p-2 rounded text-center">
                            <p className="text-black font-bold">{meal.nutrition.fat || "N/A"}g</p>
                            <p className="text-xs text-gray-600">Fat</p>
                          </div>
                        </div>
                      )}
                      {meal.allergens && meal.allergens.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold mb-1">Allergens:</p>
                          <div className="flex flex-wrap gap-1">
                            {meal.allergens.map((allergen) => (
                              <span key={allergen} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {allergen}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                      onClick={() => handleAddToCart(meal.id)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

        )}
{filteredMeals.length > itemsPerPage && (
  <div className="mt-8 flex justify-center">
    <nav className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        onClick={prevPage} 
        disabled={currentPage === 1}
        className="w-10 h-10 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        {Array.from({ length: totalPages }, (_, i) => {
          const page = i + 1;
          // Show limited page numbers with ellipsis for better UX
          if (
            page === 1 || 
            page === totalPages || 
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => goToPage(page)}
                className="w-10 h-10 p-0"
              >
                {page}
              </Button>
            );
          } else if (
            page === currentPage - 2 || 
            page === currentPage + 2
          ) {
            return <span key={page}>...</span>;
          }
          return null;
        })}
      </div>
      
      <Button 
        variant="outline" 
        onClick={nextPage} 
        disabled={currentPage === totalPages}
        className="w-10 h-10 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  </div>
)}

{/* Items per page selector */}
<div className="mt-4 flex justify-center">
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-400">Items per page:</span>
    <Select 
      value={String(itemsPerPage)} 
      onValueChange={(value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
      }}
    >
      <SelectTrigger className="w-16">
        <SelectValue placeholder={itemsPerPage} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="6">6</SelectItem>
        <SelectItem value="9">9</SelectItem>
        <SelectItem value="12">12</SelectItem>
        <SelectItem value="24">24</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="ml-4">
    <span className="text-sm text-gray-400">
      Showing {indexOfFirstMeal + 1}-{Math.min(indexOfLastMeal, filteredMeals.length)} of {filteredMeals.length} meals
    </span>
  </div>
</div>



          
        
      </div>
    </div>
  );
}