import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { UserProfile, AuthUser } from '@/types/database';

interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    
    try {
      // 添加超时保护
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 5000);
      });
      
      const sessionPromise = supabase.auth.getSession();
      
      await Promise.race([sessionPromise, timeoutPromise]);
      
      const { data: { session } } = await sessionPromise;
      
      if (session?.user) {
        let profile = null;
        try {
          const profileTimeout = new Promise<void>((resolve) => {
            setTimeout(() => resolve(), 3000);
          });
          
          const profilePromise = supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          await Promise.race([profilePromise, profileTimeout]);
          const { data } = await profilePromise;
          profile = data;
        } catch (e) {
          console.log('Profile not found');
        }

        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
          },
          profile,
          loading: false,
          initialized: true,
        });
      } else {
        set({ loading: false, initialized: true });
      }
    } catch (e) {
      console.error('Initialize error:', e);
      set({ loading: false, initialized: true });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        let profile = null;
        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          profile = data;
        } catch (e) {
          console.log('Profile not found');
        }

        set({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
          },
          profile,
          loading: false,
        });
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false });
      return { error: new Error(error.message) };
    }
    return { error: null };
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    if (error) {
      set({ loading: false });
      return { error: new Error(error.message) };
    }
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      set({ profile });
    } catch (e) {
      console.log('Failed to refresh profile', e);
    }
  },
}));
