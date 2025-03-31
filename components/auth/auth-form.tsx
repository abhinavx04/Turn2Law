"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";

interface AuthFormProps {
  type: "signin" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client" as "client" | "lawyer"
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === "signup") {
        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: formData.role
            }
          }
        });

        if (error) throw error;

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user!.id,
            email: formData.email,
            name: formData.name,
            role: formData.role
          }]);

        if (profileError) throw profileError;

        toast.success("Account created successfully! Please check your email for verification.");
        router.push("/sign-in");

      } else {
        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success("Signed in successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="flex flex-col gap-4">
      {type === "signup" && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="border p-2 rounded-md bg-gray-800 text-white"
            required
          />
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'client' }))}
              className={`flex-1 p-2 rounded-md ${
                formData.role === 'client' 
                  ? 'bg-[#ffd800] text-black' 
                  : 'bg-gray-700 text-white'
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'lawyer' }))}
              className={`flex-1 p-2 rounded-md ${
                formData.role === 'lawyer' 
                  ? 'bg-[#ffd800] text-black' 
                  : 'bg-gray-700 text-white'
              }`}
            >
              Lawyer
            </button>
          </div>
        </>
      )}
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        className="border p-2 rounded-md bg-gray-800 text-white"
        required
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        className="border p-2 rounded-md bg-gray-800 text-white"
        required
        minLength={6}
      />
      
      <button
        type="submit"
        disabled={loading}
        className="bg-[#ffd800] text-black p-2 rounded-md hover:bg-[#e6c200] transition-colors"
      >
        {loading 
          ? (type === "signup" ? "Signing up..." : "Signing in...") 
          : (type === "signup" ? "Sign Up" : "Sign In")
        }
      </button>
    </form>
  );
}