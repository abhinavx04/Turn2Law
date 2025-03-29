import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from 'next/headers';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define types for better type safety
interface LawyerRegistrationRequest {
  name: string;
  specializations: string[];
  experienceYears: number;
  hourlyRate: number;
  bio: string;
  availableHours: {
    [key: string]: string[]; // e.g., { "monday": ["09:00-12:00", "14:00-17:00"] }
  };
}

export async function POST(req: Request) {
  try {
    console.log("Starting lawyer registration process");
    
    // Get session using cookies
    const cookieStore = cookies();
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
      console.error("Authentication error:", sessionError);
      return NextResponse.json({
        error: "Authentication required",
        details: "Please sign in at /auth/signin first"
      }, { 
        status: 401,
        headers: {
          'Location': '/auth/signin'
        }
      });
    }

    // Parse and validate request body
    const body = await req.json() as LawyerRegistrationRequest;
    
    // Validate required fields
    const validationErrors = validateRegistrationData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        error: "Validation failed",
        details: validationErrors
      }, { status: 400 });
    }

    // Check for existing profile
    const { data: existingLawyer, error: checkError } = await supabase
      .from("lawyers")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "not found" error
      console.error("Error checking existing lawyer:", checkError);
      return NextResponse.json({
        error: "Database error",
        details: "Error checking existing profile"
      }, { status: 500 });
    }

    if (existingLawyer) {
      return NextResponse.json({
        error: "Profile exists",
        details: "A lawyer profile already exists for this user"
      }, { status: 409 });
    }

    // Create new lawyer profile
    const { data: lawyer, error: insertError } = await supabase
      .from("lawyers")
      .insert([
        {
          user_id: session.user.id,
          name: body.name,
          specializations: body.specializations,
          experience_years: body.experienceYears,
          hourly_rate: body.hourlyRate,
          bio: body.bio,
          available_hours: body.availableHours,
          rating: 0,
          total_consultations: 0
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating lawyer profile:", insertError);
      return NextResponse.json({
        error: "Database error",
        details: "Failed to create lawyer profile"
      }, { status: 500 });
    }

    console.log("Lawyer profile created successfully:", lawyer);
    return NextResponse.json({
      message: "Lawyer profile created successfully",
      data: lawyer
    }, { status: 201 });

  } catch (error) {
    console.error("Unexpected error in lawyer registration:", error);
    return NextResponse.json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function validateRegistrationData(data: LawyerRegistrationRequest): string[] {
  const errors: string[] = [];

  // Check required fields
  if (!data.name?.trim()) {
    errors.push("Name is required");
  }

  if (!Array.isArray(data.specializations) || data.specializations.length === 0) {
    errors.push("At least one specialization is required");
  }

  if (typeof data.experienceYears !== 'number' || data.experienceYears < 0) {
    errors.push("Valid experience years are required");
  }

  if (typeof data.hourlyRate !== 'number' || data.hourlyRate <= 0) {
    errors.push("Valid hourly rate is required");
  }

  if (!data.bio?.trim()) {
    errors.push("Bio is required");
  }

  // Validate available hours
  if (!data.availableHours || typeof data.availableHours !== 'object') {
    errors.push("Available hours are required");
  } else {
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    Object.entries(data.availableHours).forEach(([day, hours]) => {
      if (!validDays.includes(day.toLowerCase())) {
        errors.push(`Invalid day: ${day}`);
      }
      if (!Array.isArray(hours)) {
        errors.push(`Invalid hours format for ${day}`);
      } else {
        hours.forEach(timeSlot => {
          if (!timeFormat.test(timeSlot)) {
            errors.push(`Invalid time slot format in ${day}: ${timeSlot}`);
          }
        });
      }
    });
  }

  return errors;
}