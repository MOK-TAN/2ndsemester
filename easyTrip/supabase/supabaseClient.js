import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://evdhnrraznlldkwzviva.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2ZGhucnJhem5sbGRrd3p2aXZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4ODYyNDYsImV4cCI6MjA2MjQ2MjI0Nn0.lrUwlnLzY7Y26KG1oxFOMqRBasAstk5qnIyzGamu-HU';

export const supabase = createClient(supabaseUrl, supabaseKey)
