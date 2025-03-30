import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface MatchCriteria {
  specializations: string[];
  experienceLevel?: "junior" | "mid" | "senior";
  budget?: number;
  urgency?: "low" | "medium" | "high";
  location?: string;
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json({
        error: "Authentication required",
      }, { status: 401 });
    }

    const criteria: MatchCriteria = await req.json();

    // Build dynamic query based on criteria
    let query = supabase
      .from('lawyers')
      .select(`
        *,
        ratings:lawyer_ratings(avg_rating),
        availability:lawyer_availability(*)
      `);

    // Filter by specializations
    if (criteria.specializations?.length > 0) {
      query = query.contains('specializations', criteria.specializations);
    }

    // Filter by experience level
    if (criteria.experienceLevel) {
      const experienceYears = {
        junior: [0, 5],
        mid: [5, 10],
        senior: [10, 100]
      }[criteria.experienceLevel];
      
      query = query
        .gte('experience_years', experienceYears[0])
        .lt('experience_years', experienceYears[1]);
    }

    // Filter by budget
    if (criteria.budget) {
      query = query.lte('hourly_rate', criteria.budget);
    }

    // Filter by availability (for urgent cases)
    if (criteria.urgency === 'high') {
      const now = new Date();
      query = query.eq('is_available', true);
    }

    // Execute query
    const { data: matches, error: queryError } = await query
      .order('rating', { ascending: false })
      .limit(5);

    if (queryError) {
      console.error("Error finding matches:", queryError);
      return NextResponse.json({
        error: "Failed to find matches"
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "Matches found",
      data: matches
    });

  } catch (error) {
    console.error("Unexpected error in matching:", error);
    return NextResponse.json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}