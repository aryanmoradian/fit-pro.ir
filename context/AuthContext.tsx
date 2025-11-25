import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: (User & Partial<UserProfile>) | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & Partial<UserProfile>) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  const mapProfileData = (user: User, profile: any): User & Partial<UserProfile> => {
      const mappedProfile: Partial<UserProfile> = profile ? {
          ...profile,
          name: profile.full_name,
          phoneNumber: profile.phone_number,
          subscriptionTier: profile.subscription_tier,
          subscriptionStatus: profile.subscription_status,
          verificationStatus: profile.verification_status,
          inviteCode: profile.invite_code,
          role: profile.role,
          avatarUrl: profile.avatar_url, // FIXED: Map snake_case DB to camelCase App
          certUrl: profile.cert_url // Ensure certs are mapped too
      } : {};
      
      return { ...user, ...mappedProfile };
  };

  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(mapProfileData(session.user, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(mapProfileData(session.user, profile));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
      if (user?.id) {
          const profile = await fetchProfile(user.id);
          // We need the base user object to merge updates
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
              setUser(mapProfileData(authUser, profile));
          }
      }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};