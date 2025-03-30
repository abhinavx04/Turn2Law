import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return redirect('/sign-in');
    }

    return <>{children}</>;
  } catch (error) {
    console.error('Auth error:', error);
    return redirect('/sign-in');
  }
}