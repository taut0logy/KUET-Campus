"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import useCafeteriaStore from "@/stores/cafeteria-store";
import { Loader2 } from "lucide-react";

export default function Cafeteria() {
  const { 
    meals, 
    loading, 
    error, 
    fetchMeals, 
    createPreorder 
  } = useCafeteriaStore();

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchMeals}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Cafeteria Menu</h1>
      {meals.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No meals available at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => (
            <Card key={meal.id} className="border hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{meal.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {meal.description || "No description available."}
                </CardDescription>
                {meal.nutrition && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Calories: {meal.nutrition.calories || "N/A"}</p>
                    {meal.nutrition.protein && (
                      <p>Protein: {meal.nutrition.protein}g</p>
                    )}
                    {meal.nutrition.carbs && (
                      <p>Carbs: {meal.nutrition.carbs}g</p>
                    )}
                    {meal.nutrition.fat && (
                      <p>Fat: {meal.nutrition.fat}g</p>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="p-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleOrder(meal.id)}
                >
                  Order Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
