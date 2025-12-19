import { createContext, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { initializeAuth, signUp as signUpAction, signIn as signInAction, signOut as signOutAction, setAuthState } from '@/store/slices/authSlice';

interface AuthContextType {
  user: any;
  session: any;
  profile: any;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, session, profile, isAdmin, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth on mount
    dispatch(initializeAuth());

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        dispatch(setAuthState({
          user: session?.user ?? null,
          session,
          profile: null // Profile will be fetched in the slice
        }));
        
        // Re-initialize to get profile and admin status
        if (session?.user) {
          setTimeout(() => {
            dispatch(initializeAuth());
          }, 0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const result = await dispatch(signUpAction({ email, password, fullName, phone }));
    return { error: result.meta.requestStatus === 'rejected' ? result.payload : null };
  };

  const signIn = async (email: string, password: string) => {
    const result = await dispatch(signInAction({ email, password }));
    return { error: result.meta.requestStatus === 'rejected' ? result.payload : null };
  };

  const signOut = async () => {
    await dispatch(signOutAction());
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}