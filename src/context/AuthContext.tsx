"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/services';
import { UserProfile } from '@/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, name: string, orgName: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  joinWithInvite: (inviteCode: string, email: string, password: string, name: string) => Promise<UserProfile>;
  generateInviteCode: (role: 'owner' | 'staff') => Promise<string>;
  completeOnboarding: (name: string, orgName: string) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen to authentication updates from services
    const unsubscribe = authService.onAuthStateChanged((profile) => {
      setUser(profile);
      setLoading(false);
      
      // Auto routing: check if page is auth portal (including onboarding)
      const isAuthRoute = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/join') || pathname === '/onboarding';
      
      if (profile && profile.orgId && isAuthRoute) {
        router.push('/dashboard');
      } else if (profile && !profile.orgId && pathname !== '/onboarding') {
        router.push('/onboarding');
      } else if (!profile && !isAuthRoute && !loading) {
        router.push('/');
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [pathname, router, loading]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const u = await authService.signIn(email, password);
      setUser(u);
      if (!u.orgId) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
      return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, orgName: string) => {
    setLoading(true);
    try {
      const u = await authService.signUp(email, password, name, orgName);
      if ((u as any).emailConfirmationRequired) {
        setUser(null);
        setLoading(false);
        return u;
      }
      setUser(u);
      router.push('/dashboard');
      return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const joinWithInvite = async (inviteCode: string, email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const u = await authService.joinWithInvite(inviteCode, email, password, name);
      if ((u as any).emailConfirmationRequired) {
        setUser(null);
        setLoading(false);
        return u;
      }
      setUser(u);
      router.push('/dashboard');
      return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const generateInviteCode = async (role: 'owner' | 'staff') => {
    if (!user) throw new Error("Must be logged in to invite");
    if (user.role !== 'owner') throw new Error("Access Denied: Only owners can generate invite links");
    return await authService.generateInviteCode(user.orgId, role);
  };

  const completeOnboarding = async (name: string, orgName: string) => {
    if (!user) throw new Error("No authenticated user found for onboarding");
    setLoading(true);
    try {
      const u = await authService.completeOnboarding(user.id, user.email, name, orgName);
      setUser(u);
      router.push('/dashboard');
      return u;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("No authenticated user found to update profile");
    const u = await authService.updateProfile(user.id, updates);
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      joinWithInvite,
      generateInviteCode,
      completeOnboarding,
      updateProfile
    }}>
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
