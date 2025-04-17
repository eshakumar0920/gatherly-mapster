
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
    const { error } = await supabase.rpc('check_table_exists', { table_name: 'users' });
    
    // If the function doesn't exist, create it
    if (error && error.message.includes('function does not exist')) {
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
          RETURNS boolean
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $function$
          DECLARE
            table_exists BOOLEAN;
          BEGIN
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = $1
            ) INTO table_exists;
            
            RETURN table_exists;
          END;
          $function$
        `
      });
      
      if (createError) {
        console.error('Failed to create check_table_exists function:', createError);
        return false;
      }
      
      console.log('Successfully created check_table_exists function');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error in createCheckTableExistsFunction:', error);
    return false;
  }
};

// Update the Edge Function to work with the new schema
// This needs to be called on app initialization
export const initializeDatabase = async (): Promise<void> => {
  // First ensure the check_table_exists function exists
  await createCheckTableExistsFunction();
  
  // Check if other essential tables exist and handle accordingly
  const usersTableExists = await checkTableExists('users');
  const eventsTableExists = await checkTableExists('events');
  const participantsTableExists = await checkTableExists('participants');
  
  if (!usersTableExists || !eventsTableExists || !participantsTableExists) {
    console.warn('Some essential tables are missing. The application may not function correctly.');
  }
};
