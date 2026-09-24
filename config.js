// CSE Portfolio — Supabase config
// Fill these from Supabase → Project Settings → API
// anon key is safe in the browser when Row Level Security is ON (you already enabled it)

window.CSE_CONFIG = {
  supabaseUrl: 'https://gbwfrcnrhfhfiosehdtj.supabase.co',
  // PASTE your anon public key between the quotes below:
  supabaseAnonKey: 'sb_publishable_CAr67McfAPSoF3rwb31QWA_Jp6NbFzx'
};

window.getSupabase = function () {
  if (!window.__sb) {
    const { supabaseUrl, supabaseAnonKey } = window.CSE_CONFIG;
    if (!supabaseAnonKey || supabaseAnonKey.includes('PASTE_')) {
      console.error('Add your Supabase anon key in js/config.js');
    }
    window.__sb = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  }
  return window.__sb;
};
