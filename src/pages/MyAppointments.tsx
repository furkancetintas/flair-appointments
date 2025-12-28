import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchCustomerAppointments, deleteAppointment } from '@/store/slices/appointmentsSlice';
import { fetchShopSettings } from '@/store/slices/shopSettingsSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Scissors, LogOut, Plus, Trash2, MapPin, Phone, FileText, User, Sparkles } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MyAppointments = () => {
  const { profile, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const { appointments, loading } = useAppSelector((state) => state.appointments);
  const { settings } = useAppSelector((state) => state.shopSettings);

  useEffect(() => {
    if (profile) {
      dispatch(fetchCustomerAppointments(profile.id));
    }
    dispatch(fetchShopSettings());
  }, [profile, dispatch]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': 
        return { 
          bg: 'bg-emerald-500/10', 
          text: 'text-emerald-600', 
          border: 'border-emerald-500/20',
          dot: 'bg-emerald-500',
          label: 'Onaylandı' 
        };
      case 'pending': 
        return { 
          bg: 'bg-amber-500/10', 
          text: 'text-amber-600', 
          border: 'border-amber-500/20',
          dot: 'bg-amber-500',
          label: 'Bekliyor' 
        };
      case 'cancelled': 
        return { 
          bg: 'bg-rose-500/10', 
          text: 'text-rose-600', 
          border: 'border-rose-500/20',
          dot: 'bg-rose-500',
          label: 'İptal' 
        };
      case 'completed': 
        return { 
          bg: 'bg-sky-500/10', 
          text: 'text-sky-600', 
          border: 'border-sky-500/20',
          dot: 'bg-sky-500',
          label: 'Tamamlandı' 
        };
      default: 
        return { 
          bg: 'bg-muted', 
          text: 'text-muted-foreground', 
          border: 'border-border',
          dot: 'bg-muted-foreground',
          label: status 
        };
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    await dispatch(deleteAppointment(appointmentId));
  };

  const canDelete = (status: string) => {
    // Müşteriler tüm randevularını silebilir
    return true;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('tr-TR', options);
  };

  // Redirect admin to admin panel
  if (profile?.role === 'admin') {
    return <Navigate to="/admin/earnings" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-accent/10">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <Scissors className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Randevular yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/10">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <User className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Hoş Geldiniz, <span className="text-primary">{profile?.full_name}</span>
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Sparkles className="h-4 w-4" />
                  Randevularınızı buradan yönetin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/book">
                <Button className="flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                  <Plus className="h-4 w-4" />
                  Yeni Randevu
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={signOut}
                className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Toplam</p>
            <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Bekleyen</p>
            <p className="text-2xl font-bold text-amber-600">{appointments.filter(a => a.status === 'pending').length}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Onaylanan</p>
            <p className="text-2xl font-bold text-emerald-600">{appointments.filter(a => a.status === 'confirmed').length}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Tamamlanan</p>
            <p className="text-2xl font-bold text-sky-600">{appointments.filter(a => a.status === 'completed').length}</p>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Randevularım</h2>
            <p className="text-sm text-muted-foreground">Geçmiş ve gelecek randevularınız</p>
          </div>
        </div>

        {/* Appointments */}
        {appointments.length === 0 ? (
          <Card className="border-dashed border-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Henüz randevunuz yok</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-6">
                İlk randevunuzu alarak profesyonel hizmetlerimizden yararlanmaya başlayın.
              </p>
              <Link to="/book">
                <Button size="lg" className="shadow-lg shadow-primary/20">
                  <Plus className="h-5 w-5 mr-2" />
                  İlk Randevunu Al
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment, index) => {
              const statusConfig = getStatusConfig(appointment.status);
              return (
                <Card 
                  key={appointment.id} 
                  className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Date Section */}
                      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 md:w-48 flex flex-col items-center justify-center text-center">
                        <Clock className="h-6 w-6 mb-2 opacity-80" />
                        <p className="text-3xl font-bold">{appointment.appointment_time}</p>
                        <p className="text-sm opacity-80 mt-1">{formatDate(appointment.appointment_date)}</p>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          {/* Service Info */}
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Scissors className="h-4 w-4 text-primary" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Hizmet</span>
                              </div>
                              <h3 className="text-lg font-semibold text-foreground">{appointment.service}</h3>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                  <Scissors className="h-4 w-4" />
                                </div>
                                <span>{settings?.shop_name || 'Berber Dükkanı'}</span>
                              </div>
                              
                              {settings?.address && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                    <MapPin className="h-4 w-4" />
                                  </div>
                                  <span>{settings.address}</span>
                                </div>
                              )}
                              
                              {settings?.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                    <Phone className="h-4 w-4" />
                                  </div>
                                  <span>{settings.phone}</span>
                                </div>
                              )}
                            </div>

                            {appointment.notes && (
                              <div className="flex items-start gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">{appointment.notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Status & Actions */}
                          <div className="flex flex-row md:flex-col items-center md:items-end gap-3">
                            <Badge 
                              className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border px-3 py-1.5 font-medium`}
                            >
                              <span className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-2`}></span>
                              {statusConfig.label}
                            </Badge>
                            
                            {canDelete(appointment.status) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30 transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Sil
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Randevuyu Sil</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu randevuyu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteAppointment(appointment.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
