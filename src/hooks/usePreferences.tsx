
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserPreferences {
  theme: string | null;
  notifications_enabled: boolean;
}

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          ...newPreferences
        });

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved successfully."
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences.",
        variant: "destructive"
      });
    }
  };

  return {
    preferences,
    isLoading,
    updatePreferences
  };
};
