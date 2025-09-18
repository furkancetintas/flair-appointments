import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchCustomerAppointments, fetchBarberAppointments, updateAppointmentStatus } from '@/store/slices/appointmentsSlice';
import { fetchBarberByProfileId } from '@/store/slices/barbersSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Scissors, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import BarberProfileForm from '@/components/BarberProfileForm';

const Dashboard = () => {
  const { profile, signOut } = useAuth();
  const dispatch = useAppDispatch();
  const { appointments, barberAppointments, loading } = useAppSelector((state) => state.appointments);
  const { currentBarber } = useAppSelector((state) => state.barbers);

  useEffect(() => {
    if (profile) {
      if (profile.role === 'customer') {
        dispatch(fetchCustomerAppointments(profile.id));
      } else {
        // For barbers, first get their barber profile, then fetch appointments
        dispatch(fetchBarberByProfileId(profile.id)).then((result: any) => {
          if (result.payload?.id) {
            dispatch(fetchBarberAppointments(result.payload.id));
          }
        });
      }
    }
  }, [profile, dispatch]);

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    dispatch(updateAppointmentStatus({ appointmentId, status }));
  };

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
            <p className="text-muted-foreground">
              {profile?.role === 'customer' ? 'Randevularınızı görüntüleyin' : 'Müşteri randevularınızı yönetin'}
            </p>
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

        {/* Content based on user role */}
        {profile?.role === 'barber' ? (
          <Tabs defaultValue="appointments" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Randevular
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Profil Ayarları
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="space-y-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Randevularım</h2>
              </div>

              {barberAppointments.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Henüz hiç randevu yok.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {barberAppointments.map((appointment) => (
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
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.customer?.full_name}</span>
                            <span className="text-muted-foreground">- {appointment.customer?.email}</span>
                          </div>
                          
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Not:</strong> {appointment.notes}
                            </p>
                          )}

                          {appointment.status === 'pending' && (
                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                              >
                                Onayla
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                              >
                                İptal Et
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Berber Profili</h2>
              </div>
              <BarberProfileForm profileId={profile.id} />
            </TabsContent>
          </Tabs>
        ) : (
          // Customer view
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
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.barber?.shop_name}</span>
                          {(appointment.barber as any)?.address && (
                            <span className="text-muted-foreground">- {(appointment.barber as any).address}</span>
                          )}
                        </div>
                        
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Not:</strong> {appointment.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;