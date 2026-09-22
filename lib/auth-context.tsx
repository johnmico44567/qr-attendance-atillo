import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

import { getSession, onAuthStateChange } from '@/lib/auth';
import { getProfile, type Profile } from '@/lib/profiles';

export type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession) {
      setProfile(null);
      return;
    }
    try {
      setProfile(await getProfile(nextSession.user.id));
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((nextSession) => {
        if (mounted) return loadProfile(nextSession);
      })
      .finally(() => mounted && setLoading(false));

    const { data } = onAuthStateChange((nextSession) => {
      if (mounted) void loadProfile(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (session) setProfile(await getProfile(session.user.id));
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
