import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'barber';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'customer' | 'barber') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetch with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'customer' | 'barber') => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Kayıt Hatası",
          description: error.message === "User already registered" 
            ? "Bu e-posta adresi zaten kayıtlı." 
            : "Kayıt sırasında bir hata oluştu."
        });
        return { error };
      }

      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu! Giriş yapabilirsiniz."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Kayıt Hatası",
        description: "Beklenmeyen bir hata oluştu."
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Giriş Hatası",
          description: error.message === "Invalid login credentials" 
            ? "E-posta veya şifre hatalı." 
            : "Giriş sırasında bir hata oluştu."
        });
        return { error };
      }

      toast({
        title: "Hoş Geldiniz",
        description: "Başarıyla giriş yaptınız."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Giriş Hatası",
        description: "Beklenmeyen bir hata oluştu."
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Çıkış Hatası",
          description: "Çıkış sırasında bir hata oluştu."
        });
      } else {
        toast({
          title: "Çıkış Yapıldı",
          description: "Başarıyla çıkış yaptınız."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Çıkış Hatası",
        description: "Beklenmeyen bir hata oluştu."
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
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