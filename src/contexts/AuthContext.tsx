"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getSession,
  signInWithGoogle,
  signOut as authSignOut,
  onAuthStateChange,
} from "@/lib/auth";
import { pullAndMerge } from "@/lib/sync";

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setIsLoading(false);
    });
    const unsubscribe = onAuthStateChange((s) => {
      setSession(s);
      if (s) {
        pullAndMerge().then(({ error }) => {
          if (error) console.error("pullAndMerge after login:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    const { error } = await signInWithGoogle();
    if (error) console.error("signInWithGoogle:", error);
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, signIn, signOut }),
    [session, isLoading, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
