-- Migration: Create container_units table and enable dynamic units
-- Date: 2026-10-28

CREATE TABLE IF NOT EXISTS container_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_kh VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disable RLS to match other tables in the ERP schema
ALTER TABLE container_units DISABLE ROW LEVEL SECURITY;

-- Grant full permissions for Supabase client
GRANT ALL ON TABLE container_units TO anon, authenticated, service_role;

-- Convert products.unit to VARCHAR(100) to allow dynamic user-defined units
ALTER TABLE products ALTER COLUMN unit TYPE VARCHAR(100) USING unit::text;

-- Seed initial default container units
INSERT INTO container_units (code, name_kh, name_en, description, is_default)
VALUES 
  ('container_20l', 'ធុង ២០លីត្រ', '20L Container', 'ធុងទឹកចំណុះ ២០លីត្រ សម្រាប់ប្តូរសំបក ឬលក់ដាច់', true),
  ('pack_350ml', 'យួរ ៣៥០មល (២៤ដប)', '350ml Pack (24 bottles)', 'ទឹកដបតូច ៣៥០មល ចំនួន ២៤ដប ក្នុងមួយយួរ', false),
  ('pack_500ml', 'យួរ ៥០០មល (២៤ដប)', '500ml Pack (24 bottles)', 'ទឹកដបមធ្យម ៥០០មល ចំនួន ២៤ដប ក្នុងមួយយួរ', false),
  ('pack_1500ml', 'យួរ ១៥០០មល (១២ដប)', '1500ml Pack (12 bottles)', 'ទឹកដបធំ ១៥០០មល (១.៥L) ចំនួន ១២ដប ក្នុងមួយយួរ', false),
  ('bottle_custom', 'ដប/កញ្ចប់ផ្សេងៗ', 'Custom Container', 'ប្រភេទដប ឬកញ្ចប់ពិសេសតាមតម្រូវការ', false)
ON CONFLICT (code) DO UPDATE SET 
  name_kh = EXCLUDED.name_kh,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description;
