"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

export default function Cafeteria() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeals() {
      try {
        // Adjust the API endpoint if necessary.
        const response = await fetch("/cafeteria/meals");
        if (!response.ok) {
          throw new Error("Failed to fetch meals");
        }
        const data = await response.json();
        setMeals(data.meals || []);
      } catch (error) {
        console.error("Error fetching meals:", error);
        toast.error(`Error fetching meals: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchMeals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">

      <Toaster />
      <h1 className="text-3xl font-bold mb-6">Cafeteria Menu</h1>
      {meals.length === 0 ? (
        <p>No meals available at the moment.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => (
            <Card key={meal.id} className="border">
              <CardHeader>
                <CardTitle>{meal.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {meal.description || "No description available."}
                </CardDescription>
                {meal.nutrition && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Calories: {meal.nutrition.calories || "N/A"}
                  </div>
                )}
              </CardContent>
              <div className="p-4">
                <Button variant="outline">Order Now</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
