import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Scissors, UserPlus, LogIn } from 'lucide-react';
import { loginSchema, signupSchema } from '@/lib/validation';
import { toast } from 'sonner';
import SEO from '@/components/SEO';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading } = useAuth();
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse(loginForm);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    
    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    if (!error) {
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse(signupForm);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(signupForm.email, signupForm.password, signupForm.fullName, signupForm.phone);
    if (!error) {
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      loginTab?.click();
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Giriş Yap & Kayıt Ol"
        description="Ömrüm Erkek Kuaför hesabınıza giriş yapın veya yeni hesap oluşturun. Hızlı ve kolay randevu sistemi."
        canonical="/auth"
      />
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary rounded-lg p-3">
              <Scissors className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Ömrüm Kuaför</h1>
          </div>
          <p className="text-muted-foreground">Berber randevularınızı kolayca yönetin</p>
        </div>

        <Tabs defaultValue="login" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login"><LogIn className="h-4 w-4 mr-2" />Giriş Yap</TabsTrigger>
            <TabsTrigger value="signup"><UserPlus className="h-4 w-4 mr-2" />Kayıt Ol</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Giriş Yap</CardTitle>
                <CardDescription>Hesabınıza giriş yapın</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-posta</Label>
                    <Input id="login-email" type="email" value={loginForm.email} onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))} placeholder="ornek@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Şifre</Label>
                    <Input id="login-password" type="password" value={loginForm.password} onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Kayıt Ol</CardTitle>
                <CardDescription>Yeni müşteri hesabı oluşturun</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Ad Soyad</Label>
                    <Input id="signup-name" type="text" value={signupForm.fullName} onChange={(e) => setSignupForm(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Adınız Soyadınız" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Telefon Numarası</Label>
                    <Input id="signup-phone" type="tel" value={signupForm.phone} onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="0532 123 45 67" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-posta</Label>
                    <Input id="signup-email" type="email" value={signupForm.email} onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))} placeholder="ornek@email.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifre</Label>
                    <Input id="signup-password" type="password" value={signupForm.password} onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" required minLength={6} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Kayıt yapılıyor..." : "Kayıt Ol"}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </main>
    </>
  );
};

export default Auth;
