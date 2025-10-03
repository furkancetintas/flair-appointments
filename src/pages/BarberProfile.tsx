import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchBarberById } from '@/store/slices/barbersSlice';
import { fetchAppointmentsForDate, createAppointment } from '@/store/slices/appointmentsSlice';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { MapPin, Clock, Phone, Mail, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { tr } from 'date-fns/locale';

const BarberProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const dispatch = useAppDispatch();
  const barbersState = useAppSelector((state) => state.barbers);
  const appointmentsState = useAppSelector((state) => state.appointments);
  
  const { currentBarber, loading } = barbersState;
  const { bookingLoading } = appointmentsState;
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      dispatch(fetchBarberById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedDate && id) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      dispatch(fetchAppointmentsForDate({ barberId: id, date: dateStr })).then((result: any) => {
        if (result.payload) {
          setBookedTimes((result.payload as any[]).map((apt: any) => apt.appointment_time));
        }
      });
    }
  }, [selectedDate, id, dispatch]);

  // Real-time updates for appointments
  useEffect(() => {
    if (!id || !selectedDate) return;

    const channel = supabase
      .channel('appointment-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `barber_id=eq.${id}`
        },
        (payload) => {
          // Refresh available times for the selected date
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          dispatch(fetchAppointmentsForDate({ barberId: id, date: dateStr })).then((result: any) => {
            if (result.payload) {
              setBookedTimes((result.payload as any[]).map((apt: any) => apt.appointment_time));
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, selectedDate, dispatch]);

  const generateTimeSlots = () => {
    if (!currentBarber || !selectedDate) return [];

    const dayName = format(selectedDate, 'EEEE', { locale: tr }).toLowerCase();
    const englishDayMap: { [key: string]: string } = {
      'pazartesi': 'monday',
      'salı': 'tuesday', 
      'çarşamba': 'wednesday',
      'perşembe': 'thursday',
      'cuma': 'friday',
      'cumartesi': 'saturday',
      'pazar': 'sunday'
    };

    const englishDay = englishDayMap[dayName];
    const daySchedule = currentBarber.working_hours?.[englishDay];

    if (!daySchedule || daySchedule.closed) {
      return [];
    }

    const slots = [];
    const startTime = daySchedule.start;
    const endTime = daySchedule.end;
    
    // Generate 30-minute slots
    let currentHour = parseInt(startTime.split(':')[0]);
    let currentMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    // If today, filter out past times
    const now = new Date();
    const currentTimeHour = now.getHours();
    const currentTimeMinute = now.getMinutes();
    const isTodaySelected = isToday(selectedDate);

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if this time slot is already booked
      const isBooked = bookedTimes.includes(timeString);

      // If today, skip past times
      const isPastTime = isTodaySelected && (
        currentHour < currentTimeHour || 
        (currentHour === currentTimeHour && currentMinute <= currentTimeMinute)
      );

      if (!isBooked && !isPastTime) {
        slots.push(timeString);
      }

      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Çalışma saatleri belirtilmemiş';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    return days
      .map((day, index) => {
        const dayInfo = workingHours[day];
        if (dayInfo && !dayInfo.closed) {
          return `${dayNames[index]}: ${dayInfo.start}-${dayInfo.end}`;
        }
        return `${dayNames[index]}: Kapalı`;
      })
      .join('\n');
  };

  const handleBookAppointment = async () => {
    if (!profile || !selectedDate || !selectedTime || !id || !currentBarber) {
      return;
    }

    // Parse price_range to get the average price
    const priceRange = currentBarber.price_range || '100';
    const prices = priceRange.split('-').map(p => parseFloat(p.trim()));
    const averagePrice = prices.length === 2 ? (prices[0] + prices[1]) / 2 : prices[0];

    const appointmentData = {
      customer_id: profile.id,
      barber_id: id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      service: 'Genel',
      price: averagePrice,
      notes: notes.trim() || undefined,
    };

    const result = await dispatch(createAppointment(appointmentData));
    
    if (result.meta.requestStatus === 'fulfilled') {
      const appointmentId = (result.payload as any)?.id;
      
      // Show success message with appointment ID
      if (appointmentId) {
        const successMessage = `Randevunuz oluşturuldu! Randevu ID: ${appointmentId}`;
        import('sonner').then(({ toast }) => {
          toast.success(successMessage, {
            description: 'Randevu bilgilerinizi ana sayfadan ID ile sorgulayabilirsiniz.',
            duration: 8000,
          });
        });
      }
      
      // Reset form
      setSelectedTime('');
      setNotes('');
      
      // Refresh booked times for the selected date
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      dispatch(fetchAppointmentsForDate({ barberId: id, date: dateStr })).then((result: any) => {
        if (result.payload) {
          setBookedTimes((result.payload as any[]).map((apt: any) => apt.appointment_time));
        }
      });
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Bugün';
    if (isTomorrow(date)) return 'Yarın';
    return format(date, 'dd MMMM yyyy', { locale: tr });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentBarber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              Berber bulunamadı.
            </p>
            <Link to="/barbers" className="mt-4">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Berberlere Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/barbers">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Berberlere Dön
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Barber Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{currentBarber.shop_name}</CardTitle>
                <CardDescription className="text-lg">
                  {currentBarber.profile.full_name}
                </CardDescription>
                <div className="flex gap-2">
                  <Badge variant={currentBarber.shop_status === 'open' ? 'default' : 'secondary'}>
                    {currentBarber.shop_status === 'open' ? 'Açık' : 'Kapalı'}
                  </Badge>
                  {currentBarber.price_range && (
                    <Badge variant="outline">
                      {currentBarber.price_range} ₺
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentBarber.description && (
                  <p className="text-muted-foreground">{currentBarber.description}</p>
                )}

                {currentBarber.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <span>{currentBarber.address}</span>
                  </div>
                )}

                {currentBarber.profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{currentBarber.profile.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>{currentBarber.profile.email}</span>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <pre className="text-sm whitespace-pre-line">
                    {formatWorkingHours(currentBarber.working_hours)}
                  </pre>
                </div>

                {currentBarber.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Hizmetler</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentBarber.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Appointment Booking */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Randevu Al
                </CardTitle>
                <CardDescription>
                  Müsait bir tarih ve saat seçerek randevu alabilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-base font-semibold">Tarih Seçin</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                    className="rounded-md border mt-2"
                    locale={tr}
                  />
                  {selectedDate && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Seçili tarih: {getDateLabel(selectedDate)}
                    </p>
                  )}
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <Label className="text-base font-semibold">Saat Seçin</Label>
                    {timeSlots.length > 0 ? (
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Müsait saatlerden seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2 p-4 bg-muted rounded-md">
                        Bu tarih için müsait saat bulunmamaktadır.
                      </p>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedTime && (
                  <div>
                    <Label htmlFor="notes" className="text-base font-semibold">
                      Notlar (Opsiyonel)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Book Button */}
                {selectedDate && selectedTime && (
                  <Button 
                    onClick={handleBookAppointment}
                    disabled={bookingLoading || !profile}
                    className="w-full"
                    size="lg"
                  >
                    {bookingLoading ? 'Randevu Alınıyor...' : 'Randevu Al'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberProfile;