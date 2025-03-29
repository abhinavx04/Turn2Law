import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Get table structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      return NextResponse.json({
        status: 'error',
        error: usersError.message,
        timestamp: new Date().toISOString(),
        user: 'abhinavx04'
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Connected to Supabase successfully',
      data: {
        userCount: users?.length || 0,
        users: users?.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }))
      },
      timestamp: new Date().toISOString(),
      user: 'abhinavx04'
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to Supabase',
      error: error.message,
      timestamp: new Date().toISOString(),
      user: 'abhinavx04'
    }, { status: 500 });
  }
}