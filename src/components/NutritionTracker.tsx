import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Apple, 
  Camera, 
  Plus, 
  Target, 
  Utensils, 
  Zap,
  Brain,
  Search,
  Clock
} from "lucide-react";

const NutritionTracker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock data for demonstration
  const dailyGoals = {
    calories: { current: 1240, target: 2200, unit: "kcal" },
    protein: { current: 65, target: 120, unit: "g" },
    carbs: { current: 140, target: 250, unit: "g" },
    fat: { current: 45, target: 80, unit: "g" }
  };

  const recentMeals = [
    {
      id: 1,
      name: "Greek Yogurt with Berries",
      time: "8:30 AM",
      calories: 180,
      protein: 15,
      carbs: 20,
      fat: 6,
      meal: "Breakfast"
    },
    {
      id: 2,
      name: "Grilled Chicken Salad",
      time: "1:15 PM",
      calories: 420,
      protein: 35,
      carbs: 25,
      fat: 18,
      meal: "Lunch"
    },
    {
      id: 3,
      name: "Protein Smoothie",
      time: "4:00 PM",
      calories: 280,
      protein: 25,
      carbs: 30,
      fat: 8,
      meal: "Snack"
    }
  ];

  const quickAdd = [
    { name: "Banana", calories: 105, icon: "🍌" },
    { name: "Almonds (1oz)", calories: 164, icon: "🥜" },
    { name: "Greek Yogurt", calories: 130, icon: "🥄" },
    { name: "Protein Bar", calories: 190, icon: "🍫" },
    { name: "Apple", calories: 80, icon: "🍎" },
    { name: "Oatmeal", calories: 150, icon: "🥣" }
  ];

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 60) return "bg-warning";
    return "bg-primary";
  };

  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            AI Nutrition Tracker
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your nutrition with AI-powered food recognition, calorie estimation, 
            and personalized recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Progress */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Daily Nutrition Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(dailyGoals).map(([key, data]) => {
                    const percentage = calculatePercentage(data.current, data.target);
                    return (
                      <div key={key} className="text-center">
                        <div className="relative mb-3">
                          <Progress 
                            value={percentage} 
                            className="h-3"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-background mix-blend-difference">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-foreground capitalize">{key}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.current}/{data.target} {data.unit}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Add Food */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-secondary" />
                  Add Food
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search for food..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* AI Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="accent" className="gap-2 h-auto py-4">
                    <Camera className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Scan Food</div>
                      <div className="text-xs opacity-80">AI-powered recognition</div>
                    </div>
                  </Button>
                  <Button variant="fitness" className="gap-2 h-auto py-4">
                    <Brain className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">Ask AI Nutritionist</div>
                      <div className="text-xs opacity-80">Get food suggestions</div>
                    </div>
                  </Button>
                </div>

                {/* Quick Add */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Quick Add</h4>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {quickAdd.map((food, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-3 px-2 flex-col gap-1 hover:shadow-medium transition-smooth"
                      >
                        <span className="text-lg">{food.icon}</span>
                        <span className="text-xs font-medium">{food.name}</span>
                        <span className="text-xs text-muted-foreground">{food.calories} cal</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Meals */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-accent" />
                  Today's Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMeals.map((meal) => (
                    <div key={meal.id} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground">{meal.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{meal.time}</span>
                            <Badge variant="outline" className="text-xs">
                              {meal.meal}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {meal.calories} cal
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium text-foreground">{meal.protein}g</p>
                          <p className="text-muted-foreground">Protein</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">{meal.carbs}g</p>
                          <p className="text-muted-foreground">Carbs</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">{meal.fat}g</p>
                          <p className="text-muted-foreground">Fat</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <Card className="bg-gradient-hero border-0 shadow-strong text-center">
              <CardContent className="p-6">
                <Brain className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold text-primary-foreground mb-2">
                  AI Nutrition Insights
                </h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Your protein intake is on track! Consider adding more vegetables for micronutrients.
                </p>
                <Button variant="outline" size="sm" className="bg-background/20 border-primary-foreground/30 text-primary-foreground hover:bg-background/30">
                  Get Suggestions
                </Button>
              </CardContent>
            </Card>

            {/* Water Intake */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  💧 Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-foreground">6/8</p>
                  <p className="text-sm text-muted-foreground">Glasses today</p>
                </div>
                <Progress value={75} className="mb-4" />
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Glass
                </Button>
              </CardContent>
            </Card>

            {/* Meal Planning */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Meal Planning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Generate Meal Plan
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Apple className="w-4 h-4 text-secondary" />
                  Healthy Recipes
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Target className="w-4 h-4 text-accent" />
                  Set Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NutritionTracker;