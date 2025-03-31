"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RequestResetPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send reset email");

      toast.success("Password reset instructions sent to your email");
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Reset Password</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
          
          <Button
            type="submit"
            className="w-full bg-teal-400 hover:bg-teal-500 text-black"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </form>
      </div>
    </div>
  );
}