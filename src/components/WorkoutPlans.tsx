import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Zap, 
  Heart, 
  Timer,
  TrendingUp,
  Users
} from "lucide-react";

const WorkoutPlans = () => {
  const workoutPlans = [
    {
      id: 1,
      title: "AI Strength Builder",
      description: "Progressive strength training with real-time form correction",
      duration: "45 min",
      level: "Intermediate",
      exercises: 8,
      aiFeatures: ["Form Check", "Rep Counter", "Progress Tracking"],
      category: "Strength",
      popularity: 92,
      image: "💪"
    },
    {
      id: 2,
      title: "Smart Cardio Blast",
      description: "High-intensity cardio with AI-powered heart rate optimization",
      duration: "30 min",
      level: "Beginner",
      exercises: 6,
      aiFeatures: ["Heart Rate AI", "Intensity Adjustment", "Calorie Prediction"],
      category: "Cardio",
      popularity: 88,
      image: "🔥"
    },
    {
      id: 3,
      title: "Yoga Flow AI",
      description: "Mindful yoga with posture alignment assistance",
      duration: "40 min",
      level: "All Levels",
      exercises: 12,
      aiFeatures: ["Pose Detection", "Alignment Guide", "Breathing Coach"],
      category: "Flexibility",
      popularity: 85,
      image: "🧘"
    },
    {
      id: 4,
      title: "HIIT Pro Max",
      description: "Advanced HIIT training with AI performance optimization",
      duration: "25 min",
      level: "Advanced",
      exercises: 10,
      aiFeatures: ["Performance AI", "Recovery Analysis", "Intensity Scaling"],
      category: "HIIT",
      popularity: 94,
      image: "⚡"
    },
    {
      id: 5,
      title: "Core Power AI",
      description: "Targeted core strengthening with precision form tracking",
      duration: "20 min",
      level: "Intermediate",
      exercises: 6,
      aiFeatures: ["Core Stability AI", "Balance Analysis", "Progress Metrics"],
      category: "Core",
      popularity: 90,
      image: "🎯"
    },
    {
      id: 6,
      title: "Recovery & Mobility",
      description: "AI-guided recovery sessions for optimal muscle restoration",
      duration: "35 min",
      level: "All Levels",
      exercises: 8,
      aiFeatures: ["Recovery AI", "Tension Detection", "Mobility Score"],
      category: "Recovery",
      popularity: 87,
      image: "🌟"
    }
  ];

  const categories = ["All", "Strength", "Cardio", "Flexibility", "HIIT", "Core", "Recovery"];

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            AI-Powered Workout Plans
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover personalized workout plans enhanced with artificial intelligence for 
            optimal performance, safety, and results.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className="transition-smooth"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Dumbbell className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">50+</p>
              <p className="text-sm text-muted-foreground">AI Workouts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Target className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <Users className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">10K+</p>
              <p className="text-sm text-muted-foreground">Users</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-card border-0 shadow-soft text-center">
            <CardContent className="p-4">
              <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">4.9</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Workout Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-smooth group cursor-pointer"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{plan.image}</div>
                  <Badge variant="secondary" className="text-xs">
                    {plan.popularity}% match
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-smooth">
                  {plan.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Workout Info */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">{plan.duration}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Dumbbell className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">{plan.exercises} exercises</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Target className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs font-medium">{plan.level}</p>
                  </div>
                </div>

                {/* AI Features */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground mb-2">AI Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.aiFeatures.map((feature, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs bg-primary/10 text-primary border-primary/20"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="gradient" size="sm" className="flex-1">
                    <Zap className="w-4 h-4 mr-2" />
                    Start Now
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Workout CTA */}
        <Card className="mt-8 bg-gradient-hero border-0 shadow-strong text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-primary-foreground mb-4">
              Need Something Custom?
            </h3>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              Let our AI create a completely personalized workout plan based on your goals, 
              fitness level, available equipment, and schedule.
            </p>
            <Button variant="outline" size="lg" className="bg-background/20 border-primary-foreground/30 text-primary-foreground hover:bg-background/30">
              <Zap className="w-5 h-5 mr-2" />
              Generate AI Workout
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default WorkoutPlans;