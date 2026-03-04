import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

export type AuthStateListener = (session: Session | null) => void;

export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const client = supabase;
  if (!client) {
    return { error: new Error("Supabase 未配置，请设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY") };
  }
  const { error } = await client.auth.signInWithOAuth({ provider: "google" });
  return { error: error ?? null };
}

export async function signOut(): Promise<void> {
  const client = supabase;
  if (client) await client.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const client = supabase;
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export function onAuthStateChange(callback: AuthStateListener): () => void {
  const client = supabase;
  if (!client) return () => {};
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}
