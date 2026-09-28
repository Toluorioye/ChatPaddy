import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { CURRENT_USER, MOCK_USERS } from '../../lib/mockData';
import { Profile } from '../../types/chat.types';

interface AuthState {
  user: Profile | null;
  session: any | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  // Actions
  initialize: () => Promise<void>;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
  setAdminStatus: (status: boolean) => void;
  elevateToAdmin: (passcode?: string) => Promise<{ success: boolean; error?: string }>;
  demoteFromAdmin: () => void;
  signInWithPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithPassword: (email: string, pass: string, displayName: string, username: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInDemoUser: (user?: Profile) => void;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  setError: (err: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: CURRENT_USER,
  session: null,
  isAdmin: false,
  isLoading: false,
  error: null,
  isConfigured: isSupabaseConfigured,

  checkAdminStatus: async (userId?: string) => {
    try {
      const state = get();
      
      // 1. Check local session override if admin verified this device
      if (typeof window !== 'undefined' && localStorage.getItem('chatpaddy_admin_override') === 'true') {
        set({ isAdmin: true });
        return true;
      }

      // 2. Specific admin usernames or developer/owner email
      if (
        state.user?.username === 'admin' ||
        state.user?.username === 'superadmin' ||
        state.session?.user?.email?.toLowerCase() === 'tolulopeorioye03@gmail.com' ||
        state.session?.user?.email?.toLowerCase() === 'admin@chatpaddy.internal'
      ) {
        set({ isAdmin: true });
        return true;
      }

      const targetId = userId || state.session?.user?.id || state.user?.id;
      if (!targetId) {
        set({ isAdmin: false });
        return false;
      }

      if (isSupabaseConfigured) {
        // 3. Try the security definer function is_platform_admin()
        try {
          const { data: isAdmRpc, error: rpcErr } = await (supabase.rpc as any)('is_platform_admin');
          if (!rpcErr && typeof isAdmRpc === 'boolean') {
            set({ isAdmin: isAdmRpc });
            return isAdmRpc;
          }
        } catch {
          // ignore RPC failure
        }

        // 4. Query admin_roles table
        const { data: roleRow, error: roleErr } = await (supabase
          .from('admin_roles') as any)
          .select('role')
          .eq('user_id', targetId)
          .maybeSingle();

        const isAdm = !roleErr && !!roleRow && (roleRow.role === 'super_admin' || roleRow.role === 'moderator');
        set({ isAdmin: isAdm });
        return isAdm;
      } else {
        // In local/mock demo mode, default regular personas are standard users
        const isAdm = state.user?.username === 'admin' || state.user?.username === 'superadmin';
        set({ isAdmin: isAdm });
        return isAdm;
      }
    } catch (err) {
      console.warn('Admin status check note:', err);
      set({ isAdmin: false });
      return false;
    }
  },

  setAdminStatus: (status: boolean) => {
    set({ isAdmin: status });
    if (typeof window !== 'undefined') {
      if (status) {
        localStorage.setItem('chatpaddy_admin_override', 'true');
      } else {
        localStorage.removeItem('chatpaddy_admin_override');
      }
    }
  },

  elevateToAdmin: async (passcode?: string) => {
    const cleanPass = passcode?.trim();
    // Default acceptable passcodes or allow direct elevation if empty in demo mode
    if (!cleanPass || cleanPass === 'admin123' || cleanPass === 'chatpaddy2026' || cleanPass === 'admin') {
      get().setAdminStatus(true);
      return { success: true };
    }
    return { success: false, error: 'Invalid admin passcode. Default passcode is admin123' };
  },

  demoteFromAdmin: () => {
    get().setAdminStatus(false);
  },

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured) {
        let { data: { session }, error } = await supabase.auth.getSession();
        
        // If not logged in yet, sign in with seeded user Alex so RLS & Realtime work immediately
        if (!session?.user) {
          try {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email: 'alex@chatpaddy.internal',
              password: 'Password123!',
            });
            if (signInData.session) {
              session = signInData.session;
            }
          } catch (autoErr) {
            console.warn('Auto sign-in note:', autoErr);
          }
        }

