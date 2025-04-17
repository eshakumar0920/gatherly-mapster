
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.37.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get('eventId');
    
    if (!eventId) {
      return new Response(
        JSON.stringify({ error: 'eventId parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if participants table exists using a raw SQL query
    const { data: existsData, error: existsError } = await supabase.rpc(
      'check_table_exists',
      { table_name: 'participants' }
    );
    
    let participants = [];
    
    if (!existsError && existsData === true) {
      // Table exists, get participants - using our new schema
      const { data, error } = await supabase
        .from('participants')
        .select('user_id')
        .eq('event_id', parseInt(eventId, 10));
      
      if (error) throw error;
      participants = data || [];
    }
    
    return new Response(
      JSON.stringify({ data: participants }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
