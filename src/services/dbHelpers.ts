
import { supabase } from '@/integrations/supabase/client';

// Function to safely check if a table exists in the database using a Supabase RPC call
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Using Supabase RPC function to check if table exists
    const { data, error } = await supabase
      .rpc('check_table_exists', { table_name: tableName });
      
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Function to get event participants safely
export const getEventParticipants = async (eventId: number): Promise<string[]> => {
  try {
    // Query the participants table directly based on our new schema
    const { data, error } = await supabase
      .from('participants')
      .select('user_id')
      .eq('event_id', eventId);
    
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

// Function to create a check_table_exists function in the database if it doesn't exist
export const createCheckTableExistsFunction = async (): Promise<boolean> => {
  try {
    // First, check if the function already exists
    const { error } = await supabase.rpc('check_table_exists', { table_name: 'users' });
    
    // If the function doesn't exist, we'll get an error
    if (error && error.message.includes('function does not exist')) {
      console.error('The check_table_exists function does not exist in the database.');
      // We'd need to create it using SQL, but this requires admin privileges
      // This would typically be done during database initialization
      return false;
    }
    
    return !error;
  } catch (error) {
    console.error('Error in createCheckTableExistsFunction:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  // First ensure the check_table_exists function exists
  await createCheckTableExistsFunction();
  
  // Check if essential tables exist and handle accordingly
  const usersTableExists = await checkTableExists('users');
  const eventsTableExists = await checkTableExists('events');
  const participantsTableExists = await checkTableExists('participants');
  
  if (!usersTableExists || !eventsTableExists || !participantsTableExists) {
    console.warn('Some essential tables are missing. The application may not function correctly.');
  }
};
