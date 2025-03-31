import { NextResponse } from "next/server";
import { generatePasswordResetToken } from "@/utils/auth";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const supabase = createClient();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "If a user with this email exists, they will receive reset instructions." },
        { status: 200 }
      );
    }

    // Generate reset token
    const token = await generatePasswordResetToken(email);

    // Send email with reset link (implement your email sending logic here)
    // For now, we'll just return the token in development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        message: "Reset token generated",
        resetLink: `/reset-password/${token}`
      });
    }

    return NextResponse.json({
      message: "If a user with this email exists, they will receive reset instructions."
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: "Failed to process reset request" },
      { status: 500 }
    );
  }
}