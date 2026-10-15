import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle, ArrowRight, Dumbbell, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostureCorrectionProps {
  onNavigateToDetection?: () => void;
}

const exercises = {
  pushups: {
    name: "Push-Ups",
    muscle: "Chest, Triceps, Shoulders",
    steps: [
      "Place hands slightly wider than shoulder-width apart",
      "Keep your body in a straight line from head to heels",
      "Lower your chest until it nearly touches the floor",
      "Push back up while keeping core tight",
      "Breathe in going down, out going up",
    ],
    correct: [
      "Elbows at 45° angle to the body",
      "Neutral spine – no sagging or piking",
      "Full range of motion each rep",
      "Engaged glutes and core throughout",
    ],
    mistakes: [
      "Flaring elbows out to 90° (shoulder strain)",
      "Sagging hips or piked butt in the air",
      "Half reps – not going low enough",
      "Looking up and straining the neck",
    ],
  },
  squats: {
    name: "Squats",
    muscle: "Quads, Glutes, Hamstrings",
    steps: [
      "Stand with feet shoulder-width apart, toes slightly out",
      "Brace your core and keep chest up",
      "Push hips back and bend knees simultaneously",
      "Lower until thighs are parallel to the ground (or below)",
      "Drive through heels to stand back up",
    ],
    correct: [
      "Knees tracking over toes, not caving inward",
      "Weight distributed across the whole foot",
      "Chest up and back neutral throughout",
      "Depth at or below parallel",
    ],
    mistakes: [
      "Knees caving inward (valgus collapse)",
      "Rising onto toes or heels lifting off",
      "Excessive forward lean / rounding back",
      "Not reaching adequate depth",
    ],
  },
};

const PostureCorrection = ({ onNavigateToDetection }: PostureCorrectionProps) => {
  const [activeExercise, setActiveExercise] = useState<"pushups" | "squats">("pushups");
  const exercise = exercises[activeExercise];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Posture Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Perfect Your Form
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Master correct posture for key exercises. Reduce injury risk and maximize gains.
          </p>
        </div>

        {/* Exercise Tabs */}
        <Tabs
          value={activeExercise}
          onValueChange={(v) => setActiveExercise(v as "pushups" | "squats")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-xs mx-auto bg-muted/50">
            <TabsTrigger value="pushups" className="gap-2">Push-Ups</TabsTrigger>
            <TabsTrigger value="squats" className="gap-2">Squats</TabsTrigger>
          </TabsList>

          <TabsContent value={activeExercise} className="mt-6 space-y-6">
            {/* Exercise Info */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-xl">{exercise.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{exercise.muscle}</Badge>
                </div>
                <CardDescription>Step-by-step execution</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {exercise.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary text-sm font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground/90 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Correct vs Mistakes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-success/30 bg-success/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-success">
                    <CheckCircle className="w-5 h-5" />
                    Correct Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exercise.correct.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-success mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Common Mistakes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {exercise.mistakes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-destructive mt-0.5">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA to Posture Detection */}
        {onNavigateToDetection && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-3">
                <Camera className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Ready to practice?</p>
                  <p className="text-sm text-muted-foreground">Use your camera for real-time posture feedback</p>
                </div>
              </div>
              <Button onClick={onNavigateToDetection} className="gap-2">
                Open Detection
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PostureCorrection;
