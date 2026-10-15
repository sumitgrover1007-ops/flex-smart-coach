import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLogDate, useDailyLogs } from "@/hooks/useDailyLogs";
import { 
  Dumbbell, 
  Heart, 
  Trophy, 
  Clock,
  Zap
} from "lucide-react";

const SimpleWorkouts = () => {
  const { logs, loading } = useDailyLogs(7);
  const recentWorkouts = logs.filter((log) => log.activity_type);

  const getNoteValue = (notes: string | null, label: string) => {
    const line = notes?.split('\n').find((item) => item.startsWith(`${label}:`));
    return line?.replace(`${label}:`, '').trim() ?? null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gym': return <Dumbbell className="w-5 h-5 text-primary" />;
      case 'cardio': return <Heart className="w-5 h-5 text-destructive" />;
      case 'sports': return <Trophy className="w-5 h-5 text-warning" />;
      case 'home_workout': return <Dumbbell className="w-5 h-5 text-secondary" />;
      default: return <Zap className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'gym': return 'Gym';
      case 'cardio': return 'Cardio';
      case 'sports': return 'Sports';
      case 'home_workout': return 'Home Workout';
      case 'rest': return 'Rest Day';
      default: return 'Other';
    }
  };

  const getIntensityColor = (intensity: string | null) => {
    switch (intensity) {
      case 'low': return 'bg-success/20 text-success';
      case 'medium': return 'bg-warning/20 text-warning';
      case 'high': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Calculate weekly summary
  const totalMinutes = recentWorkouts.reduce((acc, workout) => acc + (workout.duration_minutes ?? 0), 0);
  const activeDays = recentWorkouts.filter((workout) => workout.activity_type !== 'rest').length;

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">Workouts</h2>
          <p className="text-muted-foreground text-sm">Your recent activity summary</p>
        </div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-5 text-center">
              <Dumbbell className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{activeDays}</p>
              <p className="text-sm text-muted-foreground">Active Days</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardContent className="p-5 text-center">
              <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{totalMinutes}</p>
              <p className="text-sm text-muted-foreground">Total Minutes</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Workouts */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading workout data...</p>}
            {!loading && recentWorkouts.length === 0 && (
              <p className="text-sm text-muted-foreground">No workout check-ins yet.</p>
            )}
            {recentWorkouts.map((workout) => (
              <div 
                key={workout.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  {getTypeIcon(workout.activity_type ?? 'other')}
                  <div>
                    <p className="font-medium text-foreground">{getTypeLabel(workout.activity_type ?? 'other')}</p>
                    <p className="text-sm text-muted-foreground">{formatLogDate(workout.log_date)}</p>
                    {getNoteValue(workout.notes, 'Gym training') && (
                      <p className="text-xs text-muted-foreground mt-1">{getNoteValue(workout.notes, 'Gym training')}</p>
                    )}
                    {getNoteValue(workout.notes, 'Other activity') && (
                      <p className="text-xs text-muted-foreground mt-1">+ {getNoteValue(workout.notes, 'Other activity')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(workout.duration_minutes ?? 0) > 0 && (
                    <span className="text-sm text-muted-foreground">{workout.duration_minutes} min</span>
                  )}
                  {workout.intensity && (
                    <Badge className={getIntensityColor(workout.intensity)}>
                      {workout.intensity}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default SimpleWorkouts;
