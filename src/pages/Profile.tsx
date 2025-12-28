import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { updateProfile } from '@/store/slices/authSlice';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Lock, Shield, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Profile = () => {
  const { user, profile, isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const isEmailVerified = user?.email_confirmed_at != null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await dispatch(updateProfile({ full_name: fullName, phone }));
      toast.success('Profil bilgileriniz güncellendi');
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Şifreniz başarıyla değiştirildi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Şifre değiştirilirken bir hata oluştu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Geçerli bir e-posta adresi giriniz');
      return;
    }
    
    setIsChangingEmail(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      toast.success('Yeni e-posta adresinize doğrulama linki gönderildi');
      setNewEmail('');
    } catch (error: any) {
      toast.error(error.message || 'E-posta değiştirilirken bir hata oluştu');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
      });
      
      if (error) throw error;
      
      toast.success('Doğrulama e-postası tekrar gönderildi');
    } catch (error: any) {
      toast.error(error.message || 'E-posta gönderilemedi');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to={isAdmin ? "/admin/appointments" : "/my-appointments"} 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Profilim</h1>
            <p className="text-muted-foreground">Hesap bilgilerinizi yönetin</p>
          </div>

          <div className="space-y-6">
            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Hesap Bilgileri
                </CardTitle>
                <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon Numarası</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0532 123 45 67"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Email Verification Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  E-posta Durumu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-wrap">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">Mevcut e-posta adresiniz</p>
                    </div>
                  </div>
                  {isEmailVerified ? (
                    <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Doğrulanmış
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Doğrulanmamış
                    </Badge>
                  )}
                </div>
                
                {!isEmailVerified && (
                  <Button variant="outline" onClick={handleResendVerification}>
                    Doğrulama E-postasını Tekrar Gönder
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Change Email Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  E-posta Değiştir
                </CardTitle>
                <CardDescription>Yeni e-posta adresinize doğrulama linki gönderilecektir</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Yeni E-posta Adresi</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="yeni@email.com"
                    />
                  </div>
                  <Button type="submit" disabled={isChangingEmail}>
                    {isChangingEmail ? 'Gönderiliyor...' : 'E-posta Değiştir'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Şifre Değiştir
                </CardTitle>
                <CardDescription>Hesabınızın güvenliği için güçlü bir şifre kullanın</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yeni Şifre</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Security Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Hesap Güvenliği
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm">Hesap Türü</span>
                    <Badge variant={isAdmin ? "default" : "secondary"}>
                      {isAdmin ? 'Admin' : 'Müşteri'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm">Kayıt Tarihi</span>
                    <span className="text-sm text-muted-foreground">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;