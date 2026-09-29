'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isMasterMode: boolean;
  operatorName: string;
  setOperatorName: (name: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: false,
  isMasterMode: true,
  operatorName: 'Shadow Monarch',
  setOperatorName: () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMasterMode, setIsMasterMode] = useState(true);
  const [operatorName, setOperatorNameState] = useState('Shadow Monarch');

  const supabase = createClient();

  useEffect(() => {
    // 1. Check if user customized their persona name in LocalStorage
    const savedName = localStorage.getItem('omni_master_name');
    if (savedName) {
      setOperatorNameState(savedName);
    }

    // 2. Auto-initialize Master Operator Identity (Zero Password Required)
    const masterUser: User = {
      id: 'master-owner-uuid-001',
      app_metadata: {},
      user_metadata: { name: savedName || 'Shadow Monarch' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'master@omnitrack.local',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    setUser(masterUser);
    setIsMasterMode(true);
    setIsLoading(false);

    // 3. If Supabase is connected, listen for any remote session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          setUser(session.user);
        }
      });
    }
  }, []);

  const setOperatorName = (name: string) => {
    setOperatorNameState(name);
    localStorage.setItem('omni_master_name', name);
    setUser((prev) => (prev ? { ...prev, user_metadata: { name } } : prev));
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!supabase) return { error: null };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!supabase) return { error: null };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error };
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Re-assign default master mode
    setIsMasterMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isMasterMode,
        operatorName,
        setOperatorName,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
