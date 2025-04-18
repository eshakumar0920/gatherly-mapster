
import { supabase } from '@/integrations/supabase/client';

export interface Level {
  id: number;
  level_number: number;
  title: string | null;
  description: string | null;
  perks: string | null;
  total_xp: number;
  tier: number;
}

export const fetchLevels = async (): Promise<Level[]> => {
  try {
    // Use RPC function, or direct query if RPC isn't available
    const { data, error } = await supabase.from('levels').select('*').order('level_number');

    if (error) {
      console.error('Error fetching levels:', error);
      // Return some default levels if the query fails
      return [
        { id: 1, level_number: 1, title: 'Freshman', description: 'Just getting started', perks: 'Basic stickers', total_xp: 0, tier: 1 },
        { id: 2, level_number: 2, title: 'Sophomore', description: 'Getting the hang of things', perks: 'More sticker options', total_xp: 10, tier: 1 },
        { id: 3, level_number: 3, title: 'Junior', description: 'Becoming a regular', perks: 'Special event access', total_xp: 25, tier: 1 },
        { id: 4, level_number: 4, title: 'Senior', description: 'Experienced member', perks: 'Priority RSVP', total_xp: 50, tier: 2 },
        { id: 5, level_number: 5, title: 'Graduate', description: 'Master of campus life', perks: 'All perks unlocked', total_xp: 100, tier: 2 }
      ];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchLevels:', error);
    return [];
  }
};

export const getCurrentLevel = async (points: number): Promise<Level | null> => {
  try {
    // Use the points parameter as total_xp in the query
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .lte('total_xp', points)
      .order('level_number', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching current level:', error);
      // Return default level if the query fails
      return { 
        id: 1, 
        level_number: 1, 
        title: 'Freshman', 
        description: 'Just getting started', 
        perks: 'Basic stickers',  
        total_xp: 0, 
        tier: 1 
      };
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentLevel:', error);
    return null;
  }
};
