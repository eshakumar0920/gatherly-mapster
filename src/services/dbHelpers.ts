
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

// Function to get event participants 
export const getEventParticipants = async (eventId: number): Promise<string[]> => {
  try {
    const { data, error } = await supabase.rpc('get_event_participants', {
      p_event_id: eventId
    });
    
    if (error) {
      console.error(`Error getting participants for event ${eventId}:`, error);
      return [];
    }
    
    if (data && Array.isArray(data)) {
      // Extract usernames or other identifiers
      const participants = data.map(p => p.user_id?.toString() || '');
      return participants;
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
    // Check if our RPC functions exist
    const eventsTableExists = await checkTableExists('events');
    const participantsTableExists = await checkTableExists('participants');
    
    return eventsTableExists && participantsTableExists;
  } catch (error) {
    console.error('Error in createDatabaseFunctions:', error);
    return false;
  }
};

// Initialize database
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Check if essential tables exist
    const eventsTableExists = await checkTableExists('events');
    const participantsTableExists = await checkTableExists('participants');
    const usersTableExists = await checkTableExists('users');
    const levelsTableExists = await checkTableExists('levels');
    
    if (!eventsTableExists || !participantsTableExists || !usersTableExists || !levelsTableExists) {
      console.warn('Some essential tables are missing. The application may not function correctly.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
