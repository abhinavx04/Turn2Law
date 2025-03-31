"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user!.id,
          email: formData.email,
          name: formData.name,
          created_at: new Date().toISOString(),
        }]);

      if (profileError) throw profileError;

      toast.success("Account created! Signing you in...");
      router.push("/dashboard");
      router.refresh();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Create Account</h1>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
          
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
          
          <Button
            type="submit"
            className="w-full bg-teal-400 hover:bg-teal-500 text-black"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
          
          <p className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <a href="/sign-in" className="text-teal-400 hover:text-teal-300">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}