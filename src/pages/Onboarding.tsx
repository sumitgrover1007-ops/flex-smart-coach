import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2 } from 'lucide-react';
import { z } from 'zod';

const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  age: z.number().min(10, "Age must be at least 10").max(100, "Age must be at most 100"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Weight must be at most 300kg"),
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Height must be at most 250cm"),
  activityLevel: z.enum(['sedentary', 'moderate', 'active']),
  fitnessGoal: z.enum(['lose_weight', 'gain_weight', 'build_muscle', 'maintain_weight'])
});

const Onboarding = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    dateOfBirth: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    fitnessGoal: ''
  });
  const [bmi, setBmi] = useState<number | null>(null);
  const [goalRestricted, setGoalRestricted] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateBMI = (weight: number, height: number) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    }
    return null;
  };

  useEffect(() => {
    if (formData.weight && formData.height) {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const calculatedBMI = calculateBMI(weight, height);
      setBmi(calculatedBMI);
      
      // BMI >= 25 is overweight, >= 30 is obese
      if (calculatedBMI && calculatedBMI >= 25) {
        setGoalRestricted(true);
        setFormData(prev => ({ ...prev, fitnessGoal: 'lose_weight' }));
      } else {
        setGoalRestricted(false);
      }
    }
  }, [formData.weight, formData.height]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validate form data
      const validated = onboardingSchema.parse({
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        activityLevel: formData.activityLevel,
        fitnessGoal: formData.fitnessGoal
      });

      // Cross-check age with date of birth
      const birthDate = new Date(validated.dateOfBirth);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? calculatedAge - 1 
        : calculatedAge;

      if (Math.abs(adjustedAge - validated.age) > 1) {
        toast({
          title: "Validation Error",
          description: "Age and date of birth don't match. Please check your inputs.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: validated.firstName,
          last_name: validated.lastName,
          age: validated.age,
          date_of_birth: validated.dateOfBirth,
          gender: validated.gender,
          weight_kg: validated.weight,
          height_cm: validated.height,
          activity_level: validated.activityLevel,
          fitness_goal: validated.fitnessGoal,
          onboarding_completed: true
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been set up successfully."
      });

      navigate('/dashboard');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to complete onboarding",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-20" />
      <div className="absolute inset-0 bg-gradient-glow animate-pulse" style={{ animationDuration: '4s' }} />
      
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative animate-glow">
              <Brain className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Let's Get Started!
          </h1>
          <p className="text-muted-foreground">
            Tell us about yourself to personalize your fitness journey
          </p>
        </div>

        <Card className="bg-card/90 backdrop-blur-xl border-primary/30 shadow-strong hover:shadow-glow transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              All fields are required to create your personalized fitness plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="10"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    min="100"
                    max="250"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    required
                  />
                </div>
              </div>

              {bmi && (
                <div className="p-4 rounded-lg bg-muted/50 border border-primary/20">
                  <p className="text-sm font-medium">Your BMI: <span className="text-primary">{bmi.toFixed(1)}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bmi < 18.5 && "Underweight"}
                    {bmi >= 18.5 && bmi < 25 && "Normal weight"}
                    {bmi >= 25 && bmi < 30 && "Overweight"}
                    {bmi >= 30 && "Obese"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level *</Label>
                <Select value={formData.activityLevel} onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                    <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fitnessGoal">Fitness Goal *</Label>
                {goalRestricted && (
                  <p className="text-sm text-warning mb-2">
                    Based on your BMI, your goal has been set to "Lose Weight" for health reasons.
                  </p>
                )}
                <Select 
                  value={formData.fitnessGoal} 
                  onValueChange={(value) => setFormData({ ...formData, fitnessGoal: value })}
                  disabled={goalRestricted}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your fitness goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Lose Weight</SelectItem>
                    <SelectItem value="gain_weight" disabled={goalRestricted}>Gain Weight</SelectItem>
                    <SelectItem value="build_muscle" disabled={goalRestricted}>Build Muscle</SelectItem>
                    <SelectItem value="maintain_weight" disabled={goalRestricted}>Maintain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Setup...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
