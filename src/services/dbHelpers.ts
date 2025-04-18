
import { supabase } from '@/integrations/supabase/client';

// Function to safely check if a table exists in the database
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
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
    // Since we don't have the function yet, return an empty array
    return [];
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    return [];
  }
};

// Create database functions for events
export const createDatabaseFunctions = async (): Promise<boolean> => {
  // For now, simply return true as we don't have these functions yet
  return true;
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  // Check if essential tables exist
  const eventsTableExists = await checkTableExists('events');
  const participantsTableExists = await checkTableExists('participants');
  
  if (!eventsTableExists || !participantsTableExists) {
    console.warn('Some essential tables are missing. The application may not function correctly.');
  }
};
