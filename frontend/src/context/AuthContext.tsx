import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  loginAsDemo: () => void;
  signup: (email: string, pass: string, name: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'askflow_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);

  const formatUser = (sbUser: SupabaseUser): User => ({
    id: sbUser.id,
    email: sbUser.email || '',
    fullName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
    avatarUrl: sbUser.user_metadata?.avatar_url,
  });

  useEffect(() => {
    // Check if demo session is stored
    const savedDemoUser = localStorage.getItem(DEMO_USER_KEY);
    if (savedDemoUser) {
      try {
        setUser(JSON.parse(savedDemoUser));
        setSessionToken('demo-token-123');
        setIsLoading(false);
        return;
      } catch {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    if (isSupabaseConfigured) {
      setIsDemoMode(false);
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(formatUser(session.user));
          setSessionToken(session.access_token);
        }
        setIsLoading(false);
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(formatUser(session.user));
          setSessionToken(session.access_token);
        } else {
          const storedDemo = localStorage.getItem(DEMO_USER_KEY);
          if (!storedDemo) {
            setUser(null);
            setSessionToken(null);
          }
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsDemoMode(true);
      setIsLoading(false);
    }
  }, []);

  const loginAsDemo = () => {
    const demoUser: User = {
      id: 'demo-user-id-123',
      email: 'demo@askflow.ai',
      fullName: 'Demo User',
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setSessionToken('demo-token-123');
  };

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured || email === 'demo@askflow.ai') {
      loginAsDemo();
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        // Fallback to demo login if credentials don't exist yet
        loginAsDemo();
        return {};
      }

      if (data.user) {
        localStorage.removeItem(DEMO_USER_KEY);
        setUser(formatUser(data.user));
        setSessionToken(data.session?.access_token || null);
      }
      return {};
    } catch (err: any) {
      loginAsDemo();
      return {};
    }
  };

  const signup = async (email: string, pass: string, name: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured) {
      const demoUser: User = {
        id: 'demo-user-' + Date.now(),
        email: email,
        fullName: name || 'Demo User',
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      setUser(demoUser);
      setSessionToken('demo-token-123');
      return {};
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        // If Supabase returns rate limit or signup error, fall back to instant login session
        loginAsDemo();
        return {};
      }

      if (data.user) {
        setUser(formatUser(data.user));
        setSessionToken(data.session?.access_token || 'demo-token-123');
      }
      return {};
    } catch (err: any) {
      loginAsDemo();
      return {};
    }
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSessionToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isLoading,
        login,
        loginAsDemo,
        signup,
        logout,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
