import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://frhctzhtjfewjsenldwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaGN0emh0amZld2pzZW5sZHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NDM2MTEsImV4cCI6MjA4MjExOTYxMX0.2I1bSjNyagObIo3Nr0MdeTEmlq-Napw7O05HiiP0SyE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);