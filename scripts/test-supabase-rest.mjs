const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pyigygrgdtnzzmyxfcqw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function testSupabaseRest() {
  if (!SUPABASE_KEY) {
    console.log('Please provide SUPABASE_SERVICE_ROLE_KEY or anon key');
    return;
  }
  console.log('Pinging Supabase REST API at:', SUPABASE_URL);

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    console.log('HTTP Status:', response.status, response.statusText);
    if (response.status === 200) {
      console.log('SUCCESS: Connected to Supabase REST API!');
    }
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testSupabaseRest();
