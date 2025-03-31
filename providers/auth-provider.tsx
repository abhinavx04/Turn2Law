'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import toast from 'react-hot-toast';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const { signIn, signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'signup') {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        toast.success('Account created successfully!');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {type === 'signup' && (
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded-md bg-gray-800 text-white"
        />
      )}
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border p-2 rounded-md bg-gray-800 text-white"
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 rounded-md bg-gray-800 text-white"
      />
      
      <button
        type="submit"
        disabled={loading}
        className="bg-[#ffd800] text-black font-semibold p-2 rounded-md hover:bg-[#e6c200] transition-colors"
      >
        {loading
          ? type === 'signup'
            ? 'Creating account...'
            : 'Signing in...'
          : type === 'signup'
          ? 'Create Account'
          : 'Sign In'}
      </button>
    </form>
  );
}

export { useAuth };
