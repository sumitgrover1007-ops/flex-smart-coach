import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle2, 
  XCircle, 
  Dumbbell, 
  Bed,
  Moon,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TodayLog {
  activity_type: string | null;
  duration_minutes: number | null;
  intensity: string | null;
  food_quality: string | null;
  calories_consumed: number | null;
  sleep_hours: number | null;
  energy_level: string | null;
  mood: string | null;
}

interface SimpleDashboardProps {
  onNavigateToCheckin: () => void;
}

const SimpleDashboard = ({ onNavigateToCheckin }: SimpleDashboardProps) => {
  const { profile } = useAuth();
  const { user } = useAuth();
  const firstName = profile?.first_name || 'there';
  
  const [todayLog, setTodayLog] = useState<TodayLog | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Calculate calorie target based on profile
  const getCalorieTarget = () => {
    if (!profile) return 2000;
    const weight = (profile as any).weight_kg || 70;
    const height = (profile as any).height_cm || 170;
    const age = (profile as any).age || 25;
    const gender = (profile as any).gender || 'male';
    
    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }
    
    // Assume moderate activity level (1.55 multiplier)
    return Math.round(bmr * 1.55);
  };

  const calorieTarget = getCalorieTarget();

  useEffect(() => {
    const fetchTodayData = async () => {
      if (!user) return;
      
      try {
        // Fetch today's log
        const today = new Date().toISOString().split('T')[0];
        const { data: logData } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)
          .single();

        if (logData) {
          setTodayLog(logData);
        }

        // Fetch last 7 days of activity
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { data: weekData } = await supabase
          .from('daily_logs')
          .select('activity_type')
          .eq('user_id', user.id)
          .gte('log_date', weekAgo.toISOString().split('T')[0])
          .neq('activity_type', 'rest');

        setWeeklyActivity(weekData?.length || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayData();
  }, [user]);

  const isLogged = !!todayLog;
  const workoutStatus = todayLog?.activity_type;
  const caloriesConsumed = todayLog?.calories_consumed || 0;
  const sleepHours = todayLog?.sleep_hours || 0;

  const getWorkoutIcon = () => {
    if (!workoutStatus) return <AlertCircle className="w-6 h-6 text-muted-foreground" />;
    if (workoutStatus === 'rest') return <Bed className="w-6 h-6 text-secondary" />;
    return <Dumbbell className="w-6 h-6 text-success" />;
  };

  const getWorkoutLabel = () => {
    if (!workoutStatus) return 'Not logged';
    if (workoutStatus === 'rest') return 'Rest Day';
    return 'Workout Done';
  };

  const getWorkoutColor = () => {
    if (!workoutStatus) return 'text-muted-foreground';
    if (workoutStatus === 'rest') return 'text-secondary';
    return 'text-success';
  };

  const caloriePercentage = Math.min((caloriesConsumed / calorieTarget) * 100, 100);

  // Determine weight trend indicator (mock - would come from actual weight data)
  const getTrendIcon = () => {
    const goal = (profile as any)?.fitness_goal;
    // For demo, just show stable
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Hey, {firstName}! 👋
          </h2>
          <p className="text-muted-foreground text-sm">
            Here's your quick daily snapshot
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Today's Status */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                {isLogged ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
                <span className="text-sm text-muted-foreground">Today's Status</span>
              </div>
              <p className={cn(
                "text-xl font-bold",
                isLogged ? "text-success" : "text-destructive"
              )}>
                {isLogged ? 'Logged' : 'Not Logged'}
              </p>
            </CardContent>
          </Card>

          {/* Workout Status */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                {getWorkoutIcon()}
                <span className="text-sm text-muted-foreground">Workout</span>
              </div>
              <p className={cn("text-xl font-bold", getWorkoutColor())}>
                {getWorkoutLabel()}
              </p>
            </CardContent>
          </Card>

          {/* Calories */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-6 h-6 text-warning" />
                <span className="text-sm text-muted-foreground">Calories</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-foreground">{caloriesConsumed || '—'}</span>
                  <span className="text-muted-foreground">/ {calorieTarget}</span>
                </div>
                <Progress value={caloriesConsumed ? caloriePercentage : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Sleep */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Moon className="w-6 h-6 text-secondary" />
                <span className="text-sm text-muted-foreground">Sleep</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {sleepHours ? `${sleepHours}h` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Activity */}
        <Card className="bg-gradient-card border-0 shadow-soft mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Week's Activity</p>
                <p className="text-2xl font-bold text-foreground">
                  {weeklyActivity} <span className="text-base font-normal text-muted-foreground">workout days</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <span className="text-sm text-muted-foreground">Stable</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        {!isLogged && (
          <Button 
            onClick={onNavigateToCheckin}
            size="lg" 
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Log Today's Activity
          </Button>
        )}

        {isLogged && (
          <Button 
            onClick={onNavigateToCheckin}
            variant="outline"
            size="lg" 
            className="w-full"
          >
            Update Today's Log
          </Button>
        )}
      </div>
    </section>
  );
};

export default SimpleDashboard;
