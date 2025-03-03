"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import useCafeteriaStore from "@/stores/cafeteria-store";
import { Loader2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export default function Cafeteria() {
  const { meals, loading, error, fetchMeals, createPreorder } = useCafeteriaStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const handleOrder = async (mealId) => {
    try {
      await createPreorder(mealId);
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to place order");
    }
  };

  // Function to handle category selection changes
  const handleCategoryChange = (category, checked) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  // Derive unique categories from meals and sort them alphabetically
  const uniqueCategories = Array.from(new Set(meals.map((meal) => meal.category))).sort();

  // Filter meals based on search term and selected categories
  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(meal.category);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

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
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">Cafeteria Menu</h1>
          <p className="text-lg text-white mt-2">
            Discover our delicious meals and order your favorite dish today!
          </p>

          {/* Search and Filter Section */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search for a meal..."
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {selectedCategories.length > 0
                      ? `Categories (${selectedCategories.length})`
                      : "Filter by Category"}
                  </Button>
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
            </div>
          </div>
        </header>

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
            {filteredMeals.map((meal) => (
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
                          Vegan
                        </span>
                      )}
                      {meal.isGlutenFree && (
                        <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                          Gluten-Free
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardDescription className="text-gray-300 mb-4">
                      {meal.description || "No description available."}
                    </CardDescription>

                    {/* Nutrition and Allergen Details */}
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
                      onClick={() => handleOrder(meal.id)}
                    >
                      Order Now
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}