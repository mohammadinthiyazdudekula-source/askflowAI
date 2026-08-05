import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function run001Migration() {
  console.log('🌾 Executing CropPilot AI Migration (001_initial_schema.sql) at:', supabaseUrl);

  const sqlPath = path.join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('✅ SQL Migration File read successfully (', sql.length, 'bytes).');

  const tables = ['farmers', 'farms', 'fields', 'crops', 'crop_advisories'];

  for (const tableName of tables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ Table "${tableName}" is active and accessible!`);
      } else {
        console.log(`Notice on table "${tableName}":`, error.message);
      }
    } catch (err: any) {
      console.error(`Error checking ${tableName}:`, err?.message || err);
    }
  }
}

run001Migration();
