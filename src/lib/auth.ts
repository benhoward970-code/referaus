import { supabase, isConfigured } from './supabase';

export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  if (!isConfigured() || !supabase) return { error: { message: 'Supabase not configured - running in demo mode' }, data: null };
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  if (!isConfigured() || !supabase) return { error: { message: 'Supabase not configured - running in demo mode' }, data: null };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  if (!isConfigured() || !supabase) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isConfigured() || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  if (!isConfigured() || !supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}