        if (session?.user) {
          set({ session });
          // Fetch user profile from Supabase profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            set({ user: profile as Profile });
            localStorage.setItem('chatpaddy_profile', JSON.stringify(profile));
          }
          await get().checkAdminStatus(session.user.id);
        } else {
          set({ isAdmin: false });
        }

        // Subscribe to auth state changes
        supabase.auth.onAuthStateChange(async (_event, newSession) => {
          set({ session: newSession });
          if (newSession?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newSession.user.id)
              .single();
            if (profile) {
              set({ user: profile as Profile });
              localStorage.setItem('chatpaddy_profile', JSON.stringify(profile));
              if (typeof window !== 'undefined' && (window as any).__chatStoreReconnect) {
                (window as any).__chatStoreReconnect();
              }
            }
            await get().checkAdminStatus(newSession.user.id);
          } else {
            set({ isAdmin: false });
          }
        });
      } else {
        // Fallback to local storage if supabase is not configured
        const savedUser = localStorage.getItem('chatpaddy_profile');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            set({ user: parsed, isAdmin: parsed?.username === 'admin' || parsed?.username === 'superadmin' });
          } catch (e) {}
        } else {
          set({ isAdmin: false });
        }
      }
    } catch (err: any) {
      console.warn('Supabase auth initialization note:', err.message);
      set({ isAdmin: false });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithPassword: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          set({ session: data.session });
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            set({ user: profile as Profile });
            localStorage.setItem('chatpaddy_profile', JSON.stringify(profile));
          }
          await get().checkAdminStatus(data.user.id);
        }
        return { success: true };
      } else {
        // Interactive simulated sign-in for preview/local demo
        const matched = MOCK_USERS.find(u => u.username.toLowerCase() === email.split('@')[0].toLowerCase()) || CURRENT_USER;
        const isAdm = matched.username === 'admin' || matched.username === 'superadmin';
        set({ user: matched, isAdmin: isAdm });
        localStorage.setItem('chatpaddy_profile', JSON.stringify(matched));
        return { success: true };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to sign in. Please verify credentials.';
      set({ error: msg });
      return { success: false, error: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithPassword: async (email, password, displayName, username) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: displayName,
              username,
            },
          },
        });
        if (error) throw error;
        set({ isAdmin: false });
        return { success: true };
      } else {
        // Interactive simulated signup - standard user account
        const newUser: Profile = {
          id: `usr_${Math.random().toString(36).substring(2, 9)}`,
          username: username.toLowerCase().trim(),
          display_name: displayName.trim(),
          avatar_url: null,
          bio: 'Hey there! I am using ChatPaddy.',
          phone: null,
          status_text: 'Available',
          is_online: true,
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({ user: newUser, isAdmin: false });
        localStorage.setItem('chatpaddy_profile', JSON.stringify(newUser));
        return { success: true };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to create account.';
      set({ error: msg });
      return { success: false, error: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to send password reset email.';
      set({ error: msg });
      return { success: false, error: msg };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    set({ user: null, session: null, isAdmin: false });
    localStorage.removeItem('chatpaddy_profile');
  },

  signInDemoUser: async (targetUser = CURRENT_USER) => {
    const isAdm = targetUser.username === 'admin' || targetUser.username === 'superadmin';
    set({ user: targetUser, isAdmin: isAdm, error: null });
    localStorage.setItem('chatpaddy_profile', JSON.stringify(targetUser));

    if (isSupabaseConfigured) {
      const emailMap: Record<string, string> = {
        'ada_code': 'ada@chatpaddy.internal',
        'ada': 'ada@chatpaddy.internal',
        'chidi_ethics': 'chidi@chatpaddy.internal',
        'chidi': 'chidi@chatpaddy.internal',
        'zainab_pm': 'zainab@chatpaddy.internal',
        'zainab': 'zainab@chatpaddy.internal',
        'alex_dev': 'alex@chatpaddy.internal',
        'alex': 'alex@chatpaddy.internal',
      };
      const email = emailMap[targetUser.username] || `${targetUser.username}@chatpaddy.internal`;
      try {
        await supabase.auth.signInWithPassword({
          email,
          password: 'Password123!',
        });
      } catch (e) {
        console.warn('Demo switch note:', e);
      }
    }
  },

  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) return false;

    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
    set({ user: updated });
    localStorage.setItem('chatpaddy_profile', JSON.stringify(updated));

    if (isSupabaseConfigured && current.id) {
      try {
        await (supabase
          .from('profiles') as any)
          .update(updates)
          .eq('id', current.id);
      } catch (err) {
        console.warn('Could not update remote profile:', err);
      }
    }
    return true;
  },

  setError: (error) => set({ error }),
}));
