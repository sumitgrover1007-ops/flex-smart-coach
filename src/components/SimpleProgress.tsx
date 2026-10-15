import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Target,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const SimpleProgress = () => {
  const { profile } = useAuth();
  
  // Mock data - would come from weight tracking table
  const currentWeight = (profile as any)?.weight_kg || 75;
  const previousWeight = currentWeight + 0.5; // Mock: slightly higher last week
  const bodyFat = 18.5; // Optional - could be null
  const goal = (profile as any)?.fitness_goal || 'maintenance';

  const weightChange = currentWeight - previousWeight;
  
  const getTrendInfo = () => {
    if (Math.abs(weightChange) < 0.1) {
      return { icon: Minus, label: 'Stable', color: 'text-muted-foreground' };
    }
    if (weightChange < 0) {
      // Lost weight
      if (goal === 'lose_weight' || goal === 'weight_loss') {
        return { icon: TrendingDown, label: 'Losing', color: 'text-success' };
      }
      return { icon: TrendingDown, label: 'Losing', color: 'text-warning' };
    }
    // Gained weight
    if (goal === 'muscle_gain' || goal === 'build_muscle') {
      return { icon: TrendingUp, label: 'Gaining', color: 'text-success' };
    }
    return { icon: TrendingUp, label: 'Gaining', color: 'text-warning' };
  };

  const trend = getTrendInfo();
  const TrendIcon = trend.icon;

  const getGoalLabel = () => {
    switch (goal) {
      case 'lose_weight':
      case 'weight_loss': return 'Fat Loss';
      case 'muscle_gain':
      case 'build_muscle': return 'Muscle Gain';
      case 'maintenance': return 'Maintenance';
      default: return 'General Fitness';
    }
  };

  // Weekly consistency (mock)
  const weeklyConsistency = 85; // percentage

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">Progress</h2>
          <p className="text-muted-foreground text-sm">Your fitness journey at a glance</p>
        </div>

        {/* Weight Card */}
        <Card className="bg-gradient-card border-0 shadow-soft mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                <span className="text-lg font-semibold text-foreground">Current Weight</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendIcon className={cn("w-5 h-5", trend.color)} />
                <span className={cn("text-sm font-medium", trend.color)}>{trend.label}</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-5xl font-bold text-foreground mb-2">
                {currentWeight} <span className="text-xl text-muted-foreground">kg</span>
              </p>
              {weightChange !== 0 && (
                <p className={cn("text-sm", trend.color)}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from last week
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Body Fat (Optional) */}
          {bodyFat && (
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardContent className="p-5 text-center">
                <Activity className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{bodyFat}%</p>
                <p className="text-sm text-muted-foreground">Body Fat</p>
              </CardContent>
            </Card>
          )}

          {/* Goal */}
          <Card className={cn("bg-gradient-card border-0 shadow-soft", !bodyFat && "col-span-2")}>
            <CardContent className="p-5 text-center">
              <Target className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{getGoalLabel()}</p>
              <p className="text-sm text-muted-foreground">Current Goal</p>
            </CardContent>
          </Card>
        </div>

        {/* Consistency */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${weeklyConsistency}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 text-2xl font-bold text-foreground">{weeklyConsistency}%</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You've logged {Math.round(weeklyConsistency / 100 * 7)} out of 7 days this week
            </p>
          </CardContent>
        </Card>

        {/* AI Insight */}
        <Card className="bg-gradient-hero border-0 shadow-strong mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-primary-foreground/90 text-sm mb-2">AI Insight</p>
            <p className="text-primary-foreground font-medium">
              {goal === 'weight_loss' || goal === 'lose_weight'
                ? "Your consistency is great! Keep up the deficit and you'll reach your goal."
                : goal === 'muscle_gain' || goal === 'build_muscle'
                ? "Focus on progressive overload and protein intake for optimal gains."
                : "You're maintaining well. Consider setting a new challenge!"}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SimpleProgress;
