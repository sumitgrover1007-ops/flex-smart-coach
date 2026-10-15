import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const DashboardGreeting = () => {
  const { user, profile } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = async () => {
      if (!profile || !user) return;

      const firstName = profile.first_name || 'there';
      
      if (profile.first_login) {
        setGreeting(`Welcome, ${firstName}! How are you today?`);
        
        // Update first_login to false after showing welcome message
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('id', user.id);
      } else {
        setGreeting(`Welcome back, ${firstName}!`);
      }
    };

    updateGreeting();
  }, [profile, user]);

  if (!greeting) return null;

  return (
    <Card className="bg-gradient-card border-primary/30 shadow-glow animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-primary animate-glow" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {greeting}
          </h2>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardGreeting;
