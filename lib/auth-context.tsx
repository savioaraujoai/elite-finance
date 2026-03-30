'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';
import { useFinanceStore } from './store';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const setUserId = useFinanceStore((state) => state.setUserId);
  const initializeFromSupabase = useFinanceStore((state) => state.initializeFromSupabase);

  useEffect(() => {
    const setData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
      if (currentUser) {
        initializeFromSupabase();
      }
      setIsLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
      if (currentUser) {
        initializeFromSupabase();
      }
      setIsLoading(false);
    });

    setData();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setUserId, initializeFromSupabase]);

  useEffect(() => {
    const publicRoutes = ['/login', '/register'];
    if (!isLoading) {
      if (!user && !publicRoutes.includes(pathname)) {
        router.push('/login');
      } else if (user && publicRoutes.includes(pathname)) {
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const signOut = async () => {
    const clearLocalData = useFinanceStore.getState().clearLocalData;
    await supabase.auth.signOut();
    clearLocalData();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
