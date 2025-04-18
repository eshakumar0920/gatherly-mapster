
import { supabase } from '@/integrations/supabase/client';

// Function to safely check if a table exists in the database
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_table_exists', {
      table_name: tableName
    });
      
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

// Function to get event participants - using mock data now
export const getEventParticipants = async (eventId: number): Promise<string[]> => {
  try {
    // Just return mock data since we don't have the participants table
    return ["user1", "user2", "user3"];
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    return [];
  }
};

// Create database functions for events - now just checks for tables
export const createDatabaseFunctions = async (): Promise<boolean> => {
  try {
    // Check if our tables exist
    const eventsTableExists = await checkTableExists('events');
    const participantsTableExists = await checkTableExists('participants');
    
    return eventsTableExists && participantsTableExists;
  } catch (error) {
    console.error('Error in createDatabaseFunctions:', error);
    return false;
  }
};

// Initialize database - just logs a warning now if tables don't exist
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Check if essential tables exist
    const eventsTableExists = await checkTableExists('events');
    const participantsTableExists = await checkTableExists('participants');
    const usersTableExists = await checkTableExists('users');
    const levelsTableExists = await checkTableExists('levels');
    
    if (!eventsTableExists || !participantsTableExists || !usersTableExists || !levelsTableExists) {
      console.warn('Some essential tables are missing. The application will use mock data instead.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
