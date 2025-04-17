
import { supabase } from '@/integrations/supabase/client';

// Function to safely check if a table exists in the database
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');
      
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Function to get event participants safely
export const getEventParticipants = async (eventId: number): Promise<string[]> => {
  try {
    // First check if participants table exists
    const tableExists = await checkTableExists('participants');
    
    if (!tableExists) {
      console.log('Participants table does not exist');
      return [];
    }
    
    // If table exists, attempt to query it
    const { data, error } = await supabase
      .rpc('get_participants_for_event', { event_id_param: eventId });
    
    if (error) {
      console.error('Error getting participants:', error);
      return [];
    }
    
    return (data || []).map(p => p.user_id?.toString() || '');
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    return [];
  }
};
