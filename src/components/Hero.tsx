import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import ScrollNav from "@/components/ScrollNav";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import { Activity, Brain, Camera, Target, Sparkles } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <ScrollNav />
      
      {/* Theme Switcher */}
      <div className="fixed top-24 right-6 z-50">
        <ThemeSwitcher />
      </div>

      {/* Animated Background with Neon Gradients - Only for Neon Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-purple-900/20 to-blue-900/20" />
      {theme === 'neon' && (
        <>
          <div className="absolute inset-0 bg-neon-grid opacity-30" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
          </div>
        </>
      )}

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <Badge variant="secondary" className="mb-6 bg-card/50 backdrop-blur-sm text-foreground border-primary/50 hover-glow animate-glow">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Fitness Revolution
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-loose tracking-tight pb-6">
              Transform Your Body With
              <span className="block mt-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent pb-4">
                AI Intelligence
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience real-time posture correction, personalized workouts, 
              and intelligent nutrition guidance powered by cutting-edge AI technology.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12 max-w-4xl mx-auto">
              <div className="group bg-card/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-primary/30 hover:border-primary transition-all duration-300 hover:shadow-glow hover-glow">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-foreground">Real-time Form</p>
              </div>
              <div className="group bg-card/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-secondary/30 hover:border-secondary transition-all duration-300 hover:shadow-glow hover-glow">
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-foreground">Smart Plans</p>
              </div>
              <div className="group bg-card/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-accent/30 hover:border-accent transition-all duration-300 hover:shadow-glow hover-glow">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-foreground">AI Nutrition</p>
              </div>
              <div className="group bg-card/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-primary-light/30 hover:border-primary-light transition-all duration-300 hover:shadow-glow hover-glow">
                <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-primary-light mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-foreground">Analytics</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 hover:shadow-glow transition-all duration-300 group text-base sm:text-lg px-8 py-6 rounded-2xl animate-glow"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Journey
                <Target className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;