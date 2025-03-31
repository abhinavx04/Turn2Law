"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignIn() {  // This is the missing default export React component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles') // Changed from 'users' to 'profiles'
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Welcome Back</h1>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
          
          <Button
            type="submit"
            className="w-full bg-teal-400 hover:bg-teal-500 text-black"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          
          <p className="text-sm text-gray-400 text-center">
            Don't have an account?{" "}
            <a href="/sign-up" className="text-teal-400 hover:text-teal-300">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}