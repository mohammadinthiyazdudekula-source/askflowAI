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

async function runMigration() {
  console.log('Connecting to Supabase at:', supabaseUrl);

  const sqlPath = path.join(__dirname, '../../supabase/migrations/20260801_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('SQL Migration file read successfully.');

  // Check if we can execute via Supabase RPC or check existing tables
  try {
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('count', { count: 'exact', head: true });

    if (!convError) {
      console.log('✅ Table "conversations" already exists and is accessible!');
    } else {
      console.log('Notice on conversations table:', convError.message);
    }

    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('count', { count: 'exact', head: true });

    if (!msgError) {
      console.log('✅ Table "messages" already exists and is accessible!');
    } else {
      console.log('Notice on messages table:', msgError.message);
    }
  } catch (err: any) {
    console.error('Migration test error:', err);
  }
}

runMigration();
