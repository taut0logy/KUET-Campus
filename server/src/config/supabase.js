const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create client with anonymous key (limited permissions)
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Create admin client with service key (full permissions)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

module.exports = {
  supabaseClient,
  supabaseAdmin
}; 