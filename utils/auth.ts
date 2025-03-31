import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { dbConfig, type UserRole } from '@/lib/supabase/config';

export async function generatePasswordResetToken(email: string) {
  const supabase = createClient();
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  const { error } = await supabase
    .from('users')
    .update({
      reset_token: token,
      reset_token_expires: expires.toISOString(),
    })
    .eq('email', email);

  if (error) throw error;
  return token;
}

export async function resetPassword(token: string, newPassword: string) {
  const supabase = createClient();

  // Verify token and update password
  const { data: user, error: getUserError } = await supabase
    .from('users')
    .select('id, email, reset_token_expires')
    .eq('reset_token', token)
    .single();

  if (getUserError || !user) throw new Error('Invalid or expired reset token');
  if (new Date(user.reset_token_expires) < new Date()) throw new Error('Reset token has expired');

  // Update auth password
  const { error: updateAuthError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateAuthError) throw updateAuthError;

  // Clear reset token
  const { error: clearTokenError } = await supabase
    .from('users')
    .update({
      reset_token: null,
      reset_token_expires: null
    })
    .eq('id', user.id);

  if (clearTokenError) throw clearTokenError;
}

export async function updateRole(userId: string, role: UserRole) {
  const supabase = createClient();

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}