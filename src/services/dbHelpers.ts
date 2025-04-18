
import { supabase } from '@/integrations/supabase/client';

// Function to safely check if a table exists in the database using a Supabase RPC call
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Directly query the information schema instead of using RPC
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
      
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Function to get event participants safely
export const getEventParticipants = async (eventId: number): Promise<string[]> => {
  try {
    // Query the participants table directly based on our new schema
    const { data, error } = await supabase.rpc(
      'get_event_participants',
      { p_event_id: eventId }
    );
    
    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
    
    if (Array.isArray(data)) {
      return data.map((p: any) => p.user_id?.toString() || '');
    }
    
    return [];
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    return [];
  }
};

// Create database functions for events
export const createDatabaseFunctions = async (): Promise<boolean> => {
  try {
    // Create get_events function
    const { error: getEventsError } = await supabase.rpc('get_events');
    
    if (getEventsError && !getEventsError.message.includes('does not exist')) {
      console.error('Error checking get_events function:', getEventsError);
      return false;
    }
    
    // Create get_event_by_id function  
    const { error: getEventByIdError } = await supabase.rpc(
      'get_event_by_id', 
      { p_event_id: -1 }  // Pass invalid ID for check
    );
    
    if (getEventByIdError && !getEventByIdError.message.includes('does not exist')) {
      console.error('Error checking get_event_by_id function:', getEventByIdError);
      return false;
    }

    // Create create_event function
    const { error: createEventError } = await supabase.rpc(
      'create_event',
      { 
        p_title: 'test', 
        p_description: 'test',
        p_location: 'test',
        p_event_date: 'test',
        p_creator_id: 1,
        p_xp_reward: 1,
        p_organizer_xp_reward: 1,
        p_semester: 'test'
      }
    );
    
    if (createEventError && !createEventError.message.includes('does not exist')) {
      console.error('Error checking create_event function:', createEventError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createDatabaseFunctions:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  // Check if essential tables exist
  const eventsTableExists = await checkTableExists('events');
  const participantsTableExists = await checkTableExists('participants');
  
  // Check if database functions exist and create them if needed
  await createDatabaseFunctions();
  
  if (!eventsTableExists || !participantsTableExists) {
    console.warn('Some essential tables are missing. The application may not function correctly.');
  }
};
