
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS Headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

// Define your Flask API base URL
const FLASK_API_BASE_URL = 'http://localhost:5000/api' // Update this to your actual Flask API URL

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Get the path and params from the request
    const url = new URL(req.url)
    const path = url.pathname.replace('/event-api', '')
    const searchParams = url.search

    // Create the Flask API URL
    const flaskApiUrl = `${FLASK_API_BASE_URL}${path}${searchParams}`
    
    console.log(`Proxying request to Flask API: ${flaskApiUrl}`)

    // Forward the request to Flask API
    const response = await fetch(flaskApiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward any other necessary headers
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    })

    // Get the response data
    const data = await response.json()

    // Return the response with CORS headers
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error('Error proxying request:', error)
    return new Response(JSON.stringify({ error: 'Failed to proxy request to Flask API' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  }
})
