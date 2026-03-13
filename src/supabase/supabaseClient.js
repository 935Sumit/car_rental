import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper to check if URL is valid
const isValidUrl = (url) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('your_supabase_project_url');
  } catch {
    return false;
  }
}

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key')) {
  console.error("CRITICAL: Supabase credentials are missing or invalid in your .env file!");
  console.log("Please update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file with values from your Supabase Dashboard Settings > API.");
}

// Only create client if URL is valid to avoid crashing the whole app
export const supabase = isValidUrl(supabaseUrl) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { 
      // Proxy object to prevent 'cannot read property from undefined' errors
      auth: { signUp: () => ({ error: { message: 'Supabase not configured' } }), signInWithPassword: () => ({ error: { message: 'Supabase not configured' } }) },
      from: () => ({ 
        select: () => ({ order: () => ({ data: [], error: { message: 'Supabase not configured' } }), eq: () => ({ single: () => ({ data: null, error: { message: 'Supabase not configured' } }) }), data: [], error: { message: 'Supabase not configured' } }),
        insert: () => ({ select: () => ({ data: [], error: { message: 'Supabase not configured' } }) }),
        update: () => ({ eq: () => ({ error: { message: 'Supabase not configured' } }) }),
        delete: () => ({ eq: () => ({ error: { message: 'Supabase not configured' } }) })
      }),
      channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
      removeChannel: () => {},
      storage: { from: () => ({ upload: () => ({ error: { message: 'Supabase not configured' } }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
    };
