import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Activity, 
  Target, 
  Flame, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Clock,
  Zap
} from "lucide-react";

const Dashboard = () => {
  const { profile } = useAuth();
  const firstName = profile?.first_name || 'there';

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {firstName}! 💪
          </h2>
          <p className="text-muted-foreground">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Weekly Goal</p>
                  <p className="text-2xl font-bold text-foreground">4/5</p>
                  <p className="text-sm text-success">Workouts completed</p>
                </div>
                <div className="p-3 bg-gradient-primary rounded-xl">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <Progress value={80} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Calories Burned</p>
                  <p className="text-2xl font-bold text-foreground">1,240</p>
                  <p className="text-sm text-warning">Today</p>
                </div>
                <div className="p-3 bg-gradient-secondary rounded-xl">
                  <Flame className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Streak</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-sm text-accent">Days active</p>
                </div>
                <div className="p-3 bg-gradient-accent rounded-xl">
                  <Trophy className="w-6 h-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-soft hover:shadow-medium transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">AI Score</p>
                  <p className="text-2xl font-bold text-foreground">94%</p>
                  <p className="text-sm text-success">Form accuracy</p>
                </div>
                <div className="p-3 bg-success rounded-xl">
                  <TrendingUp className="w-6 h-6 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Workout */}
          <Card className="lg:col-span-2 bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Today's Workout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-primary/10 rounded-xl border border-primary/20">
                  <div>
                    <h4 className="font-semibold text-foreground">Upper Body Strength</h4>
                    <p className="text-sm text-muted-foreground">45 minutes • AI Form Check enabled</p>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    6:30 PM
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-sm text-muted-foreground">Exercises</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Sets each</p>
                  </div>
                </div>
                
                <Button variant="gradient" size="lg" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Workout with AI
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gradient-card border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Workout
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Activity className="w-4 h-4" />
                Log Food Intake
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <TrendingUp className="w-4 h-4" />
                View Progress
              </Button>
              
              <div className="pt-4 mt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Recent Achievement</h4>
                <div className="p-3 bg-gradient-secondary/10 rounded-lg border border-secondary/20">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-medium">Perfect Form Week!</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    7 days of 95%+ form accuracy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;