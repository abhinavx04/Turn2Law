import { createClient } from '@supabase/supabase-js';
import { dbConfig } from './config';

if (!dbConfig.supabase.url || !dbConfig.supabase.anonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  dbConfig.supabase.url,
  dbConfig.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: dbConfig.database.schema
    }
  }
);

export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .single();

    if (error) {
      throw new Error(`Database connection error: ${error.message}`);
    }

    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
}