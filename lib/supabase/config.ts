export const dbConfig = {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    database: {
      name: 'turn2law',
      schema: 'turn2law'
    }
  };
  
  export type DbUser = {
    id: string;
    email: string;
    full_name: string;
    role: 'client' | 'lawyer' | 'admin';
    created_at: string;
    updated_at: string;
  };
  
  export type UserRole = 'client' | 'lawyer' | 'admin';