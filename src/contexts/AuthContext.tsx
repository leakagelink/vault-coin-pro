
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/lib/cleanupAuthState';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  wallet?: {
    balance: number;
    transactions: any[];
  };
  portfolio?: {
    positions: any[];
    holdings: any[];
  };
}

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('[Auth] Fetching profile for', userId);
    try {
      // Try to get existing profile
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Auth] profile fetch error', error);
      }

      // Ensure a profile exists; if missing, create it along with an initial wallet.
      let profile = data;
      if (!profile) {
        console.log('[Auth] No profile found, creating one with default values');
        const { data: userResp } = await supabase.auth.getUser();
        const email = userResp.user?.email ?? null;
        const display_name =
          (userResp.user?.user_metadata as any)?.display_name ??
          email ??
          null;

        // If using the seeded admin email, make the profile admin
        const role = email === 'admin@example.com' ? 'admin' : 'user';

        const { error: insertErr } = await (supabase as any)
          .from('profiles')
          .insert({
            id: userId,
            email,
            display_name,
            role,
          });

        if (insertErr) {
          console.error('[Auth] profile insert error', insertErr);
        } else {
          console.log('[Auth] Profile created');
        }

        // Create initial wallet (if not exists)
        const { error: walletInsertErr } = await (supabase as any)
          .from('wallets')
          .insert({
            user_id: userId,
            balance: 100000.0, // default starting balance to match server-side function
          });

        if (walletInsertErr) {
          // It's okay if it already exists or fails; just log it.
          console.warn('[Auth] wallet insert warn', walletInsertErr);
        }

        // Re-fetch profile after insert
        const { data: prof2 } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        profile = prof2;
      } else {
        // If this is the seeded admin email but role isn't admin yet, promote it.
        if (profile.email === 'admin@example.com' && profile.role !== 'admin') {
          console.log('[Auth] Promoting admin@example.com to admin');
          const { error: promoteErr } = await (supabase as any)
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId);
          if (promoteErr) {
            console.error('[Auth] admin promotion error', promoteErr);
          } else {
            // Refresh profile
            const { data: prof3 } = await (supabase as any)
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            profile = prof3 ?? profile;
          }
        }
      }

      if (profile) {
        const profileUserData: UserData = {
          uid: profile.id,
          email: profile.email,
          displayName: profile.display_name,
          wallet: undefined,
          portfolio: undefined,
        };
        setUserData(profileUserData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('[Auth] Profile fetch failed:', error);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('[Auth] login start for', email);
    // Clean any stale tokens and attempt a global sign out
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // ignore
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.session) {
      // Hard refresh to ensure full clean state
      window.location.href = '/';
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    console.log('[Auth] signup start for', email);
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // ignore
    }

    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) throw error;

    // If email confirmations are enabled, user must confirm; otherwise session may exist
    if (data.session) {
      window.location.href = '/';
    }
  };

  const logout = async () => {
    console.log('[Auth] logout');
    cleanupAuthState();
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // ignore
    }
    // Force a clean reload
    window.location.href = '/';
  };

  useEffect(() => {
    console.log('[Auth] init listener');
    // Set up listener FIRST
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[Auth] onAuthStateChange', event);
      setSession(newSession);
      setCurrentUser(newSession?.user ?? null);

      const userId = newSession?.user?.id;
      if (userId) {
        // Defer any additional supabase calls to avoid deadlocks
        setTimeout(() => fetchProfile(userId), 0);
      } else {
        setUserData(null);
      }
    });

    // Then load current session
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setCurrentUser(current?.user ?? null);
      const userId = current?.user?.id;
      if (userId) setTimeout(() => fetchProfile(userId), 0);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    session,
    userData,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

