import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { estimateCaloriesFromFoodDetails } from "@/lib/calorieEstimator";
import { 
  Dumbbell, 
  Home, 
  Heart, 
  Trophy,
  Bed,
  Sun,
  Moon,
  Smile,
  Meh,
  Frown,
  Zap,
  Battery,
  BatteryLow,
  Check,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType = 'gym' | 'home_workout' | 'cardio' | 'sports' | 'rest' | 'other';
type Intensity = 'low' | 'medium' | 'high';
type FoodQuality = 'very_poor' | 'poor' | 'okay' | 'good' | 'excellent';
type EnergyLevel = 'low' | 'normal' | 'high';
type Mood = 'bad' | 'neutral' | 'good';

const DailyCheckin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form state
  const [activityType, setActivityType] = useState<ActivityType | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [foodQuality, setFoodQuality] = useState<FoodQuality | null>(null);
  const [calories, setCalories] = useState<string>('');
  const [foodDetails, setFoodDetails] = useState<string>('');
  const [gymBodyParts, setGymBodyParts] = useState<string>('');
  const [extraActivity, setExtraActivity] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState<string>('');

  const activities = [
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'home_workout', label: 'Home Workout', icon: Home },
    { id: 'cardio', label: 'Cardio', icon: Heart },
    { id: 'sports', label: 'Sports', icon: Trophy },
    { id: 'rest', label: 'Rest', icon: Bed },
    { id: 'other', label: 'Other', icon: Zap },
  ];

  const intensities = [
    { id: 'low', label: 'Low', color: 'bg-success/20 border-success/40 text-success' },
    { id: 'medium', label: 'Medium', color: 'bg-warning/20 border-warning/40 text-warning' },
    { id: 'high', label: 'High', color: 'bg-destructive/20 border-destructive/40 text-destructive' },
  ];

  const foodQualities = [
    { id: 'very_poor', label: 'Very Poor', emoji: '😞' },
    { id: 'poor', label: 'Poor', emoji: '😕' },
    { id: 'okay', label: 'Okay', emoji: '😐' },
    { id: 'good', label: 'Good', emoji: '🙂' },
    { id: 'excellent', label: 'Excellent', emoji: '😊' },
  ];

  const energyLevels = [
    { id: 'low', label: 'Low', icon: BatteryLow, color: 'text-destructive' },
    { id: 'normal', label: 'Normal', icon: Battery, color: 'text-warning' },
    { id: 'high', label: 'High', icon: Zap, color: 'text-success' },
  ];

  const moods = [
    { id: 'bad', label: 'Bad', icon: Frown, color: 'text-destructive' },
    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-warning' },
    { id: 'good', label: 'Good', icon: Smile, color: 'text-success' },
  ];

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    const calorieEstimate = estimateCaloriesFromFoodDetails(foodDetails);
    const manualCalories = Number.parseInt(calories, 10);
    const calorieValue = Number.isFinite(manualCalories) ? manualCalories : calorieEstimate.calories;
    const structuredNotes = [
      foodDetails.trim() ? `Food today: ${foodDetails.trim()}` : null,
      `Calorie feedback: ${calorieEstimate.feedback}`,
      calorieEstimate.range ? `Calorie range: ${calorieEstimate.range[0]}-${calorieEstimate.range[1]}` : null,
      activityType === 'gym' && gymBodyParts.trim() ? `Gym training: ${gymBodyParts.trim()}` : null,
      extraActivity.trim() ? `Other activity: ${extraActivity.trim()}` : null,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ].filter(Boolean).join('\n');
    
    try {
      const { error } = await supabase
        .from('daily_logs')
        .upsert({
          user_id: user.id,
          log_date: new Date().toISOString().split('T')[0],
          activity_type: activityType,
          duration_minutes: activityType && activityType !== 'rest' ? duration : null,
          intensity: activityType && activityType !== 'rest' ? intensity : null,
          food_quality: foodQuality,
          calories_consumed: calorieValue,
          sleep_hours: sleepHours,
          energy_level: energyLevel,
          mood: mood,
          notes: structuredNotes || null,
        }, {
          onConflict: 'user_id,log_date'
        });

      if (error) throw error;

      setSubmitted(true);
      window.dispatchEvent(new Event("daily-log-updated"));
      toast({
        title: "Daily check-in saved!",
        description: calorieValue
          ? `Calories logged: about ${calorieValue} kcal.`
          : calorieEstimate.feedback,
      });
    } catch (error: unknown) {
      toast({
        title: "Error saving check-in",
        description: error instanceof Error ? error.message : "Unable to save your check-in.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-6">
          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-12">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">All Done!</h2>
              <p className="text-muted-foreground mb-6">
                Your daily check-in has been saved. Great job staying consistent!
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline">
                Update Today's Log
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Smart Daily Check-in
          </h2>
          <p className="text-muted-foreground">
            Track food, training, recovery, and habits in one place
          </p>
        </div>

        <div className="space-y-6">
          {/* Activity Type */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {activities.map((activity) => {
                  const Icon = activity.icon;
                  const isSelected = activityType === activity.id;
                  return (
                    <button
                      key={activity.id}
                      onClick={() => setActivityType(activity.id as ActivityType)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-muted/30"
                      )}
                    >
                      <Icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                        {activity.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Duration & Intensity - Only show if not rest */}
          {activityType && activityType !== 'rest' && (
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Duration & Intensity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Duration */}
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-bold text-foreground">{duration} min</span>
                  </div>
                  <Slider
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    min={5}
                    max={180}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Intensity */}
                <div>
                  <span className="text-sm text-muted-foreground block mb-3">Intensity</span>
                  <div className="grid grid-cols-3 gap-3">
                    {intensities.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setIntensity(item.id as Intensity)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all duration-200 font-medium",
                          intensity === item.id
                            ? item.color + " border-current"
                            : "border-border hover:border-primary/50 bg-muted/30 text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activityType === 'gym' && (
                  <div>
                    <span className="text-sm text-muted-foreground block mb-3">Which body parts did you train?</span>
                    <Input
                      placeholder="Chest + triceps, back + biceps, legs..."
                      value={gymBodyParts}
                      onChange={(e) => setGymBodyParts(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Any activity apart from gym?</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Walking, cycling, sports, stretching, steps, active commute..."
                value={extraActivity}
                onChange={(e) => setExtraActivity(e.target.value)}
                className="bg-muted/30 min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Food Quality */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">What did you eat today?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Breakfast, lunch, dinner, snacks, drinks, portions if you remember..."
                value={foodDetails}
                onChange={(e) => setFoodDetails(e.target.value)}
                className="bg-muted/30 min-h-[110px]"
              />
              <div className="grid grid-cols-5 gap-2">
                {foodQualities.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFoodQuality(item.id as FoodQuality)}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1",
                      foodQuality === item.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-muted/30"
                    )}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      foodQuality === item.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div>
                {foodDetails.trim() && (
                  <div className="mb-3 rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-sm font-medium text-foreground">
                      {(() => {
                        const estimate = estimateCaloriesFromFoodDetails(foodDetails);
                        if (estimate.calories && estimate.range) {
                          return `${estimate.status === 'calculated' ? 'Calculated' : 'Estimated'}: ${estimate.calories} kcal (${estimate.range[0]}-${estimate.range[1]})`;
                        }
                        return 'More details needed';
                      })()}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {estimateCaloriesFromFoodDetails(foodDetails).feedback}
                    </p>
                  </div>
                )}
                <Input
                  type="number"
                  placeholder="Calories only if you know them (optional)"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="bg-muted/30"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Add meal portions above so the AI coach can estimate more safely before giving calorie numbers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sleep */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Moon className="w-5 h-5 text-secondary" />
                Sleep Last Night
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">Hours of sleep</span>
                <span className="text-sm font-bold text-foreground">{sleepHours} hours</span>
              </div>
              <Slider
                value={[sleepHours]}
                onValueChange={(value) => setSleepHours(value[0])}
                min={0}
                max={12}
                step={0.5}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Energy & Mood */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="w-5 h-5 text-warning" />
                How Do You Feel?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Energy */}
              <div>
                <span className="text-sm text-muted-foreground block mb-3">Energy Level</span>
                <div className="grid grid-cols-3 gap-3">
                  {energyLevels.map((item) => {
                    const Icon = item.icon;
                    const isSelected = energyLevel === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setEnergyLevel(item.id as EnergyLevel)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-muted/30"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isSelected ? item.color : "text-muted-foreground")} />
                        <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mood */}
              <div>
                <span className="text-sm text-muted-foreground block mb-3">Mood</span>
                <div className="grid grid-cols-3 gap-3">
                  {moods.map((item) => {
                    const Icon = item.icon;
                    const isSelected = mood === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setMood(item.id as Mood)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-muted/30"
                        )}
                      >
                        <Icon className={cn("w-5 h-5", isSelected ? item.color : "text-muted-foreground")} />
                        <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional Notes */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Anything special today? (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Injury, cheat meal, stress, achievements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-muted/30 min-h-[80px]"
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !activityType}
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Save Today's Check-in
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DailyCheckin;
