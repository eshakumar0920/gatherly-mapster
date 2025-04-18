
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

// Define default levels for when database is not available
const defaultLevels: Level[] = [
  { id: 1, level_number: 1, title: 'Freshman', description: 'Just getting started', perks: 'Basic stickers', total_xp: 0, tier: 1 },
  { id: 2, level_number: 2, title: 'Sophomore', description: 'Getting the hang of things', perks: 'More sticker options', total_xp: 10, tier: 1 },
  { id: 3, level_number: 3, title: 'Junior', description: 'Becoming a regular', perks: 'Special event access', total_xp: 25, tier: 1 },
  { id: 4, level_number: 4, title: 'Senior', description: 'Experienced member', perks: 'Priority RSVP', total_xp: 50, tier: 2 },
  { id: 5, level_number: 5, title: 'Graduate', description: 'Master of campus life', perks: 'All perks unlocked', total_xp: 100, tier: 2 }
];

export const fetchLevels = async (): Promise<Level[]> => {
  try {
    // Check if the levels table exists before querying it
    const { data: tableExists, error: checkError } = await supabase.rpc('check_table_exists', {
      table_name: 'levels'
    });
    
    if (checkError || !tableExists) {
      console.log('Levels table does not exist, using mock data instead');
      return defaultLevels;
    }
    
    // If the table exists, we attempt the query (though this won't execute in our current setup)
    // This is kept here for when the table is created later
    console.log('Attempting to fetch levels from database (table exists)');
    return defaultLevels;
    
    // The code below is commented out until the levels table exists
    /*
    const { data, error } = await supabase.from('levels').select('*').order('level_number');

    if (error) {
      console.error('Error fetching levels:', error);
      return defaultLevels;
    }

    return data || [];
    */
  } catch (error) {
    console.error('Error in fetchLevels:', error);
    return defaultLevels;
  }
};

export const getCurrentLevel = async (points: number): Promise<Level | null> => {
  try {
    // In a real app, we would query the database to find the appropriate level
    // For now, since the levels table doesn't exist, we'll calculate from the mock data
    const levels = defaultLevels;
    
    // Find the highest level that the user qualifies for based on their points
    const currentLevel = levels
      .filter(level => level.total_xp <= points)
      .sort((a, b) => b.level_number - a.level_number)[0];
    
    if (!currentLevel) {
      console.warn('No level found for points:', points);
      return defaultLevels[0]; // Return the first level as a fallback
    }
    
    return currentLevel;
    
    // The code below is commented out until the levels table exists
    /*
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .lte('total_xp', points)
      .order('level_number', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching current level:', error);
      return defaultLevels[0];
    }

    return data;
    */
  } catch (error) {
    console.error('Error in getCurrentLevel:', error);
    return defaultLevels[0];
  }
};
