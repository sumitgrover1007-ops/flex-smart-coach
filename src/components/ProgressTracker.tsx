import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Calendar,
  Activity,
  Zap,
  Award,
  ChevronRight,
  Clock
} from "lucide-react";

const ProgressTracker = () => {
  // Mock data for demonstration
  const stats = {
    workoutsCompleted: 47,
    totalHours: 38.5,
    caloriesBurned: 12840,
    currentStreak: 12,
    longestStreak: 21,
    avgWorkoutTime: 42
  };

  const weeklyProgress = [
    { day: "Mon", workouts: 1, calories: 420, duration: 45 },
    { day: "Tue", workouts: 1, calories: 380, duration: 38 },
    { day: "Wed", workouts: 0, calories: 0, duration: 0 },
    { day: "Thu", workouts: 1, calories: 510, duration: 52 },
    { day: "Fri", workouts: 1, calories: 445, duration: 48 },
    { day: "Sat", workouts: 2, calories: 680, duration: 75 },
    { day: "Sun", workouts: 1, calories: 390, duration: 40 }
  ];

  const achievements = [
    { 
      id: 1, 
      title: "Perfect Week", 
      description: "Complete 7 workouts in a week", 
      progress: 85, 
      icon: "🎯",
      unlocked: false
    },
    { 
      id: 2, 
      title: "Form Master", 
      description: "Maintain 95%+ form accuracy for 10 workouts", 
      progress: 100, 
      icon: "🏆",
      unlocked: true
    },
    { 
      id: 3, 
      title: "Consistency King", 
      description: "Workout for 30 days straight", 
      progress: 40, 
      icon: "👑",
      unlocked: false
    },
    { 
      id: 4, 
      title: "Calorie Crusher", 
      description: "Burn 15,000 total calories", 
      progress: 85, 
      icon: "🔥",
      unlocked: false
    }
  ];

  const goals = [
    { 
      title: "Weekly Workout Goal", 
      current: 5, 
      target: 6, 
      unit: "workouts",
      category: "fitness"
    },
    { 
      title: "Monthly Calories", 
      current: 3420, 
      target: 4000, 
      unit: "kcal burned",
      category: "calories"
    },
    { 
      title: "Form Accuracy", 
      current: 94, 
      target: 95, 
      unit: "% accuracy",
      category: "form"
    }
  ];

  const recentWorkouts = [
    {
      id: 1,
      name: "Upper Body Strength",
      date: "Today",
      duration: 45,
      calories: 420,
      formScore: 96,
      exercises: 8
    },
    {
      id: 2,
      name: "HIIT Cardio",
      date: "Yesterday",
      duration: 30,
      calories: 380,
      formScore: 94,
      exercises: 6
    },
    {
      id: 3,
      name: "Core Power",
      date: "2 days ago",
      duration: 25,
      calories: 290,
      formScore: 98,
      exercises: 5
    }
  ];

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Progress & Analytics
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track your fitness journey with AI-powered analytics, achievements, 
            and personalized insights.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.workoutsCompleted}</p>
              <p className="text-sm text-muted-foreground">Workouts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Clock className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.totalHours}h</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Zap className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.caloriesBurned.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Calories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Target className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.avgWorkoutTime}m</p>
              <p className="text-sm text-muted-foreground">Avg Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Award className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">94%</p>
              <p className="text-sm text-muted-foreground">AI Score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Overview */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  This Week's Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weeklyProgress.map((day, index) => (
                    <div key={index} className="text-center">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{day.day}</p>
                      <div className={`h-20 rounded-lg flex items-end justify-center p-2 ${
                        day.workouts > 0 ? 'bg-gradient-primary' : 'bg-muted/50'
                      }`}>
                        <div className="text-center">
                          {day.workouts > 0 && (
                            <>
                              <p className="text-xs font-bold text-primary-foreground">{day.workouts}</p>
                              <p className="text-xs text-primary-foreground/80">{day.duration}m</p>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{day.calories} cal</p>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    6 workouts this week • 285 min total • 2,825 calories burned
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Current Goals */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((goal, index) => {
                  const percentage = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div key={index} className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-foreground">{goal.title}</h4>
                        <Badge variant="outline">
                          {goal.current}/{goal.target} {goal.unit}
                        </Badge>
                      </div>
                      <Progress value={percentage} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {percentage.toFixed(0)}% complete
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent" />
                  Recent Workouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div key={workout.id} className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:shadow-medium transition-smooth cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{workout.name}</h4>
                        <p className="text-sm text-muted-foreground">{workout.date}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-foreground">{workout.duration}m</p>
                        <p className="text-muted-foreground">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{workout.calories}</p>
                        <p className="text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{workout.formScore}%</p>
                        <p className="text-muted-foreground">AI Score</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-foreground">{workout.exercises}</p>
                        <p className="text-muted-foreground">Exercises</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-3 rounded-xl border transition-smooth ${
                      achievement.unlocked 
                        ? 'bg-gradient-secondary/20 border-secondary/30' 
                        : 'bg-muted/30 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${
                          achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    {!achievement.unlocked && (
                      <Progress value={achievement.progress} className="h-1" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-hero border-0 shadow-strong text-center">
              <CardContent className="p-6">
                <Zap className="w-8 h-8 text-primary-foreground mx-auto mb-3" />
                <h3 className="text-lg font-bold text-primary-foreground mb-2">
                  AI Performance Insight
                </h3>
                <p className="text-sm text-primary-foreground/80 mb-4">
                  Your consistency has improved 23% this month! Keep up the great work.
                </p>
                <Button variant="outline" size="sm" className="bg-background/20 border-primary-foreground/30 text-primary-foreground hover:bg-background/30">
                  View Full Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressTracker;