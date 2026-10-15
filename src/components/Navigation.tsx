import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Dumbbell, MessageSquare, TrendingUp, User, Apple, LogOut } from "lucide-react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "workouts", label: "Workouts", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "chat", label: "AI Coach", icon: MessageSquare },
    { id: "progress", label: "Progress", icon: TrendingUp },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Don't show navigation on home page
  if (isHomePage) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FitAI</h1>
              <Badge variant="outline" className="text-xs">Beta</Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSectionChange(item.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden sm:flex">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <div className={`w-full h-0.5 bg-foreground transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
                <div className={`w-full h-0.5 bg-foreground transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`w-full h-0.5 bg-foreground transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMenuOpen(false);
                    }}
                    className="justify-start gap-3"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="justify-start gap-3"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;