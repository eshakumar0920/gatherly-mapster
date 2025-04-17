
import { supabase } from '@/integrations/supabase/client';

export interface Level {
  id: number;
  level_number: number;
  title: string | null;
  description: string | null;
  level_points: number;
}

export const fetchLevels = async () => {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('level_number');

  if (error) {
    console.error('Error fetching levels:', error);
    return [];
  }

  return data;
};

export const getCurrentLevel = async (points: number) => {
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .lte('level_points', points)
    .order('level_number', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching current level:', error);
    return null;
  }

  return data;
};
