import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatLogDate, useDailyLogs } from "@/hooks/useDailyLogs";
import { estimateCaloriesFromFoodDetails } from "@/lib/calorieEstimator";
import { 
  Zap, 
  TrendingUp,
  TrendingDown,
  Minus,
  Coffee,
  Salad,
  Apple,
  Moon
} from "lucide-react";

const balancedDietPlan = [
  {
    title: "Breakfast",
    icon: Coffee,
    guide: "Protein + carbs",
    examples: "Eggs or Greek yogurt with oats, fruit, or whole-grain toast",
  },
  {
    title: "Lunch",
    icon: Salad,
    guide: "Protein + carbs + veggies",
    examples: "Chicken, paneer, tofu, fish, or beans with rice/roti and vegetables",
  },
  {
    title: "Snacks",
    icon: Apple,
    guide: "Light and healthy",
    examples: "Fruit, nuts, sprouts, yogurt, protein shake, or roasted chana",
  },
  {
    title: "Dinner",
    icon: Moon,
    guide: "Lighter but nutritious",
    examples: "Lean protein with vegetables, soup, salad, or a smaller balanced plate",
  },
];

const SimpleNutrition = () => {
  const { logs, loading } = useDailyLogs(5);

  const calorieTarget = 2200;
  const todayLog = logs.find((log) => log.log_date === new Date().toISOString().split('T')[0]) ?? logs[0];
  const getNoteValue = (notes: string | null | undefined, label: string) => {
    const line = notes?.split('\n').find((item) => item.startsWith(`${label}:`));
    return line?.replace(`${label}:`, '').trim() ?? null;
  };
  const todayFoodDetails = getNoteValue(todayLog?.notes, 'Food today');
  const todayEstimate = todayFoodDetails ? estimateCaloriesFromFoodDetails(todayFoodDetails) : null;
  const caloriesConsumed = todayLog?.calories_consumed ?? todayEstimate?.calories ?? 0;
  const calorieFeedback = getNoteValue(todayLog?.notes, 'Calorie feedback') ?? todayEstimate?.feedback;
  const proteinLevel = todayLog?.protein_level ?? null;
  const recentNutrition = useMemo(
    () => logs.filter((log) => log.food_quality || log.calories_consumed || log.protein_level || getNoteValue(log.notes, 'Food today')),
    [logs],
  );

  const getFoodQualityEmoji = (quality: string) => {
    switch (quality) {
      case 'excellent': return '😊';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'poor': return '😕';
      case 'very_poor': return '😞';
      default: return '—';
    }
  };

  const getProteinBadge = (level: string) => {
    switch (level) {
      case 'low': return <Badge className="bg-destructive/20 text-destructive">Low</Badge>;
      case 'okay': return <Badge className="bg-warning/20 text-warning">OK</Badge>;
      case 'high': return <Badge className="bg-success/20 text-success">High</Badge>;
      default: return null;
    }
  };

  const caloriePercentage = Math.min((caloriesConsumed / calorieTarget) * 100, 100);
  const calorieDiff = caloriesConsumed - calorieTarget;

  const getCalorieTrend = () => {
    if (calorieDiff > 100) return { icon: TrendingUp, label: 'Over', color: 'text-warning' };
    if (calorieDiff < -100) return { icon: TrendingDown, label: 'Under', color: 'text-success' };
    return { icon: Minus, label: 'On Track', color: 'text-success' };
  };

  const trend = getCalorieTrend();
  const TrendIcon = trend.icon;

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">Nutrition</h2>
          <p className="text-muted-foreground text-sm">Your eating habits at a glance</p>
        </div>

        {/* Today's Summary */}
        <Card className="bg-gradient-card border-0 shadow-soft mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-warning" />
              <span className="text-lg font-semibold text-foreground">Today's Calories</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold text-foreground">{caloriesConsumed || 'Needs details'}</span>
                <span className="text-muted-foreground">/ {calorieTarget} target</span>
              </div>
              <Progress value={caloriesConsumed ? caloriePercentage : 0} className="h-3" />
              <div className="flex items-center gap-2">
                <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                <span className={`text-sm ${trend.color}`}>{trend.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {calorieFeedback ?? "Log your meals with items and portions to get a calorie estimate."}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Protein</span>
                {getProteinBadge(proteinLevel ?? '') ?? <span className="text-sm text-muted-foreground">—</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-soft mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Balanced Daily Plan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {balancedDietPlan.map((meal) => {
              const Icon = meal.icon;
              return (
                <div key={meal.title} className="p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{meal.title}</p>
                      <p className="text-xs text-muted-foreground">{meal.guide}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{meal.examples}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent History */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Recent Days</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading nutrition data...</p>}
            {!loading && recentNutrition.length === 0 && (
              <p className="text-sm text-muted-foreground">No nutrition check-ins yet.</p>
            )}
            {recentNutrition.map((day) => {
              const foodDetails = getNoteValue(day.notes, 'Food today');
              const estimate = foodDetails ? estimateCaloriesFromFoodDetails(foodDetails) : null;
              const displayCalories = day.calories_consumed ?? estimate?.calories;

              return (
                <div 
                  key={day.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getFoodQualityEmoji(day.food_quality ?? '')}</span>
                    <div>
                      <p className="font-medium text-foreground capitalize">{day.food_quality?.replace('_', ' ') ?? 'Not rated'}</p>
                      <p className="text-sm text-muted-foreground">{formatLogDate(day.log_date)}</p>
                      {foodDetails && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{foodDetails}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{displayCalories ? `~${displayCalories} cal` : 'Needs details'}</span>
                    {getProteinBadge(day.protein_level ?? '')}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SimpleNutrition;
