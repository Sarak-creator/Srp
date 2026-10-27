const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pyigygrgdtnzzmyxfcqw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function listTables() {
  if (!SUPABASE_KEY) {
    console.log('Please provide SUPABASE_SERVICE_ROLE_KEY in .env');
    return;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  const schema = await response.json();
  const definitions = Object.keys(schema.definitions || {});
  console.log('Tables defined in Supabase public schema:');
  if (definitions.length === 0) {
    console.log(' (No tables found in public schema yet. Ready for schema creation!)');
  } else {
    definitions.forEach((def) => console.log(' - ' + def));
  }
}

listTables();
