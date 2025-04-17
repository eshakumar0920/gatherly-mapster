
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
    // Try to fetch participants via Edge Function
    const response = await fetch(`https://lzcpjxkttpfcgcwonrfc.supabase.co/functions/v1/get_participants?eventId=${eventId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching participants from edge function:', await response.text());
      return [];
    }
    
    const result = await response.json();
    
    if (Array.isArray(result.data)) {
      return result.data.map((p: any) => p.user_id?.toString() || '');
    }
    
    return [];
  } catch (error) {
    console.error('Error in getEventParticipants:', error);
    return [];
  }
};
