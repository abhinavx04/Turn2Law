import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jplocxpooexjxpwibcwv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbG9jeHBvb2V4anhwd2liY3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjY1MjUsImV4cCI6MjA1ODg0MjUyNX0.CT-dozg_dvUtiHN3HfafWKMfY6JCRG2X4VvSyueVa-U';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: 'Database connection error', 
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Successfully connected to Supabase!',
      data,
      user: 'abhinavx04',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}