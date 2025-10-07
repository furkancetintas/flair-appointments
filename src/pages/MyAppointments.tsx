import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchCustomerAppointments } from '@/store/slices/appointmentsSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Scissors, LogOut } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const MyAppointments = () => {
  const { profile, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const { appointments, loading } = useAppSelector((state) => state.appointments);

  useEffect(() => {
    if (profile) {
      dispatch(fetchCustomerAppointments(profile.id));
    }
  }, [profile, dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Onaylandı';
      case 'pending': return 'Bekliyor';
      case 'cancelled': return 'İptal';
      case 'completed': return 'Tamamlandı';
      default: return status;
    }
  };

  // Redirect barbers to barbers page
  if (profile?.role === 'barber') {
    return <Navigate to="/barbers" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Hoş Geldiniz, {profile?.full_name}
            </h1>
            <p className="text-muted-foreground">Randevularınızı görüntüleyin</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/barbers">
              <Button variant="outline" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Berberler
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </Button>
          </div>
        </div>

        {/* Appointments */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Randevularım</h2>
          </div>

          {appointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Henüz hiç randevunuz yok. Berberler sayfasından randevu alabilirsiniz.
                </p>
                <Link to="/barbers" className="mt-4">
                  <Button>Randevu Al</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(appointment.appointment_date).toLocaleDateString('tr-TR')} - {appointment.appointment_time}
                        </CardTitle>
                        <CardDescription>
                          {appointment.service}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-3">
                        <div className="flex items-start gap-2">
                          <Scissors className="h-4 w-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="font-medium">{appointment.barber?.shop_name}</p>
                            {appointment.barber?.address && (
                              <p className="text-sm text-muted-foreground">{appointment.barber.address}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t pt-3 space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Berber:</span> {appointment.barber?.profile.full_name}
                          </p>
                          {appointment.barber?.profile.phone && (
                            <p className="text-sm">
                              <span className="font-medium">Telefon:</span> {appointment.barber.profile.phone}
                            </p>
                          )}
                          {appointment.barber?.profile.email && (
                            <p className="text-sm">
                              <span className="font-medium">E-posta:</span> {appointment.barber.profile.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="border-t pt-3">
                          <p className="text-sm">
                            <span className="font-medium">Not:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground mb-1">Randevu ID</p>
                        <p className="text-sm font-mono font-semibold">{appointment.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;