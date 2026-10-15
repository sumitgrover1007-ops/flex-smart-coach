import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Home, Dumbbell, Apple, MessageSquare, TrendingUp, LogOut, Menu, X, ClipboardCheck, ScanEye, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ScrollNavProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const ScrollNav = ({ activeSection, onSectionChange }: ScrollNavProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isAuthPage = location.pathname === '/auth' || location.pathname === '/onboarding';
  const isHomePage = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';

  const navItems = isDashboard ? [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'checkin', label: 'Check-in', icon: ClipboardCheck },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Apple },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'posture', label: 'Posture', icon: ScanEye },
    { id: 'detection', label: 'Detection', icon: Camera },
  ] : [];

  if (isAuthPage) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out",
        scrolled
          ? "bg-background/60 backdrop-blur-2xl border-b border-purple-500/20 shadow-[0_8px_32px_0_rgba(139,92,246,0.15)]"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => isHomePage ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/')}
            className="flex items-center gap-2 group"
          >
            <div className={cn(
              "relative transition-all duration-300",
              scrolled ? "animate-glow" : ""
            )}>
              <Brain className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300",
                scrolled ? "text-primary" : "text-primary-light"
              )} />
            </div>
            <span className={cn(
              "text-lg sm:text-xl font-bold transition-all duration-300",
              scrolled
                ? "bg-gradient-primary bg-clip-text text-transparent"
                : "text-foreground"
            )}>
              AI Fitness Trainer
            </span>
          </button>

          {/* Desktop Navigation */}
          {isDashboard && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange?.(item.id)}
                    className={cn(
                      "relative px-4 py-2 rounded-lg transition-all duration-300 group overflow-hidden",
                      "hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10",
                      isActive && "bg-gradient-to-r from-purple-500/20 to-blue-500/20"
                    )}
                  >
                    <div className="flex items-center gap-2 relative z-10">
                      <Icon className={cn(
                        "w-4 h-4 transition-all duration-300 group-hover:scale-110",
                        isActive ? "text-purple-400" : "text-muted-foreground group-hover:text-purple-400"
                      )} />
                      <span className={cn(
                        "text-sm font-medium transition-all duration-300",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {item.label}
                      </span>
                    </div>
                    {/* Animated underline */}
                    <div className={cn(
                      "absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300",
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className={cn(
                    "hidden sm:flex hover-glow transition-all duration-300",
                    scrolled ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                
                {/* Mobile Menu Button */}
                {isDashboard && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                )}
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate('/auth')}
                className={cn(
                  "bg-gradient-primary hover:opacity-90 transition-all duration-300",
                  !scrolled && "hover-glow"
                )}
              >
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isDashboard && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/30 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSectionChange?.(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                      "hover:bg-primary/20",
                      isActive && "bg-primary/30"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="justify-start px-4 mt-2"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ScrollNav;
