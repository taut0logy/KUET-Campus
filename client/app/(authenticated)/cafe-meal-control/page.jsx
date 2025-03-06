'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash, Search, ArrowLeft, Image as ImageIcon, Utensils, CalendarDays } from 'lucide-react';
import axios from '@/lib/axios';

export default function MealsManagementPage() {
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVegan: false,
    isGlutenFree: false,
    isSugarFree: false,
    isLowFat: false,
    isOrganic: false,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
    vitaminA: '',
    vitaminC: '',
    calcium: '',
    iron: '',
    allergens: '',
  });

  // Fetch all meals
  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cafeteria/meals');
      setMeals(response.data.data.meals);
    } catch (error) {
      toast.error('Failed to fetch meals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  // Filter meals based on search term
  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCreateMeal = async () => {
    try {
      // Form validation
      if (!formData.name || !formData.price || !formData.category) {
        toast.error('Please fill all required fields');
        return;
      }

      // Convert price to number
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error('Price must be a valid positive number');
        return;
      }

      // Validate allergens JSON syntax if provided
      let parsedAllergens = null;
      if (formData.allergens) {
        try {
          parsedAllergens = JSON.parse(formData.allergens);
        } catch (error) {
          toast.error('Allergens must be valid JSON');
          return;
        }
      }

      // Create meal data with individual nutrition fields
      const mealData = {
        name: formData.name,
        description: formData.description,
        price,
        category: formData.category,
        // Dietary flags
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        isSugarFree: formData.isSugarFree,
        isLowFat: formData.isLowFat,
        isOrganic: formData.isOrganic,
        // Nutrition values as separate fields
        calories: formData.calories ? parseInt(formData.calories) : null,
        protein: formData.protein ? parseInt(formData.protein) : null,
        carbs: formData.carbs ? parseInt(formData.carbs) : null,
        fat: formData.fat ? parseInt(formData.fat) : null,
        fiber: formData.fiber ? parseInt(formData.fiber) : null,
        sugar: formData.sugar ? parseInt(formData.sugar) : null,
        sodium: formData.sodium ? parseInt(formData.sodium) : null,
        vitaminA: formData.vitaminA ? parseInt(formData.vitaminA) : null,
        vitaminC: formData.vitaminC ? parseInt(formData.vitaminC) : null,
        calcium: formData.calcium ? parseInt(formData.calcium) : null,
        iron: formData.iron ? parseInt(formData.iron) : null,
        // JSON fields
        allergens: formData.allergens // Send as string, backend will parse
      };

      // First save meal data
      const response = await axios.post('/cafeteria/meals', mealData);
      const mealId = response.data.data.meal.id;



      toast.success('Meal created successfully');
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        isVegan: false,
        isGlutenFree: false,
        allergens: '',
        nutrition: '',
      });
      fetchMeals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create meal');
      console.error(error);
    }
  };

  // Update the handleEditMeal function

  const handleEditMeal = async () => {
    try {
      // Form validation
      if (!formData.name || !formData.price || !formData.category) {
        toast.error('Please fill all required fields');
        return;
      }

      // Convert price to number
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        toast.error('Price must be a valid positive number');
        return;
      }

      // Validate allergens JSON syntax
      let parsedAllergens = [];
      try {
        if (formData.allergens) {
          parsedAllergens = JSON.parse(formData.allergens);
          if (!Array.isArray(parsedAllergens)) {
            throw new Error('Allergens must be an array');
          }
        }
      } catch (error) {
        toast.error('Allergens must be a valid JSON array');
        return;
      }

      // Create meal data with individual nutrition fields
      const mealData = {
        name: formData.name,
        description: formData.description,
        price,
        category: formData.category,
        // Dietary flags
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        isSugarFree: formData.isSugarFree,
        isLowFat: formData.isLowFat,
        isOrganic: formData.isOrganic,
        // Nutrition values as separate fields
        calories: formData.calories ? parseInt(formData.calories) : null,
        protein: formData.protein ? parseInt(formData.protein) : null,
        carbs: formData.carbs ? parseInt(formData.carbs) : null,
        fat: formData.fat ? parseInt(formData.fat) : null,
        fiber: formData.fiber ? parseInt(formData.fiber) : null,
        sugar: formData.sugar ? parseInt(formData.sugar) : null,
        sodium: formData.sodium ? parseInt(formData.sodium) : null,
        vitaminA: formData.vitaminA ? parseInt(formData.vitaminA) : null,
        vitaminC: formData.vitaminC ? parseInt(formData.vitaminC) : null,
        calcium: formData.calcium ? parseInt(formData.calcium) : null,
        iron: formData.iron ? parseInt(formData.iron) : null,
        // JSON fields
        allergens: parsedAllergens
      };

      // Submit the update
      setLoading(true);
      await axios.put(`/cafeteria/meals/${selectedMeal.id}`, mealData);

      // Update the meals list
      const updatedMeals = meals.map(meal => {
        if (meal.id === selectedMeal.id) {
          return { ...meal, ...mealData };
        }
        return meal;
      });

      setMeals(updatedMeals);
      setIsEditDialogOpen(false);
      toast.success('Meal updated successfully');
    } catch (error) {
      console.error('Error updating meal:', error);
      toast.error(error.response?.data?.message || 'Failed to update meal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async () => {
    try {
      if (!selectedMeal) return;

      await axios.delete(`/cafeteria/meals/${selectedMeal.id}`);
      toast.success('Meal deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedMeal(null);
      fetchMeals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete meal');
      console.error(error);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      isVegan: false,
      isGlutenFree: false,
      allergens: '',
      nutrition: '',

    });
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (meal) => {
    setSelectedMeal(meal);
    setFormData({
      name: meal.name,
      description: meal.description || '',
      price: meal.price.toString(),
      category: meal.category,
      // Dietary flags
      isVegan: meal.isVegan || false,
      isGlutenFree: meal.isGlutenFree || false,
      isSugarFree: meal.isSugarFree || false,
      isLowFat: meal.isLowFat || false,
      isOrganic: meal.isOrganic || false,
      // Nutrition values
      calories: meal.calories || '',
      protein: meal.protein || '',
      carbs: meal.carbs || '',
      fat: meal.fat || '',
      fiber: meal.fiber || '',
      sugar: meal.sugar || '',
      sodium: meal.sodium || '',
      vitaminA: meal.vitaminA || '',
      vitaminC: meal.vitaminC || '',
      calcium: meal.calcium || '',
      iron: meal.iron || '',
      // JSON fields
      allergens: meal.allergens ? JSON.stringify(meal.allergens) : '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (meal) => {
    setSelectedMeal(meal);
    setIsDeleteDialogOpen(true);
  };



  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Meal Management</h1>


        {/* <div className="mb-10 flex gap-10 mt-4 justify-end">
  <Button 
    variant="outline" 
    onClick={() => router.push('/cafe-dashboard/meals')}
    className="flex items-center gap-2"
  >
    <Utensils className="h-4 w-4" />
    Manage Meals
  </Button>
  
  <Button 
    variant="outline" 
    onClick={() => router.push('/cafe-order-control')}
    className="flex items-center gap-2"
  >
    <CalendarDays className="h-4 w-4" />
    Manage Orders
  </Button>
</div> */}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search meals..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/cafe-order-control')}
            className="gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Manage Orders
          </Button>

          <Button onClick={openCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Meal
          </Button>
        </div>
      </div>


      {loading ? (
        <div className="text-center py-8">Loading meals...</div>
      ) : filteredMeals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onEdit={() => openEditDialog(meal)}
              onDelete={() => openDeleteDialog(meal)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">No meals found</div>
      )}

      {/* Create Meal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Meal</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new meal item for the cafeteria menu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Fried Rice"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the meal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Price (৳) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="100.00"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Breakfast">Breakfast</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Dinner">Dinner</SelectItem>
                    <SelectItem value="Snacks">Snacks</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Desserts">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVegan"
                  checked={formData.isVegan}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVegan: checked })}
                />
                <Label htmlFor="isVegan">Vegan</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isGlutenFree"
                  checked={formData.isGlutenFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isGlutenFree: checked })}
                />
                <Label htmlFor="isGlutenFree">Gluten Free</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isLowFat"
                  checked={formData.isLowFat}
                  onCheckedChange={(checked) => setFormData({ ...formData, isLowFat: checked })}
                />
                <Label htmlFor="isLowFat">Low Fat</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isOrganic"
                  checked={formData.isOrganic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isOrganic: checked })}
                />
                <Label htmlFor="isOrganic">Organic</Label>
              </div>


            </div>

            <div className="grid gap-2">
              <Label htmlFor="allergens">Allergens (JSON format)</Label>
              <Textarea
                id="allergens"
                value={formData.allergens}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                placeholder='["nuts", "dairy", "eggs"]'
              />
              <p className="text-xs text-muted-foreground">Enter as a JSON array of strings</p>
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-medium">Nutrition Information</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="calories">Calories (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || '' })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    value={formData.protein || ''}
                    onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || '' })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    value={formData.carbs || ''}
                    onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) || '' })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    value={formData.fat || ''}
                    onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) || '' })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Advanced nutrition */}
              <details className="mt-2">
                <summary className="text-sm font-medium cursor-pointer">Advanced Nutrition Details</summary>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="grid gap-2">
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input
                      id="fiber"
                      type="number"
                      min="0"
                      value={formData.fiber || ''}
                      onChange={(e) => setFormData({ ...formData, fiber: parseInt(e.target.value) || '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sugar">Sugar (g)</Label>
                    <Input
                      id="sugar"
                      type="number"
                      min="0"
                      value={formData.sugar || ''}
                      onChange={(e) => setFormData({ ...formData, sugar: parseInt(e.target.value) || '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sodium">Sodium (mg)</Label>
                    <Input
                      id="sodium"
                      type="number"
                      min="0"
                      value={formData.sodium || ''}
                      onChange={(e) => setFormData({ ...formData, sodium: parseInt(e.target.value) || '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vitaminA">Vitamin A (IU)</Label>
                    <Input
                      id="vitaminA"
                      type="number"
                      min="0"
                      value={formData.vitaminA || ''}
                      onChange={(e) => setFormData({ ...formData, vitaminA: parseInt(e.target.value) || '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vitaminC">Vitamin C (mg)</Label>
                    <Input
                      id="vitaminC"
                      type="number"
                      min="0"
                      value={formData.vitaminC || ''}
                      onChange={(e) => setFormData({ ...formData, vitaminC: parseInt(e.target.value) || '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="calcium">Calcium (mg)</Label>
                    <Input
                      id="calcium"
                      type="number"
                      min="0"
                      value={formData.calcium || ''}
                      onChange={(e) => setFormData({ ...formData, calcium: parseInt(e.target.value) || '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="iron">Iron (mg)</Label>
                    <Input
                      id="iron"
                      type="number"
                      min="0"
                      value={formData.iron || ''}
                      onChange={(e) => setFormData({ ...formData, iron: parseInt(e.target.value) || '' })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </details>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMeal}>Create Meal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
            <DialogDescription>Update meal details and nutrition information.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Nutrition Information - Updated to individual fields */}
            <div className="grid gap-4">
              <h3 className="text-sm font-medium">Nutrition Information</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="calories">Calories (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value) : '' })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    value={formData.protein || ''}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value ? parseInt(e.target.value) : '' })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    value={formData.carbs || ''}
                    onChange={(e) => setFormData({ ...formData, carbs: e.target.value ? parseInt(e.target.value) : '' })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    value={formData.fat || ''}
                    onChange={(e) => setFormData({ ...formData, fat: e.target.value ? parseInt(e.target.value) : '' })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Advanced nutrition */}
              <details className="mt-2">
                <summary className="text-sm font-medium cursor-pointer">Advanced Nutrition Details</summary>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="grid gap-2">
                    <Label htmlFor="fiber">Fiber (g)</Label>
                    <Input
                      id="fiber"
                      type="number"
                      min="0"
                      value={formData.fiber || ''}
                      onChange={(e) => setFormData({ ...formData, fiber: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sugar">Sugar (g)</Label>
                    <Input
                      id="sugar"
                      type="number"
                      min="0"
                      value={formData.sugar || ''}
                      onChange={(e) => setFormData({ ...formData, sugar: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sodium">Sodium (mg)</Label>
                    <Input
                      id="sodium"
                      type="number"
                      min="0"
                      value={formData.sodium || ''}
                      onChange={(e) => setFormData({ ...formData, sodium: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vitaminA">Vitamin A (IU)</Label>
                    <Input
                      id="vitaminA"
                      type="number"
                      min="0"
                      value={formData.vitaminA || ''}
                      onChange={(e) => setFormData({ ...formData, vitaminA: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="vitaminC">Vitamin C (mg)</Label>
                    <Input
                      id="vitaminC"
                      type="number"
                      min="0"
                      value={formData.vitaminC || ''}
                      onChange={(e) => setFormData({ ...formData, vitaminC: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="calcium">Calcium (mg)</Label>
                    <Input
                      id="calcium"
                      type="number"
                      min="0"
                      value={formData.calcium || ''}
                      onChange={(e) => setFormData({ ...formData, calcium: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder="0"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="iron">Iron (mg)</Label>
                    <Input
                      id="iron"
                      type="number"
                      min="0"
                      value={formData.iron || ''}
                      onChange={(e) => setFormData({ ...formData, iron: e.target.value ? parseInt(e.target.value) : '' })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </details>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allergens">Allergens (JSON Array)</Label>
              <Textarea
                id="allergens"
                value={formData.allergens || '[]'}
                onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                rows={2}
                placeholder='["Gluten", "Dairy", "Nuts"]'
              />
              <p className="text-xs text-muted-foreground">Enter allergens as a JSON array</p>
            </div>

            {/* Dietary Preferences */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVegan"
                  checked={formData.isVegan}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVegan: checked })}
                />
                <Label htmlFor="isVegan">Vegan</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isGlutenFree"
                  checked={formData.isGlutenFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isGlutenFree: checked })}
                />
                <Label htmlFor="isGlutenFree">Gluten Free</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isSugarFree"
                  checked={formData.isSugarFree}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSugarFree: checked })}
                />
                <Label htmlFor="isSugarFree">Sugar Free</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isLowFat"
                  checked={formData.isLowFat}
                  onCheckedChange={(checked) => setFormData({ ...formData, isLowFat: checked })}
                />
                <Label htmlFor="isLowFat">Low Fat</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isOrganic"
                  checked={formData.isOrganic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isOrganic: checked })}
                />
                <Label htmlFor="isOrganic">Organic</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMeal}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedMeal?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMeal}>
              Delete Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Meal Card Component
// Replace the MealCard component with this updated version

// Meal Card Component
function MealCard({ meal, onEdit, onDelete }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold">
            {meal.name}
          </CardTitle>
          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
            ৳{meal.price}
          </span>
        </div>
        <div className="flex mt-2 space-x-2">
          <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
            {meal.category}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {meal.description && (
          <CardDescription className="text-gray-300 mb-4">
            {meal.description}
          </CardDescription>
        )}

        {/* Nutrition information */}
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <span className="font-semibold">Cal:</span> {meal.calories || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Protein:</span> {meal.protein ? `${meal.protein}g` : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Carbs:</span> {meal.carbs ? `${meal.carbs}g` : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Fat:</span> {meal.fat ? `${meal.fat}g` : 'N/A'}
          </div>
        </div>

        {/* Dietary preferences as text-based visuals */}
        <div className="flex flex-wrap gap-2 mt-3">
          {meal.isVegan && (
            <div className="text-xs font-medium text-green-600">
              <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
              Vegan
            </div>
          )}
          {meal.isGlutenFree && (
            <div className="text-xs font-medium text-blue-600">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1"></span>
              Gluten-Free
            </div>
          )}
          {meal.isSugarFree && (
            <div className="text-xs font-medium text-purple-600">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-600 mr-1"></span>
              Sugar-Free
            </div>
          )}
          {meal.isLowFat && (
            <div className="text-xs font-medium text-amber-600">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-600 mr-1"></span>
              Low-Fat
            </div>
          )}
          {meal.isOrganic && (
            <div className="text-xs font-medium text-emerald-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 mr-1"></span>
              Organic
            </div>
          )}
        </div>

        {/* Allergens */}
        {meal.allergens && meal.allergens.length > 0 && (
          <div className="mt-4 text-sm">
            <span className="font-semibold">Allergens: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {meal.allergens.map((allergen, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-red-50 text-red-700 text-xs rounded"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t flex justify-between">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}